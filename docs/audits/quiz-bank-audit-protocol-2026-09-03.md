# Quiz-bank audit protocol — 2026-09-03

## What we're focusing on next

Audit every one of the 208 live draft questions against its published source unit and the actual cited PDF page. Preserve one structured result per question before moving to the next question, then have the coordinating reviewer adjudicate every Terra result.

## Scope and authority

- Audit snapshot: live Supabase `quiz_questions`, options, marking criteria, published content units, topics, chapters, and source references fetched read-only on 2026-09-03.
- Private snapshot: `data/audits-private/quiz-bank-2026-09-03/` (gitignored because it contains answer keys and rubrics).
- Durable progress: `data/audits/quiz-bank-2026-09-03/progress/*.jsonl`.
- Final sanitized results: `data/audits/quiz-bank-2026-09-03/results.json`.
- Final report: `docs/pedagogy-review-quiz-bank-2026-09-03.md`.
- This pass is advisory and GET-only. It must not approve, reject, patch, or delete database records.

The intended use is low-stakes formative practice for DTM10333 Tourism Geography learners. The exact learner English level and formal course learning outcomes are not available. For question-level alignment, use the cited published unit and actual PDF page; do not use secondary audit prose as a source.

## Skills applied

1. `assessment-validity-checker`: source/content alignment, construct validity, difficulty/cognitive demand, reliability, ambiguity, authenticity, and likely learning consequences.
2. `feedback-quality-analyser`: specificity and actionability of answer schemes, marking criteria, explanations, and the risk of unfairly rejecting a source-correct response.
3. Project `course-content` rules: exact source fidelity, mandatory provenance, no invented corrections, and actual-PDF verification.

## Required checks for every question

### All questions

- The source unit exists, is published, and has a citation.
- The prompt is answerable from the cited unit and actual cited PDF page.
- No fact, qualifier, example, or correction is attributed to the slide when the slide does not support it.
- The wording is clear, grammatically usable, non-leading, and does not expose internal pipeline language.
- The declared difficulty reflects the cognitive operation actually required.
- The item does not unfairly measure avoidable language complexity, guessing strategy, or familiarity with the app instead of Tourism Geography.
- Note exact or near duplication with another question.

### MCQ

- Exactly one option is marked correct.
- The keyed option is fully supported and uniquely best.
- Distractors are plausible, mutually exclusive, parallel in form, and clearly wrong from the source.
- No length, grammar, repetition, absolute-word, or position clue reveals the key.
- The explanation identifies the relevant fact rather than merely saying that an option is correct.

### Written response

- `max_marks` equals the sum of criterion marks.
- The answer scheme, criteria, accepted concepts, and accepted synonyms all match the prompt and source.
- Each criterion is atomic enough to mark consistently; criteria neither overlap nor double-count.
- A learner using the source's exact wording can receive every deserved mark.
- Accepted terms are not so narrow that an equivalent source-correct response is rejected.
- Feedback scaffolding is specific enough to show what was met and what to do next. Generic stored explanation text may be noted without automatically failing the question when runtime criterion feedback supplies the missing specificity.

## Verdicts

- `pass`: valid and fair as written.
- `pass_with_note`: usable; a non-blocking improvement or bank-level issue exists.
- `revise`: a correctable defect can affect validity, reliability, clarity, or feedback quality.
- `reject`: the item is fundamentally unsupported, incorrectly keyed, or not salvageable without redesign.
- `needs_lecturer_ruling`: the source is defective or ambiguous and the project must not silently adjudicate it.

Severity is one of `none`, `minor`, `moderate`, `major`, or `critical`.

## Issue codes

Use zero or more of:

`citation_mismatch`, `source_mismatch`, `unsupported_claim`, `source_defect`, `wrong_key`, `ambiguous_key`, `multiple_correct`, `answer_leakage`, `wording_ambiguous`, `language_burden`, `difficulty_mislabel`, `recall_only`, `duplicate_exact`, `duplicate_near`, `distractor_weak`, `distractor_nonparallel`, `explanation_generic`, `explanation_mismatch`, `marks_mismatch`, `criterion_unsupported`, `criterion_overlap`, `criterion_nonatomic`, `accepted_terms_brittle`, `answer_scheme_mismatch`, `construct_irrelevant_variance`, `other`.

## Per-question JSONL contract

Write exactly one valid JSON object per line, immediately after reviewing that question:

```json
{
  "question_id": "uuid",
  "chapter_code": "CH1",
  "topic_id": "uuid",
  "source_unit_id": "uuid",
  "source_page": 1,
  "question_type": "mcq",
  "difficulty": "introductory",
  "verdict": "pass",
  "severity": "none",
  "issue_codes": [],
  "source_alignment": "pass",
  "marking_fairness": "pass",
  "feedback_quality": "pass",
  "difficulty_fit": "pass",
  "duplicate_of": [],
  "pdf_checked": true,
  "notes": "Concise evidence-backed judgement without reproducing private answer keys.",
  "recommended_action": "Keep as written.",
  "reviewer": "terra-a",
  "reviewed_at": "2026-09-03T00:00:00+08:00"
}
```

Do not include the correct option, accepted concepts, accepted synonyms, full rubric, or answer scheme in tracked progress. Those remain in the private snapshot.

## Persistence and completeness rules

- Each Terra reviewer owns one shard and one progress file; no two reviewers write the same file.
- Write the result before opening the next question. Do not hold completed judgments only in context.
- Never delete or rewrite an earlier line. If reconsidering a result, append a second record with the same `question_id` and `supersedes: true`; the coordinator uses the last record.
- Periodically compare unique saved IDs with the shard manifest.
- A shard is complete only when its unique result IDs exactly equal its assigned IDs.
- The coordinating reviewer must read and adjudicate all 208 final Terra records, not only the flagged subset.

