#!/usr/bin/env python3
"""Build the atomic Supabase migration for the reviewed question rewrite."""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "data/question-language-rewrite-2026-08-16.json"
OUTPUT = ROOT / "supabase/migrations/202608160001_naturalize_exam_language.sql"


def main() -> None:
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    payload = json.dumps(manifest, ensure_ascii=False, separators=(",", ":"))
    if "$manifest$" in payload:
        raise ValueError("Manifest contains the SQL dollar-quote delimiter.")
    sql = f"""-- Make learner-facing questions read as ordinary Tourism Geography questions.
-- The manifest retains exact before/after values; any unexpected live state
-- aborts the transaction before the bank can be partially rewritten.

do $migration$
declare
  item jsonb;
  delta jsonb;
  option_item jsonb;
  criterion_item jsonb;
  target_question_id uuid;
  option_id uuid;
  criterion_id uuid;
  match_count integer;
  current_text text;
  current_correct boolean;
  remaining_question text;
  remaining_explanation text;
  item_index integer;
begin
  for item in
    select value from jsonb_array_elements($manifest${payload}$manifest$::jsonb)
  loop
    select count(*) into match_count
    from public.quiz_questions
    where source_content_unit_id = (item->>'source_content_unit_id')::uuid
      and question_type = (item->>'question_type')::public.quiz_question_type
      and question in (item->>'old_question', item->>'new_question')
      and status = 'draft' and generated_by = 'deepseek_draft';
    if match_count <> 1 then
      raise exception 'Expected one question match for %, found %', item->>'old_question', match_count;
    end if;
    select id into target_question_id
    from public.quiz_questions
    where source_content_unit_id = (item->>'source_content_unit_id')::uuid
      and question_type = (item->>'question_type')::public.quiz_question_type
      and question in (item->>'old_question', item->>'new_question')
      and status = 'draft' and generated_by = 'deepseek_draft';

    delta := item->'changes';
    update public.quiz_questions
    set question = case when delta ? 'question' then delta#>>'{{question,after}}' else question end,
        explanation = case when delta ? 'explanation' then delta#>>'{{explanation,after}}' else explanation end,
        subjective_answer_scheme = case when delta ? 'answer_scheme' then delta#>>'{{answer_scheme,after}}' else subjective_answer_scheme end
    where id = target_question_id;

    if delta ? 'options' then
      item_index := 0;
      for option_item in select value from jsonb_array_elements(delta#>'{{options,after}}')
      loop
        item_index := item_index + 1;
        select id, option_text, is_correct into option_id, current_text, current_correct
        from public.quiz_question_options
        where question_id = target_question_id and display_order = item_index;
        if option_id is null then
          raise exception 'Missing option % for question %', item_index, target_question_id;
        end if;
        if current_text not in (
          delta#>>array['options','before',(item_index - 1)::text,'text'],
          option_item->>'text'
        ) or current_correct <> (option_item->>'is_correct')::boolean then
          raise exception 'Unexpected option % state for question %', item_index, target_question_id;
        end if;
        update public.quiz_question_options set option_text = option_item->>'text' where id = option_id;
      end loop;
    end if;

    if delta ? 'criteria' then
      item_index := 0;
      for criterion_item in select value from jsonb_array_elements(delta#>'{{criteria,after}}')
      loop
        item_index := item_index + 1;
        select id, criterion into criterion_id, current_text
        from public.quiz_marking_criteria
        where question_id = target_question_id and display_order = item_index;
        if criterion_id is null then
          raise exception 'Missing criterion % for question %', item_index, target_question_id;
        end if;
        if current_text not in (
          delta#>>array['criteria','before',(item_index - 1)::text,'criterion'],
          criterion_item->>'criterion'
        ) then
          raise exception 'Unexpected criterion % state for question %', item_index, target_question_id;
        end if;
        update public.quiz_marking_criteria set criterion = criterion_item->>'criterion' where id = criterion_id;
      end loop;
    end if;
  end loop;

  if (select count(*) from public.quiz_questions where status = 'draft' and generated_by = 'deepseek_draft') <> 208 then
    raise exception 'Expected the generated practice bank to retain 208 questions.';
  end if;
  select question, explanation into remaining_question, remaining_explanation
  from public.quiz_questions
    where status = 'draft' and generated_by = 'deepseek_draft'
      and (lower(question) like '%course material%'
        or lower(question) like '%course item%'
        or lower(question) like '%in the course%'
        or lower(question) like '%according to the course%'
        or lower(explanation) like '%lecturer review%'
        or lower(explanation) like '%published unit%')
  limit 1;
  if found then
    raise exception 'Learner-facing meta-language remains: question=%, explanation=%',
      remaining_question, remaining_explanation;
  end if;
end
$migration$;
"""
    OUTPUT.write_text(sql, encoding="utf-8")
    print(f"Wrote migration for {len(manifest)} reviewed records to {OUTPUT}")


if __name__ == "__main__":
    main()
