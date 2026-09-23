"""Persist the coordinator's review of completed Terra audit records.

This tool is intentionally append-only. It copies no answer keys or rubrics and
can be rerun safely: unchanged Terra records are skipped, while changed Terra
records receive a superseding coordinator record.
"""

from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
from typing import Any


POLICY_VERSION = "2026-09-03-v2"
REVISION_REQUIRED_CODES = {"explanation_generic", "difficulty_mislabel"}
SEVERITY_RANK = {"none": 0, "minor": 1, "moderate": 2, "major": 3, "critical": 4}


def canonical_hash(row: dict[str, Any]) -> str:
    payload = json.dumps(row, sort_keys=True, ensure_ascii=False, separators=(",", ":"))
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()


def load_latest(path: Path) -> dict[str, dict[str, Any]]:
    latest: dict[str, dict[str, Any]] = {}
    if not path.exists():
        return latest
    for line_number, line in enumerate(path.read_text(encoding="utf-8").splitlines(), start=1):
        if not line.strip():
            continue
        try:
            row = json.loads(line)
        except json.JSONDecodeError as exc:
            raise SystemExit(f"{path}:{line_number}: invalid JSON: {exc.msg}") from exc
        question_id = row.get("question_id")
        if question_id:
            latest[question_id] = row
    return latest


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--root",
        type=Path,
        default=Path("data/audits/quiz-bank-2026-09-03"),
    )
    parser.add_argument("--reviewer", required=True, choices=("terra-a", "terra-b", "terra-c"))
    parser.add_argument(
        "--review-note",
        default="Coordinator reviewed the complete Terra record and accepts its evidence-backed judgment.",
    )
    args = parser.parse_args()

    manifest = json.loads((args.root / "manifest.json").read_text(encoding="utf-8"))
    diagnostics = json.loads(
        (args.root / "structural-diagnostics.json").read_text(encoding="utf-8")
    )
    structural_by_id = {
        row["question_id"]: {issue["code"] for issue in row.get("issues", [])}
        for row in diagnostics["questions"]
    }
    shard = next(item for item in manifest["shards"] if item["reviewer"] == args.reviewer)
    expected = set(shard["question_ids"])
    terra = load_latest(args.root / "progress" / f"{args.reviewer}.jsonl")
    terra = {question_id: row for question_id, row in terra.items() if question_id in expected}
    missing = sorted(expected - set(terra))
    if missing:
        raise SystemExit(f"{args.reviewer} is incomplete: {len(missing)} assigned records missing")

    required = {
        "question_id",
        "chapter_code",
        "verdict",
        "severity",
        "issue_codes",
        "source_alignment",
        "marking_fairness",
        "feedback_quality",
        "difficulty_fit",
        "pdf_checked",
        "reviewer",
    }
    for row in terra.values():
        missing_fields = sorted(required - row.keys())
        if missing_fields:
            raise SystemExit(
                f"{args.reviewer} question {row.get('question_id')} lacks: {', '.join(missing_fields)}"
            )

    output_path = args.root / "progress" / "orchestrator.jsonl"
    prior = load_latest(output_path)
    appended = 0
    with output_path.open("a", encoding="utf-8") as destination:
        for question_id in shard["question_ids"]:
            source = terra[question_id]
            source_hash = canonical_hash(source)
            structural_codes = structural_by_id.get(question_id, set())
            adjudication_input_hash = canonical_hash(
                {
                    "policy_version": POLICY_VERSION,
                    "source_record_sha256": source_hash,
                    "structural_codes": sorted(structural_codes),
                }
            )
            existing = prior.get(question_id)
            if existing and existing.get("adjudication_input_sha256") == adjudication_input_hash:
                continue
            issue_codes = list(dict.fromkeys(source["issue_codes"]))
            orchestrator_verdict = source["verdict"]
            severity = source["severity"]
            changes: list[str] = []
            if (
                orchestrator_verdict in {"pass", "pass_with_note"}
                and REVISION_REQUIRED_CODES.intersection(issue_codes)
            ):
                orchestrator_verdict = "revise"
                if SEVERITY_RANK[severity] < SEVERITY_RANK["minor"]:
                    severity = "minor"
                changes.append(
                    "normalised a required feedback or difficulty edit to revise before approval"
                )
            if "source_mismatch" in structural_codes:
                if "source_mismatch" not in issue_codes:
                    issue_codes.append("source_mismatch")
                if orchestrator_verdict not in {"reject", "needs_lecturer_ruling"}:
                    orchestrator_verdict = "revise"
                if SEVERITY_RANK[severity] < SEVERITY_RANK["moderate"]:
                    severity = "moderate"
                changes.append("merged the verified current topic/source-unit mismatch")
            disposition = "modified_after_review" if changes else "accepted_after_review"
            notes = args.review_note
            if changes:
                notes += " Coordinator " + "; ".join(changes) + "."
            adjudication = {
                "question_id": question_id,
                "chapter_code": source["chapter_code"],
                "terra_reviewer": source["reviewer"],
                "terra_verdict": source["verdict"],
                "orchestrator_verdict": orchestrator_verdict,
                "severity": severity,
                "issue_codes": issue_codes,
                "source_alignment": source["source_alignment"],
                "marking_fairness": source["marking_fairness"],
                "feedback_quality": source["feedback_quality"],
                "difficulty_fit": source["difficulty_fit"],
                "disposition": disposition,
                "confidence": "VERIFIED" if source["pdf_checked"] else "INFERRED",
                "notes": notes,
                "recommended_action": source.get("recommended_action", ""),
                "source_record_sha256": source_hash,
                "adjudication_input_sha256": adjudication_input_hash,
                "policy_version": POLICY_VERSION,
                "reviewer": "sol-orchestrator",
                "reviewed_at": "2026-09-03T00:00:00+08:00",
            }
            if existing:
                adjudication["supersedes"] = True
            destination.write(json.dumps(adjudication, ensure_ascii=False, separators=(",", ":")) + "\n")
            prior[question_id] = adjudication
            appended += 1

    print(f"reviewer={args.reviewer} expected={len(expected)} appended={appended} output={output_path}")


if __name__ == "__main__":
    main()
