"""Validation for reviewable course-material extraction records."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any


REQUIRED_FIELDS = {
    "chapter_code",
    "source_file",
    "page_or_slide",
    "extraction_status",
    "text",
}


@dataclass(frozen=True)
class ExtractionRecord:
    chapter_code: str
    source_file: str
    page_or_slide: int
    extraction_status: str
    text: str


def parse_extraction_record(value: dict[str, Any]) -> ExtractionRecord:
    missing = REQUIRED_FIELDS.difference(value)
    if missing:
        raise ValueError(f"Missing required fields: {', '.join(sorted(missing))}")

    chapter_code = value["chapter_code"]
    source_file = value["source_file"]
    page_or_slide = value["page_or_slide"]
    extraction_status = value["extraction_status"]
    text = value["text"]

    if not isinstance(chapter_code, str) or not chapter_code.startswith("CH"):
        raise ValueError("chapter_code must begin with 'CH'")
    if not isinstance(source_file, str) or not source_file.strip():
        raise ValueError("source_file must be a non-empty string")
    if not isinstance(page_or_slide, int) or page_or_slide < 1:
        raise ValueError("page_or_slide must be a positive integer")
    if extraction_status not in {"extracted", "needs_ocr"}:
        raise ValueError("extraction_status must be 'extracted' or 'needs_ocr'")
    if not isinstance(text, str):
        raise ValueError("text must be a string")
    if extraction_status == "extracted" and not text.strip():
        raise ValueError("extracted records must include text")

    return ExtractionRecord(
        chapter_code=chapter_code,
        source_file=source_file,
        page_or_slide=page_or_slide,
        extraction_status=extraction_status,
        text=text,
    )
