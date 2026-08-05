import importlib.util
from pathlib import Path

import pytest

spec = importlib.util.spec_from_file_location(
    "import_reviewed_content", Path("scripts/import_reviewed_content.py")
)
module = importlib.util.module_from_spec(spec)
assert spec and spec.loader
spec.loader.exec_module(module)


VALID_UNIT = {
    "title": "A reviewed title", "body": "A reviewed body", "source_file": "source.pdf",
    "chapter_label": "Chapter 1", "page_or_slide": 4, "reviewed_status": "reviewed",
    "chapter_code": "CH1", "topic_name": "Introduction",
}


def test_validate_reviewed_unit_rejects_missing_provenance():
    with pytest.raises(ValueError, match="page_or_slide"):
        module.validate_reviewed_unit({key: value for key, value in VALID_UNIT.items() if key != "page_or_slide"})


def test_import_plan_creates_source_reference_before_publication():
    plan = module.build_import_plan([VALID_UNIT])
    assert plan[0]["steps"] == ["upsert_chapter", "upsert_topic", "insert_draft_content_unit", "insert_source_reference", "publish_content_unit"]


class RecordingTransaction:
    def __init__(self):
        self.executed: list[tuple[str, tuple[object, ...]]] = []
        self.committed = False
        self.rolled_back = False

    def execute(self, statement: str, parameters: tuple[object, ...] = ()):
        self.executed.append((statement, parameters))
        if "returning id" in statement.lower():
            return {"id": "record-id"}
        return None

    def commit(self):
        self.committed = True

    def rollback(self):
        self.rolled_back = True


def test_apply_reviewed_units_uses_one_transaction_and_publishes_after_citation():
    transaction = RecordingTransaction()

    module.apply_reviewed_units([VALID_UNIT], transaction)

    statements = [statement.lower() for statement, _ in transaction.executed]
    source_index = next(index for index, statement in enumerate(statements) if "source_references" in statement)
    publish_index = next(index for index, statement in enumerate(statements) if "set status = 'published'" in statement)
    assert source_index < publish_index
    assert transaction.committed is True
    assert transaction.rolled_back is False
    assert all("a reviewed body" not in statement for statement in statements)


def test_apply_derives_unique_chapter_display_order_from_chapter_code():
    transaction = RecordingTransaction()
    second_chapter = {**VALID_UNIT, "chapter_code": "CH2", "chapter_label": "Chapter 2"}

    module.apply_reviewed_units([second_chapter], transaction)

    chapter_parameters = next(parameters for statement, parameters in transaction.executed if "insert into public.chapters" in statement.lower())
    assert chapter_parameters == ("CH2", "Chapter 2", 2)


def test_apply_assigns_distinct_display_order_to_new_topics_in_one_chapter():
    transaction = RecordingTransaction()
    second_topic = {**VALID_UNIT, "topic_name": "Second topic"}

    module.apply_reviewed_units([VALID_UNIT, second_topic], transaction)

    topic_parameters = [parameters for statement, parameters in transaction.executed if "insert into public.topics" in statement.lower()]
    assert topic_parameters[0][-1] == "record-id"
    assert topic_parameters[1][-1] == "record-id"
    assert "coalesce(max(display_order), 0) + 1" in next(statement.lower() for statement, _ in transaction.executed if "insert into public.topics" in statement.lower())
