"""Validate and publish the sanitized 208-question audit result."""

from __future__ import annotations

import argparse
import hashlib
import json
from collections import Counter
from pathlib import Path
from typing import Any


def canonical_hash(row: dict[str, Any]) -> str:
    payload = json.dumps(row, sort_keys=True, ensure_ascii=False, separators=(",", ":"))
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()


def load_latest(path: Path) -> tuple[dict[str, dict[str, Any]], list[str]]:
    latest: dict[str, dict[str, Any]] = {}
    errors: list[str] = []
    if not path.exists():
        return latest, [f"missing file: {path}"]
    for line_number, line in enumerate(path.read_text(encoding="utf-8").splitlines(), start=1):
        if not line.strip():
            continue
        try:
            row = json.loads(line)
        except json.JSONDecodeError as exc:
            errors.append(f"{path.name}:{line_number}: invalid JSON: {exc.msg}")
            continue
        question_id = row.get("question_id")
        if not question_id:
            errors.append(f"{path.name}:{line_number}: missing question_id")
            continue
        latest[question_id] = row
    return latest, errors


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--root",
        type=Path,
        default=Path("data/audits/quiz-bank-2026-09-03"),
    )
    args = parser.parse_args()

    manifest = json.loads((args.root / "manifest.json").read_text(encoding="utf-8"))
    expected_order = [
        question_id
        for shard in manifest["shards"]
        for question_id in shard["question_ids"]
    ]
    expected = set(expected_order)
    terra: dict[str, dict[str, Any]] = {}
    errors: list[str] = []
    for shard in manifest["shards"]:
        latest, shard_errors = load_latest(
            args.root / "progress" / f"{shard['reviewer']}.jsonl"
        )
        errors.extend(shard_errors)
        assigned = set(shard["question_ids"])
        terra.update({question_id: row for question_id, row in latest.items() if question_id in assigned})

    orchestrator, orchestrator_errors = load_latest(
        args.root / "progress" / "orchestrator.jsonl"
    )
    errors.extend(orchestrator_errors)
    missing_terra = sorted(expected - set(terra))
    missing_orchestrator = sorted(expected - set(orchestrator))
    unexpected_orchestrator = sorted(set(orchestrator) - expected)
    if missing_terra:
        errors.append(f"missing Terra records: {len(missing_terra)}")
    if missing_orchestrator:
        errors.append(f"missing orchestrator records: {len(missing_orchestrator)}")
    if unexpected_orchestrator:
        errors.append(f"unexpected orchestrator records: {len(unexpected_orchestrator)}")

    for question_id in expected & set(terra) & set(orchestrator):
        expected_hash = canonical_hash(terra[question_id])
        actual_hash = orchestrator[question_id].get("source_record_sha256")
        if actual_hash != expected_hash:
            errors.append(f"stale orchestrator decision: {question_id}")

    status = {
        "expected": len(expected),
        "terra_unique": len(expected & set(terra)),
        "orchestrator_unique": len(expected & set(orchestrator)),
        "errors": errors,
    }
    print(json.dumps(status, indent=2))
    if errors:
        raise SystemExit(1)

    questions: list[dict[str, Any]] = []
    for question_id in expected_order:
        source = terra[question_id]
        decision = orchestrator[question_id]
        questions.append(
            {
                "question_id": question_id,
                "chapter_code": source["chapter_code"],
                "topic_id": source["topic_id"],
                "source_unit_id": source["source_unit_id"],
                "source_page": source["source_page"],
                "question_type": source["question_type"],
                "difficulty": source["difficulty"],
                "terra": {
                    "reviewer": source["reviewer"],
                    "verdict": source["verdict"],
                    "severity": source["severity"],
                    "issue_codes": source["issue_codes"],
                    "notes": source["notes"],
                    "recommended_action": source["recommended_action"],
                    "pdf_checked": source["pdf_checked"],
                },
                "orchestrator": {
                    "verdict": decision["orchestrator_verdict"],
                    "severity": decision["severity"],
                    "issue_codes": decision["issue_codes"],
                    "disposition": decision["disposition"],
                    "confidence": decision["confidence"],
                    "notes": decision["notes"],
                    "recommended_action": decision["recommended_action"],
                    "policy_version": decision["policy_version"],
                },
            }
        )

    output = {
        "audit_date": manifest["audit_date"],
        "snapshot": manifest["snapshot"],
        "snapshot_hashes": manifest["private_snapshot_hashes"],
        "total_questions": len(questions),
        "counts": {
            "by_chapter": dict(sorted(Counter(row["chapter_code"] for row in questions).items())),
            "by_type": dict(sorted(Counter(row["question_type"] for row in questions).items())),
            "by_difficulty": dict(sorted(Counter(row["difficulty"] for row in questions).items())),
            "by_verdict": dict(
                sorted(Counter(row["orchestrator"]["verdict"] for row in questions).items())
            ),
            "by_severity": dict(
                sorted(Counter(row["orchestrator"]["severity"] for row in questions).items())
            ),
            "by_disposition": dict(
                sorted(Counter(row["orchestrator"]["disposition"] for row in questions).items())
            ),
            "by_issue_code": dict(
                sorted(
                    Counter(
                        code
                        for row in questions
                        for code in row["orchestrator"]["issue_codes"]
                    ).items()
                )
            ),
        },
        "questions": questions,
    }
    destination = args.root / "results.json"
    destination.write_text(json.dumps(output, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"complete=true output={destination}")


if __name__ == "__main__":
    main()
