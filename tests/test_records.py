from course_brain.records import parse_extraction_record


def test_parses_traceable_extracted_record() -> None:
    record = parse_extraction_record(
        {
            "chapter_code": "CH1",
            "source_file": "chapter-1.pdf",
            "page_or_slide": 1,
            "extraction_status": "extracted",
            "text": "Tourism Geography introduction",
        }
    )

    assert record.chapter_code == "CH1"
    assert record.page_or_slide == 1


def test_rejects_extracted_record_without_text() -> None:
    value = {
        "chapter_code": "CH1",
        "source_file": "chapter-1.pdf",
        "page_or_slide": 1,
        "extraction_status": "extracted",
        "text": "",
    }

    try:
        parse_extraction_record(value)
    except ValueError as error:
        assert "must include text" in str(error)
    else:
        raise AssertionError("expected an extracted empty record to fail")


def test_allows_scanned_page_to_be_flagged_for_ocr() -> None:
    record = parse_extraction_record(
        {
            "chapter_code": "CH2",
            "source_file": "chapter-2.pdf",
            "page_or_slide": 4,
            "extraction_status": "needs_ocr",
            "text": "",
        }
    )

    assert record.extraction_status == "needs_ocr"
