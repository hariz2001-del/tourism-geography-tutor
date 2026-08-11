#!/usr/bin/env python3
"""Transactionally insert unpublished, source-grounded exam-question drafts.

The input carries a source unit UUID and a human-readable source citation. The
importer verifies both against published Course Brain content before writing.
"""

from __future__ import annotations

import argparse
import json
import os
from pathlib import Path
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen
from uuid import UUID


def validate(records: list[dict[str, Any]]) -> None:
    if not isinstance(records, list) or not records:
        raise ValueError("The draft question bank must be a non-empty JSON array.")

    seen: set[tuple[str, str]] = set()
    for record in records:
        if not isinstance(record, dict):
            raise ValueError("Every draft question must be an object.")
        required = (
            "bank_id", "variant", "chapter_code", "topic_name", "source_title",
            "source_content_unit_id", "question_type", "question", "difficulty",
        )
        if any(not isinstance(record.get(field), str) or not record[field].strip() for field in required):
            raise ValueError("Every record needs non-empty bank/variant/chapter/topic/source/type/question/difficulty fields.")
        try:
            UUID(record["source_content_unit_id"])
        except (ValueError, AttributeError):
            raise ValueError("Every record needs a valid source_content_unit_id UUID.") from None
        citation = record.get("source_citation")
        if not isinstance(citation, dict) or not isinstance(citation.get("source_file"), str) or not citation["source_file"].strip():
            raise ValueError("Every record needs a cited source_file.")
        if not isinstance(citation.get("chapter_label"), str) or not citation["chapter_label"].strip():
            raise ValueError("Every record needs a cited chapter_label.")
        if not isinstance(citation.get("page_or_slide"), int) or isinstance(citation["page_or_slide"], bool) or citation["page_or_slide"] < 1:
            raise ValueError("Every record needs a positive integer citation page_or_slide.")
        if record.get("status", "draft") != "draft" or record.get("generated_by", "deepseek_draft") != "deepseek_draft":
            raise ValueError("Draft imports may only contain draft questions generated_by deepseek_draft.")
        if record["question_type"] not in {"mcq", "subjective"}:
            raise ValueError("question_type must be mcq or subjective.")
        if record["difficulty"] not in {"introductory", "intermediate", "application"}:
            raise ValueError("Invalid difficulty.")
        key = (record["source_content_unit_id"], record["question"].strip().casefold())
        if key in seen:
            raise ValueError(f"Duplicate draft question: {key}")
        seen.add(key)
        if record["question_type"] == "mcq":
            options = record.get("options")
            if (
                not isinstance(options, list)
                or len(options) < 2
                or any(not isinstance(option, dict) or not isinstance(option.get("text"), str) or not option["text"].strip()
                       or not isinstance(option.get("is_correct"), bool) for option in options)
                or sum(option["is_correct"] for option in options) != 1
            ):
                raise ValueError("Each MCQ needs at least two options and exactly one correct option.")
        else:
            criteria = record.get("criteria")
            if (
                not isinstance(record.get("answer_scheme"), str)
                or not record["answer_scheme"].strip()
                or not isinstance(record.get("max_marks"), int)
                or isinstance(record["max_marks"], bool)
                or record["max_marks"] < 1
                or not isinstance(criteria, list)
                or not criteria
                or any(
                    not isinstance(criterion, dict)
                    or not isinstance(criterion.get("criterion"), str)
                    or not criterion["criterion"].strip()
                    or not isinstance(criterion.get("marks"), int)
                    or isinstance(criterion["marks"], bool)
                    or criterion["marks"] < 1
                    or not isinstance(criterion.get("accepted_concepts", []), list)
                    or not isinstance(criterion.get("accepted_synonyms", []), list)
                    or any(not isinstance(value, str) or not value.strip()
                           for value in criterion.get("accepted_concepts", []) + criterion.get("accepted_synonyms", []))
                    for criterion in criteria
                )
            ):
                raise ValueError("Each subjective question needs an answer scheme and criteria.")
            if sum(criterion["marks"] for criterion in criteria) != record["max_marks"]:
                raise ValueError("Subjective criterion marks must equal max_marks.")
    # A bank can contain any valid number of MCQ and subjective items. The exam
    # generator chooses a shuffled subset later; import must not impose a fixed
    # chapter or variant shape.


def apply(records: list[dict[str, Any]], connection: Any) -> int:
    validate(records)
    inserted = 0
    try:
        with connection.cursor() as cur:
            cur.execute("select pg_advisory_xact_lock(hashtext(%s))", ("deepseek_draft_exam_import",))
            for item in records:
                cur.execute(
                    """select topic.id, content.id from public.chapters chapter
                       join public.topics topic on topic.chapter_id = chapter.id
                       join public.content_units content on content.topic_id = topic.id
                       join public.source_references source_ref on source_ref.content_unit_id = content.id
                       where chapter.code = %s and topic.name = %s and content.title = %s
                         and content.id = %s and content.status = 'published'
                         and source_ref.source_file = %s and source_ref.chapter_label = %s
                         and source_ref.page_or_slide = %s""",
                    (item["chapter_code"], item["topic_name"], item["source_title"], item["source_content_unit_id"],
                     item["source_citation"]["source_file"], item["source_citation"]["chapter_label"],
                     item["source_citation"]["page_or_slide"]),
                )
                source = cur.fetchone()
                if source is None:
                    raise ValueError(f"No published, cited source for {item['chapter_code']} / {item['source_title']}")
                topic_id, source_id = source
                cur.execute(
                    """select id from public.quiz_questions
                       where generated_by = 'deepseek_draft' and source_content_unit_id = %s
                         and lower(question) = lower(%s)""",
                    (source_id, item["question"].strip()),
                )
                if cur.fetchone():
                    continue
                cur.execute(
                    """insert into public.quiz_questions
                       (topic_id, source_content_unit_id, question, explanation, difficulty, status, generated_by,
                        question_type, max_marks, subjective_answer_scheme)
                       values (%s, %s, %s, %s, %s, 'draft', 'deepseek_draft', %s, %s, %s) returning id""",
                    (topic_id, source_id, item["question"], item.get("explanation", "Draft requires lecturer review."),
                     item["difficulty"], item["question_type"], item.get("max_marks", 1), item.get("answer_scheme")),
                )
                question_id = cur.fetchone()[0]
                for order, option in enumerate(item.get("options", []), 1):
                    cur.execute("""insert into public.quiz_question_options
                        (question_id, option_text, display_order, is_correct) values (%s, %s, %s, %s)""",
                        (question_id, option["text"], order, option["is_correct"]))
                for order, criterion in enumerate(item.get("criteria", []), 1):
                    cur.execute("""insert into public.quiz_marking_criteria
                        (question_id, source_content_unit_id, criterion, marks, accepted_concepts, accepted_synonyms, display_order)
                        values (%s, %s, %s, %s, %s, %s, %s)""",
                        (question_id, source_id, criterion["criterion"], criterion["marks"],
                         criterion.get("accepted_concepts", []), criterion.get("accepted_synonyms", []), order))
                inserted += 1
        connection.commit()
    except Exception:
        connection.rollback()
        raise
    return inserted


class SupabaseRestClient:
    """Small PostgREST client used only by this controlled draft importer.

    Keeping this dependency-free lets the script run wherever the Supabase
    service credentials are already available. Error messages deliberately
    never include request headers or URLs, which could contain credentials.
    """

    def __init__(self, supabase_url: str, service_role_key: str) -> None:
        self.base_url = supabase_url.rstrip("/") + "/rest/v1"
        self.headers = {
            "apikey": service_role_key,
            "Authorization": f"Bearer {service_role_key}",
            "Content-Type": "application/json",
        }

    def request(
        self,
        method: str,
        table: str,
        *,
        params: dict[str, str] | None = None,
        payload: Any | None = None,
        prefer: str | None = None,
    ) -> Any:
        query = f"?{urlencode(params)}" if params else ""
        headers = dict(self.headers)
        if prefer:
            headers["Prefer"] = prefer
        body = json.dumps(payload).encode("utf-8") if payload is not None else None
        request = Request(f"{self.base_url}/{table}{query}", data=body, headers=headers, method=method)
        try:
            with urlopen(request, timeout=30) as response:  # nosec B310: URL is configured by the operator
                raw = response.read().decode("utf-8")
        except HTTPError as error:
            raise RuntimeError(f"Supabase REST {method} {table} failed with HTTP {error.code}.") from error
        except URLError as error:
            raise RuntimeError(f"Supabase REST {method} {table} could not be reached.") from error
        return json.loads(raw) if raw else None


def _rest_source(client: Any, item: dict[str, Any]) -> tuple[str, str]:
    """Return (topic_id, source_id) only for the exact published cited unit."""
    citation = item["source_citation"]
    rows = client.request(
        "GET",
        "content_units",
        params={
            "select": "id,topic_id,topics!inner(name,chapters!inner(code)),source_references!inner(source_file,chapter_label,page_or_slide)",
            "id": f"eq.{item['source_content_unit_id']}",
            "title": f"eq.{item['source_title']}",
            "status": "eq.published",
            "topics.name": f"eq.{item['topic_name']}",
            "topics.chapters.code": f"eq.{item['chapter_code']}",
            "source_references.source_file": f"eq.{citation['source_file']}",
            "source_references.chapter_label": f"eq.{citation['chapter_label']}",
            "source_references.page_or_slide": f"eq.{citation['page_or_slide']}",
        },
    )
    if not isinstance(rows, list) or len(rows) != 1:
        raise ValueError(f"No published, cited source for {item['chapter_code']} / {item['source_title']}")
    row = rows[0]
    if not isinstance(row.get("id"), str) or not isinstance(row.get("topic_id"), str):
        raise RuntimeError("Supabase REST returned an invalid source row.")
    return row["topic_id"], row["id"]


def apply_rest(records: list[dict[str, Any]], client: Any) -> int:
    """Insert only new drafts through PostgREST, deleting created drafts on error.

    The source and all duplicates are checked before the first mutation. This
    cannot provide a cross-request Postgres transaction, so rollback is best
    effort; deleting a question cascades to its options and rubric criteria.
    """
    validate(records)
    prepared: list[tuple[dict[str, Any], str, str]] = []
    for item in records:
        topic_id, source_id = _rest_source(client, item)
        duplicates = client.request(
            "GET",
            "quiz_questions",
            params={
                "select": "id",
                "generated_by": "eq.deepseek_draft",
                "source_content_unit_id": f"eq.{source_id}",
                "question": f"ilike.{item['question'].strip()}",
            },
        )
        if not isinstance(duplicates, list):
            raise RuntimeError("Supabase REST returned an invalid duplicate-check response.")
        if not duplicates:
            prepared.append((item, topic_id, source_id))

    created_ids: list[str] = []
    try:
        for item, topic_id, source_id in prepared:
            created = client.request(
                "POST",
                "quiz_questions",
                payload={
                    "topic_id": topic_id,
                    "source_content_unit_id": source_id,
                    "question": item["question"],
                    "explanation": item.get("explanation", "Draft requires lecturer review."),
                    "difficulty": item["difficulty"],
                    "status": "draft",
                    "generated_by": "deepseek_draft",
                    "question_type": item["question_type"],
                    "max_marks": item.get("max_marks", 1),
                    "subjective_answer_scheme": item.get("answer_scheme"),
                },
                prefer="return=representation",
            )
            if not isinstance(created, list) or len(created) != 1 or not isinstance(created[0].get("id"), str):
                raise RuntimeError("Supabase REST did not return the created draft question ID.")
            question_id = created[0]["id"]
            created_ids.append(question_id)
            options = [
                {"question_id": question_id, "option_text": option["text"], "display_order": order,
                 "is_correct": option["is_correct"]}
                for order, option in enumerate(item.get("options", []), 1)
            ]
            if options:
                client.request("POST", "quiz_question_options", payload=options)
            criteria = [
                {"question_id": question_id, "source_content_unit_id": source_id,
                 "criterion": criterion["criterion"], "marks": criterion["marks"],
                 "accepted_concepts": criterion.get("accepted_concepts", []),
                 "accepted_synonyms": criterion.get("accepted_synonyms", []), "display_order": order}
                for order, criterion in enumerate(item.get("criteria", []), 1)
            ]
            if criteria:
                client.request("POST", "quiz_marking_criteria", payload=criteria)
    except Exception:
        for question_id in reversed(created_ids):
            try:
                client.request("DELETE", "quiz_questions", params={"id": f"eq.{question_id}"})
            except Exception:
                pass
        raise
    return len(prepared)


def replace_ch2_rest(records: list[dict[str, Any]], client: Any) -> dict[str, int]:
    """Atomically replace only CH2 deepseek draft rows through a private RPC.

    Client-side validation runs before this call.  The database function then
    validates every source/citation before deleting anything, so a bad fixture
    cannot leave CH2 with an empty or partially replaced bank.
    """
    validate(records)
    if not records or any(record["chapter_code"] != "CH2" for record in records):
        raise ValueError("The CH2 replacement path accepts CH2 records only.")
    result = client.request("POST", "rpc/replace_ch2_deepseek_draft_bank", payload={"p_records": records})
    if not isinstance(result, dict) or not all(isinstance(result.get(key), int) for key in ("deleted", "inserted")):
        raise RuntimeError("CH2 replacement RPC returned an invalid result.")
    return {"deleted": result["deleted"], "inserted": result["inserted"]}


def replace_ch4_rest(records: list[dict[str, Any]], client: Any) -> dict[str, int]:
    """Atomically replace only CH4 deepseek draft rows through a private RPC."""
    validate(records)
    if not records or any(record["chapter_code"] != "CH4" for record in records):
        raise ValueError("The CH4 replacement path accepts CH4 records only.")
    result = client.request("POST", "rpc/replace_ch4_deepseek_draft_bank", payload={"p_records": records})
    if not isinstance(result, dict) or not all(isinstance(result.get(key), int) for key in ("deleted", "inserted")):
        raise RuntimeError("CH4 replacement RPC returned an invalid result.")
    return {"deleted": result["deleted"], "inserted": result["inserted"]}


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("input", type=Path)
    parser.add_argument("--apply", action="store_true")
    parser.add_argument("--replace-ch2-drafts", action="store_true",
                        help="Atomically replace only existing CH2 draft/deepseek_draft rows.")
    parser.add_argument("--replace-ch4-drafts", action="store_true",
                        help="Atomically replace only existing CH4 draft/deepseek_draft rows.")
    args = parser.parse_args()
    records = json.loads(args.input.read_text(encoding="utf-8"))
    validate(records)
    if (args.replace_ch2_drafts or args.replace_ch4_drafts) and not args.apply:
        raise RuntimeError("A draft replacement flag requires --apply.")
    if args.replace_ch2_drafts and args.replace_ch4_drafts:
        raise RuntimeError("Choose only one chapter-specific replacement flag.")
    if not args.apply:
        print(f"Validated {len(records)} draft question(s); no database changes made.")
        return 0
    database_url = os.environ.get("COURSE_BRAIN_DATABASE_URL")
    if args.replace_ch2_drafts:
        if database_url:
            raise RuntimeError("CH2 replacement uses the private Supabase RPC; unset COURSE_BRAIN_DATABASE_URL.")
        supabase_url = os.environ.get("SUPABASE_URL")
        service_role_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
        if not supabase_url or not service_role_key:
            raise RuntimeError("CH2 replacement requires SUPABASE_URL plus SUPABASE_SERVICE_ROLE_KEY.")
        result = replace_ch2_rest(records, SupabaseRestClient(supabase_url, service_role_key))
        print(f"Replaced {result['deleted']} CH2 draft question(s) with {result['inserted']} revised draft question(s).")
        return 0
    if args.replace_ch4_drafts:
        if database_url:
            raise RuntimeError("CH4 replacement uses the private Supabase RPC; unset COURSE_BRAIN_DATABASE_URL.")
        supabase_url = os.environ.get("SUPABASE_URL")
        service_role_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
        if not supabase_url or not service_role_key:
            raise RuntimeError("CH4 replacement requires SUPABASE_URL plus SUPABASE_SERVICE_ROLE_KEY.")
        result = replace_ch4_rest(records, SupabaseRestClient(supabase_url, service_role_key))
        print(f"Replaced {result['deleted']} CH4 draft question(s) with {result['inserted']} revised draft question(s).")
        return 0
    if database_url:
        import psycopg
        with psycopg.connect(database_url) as connection:
            inserted = apply(records, connection)
    else:
        supabase_url = os.environ.get("SUPABASE_URL")
        service_role_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
        if not supabase_url or not service_role_key:
            raise RuntimeError("--apply requires COURSE_BRAIN_DATABASE_URL or SUPABASE_URL plus SUPABASE_SERVICE_ROLE_KEY.")
        inserted = apply_rest(records, SupabaseRestClient(supabase_url, service_role_key))
    print(f"Inserted {inserted} new draft question(s).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
