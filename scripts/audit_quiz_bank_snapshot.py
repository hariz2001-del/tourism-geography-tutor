"""Run deterministic, read-only diagnostics on a private quiz-bank snapshot.

The input contains server-only answer keys and rubrics and must stay under the
gitignored ``data/audits-private`` tree. Outputs contain only question identifiers,
learner-visible prompts, metrics, and issue codes; they never copy answer keys,
accepted concepts, synonyms, or full marking schemes.
"""

from __future__ import annotations

import argparse
import json
import re
from collections import Counter, defaultdict
from dataclasses import dataclass
from datetime import datetime, timezone
from difflib import SequenceMatcher
from pathlib import Path
from typing import Any


GENERIC_EXPLANATIONS = {
    "use the answer criteria to check the key points in your response.",
    "the correct option matches the geographical fact or definition being tested.",
    "this option best matches the definition or fact in the question.",
}

PIPELINE_PATTERNS = (
    "course material",
    "course item",
    "published unit",
    "content unit",
    "draft",
    "generated",
    "according to the course",
)


@dataclass(frozen=True)
class BankItem:
    raw: dict[str, Any]
    question: dict[str, Any]
    chapter_code: str
    topic_name: str
    source_unit: dict[str, Any]
    source_reference: dict[str, Any] | None


def normalized(text: str) -> str:
    text = text.casefold().replace("’", "'")
    return " ".join(re.findall(r"[a-z0-9]+", text))


def words(text: str) -> set[str]:
    return set(normalized(text).split())


def jaccard(left: str, right: str) -> float:
    a, b = words(left), words(right)
    if not a and not b:
        return 1.0
    if not a or not b:
        return 0.0
    return len(a & b) / len(a | b)


def load_items(shard_dir: Path) -> list[BankItem]:
    items: list[BankItem] = []
    for path in sorted(shard_dir.glob("terra-*.json")):
        for raw in json.loads(path.read_text(encoding="utf-8")):
            items.append(
                BankItem(
                    raw=raw,
                    question=raw["question"],
                    chapter_code=raw["chapter_code"],
                    topic_name=raw["topic_name"],
                    source_unit=raw["source_unit"],
                    source_reference=raw.get("source_reference"),
                )
            )
    ids = [item.question["id"] for item in items]
    if len(items) != 208 or len(set(ids)) != 208:
        raise ValueError(f"Expected 208 unique questions, got {len(items)} rows/{len(set(ids))} IDs")
    return items


def add_issue(issues: list[dict[str, str]], code: str, detail: str) -> None:
    issues.append({"code": code, "detail": detail})


def inspect_item(item: BankItem) -> dict[str, Any]:
    q = item.question
    issues: list[dict[str, str]] = []
    options = sorted(q.get("quiz_question_options") or [], key=lambda x: x.get("display_order", 0))
    criteria = sorted(q.get("quiz_marking_criteria") or [], key=lambda x: x.get("display_order", 0))
    qtype = q.get("question_type")
    prompt = str(q.get("question") or "")
    explanation = str(q.get("explanation") or "")

    if item.source_unit.get("status") != "published":
        add_issue(issues, "source_mismatch", "Question source unit is not published.")
    if not item.source_reference:
        add_issue(issues, "citation_mismatch", "Question source unit has no source reference.")
    if q.get("topic_id") != item.source_unit.get("topic_id"):
        add_issue(issues, "source_mismatch", "Question topic differs from its source unit topic.")

    lowered = prompt.casefold()
    hits = [pattern for pattern in PIPELINE_PATTERNS if pattern in lowered]
    if hits:
        add_issue(issues, "wording_ambiguous", f"Internal/course-pipeline wording remains: {', '.join(hits)}.")
    if len(prompt.split()) > 38:
        add_issue(issues, "language_burden", f"Prompt is {len(prompt.split())} words long.")

    if explanation.strip().casefold() in GENERIC_EXPLANATIONS:
        add_issue(issues, "explanation_generic", "Stored explanation is generic rather than item-specific.")

    if qtype == "mcq":
        correct = [option for option in options if option.get("is_correct") is True]
        if len(options) != 4:
            add_issue(issues, "distractor_weak", f"MCQ has {len(options)} options instead of four.")
        if len(correct) == 0:
            add_issue(issues, "wrong_key", "MCQ has no keyed correct option.")
        elif len(correct) > 1:
            add_issue(issues, "multiple_correct", f"MCQ has {len(correct)} keyed correct options.")
        normalized_options = [normalized(str(option.get("option_text") or "")) for option in options]
        if len(normalized_options) != len(set(normalized_options)):
            add_issue(issues, "multiple_correct", "MCQ contains duplicate option text.")
        if criteria:
            add_issue(issues, "other", "MCQ unexpectedly has subjective marking criteria.")
        if q.get("subjective_answer_scheme"):
            add_issue(issues, "other", "MCQ unexpectedly has a subjective answer scheme.")
        if options and correct:
            lengths = [len(str(option.get("option_text") or "").split()) for option in options]
            keyed_length = len(str(correct[0].get("option_text") or "").split())
            other_lengths = [length for option, length in zip(options, lengths) if option is not correct[0]]
            median_other = sorted(other_lengths)[len(other_lengths) // 2] if other_lengths else 0
            if median_other and keyed_length >= median_other * 2.5 and keyed_length - median_other >= 5:
                add_issue(issues, "answer_leakage", "The keyed option is much longer than the distractors.")
    elif qtype == "subjective":
        if options:
            add_issue(issues, "other", "Written question unexpectedly has MCQ options.")
        criterion_marks = sum(int(criterion.get("marks") or 0) for criterion in criteria)
        max_marks = int(q.get("max_marks") or 0)
        if criterion_marks != max_marks:
            add_issue(issues, "marks_mismatch", f"Criteria total {criterion_marks}; max_marks is {max_marks}.")
        if not criteria:
            add_issue(issues, "marks_mismatch", "Written question has no marking criteria.")
        if not q.get("subjective_answer_scheme"):
            add_issue(issues, "answer_scheme_mismatch", "Written question has no answer scheme.")
        source_ids = {criterion.get("source_content_unit_id") for criterion in criteria}
        if None in source_ids or "" in source_ids:
            add_issue(issues, "criterion_unsupported", "A marking criterion has no source unit.")
        if len(source_ids - {q.get("source_content_unit_id")}) > 0:
            add_issue(issues, "criterion_unsupported", "At least one criterion cites a different unit; verify cross-source alignment.")
        for criterion in criteria:
            concepts = criterion.get("accepted_concepts") or []
            if not concepts:
                add_issue(issues, "accepted_terms_brittle", "A criterion has no accepted concepts.")
                break
    else:
        add_issue(issues, "other", f"Unknown question type: {qtype!r}.")

    return {
        "question_id": q["id"],
        "chapter_code": item.chapter_code,
        "topic_name": item.topic_name,
        "question_topic_id": q.get("topic_id"),
        "source_topic_id": item.source_unit.get("topic_id"),
        "source_unit_id": q.get("source_content_unit_id"),
        "source_page": (item.source_reference or {}).get("page_or_slide"),
        "question_type": qtype,
        "difficulty": q.get("difficulty"),
        "question": prompt,
        "issues": issues,
    }


def duplicate_groups(items: list[BankItem]) -> tuple[list[list[str]], list[dict[str, Any]]]:
    by_norm: dict[str, list[BankItem]] = defaultdict(list)
    for item in items:
        by_norm[normalized(item.question["question"])].append(item)
    exact = [
        [item.question["id"] for item in group]
        for group in by_norm.values()
        if len(group) > 1
    ]

    near: list[dict[str, Any]] = []
    ordered = sorted(items, key=lambda item: item.question["id"])
    for index, left in enumerate(ordered):
        left_prompt = left.question["question"]
        for right in ordered[index + 1 :]:
            if left.question.get("question_type") != right.question.get("question_type"):
                continue
            right_prompt = right.question["question"]
            sequence = SequenceMatcher(None, normalized(left_prompt), normalized(right_prompt)).ratio()
            overlap = jaccard(left_prompt, right_prompt)
            if sequence >= 0.88 or (sequence >= 0.78 and overlap >= 0.72):
                near.append(
                    {
                        "left_id": left.question["id"],
                        "right_id": right.question["id"],
                        "sequence_ratio": round(sequence, 3),
                        "token_jaccard": round(overlap, 3),
                    }
                )
    return exact, near


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--private-root",
        type=Path,
        default=Path("data/audits-private/quiz-bank-2026-09-03"),
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("data/audits/quiz-bank-2026-09-03/structural-diagnostics.json"),
    )
    args = parser.parse_args()

    items = load_items(args.private_root / "shards")
    diagnostics = [inspect_item(item) for item in items]
    exact, near = duplicate_groups(items)

    source_counts = Counter(item.question.get("source_content_unit_id") for item in items)
    topic_counts = Counter((item.chapter_code, item.topic_name) for item in items)
    chapter_counts = Counter(item.chapter_code for item in items)
    type_counts = Counter(item.question.get("question_type") for item in items)
    difficulty_counts = Counter(item.question.get("difficulty") for item in items)
    issue_counts = Counter(issue["code"] for row in diagnostics for issue in row["issues"])

    snapshot_units = json.loads((args.private_root / "snapshot" / "units.json").read_text(encoding="utf-8"))
    snapshot_topics = json.loads((args.private_root / "snapshot" / "topics.json").read_text(encoding="utf-8"))
    snapshot_chapters = json.loads((args.private_root / "snapshot" / "chapters.json").read_text(encoding="utf-8"))
    topic_by_id = {row["id"]: row for row in snapshot_topics}
    chapter_by_id = {row["id"]: row for row in snapshot_chapters}
    unused_units: list[dict[str, Any]] = []
    for unit in snapshot_units:
        if unit.get("status") != "published" or unit["id"] in source_counts:
            continue
        topic = topic_by_id[unit["topic_id"]]
        chapter = chapter_by_id[topic["chapter_id"]]
        references = unit.get("source_references") or []
        reference = references[0] if isinstance(references, list) and references else references
        unused_units.append(
            {
                "chapter_code": chapter["code"],
                "topic_id": topic["id"],
                "topic_name": topic["name"],
                "source_unit_id": unit["id"],
                "source_unit_title": unit["title"],
                "content_type": unit["content_type"],
                "source_page": reference.get("page_or_slide"),
            }
        )

    topic_scope_counts = Counter(item.question.get("topic_id") for item in items)
    topic_source_counts = Counter(item.source_unit.get("topic_id") for item in items)
    topic_coverage = []
    for topic in snapshot_topics:
        chapter = chapter_by_id[topic["chapter_id"]]
        topic_coverage.append(
            {
                "chapter_code": chapter["code"],
                "topic_id": topic["id"],
                "topic_name": topic["name"],
                "question_scope_count": topic_scope_counts[topic["id"]],
                "source_aligned_count": topic_source_counts[topic["id"]],
            }
        )

    output = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "total_questions": len(items),
        "counts": {
            "by_chapter": dict(sorted(chapter_counts.items())),
            "by_type": dict(sorted(type_counts.items())),
            "by_difficulty": dict(sorted(difficulty_counts.items())),
            "unique_source_units": len(source_counts),
            "questions_per_source_unit": dict(sorted(Counter(source_counts.values()).items())),
            "by_topic": {
                f"{chapter} — {topic}": count
                for (chapter, topic), count in sorted(topic_counts.items())
            },
            "issue_codes": dict(sorted(issue_counts.items())),
        },
        "exact_duplicate_groups": exact,
        "near_duplicate_pairs": near,
        "published_units_without_questions": sorted(
            unused_units,
            key=lambda row: (row["chapter_code"], row["topic_name"], row["source_page"] or 0),
        ),
        "topic_coverage": sorted(topic_coverage, key=lambda row: (row["chapter_code"], row["topic_name"])),
        "questions": diagnostics,
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(output, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps(output["counts"], indent=2))
    print(f"exact_duplicate_groups={len(exact)} near_duplicate_pairs={len(near)}")
    print(f"output={args.output}")


if __name__ == "__main__":
    main()
