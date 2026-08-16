#!/usr/bin/env python3
"""Safely apply the reviewed question-language manifest through Supabase REST."""

from __future__ import annotations

import argparse
import json
import os
from pathlib import Path
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_MANIFEST = ROOT / "data/question-language-rewrite-2026-08-16.json"


class RestClient:
    def __init__(self, url: str, key: str) -> None:
        self.base_url = url.rstrip("/") + "/rest/v1"
        self.headers = {
            "apikey": key,
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
        }

    def request(self, method: str, table: str, *, params: dict[str, str] | None = None,
                payload: Any | None = None, prefer: str | None = None) -> Any:
        query = f"?{urlencode(params)}" if params else ""
        headers = dict(self.headers)
        if prefer:
            headers["Prefer"] = prefer
        body = json.dumps(payload).encode("utf-8") if payload is not None else None
        request = Request(f"{self.base_url}/{table}{query}", data=body, headers=headers, method=method)
        try:
            with urlopen(request, timeout=30) as response:  # nosec B310: operator-configured URL
                raw = response.read().decode("utf-8")
        except HTTPError as error:
            raise RuntimeError(f"Supabase REST {method} {table} failed with HTTP {error.code}.") from error
        except URLError as error:
            raise RuntimeError(f"Supabase REST {method} {table} could not be reached.") from error
        return json.loads(raw) if raw else None


def expected_value(delta: dict[str, Any], side: str, field: str) -> Any:
    value = delta[side]
    if field == "subjective_answer_scheme" and value is None:
        return None
    return value


def load_live(client: RestClient) -> tuple[list[dict[str, Any]], list[dict[str, Any]], list[dict[str, Any]]]:
    questions = client.request("GET", "quiz_questions", params={
        "select": "id,source_content_unit_id,question_type,question,explanation,subjective_answer_scheme,status,generated_by",
        "generated_by": "eq.deepseek_draft", "status": "eq.draft", "limit": "1000",
    })
    options = client.request("GET", "quiz_question_options", params={
        "select": "id,question_id,option_text,display_order,is_correct", "order": "question_id,display_order", "limit": "1000",
    })
    criteria = client.request("GET", "quiz_marking_criteria", params={
        "select": "id,question_id,criterion,display_order", "order": "question_id,display_order", "limit": "1000",
    })
    if not all(isinstance(rows, list) for rows in (questions, options, criteria)):
        raise RuntimeError("Supabase returned an invalid bank snapshot.")
    return questions, options, criteria


def build_plan(manifest: list[dict[str, Any]], questions: list[dict[str, Any]],
               options: list[dict[str, Any]], criteria: list[dict[str, Any]]) -> list[dict[str, Any]]:
    options_by_question: dict[str, list[dict[str, Any]]] = {}
    criteria_by_question: dict[str, list[dict[str, Any]]] = {}
    for option in options:
        options_by_question.setdefault(option["question_id"], []).append(option)
    for criterion in criteria:
        criteria_by_question.setdefault(criterion["question_id"], []).append(criterion)
    plan: list[dict[str, Any]] = []
    seen_ids: set[str] = set()
    for item in manifest:
        candidates = [row for row in questions
                      if row["source_content_unit_id"] == item["source_content_unit_id"]
                      and row["question_type"] == item["question_type"]
                      and row["question"] in {item["old_question"], item["new_question"]}]
        if len(candidates) != 1:
            raise ValueError(f"Expected one live match for {item['chapter_code']} / {item['old_question']!r}; found {len(candidates)}.")
        question = candidates[0]
        if question["id"] in seen_ids:
            raise ValueError(f"Manifest maps more than once to question {question['id']}.")
        seen_ids.add(question["id"])
        update: dict[str, Any] = {}
        rollback: dict[str, Any] = {}
        field_map = {
            "question": "question",
            "answer_scheme": "subjective_answer_scheme",
            "explanation": "explanation",
        }
        for manifest_field, database_field in field_map.items():
            delta = item["changes"].get(manifest_field)
            if not delta:
                continue
            before = expected_value(delta, "before", database_field)
            after = expected_value(delta, "after", database_field)
            current = question.get(database_field)
            if current not in (before, after):
                raise ValueError(f"Unexpected live {database_field} for question {question['id']}.")
            if current != after:
                rollback[database_field] = current
                update[database_field] = after

        option_updates: list[dict[str, Any]] = []
        option_delta = item["changes"].get("options")
        if option_delta:
            live_options = sorted(options_by_question.get(question["id"], []), key=lambda row: row["display_order"])
            before_options = option_delta["before"]
            after_options = option_delta["after"]
            if len(live_options) != len(before_options) or len(live_options) != len(after_options):
                raise ValueError(f"Unexpected option count for question {question['id']}.")
            for live, before, after in zip(live_options, before_options, after_options, strict=True):
                current = {"text": live["option_text"], "is_correct": live["is_correct"]}
                expected_before = {"text": before["text"], "is_correct": before["is_correct"]}
                expected_after = {"text": after["text"], "is_correct": after["is_correct"]}
                if current not in (expected_before, expected_after):
                    raise ValueError(f"Unexpected option state for question {question['id']} / order {live['display_order']}.")
                if current != expected_after:
                    option_updates.append({"id": live["id"], "before": live["option_text"], "after": after["text"]})

        criterion_updates: list[dict[str, Any]] = []
        criterion_delta = item["changes"].get("criteria")
        if criterion_delta:
            live_criteria = sorted(criteria_by_question.get(question["id"], []), key=lambda row: row["display_order"])
            before_criteria = criterion_delta["before"]
            after_criteria = criterion_delta["after"]
            if len(live_criteria) != len(before_criteria) or len(live_criteria) != len(after_criteria):
                raise ValueError(f"Unexpected criterion count for question {question['id']}.")
            for live, before, after in zip(live_criteria, before_criteria, after_criteria, strict=True):
                current = live["criterion"]
                if current not in (before["criterion"], after["criterion"]):
                    raise ValueError(f"Unexpected criterion state for question {question['id']} / order {live['display_order']}.")
                if current != after["criterion"]:
                    criterion_updates.append({"id": live["id"], "before": current, "after": after["criterion"]})
        plan.append({"id": question["id"], "question_update": update, "question_rollback": rollback,
                     "option_updates": option_updates, "criterion_updates": criterion_updates})
    return plan


def patch(client: RestClient, table: str, row_id: str, payload: dict[str, Any]) -> None:
    client.request("PATCH", table, params={"id": f"eq.{row_id}"}, payload=payload, prefer="return=minimal")


def apply_plan(client: RestClient, plan: list[dict[str, Any]]) -> None:
    rollbacks: list[tuple[str, str, dict[str, Any]]] = []
    try:
        for item in plan:
            if item["question_update"]:
                patch(client, "quiz_questions", item["id"], item["question_update"])
                rollbacks.append(("quiz_questions", item["id"], item["question_rollback"]))
            for option in item["option_updates"]:
                patch(client, "quiz_question_options", option["id"], {"option_text": option["after"]})
                rollbacks.append(("quiz_question_options", option["id"], {"option_text": option["before"]}))
            for criterion in item["criterion_updates"]:
                patch(client, "quiz_marking_criteria", criterion["id"], {"criterion": criterion["after"]})
                rollbacks.append(("quiz_marking_criteria", criterion["id"], {"criterion": criterion["before"]}))
    except Exception:
        for table, row_id, payload in reversed(rollbacks):
            try:
                patch(client, table, row_id, payload)
            except Exception:
                pass
        raise


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("manifest", nargs="?", type=Path, default=DEFAULT_MANIFEST)
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()
    url = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key:
        raise RuntimeError("SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY are required.")
    manifest = json.loads(args.manifest.read_text(encoding="utf-8"))
    client = RestClient(url, key)
    snapshot = load_live(client)
    plan = build_plan(manifest, *snapshot)
    pending_questions = sum(bool(item["question_update"]) for item in plan)
    pending_options = sum(len(item["option_updates"]) for item in plan)
    pending_criteria = sum(len(item["criterion_updates"]) for item in plan)
    print(f"Preflight matched {len(plan)} manifest entries against {len(snapshot[0])} live questions.")
    print(f"Pending: {pending_questions} question rows, {pending_options} options, {pending_criteria} criteria.")
    if not args.apply:
        print("Dry run only. Use --apply to update the live bank.")
        return 0
    apply_plan(client, plan)
    verification = build_plan(manifest, *load_live(client))
    if any(item["question_update"] or item["option_updates"] or item["criterion_updates"] for item in verification):
        raise RuntimeError("Post-update verification found unapplied changes.")
    print("Live question language rewrite applied and verified.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
