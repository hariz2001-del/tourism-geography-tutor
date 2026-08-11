-- Private, atomic remediation path for CH2's unapproved DeepSeek draft bank.
-- It is deliberately CH2-specific: it cannot replace another chapter, cannot
-- touch human-generated rows, and validates all cited sources before deletion.

create or replace function public.replace_ch2_deepseek_draft_bank(p_records jsonb)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  record jsonb;
  source_topic_id uuid;
  source_id uuid;
  question_id uuid;
  option jsonb;
  criterion jsonb;
  deleted_count integer := 0;
  inserted_count integer := 0;
  position integer;
begin
  if jsonb_typeof(p_records) <> 'array' or jsonb_array_length(p_records) = 0 then
    raise exception 'CH2 replacement requires a non-empty JSON array';
  end if;

  -- Validate every item and its exact course anchor before mutating any row.
  for record in select value from jsonb_array_elements(p_records)
  loop
    if record->>'chapter_code' <> 'CH2'
       or coalesce(record->>'status', 'draft') <> 'draft'
       or coalesce(record->>'generated_by', 'deepseek_draft') <> 'deepseek_draft'
       or record->>'question_type' not in ('mcq', 'subjective') then
      raise exception 'Replacement records must be CH2 draft/deepseek_draft MCQ or subjective items';
    end if;
    select topic.id, content.id into source_topic_id, source_id
      from public.chapters chapter
      join public.topics topic on topic.chapter_id = chapter.id
      join public.content_units content on content.topic_id = topic.id
      join public.source_references source_ref on source_ref.content_unit_id = content.id
     where chapter.code = 'CH2'
       and topic.name = record->>'topic_name'
       and content.id = (record->>'source_content_unit_id')::uuid
       and content.title = record->>'source_title'
       and content.status = 'published'
       and source_ref.source_file = record->'source_citation'->>'source_file'
       and source_ref.chapter_label = record->'source_citation'->>'chapter_label'
       and source_ref.page_or_slide = (record->'source_citation'->>'page_or_slide')::integer;
    if source_id is null then
      raise exception 'No exact published CH2 source/citation for %', record->>'source_title';
    end if;
  end loop;

  delete from public.quiz_questions quiz
    using public.topics topic, public.chapters chapter
   where quiz.topic_id = topic.id
     and topic.chapter_id = chapter.id
     and chapter.code = 'CH2'
     and quiz.status = 'draft'
     and quiz.generated_by = 'deepseek_draft';
  get diagnostics deleted_count = row_count;

  for record in select value from jsonb_array_elements(p_records)
  loop
    select topic.id, content.id into source_topic_id, source_id
      from public.chapters chapter
      join public.topics topic on topic.chapter_id = chapter.id
      join public.content_units content on content.topic_id = topic.id
      join public.source_references source_ref on source_ref.content_unit_id = content.id
     where chapter.code = 'CH2'
       and topic.name = record->>'topic_name'
       and content.id = (record->>'source_content_unit_id')::uuid
       and content.title = record->>'source_title'
       and content.status = 'published'
       and source_ref.source_file = record->'source_citation'->>'source_file'
       and source_ref.chapter_label = record->'source_citation'->>'chapter_label'
       and source_ref.page_or_slide = (record->'source_citation'->>'page_or_slide')::integer;

    insert into public.quiz_questions (
      topic_id, source_content_unit_id, question, explanation, difficulty,
      status, generated_by, question_type, max_marks, subjective_answer_scheme
    ) values (
      source_topic_id, source_id, record->>'question',
      coalesce(record->>'explanation', 'Draft requires lecturer review.'),
      record->>'difficulty', 'draft', 'deepseek_draft',
      (record->>'question_type')::public.quiz_question_type,
      coalesce((record->>'max_marks')::smallint, 1), record->>'answer_scheme'
    ) returning id into question_id;

    position := 0;
    for option in select value from jsonb_array_elements(coalesce(record->'options', '[]'::jsonb))
    loop
      position := position + 1;
      insert into public.quiz_question_options (question_id, option_text, display_order, is_correct)
      values (question_id, option->>'text', position, (option->>'is_correct')::boolean);
    end loop;
    position := 0;
    for criterion in select value from jsonb_array_elements(coalesce(record->'criteria', '[]'::jsonb))
    loop
      position := position + 1;
      insert into public.quiz_marking_criteria (
        question_id, source_content_unit_id, criterion, marks, accepted_concepts,
        accepted_synonyms, display_order
      ) values (
        question_id, source_id, criterion->>'criterion', (criterion->>'marks')::smallint,
        coalesce(array(select jsonb_array_elements_text(criterion->'accepted_concepts')), '{}'::text[]),
        coalesce(array(select jsonb_array_elements_text(criterion->'accepted_synonyms')), '{}'::text[]), position
      );
    end loop;
    inserted_count := inserted_count + 1;
  end loop;
  return jsonb_build_object('deleted', deleted_count, 'inserted', inserted_count);
end;
$$;

revoke all on function public.replace_ch2_deepseek_draft_bank(jsonb) from public, anon, authenticated;
grant execute on function public.replace_ch2_deepseek_draft_bank(jsonb) to service_role;
