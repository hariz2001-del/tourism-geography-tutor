#!/usr/bin/env python3
"""Extract each PDF page into a reviewable JSONL record.

This script intentionally does not publish material. It only creates a
traceable extraction draft for human/lecturer review.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import fitz


def extract_pdf(input_path: Path, chapter_code: str) -> list[dict[str, object]]:
    document = fitz.open(input_path)
    records: list[dict[str, object]] = []
    for page_number, page in enumerate(document, start=1):
        text = page.get_text("text").strip()
        records.append(
            {
                "chapter_code": chapter_code,
                "source_file": input_path.name,
                "page_or_slide": page_number,
                "extraction_status": "extracted" if text else "needs_ocr",
                "text": text,
            }
        )
    return records


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("input_pdf", type=Path)
    parser.add_argument("--chapter-code", required=True)
    parser.add_argument("--output", required=True, type=Path)
    args = parser.parse_args()

    if not args.input_pdf.is_file():
        raise SystemExit(f"Input PDF does not exist: {args.input_pdf}")
    if not args.chapter_code.startswith("CH"):
        raise SystemExit("--chapter-code must begin with CH, for example CH1")

    records = extract_pdf(args.input_pdf, args.chapter_code)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    with args.output.open("w", encoding="utf-8") as destination:
        for record in records:
            destination.write(json.dumps(record, ensure_ascii=False) + "\n")

    needs_ocr = sum(record["extraction_status"] == "needs_ocr" for record in records)
    print(
        f"Extracted {len(records)} pages from {args.input_pdf.name}; "
        f"{needs_ocr} pages require OCR review."
    )


if __name__ == "__main__":
    main()
