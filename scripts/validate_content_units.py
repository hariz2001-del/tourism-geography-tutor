#!/usr/bin/env python3
"""Validate JSONL extraction drafts before review/import."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

from course_brain.records import parse_extraction_record


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("input_jsonl", type=Path)
    args = parser.parse_args()

    if not args.input_jsonl.is_file():
        raise SystemExit(f"Input JSONL does not exist: {args.input_jsonl}")

    valid_count = 0
    needs_ocr_count = 0
    with args.input_jsonl.open(encoding="utf-8") as source:
        for line_number, line in enumerate(source, start=1):
            if not line.strip():
                continue
            try:
                record = parse_extraction_record(json.loads(line))
            except (json.JSONDecodeError, ValueError) as error:
                raise SystemExit(f"Invalid record on line {line_number}: {error}") from error
            valid_count += 1
            needs_ocr_count += record.extraction_status == "needs_ocr"

    print(
        f"Validated {valid_count} records; {needs_ocr_count} records require OCR review."
    )


if __name__ == "__main__":
    main()
