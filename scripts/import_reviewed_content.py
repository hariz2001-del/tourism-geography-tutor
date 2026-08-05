#!/usr/bin/env python3
"""Validate and transactionally import locally reviewed Course Brain JSON.

The command never reads extraction drafts. --apply needs COURSE_BRAIN_DATABASE_URL
from the caller's approved local environment; values are neither logged nor stored.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
from collections.abc import Mapping
from pathlib import Path
from typing import Any, Protocol

REQUIRED_FIELDS = (
    "chapter_code", "topic_name", "title", "body", "source_file",
    "chapter_label", "page_or_slide", "reviewed_status",
)


class Transaction(Protocol):
    def execute(self, statement: str, parameters: tuple[object, ...] = ()) -> Any: ...
    def commit(self) -> None: ...
    def rollback(self) -> None: ...


def validate_reviewed_unit(unit: dict[str, Any]) -> dict[str, Any]:
    for field in REQUIRED_FIELDS:
        value = unit.get(field)
        if field == "page_or_slide":
            if not isinstance(value, int) or value < 1:
                raise ValueError("page_or_slide must be a positive integer")
        elif not isinstance(value, str) or not value.strip():
            raise ValueError(f"{field} must be a non-empty string")
    if unit["reviewed_status"] != "reviewed":
        raise ValueError("reviewed_status must be reviewed")
    if not unit["chapter_code"].startswith("CH"):
        raise ValueError("chapter_code must be a chapter code")
    return unit


def build_import_plan(units: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return [
        {
            "stable_identity": [unit["source_file"], unit["page_or_slide"], unit["title"]],
            "steps": [
                "upsert_chapter", "upsert_topic", "insert_draft_content_unit",
                "insert_source_reference", "publish_content_unit",
            ],
        }
        for unit in (validate_reviewed_unit(unit) for unit in units)
    ]


def reviewed_import_key(unit: dict[str, Any]) -> str:
    identity = "\x1f".join(str(unit[field]).strip() for field in (
        "chapter_code", "topic_name", "source_file", "page_or_slide", "title",
    ))
    return hashlib.sha256(identity.encode("utf-8")).hexdigest()


def chapter_display_order(chapter_code: str) -> int:
    return int(chapter_code.removeprefix("CH"))


def _returned_id(result: Any) -> str:
    if isinstance(result, Mapping):
        return str(result["id"])
    fetchone = getattr(result, "fetchone", None)
    row = fetchone() if callable(fetchone) else None
    if isinstance(row, Mapping):
        return str(row["id"])
    if isinstance(row, tuple):
        return str(row[0])
    raise RuntimeError("Database adapter did not return an id.")


def apply_reviewed_units(units: list[dict[str, Any]], transaction: Transaction) -> int:
    validated = [validate_reviewed_unit(unit) for unit in units]
    try:
        transaction.execute("select pg_advisory_xact_lock(hashtext(%s))", ("course_brain_reviewed_import",))
        for unit in validated:
            chapter_id = _returned_id(transaction.execute(
                """insert into public.chapters (code, title, display_order)
                   values (%s, %s, %s)
                   on conflict (code) do update set title = excluded.title
                   returning id""",
                (unit["chapter_code"], unit["chapter_label"], chapter_display_order(unit["chapter_code"])),
            ))
            topic_id = _returned_id(transaction.execute(
                """insert into public.topics (chapter_id, name, display_order)
                   select %s, %s, coalesce(max(display_order), 0) + 1
                   from public.topics where chapter_id = %s
                   on conflict (chapter_id, name) do update set name = excluded.name
                   returning id""",
                (chapter_id, unit["topic_name"], chapter_id),
            ))
            content_id = _returned_id(transaction.execute(
                """insert into public.content_units
                     (topic_id, title, body, content_type, status, reviewed_import_key)
                   values (%s, %s, %s, 'learning_note', 'draft', %s)
                   on conflict (reviewed_import_key) where reviewed_import_key is not null
                   do update set topic_id = excluded.topic_id, title = excluded.title,
                     body = excluded.body, content_type = excluded.content_type
                   returning id""",
                (topic_id, unit["title"], unit["body"], reviewed_import_key(unit)),
            ))
            transaction.execute(
                """insert into public.source_references
                     (content_unit_id, source_file, chapter_label, page_or_slide)
                   values (%s, %s, %s, %s)
                   on conflict (content_unit_id) do update set source_file = excluded.source_file,
                     chapter_label = excluded.chapter_label, page_or_slide = excluded.page_or_slide""",
                (content_id, unit["source_file"], unit["chapter_label"], unit["page_or_slide"]),
            )
            transaction.execute(
                "update public.content_units set status = 'published' where id = %s",
                (content_id,),
            )
        transaction.commit()
    except Exception:
        transaction.rollback()
        raise
    return len(validated)


def apply_from_environment(units: list[dict[str, Any]]) -> int:
    database_url = os.environ.get("COURSE_BRAIN_DATABASE_URL")
    if not database_url:
        raise RuntimeError("--apply requires COURSE_BRAIN_DATABASE_URL in the approved local environment.")
    try:
        import psycopg
    except ImportError as error:
        raise RuntimeError("--apply requires the psycopg dependency.") from error
    with psycopg.connect(database_url) as connection:
        return apply_reviewed_units(units, connection)


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate and transactionally import reviewed Course Brain JSON.")
    parser.add_argument("input", type=Path)
    parser.add_argument("--dry-run", action="store_true", help="Validate and print record count only.")
    parser.add_argument("--apply", action="store_true", help="Apply through the configured transactional database adapter.")
    args = parser.parse_args()
    units = json.loads(args.input.read_text(encoding="utf-8"))
    if not isinstance(units, list):
        raise ValueError("reviewed input must be a JSON array")
    plan = build_import_plan(units)
    if args.apply:
        applied = apply_from_environment(units)
        print(f"Applied {applied} reviewed record(s) transactionally.")
    else:
        print(f"Validated {len(plan)} reviewed record(s); no data was published.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
