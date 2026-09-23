"""Validate incremental Terra quiz-audit progress and consolidate completed shards."""

from __future__ import annotations

import argparse
import json
from collections import Counter
from pathlib import Path
from typing import Any


REQUIRED_FIELDS = {
    "question_id",
    "chapter_code",
    "topic_id",
    "source_unit_id",
    "source_page",
    "question_type",
    "difficulty",
    "verdict",
    "severity",
    "issue_codes",
    "source_alignment",
    "marking_fairness",
    "feedback_quality",
    "difficulty_fit",
    "duplicate_of",
    "pdf_checked",
    "notes",
    "recommended_action",
    "reviewer",
    "reviewed_at",
}


def load_jsonl(path: Path) -> tuple[list[dict[str, Any]], list[str]]:
    rows: list[dict[str, Any]] = []
    errors: list[str] = []
    if not path.exists():
        return rows, errors
    for line_number, line in enumerate(path.read_text(encoding="utf-8").splitlines(), start=1):
        if not line.strip():
            continue
        try:
            row = json.loads(line)
        except json.JSONDecodeError as exc:
            errors.append(f"{path.name}:{line_number}: invalid JSON: {exc.msg}")
            continue
        # Validate required fields only after resolving append-only superseding
        # records. An incomplete historical row is acceptable when a later row
        # for the same question repairs it.
        row["_audit_line_number"] = line_number
        rows.append(row)
    return rows, errors


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--root",
        type=Path,
        default=Path("data/audits/quiz-bank-2026-09-03"),
    )
    parser.add_argument("--require-complete", action="store_true")
    args = parser.parse_args()

    manifest = json.loads((args.root / "manifest.json").read_text(encoding="utf-8"))
    all_final: dict[str, dict[str, Any]] = {}
    all_errors: list[str] = []
    statuses: list[dict[str, Any]] = []

    for shard in manifest["shards"]:
        reviewer = shard["reviewer"]
        expected = set(shard["question_ids"])
        rows, errors = load_jsonl(args.root / "progress" / f"{reviewer}.jsonl")
        all_errors.extend(errors)
        final_all: dict[str, dict[str, Any]] = {}
        for row in rows:
            if row.get("reviewer") != reviewer:
                all_errors.append(f"{reviewer}: question {row.get('question_id')} has wrong reviewer")
            question_id = row.get("question_id")
            if not question_id:
                all_errors.append(
                    f"{reviewer}: line {row.get('_audit_line_number')} has no question_id"
                )
                continue
            final_all[question_id] = row
        unexpected = sorted(set(final_all) - expected)
        final = {question_id: row for question_id, row in final_all.items() if question_id in expected}
        latest_errors: list[str] = []
        for row in final.values():
            missing_fields = sorted(REQUIRED_FIELDS - row.keys())
            if missing_fields:
                latest_errors.append(
                    f"{args.root.name}/{reviewer}.jsonl:{row.get('_audit_line_number')}: "
                    f"missing fields: {', '.join(missing_fields)}"
                )
        all_errors.extend(latest_errors)
        missing = sorted(expected - set(final))
        overlap = sorted(set(all_final) & set(final))
        if overlap:
            all_errors.append(f"{reviewer}: {len(overlap)} IDs overlap another shard")
        all_final.update(final)
        statuses.append(
            {
                "reviewer": reviewer,
                "expected": len(expected),
                "saved_lines": len(rows),
                "unique_saved": len(final),
                "missing": len(missing),
                "invalid_lines": len(errors) + len(latest_errors),
                "ignored_unexpected_ids": len(unexpected),
                "historical_or_superseded_lines": len(rows) - len(final),
            }
        )

    print(json.dumps({"shards": statuses, "errors": all_errors}, indent=2))
    complete = len(all_final) == manifest["total_questions"] and not all_errors and all(
        status["missing"] == 0 for status in statuses
    )
    if not complete:
        if args.require_complete:
            raise SystemExit(1)
        return

    rows = [all_final[question_id] for question_id in sorted(all_final)]
    for row in rows:
        row.pop("_audit_line_number", None)
    output = {
        "audit_date": manifest["audit_date"],
        "total_questions": len(rows),
        "counts": {
            "verdict": dict(sorted(Counter(row["verdict"] for row in rows).items())),
            "severity": dict(sorted(Counter(row["severity"] for row in rows).items())),
            "issue_codes": dict(
                sorted(Counter(code for row in rows for code in row["issue_codes"]).items())
            ),
        },
        "questions": rows,
    }
    destination = args.root / "terra-results.json"
    destination.write_text(json.dumps(output, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"complete=true output={destination}")


if __name__ == "__main__":
    main()
