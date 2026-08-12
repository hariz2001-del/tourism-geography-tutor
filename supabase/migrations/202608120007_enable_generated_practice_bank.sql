-- Lecturer approval/login is deliberately deferred for this MVP. Allow the
-- source-validated DeepSeek draft bank to power the assessment routes, while
-- retaining every answer key and subjective rubric behind service-only RPCs.

create or replace function public.get_public_exam_question_batch(
  p_scope_type text, p_scope_value text default null,
  p_question_type public.quiz_question_type default 'mcq', p_limit integer default 10
)
returns table (id uuid, topic_id uuid, source_content_unit_id uuid,
  question_type public.quiz_question_type, question text, difficulty text,
  max_marks smallint, source_file text, chapter_label text, page_or_slide integer,
  chapter_code text, options jsonb)
language sql security definer set search_path = pg_catalog, public volatile as $$
  select quiz.id, quiz.topic_id, quiz.source_content_unit_id, quiz.question_type,
    quiz.question, quiz.difficulty, quiz.max_marks, source_ref.source_file,
    source_ref.chapter_label, source_ref.page_or_slide, chapter.code,
    coalesce(jsonb_agg(jsonb_build_object('id', option_row.id, 'text', option_row.option_text)
      order by option_row.display_order) filter (where option_row.id is not null), '[]'::jsonb)
  from public.quiz_questions quiz
  join public.topics topic on topic.id = quiz.topic_id
  join public.chapters chapter on chapter.id = topic.chapter_id
  join public.content_units source_content on source_content.id = quiz.source_content_unit_id and source_content.status = 'published'
  join public.source_references source_ref on source_ref.content_unit_id = source_content.id
  left join public.quiz_question_options option_row on option_row.question_id = quiz.id
  where quiz.question_type = p_question_type
    and (quiz.status = 'approved' or (quiz.status = 'draft' and quiz.generated_by = 'deepseek_draft'))
    and ((p_scope_type = 'topic' and quiz.topic_id::text = p_scope_value)
      or (p_scope_type = 'chapter' and chapter.code = p_scope_value)
      or (p_scope_type = 'course' and p_scope_value is null))
  group by quiz.id, source_ref.id, chapter.code order by random()
  limit least(greatest(coalesce(p_limit, 10), 1), 50);
$$;

create or replace function public.get_quiz_answer_review(p_quiz_id uuid, p_option_id uuid)
returns table (is_correct boolean, explanation text, answer_scheme text)
language sql security definer set search_path = pg_catalog, public stable as $$
  select submitted.is_correct, quiz.explanation, concat('Correct answer: ', correct_option.option_text)
  from public.quiz_questions quiz
  join public.quiz_question_options submitted on submitted.question_id = quiz.id and submitted.id = p_option_id
  join public.quiz_question_options correct_option on correct_option.question_id = quiz.id and correct_option.is_correct
  where quiz.id = p_quiz_id and quiz.question_type = 'mcq'
    and (quiz.status = 'approved' or (quiz.status = 'draft' and quiz.generated_by = 'deepseek_draft'));
$$;

create or replace function public.get_subjective_question_marking_context(p_quiz_id uuid)
returns table (id uuid, question text, max_marks smallint, source_content_unit_id uuid,
  subjective_answer_scheme text, criteria jsonb)
language sql security definer set search_path = pg_catalog, public stable as $$
  select quiz.id, quiz.question, quiz.max_marks, quiz.source_content_unit_id,
    quiz.subjective_answer_scheme,
    coalesce(jsonb_agg(jsonb_build_object('id', criterion.id,
      'sourceContentUnitId', criterion.source_content_unit_id, 'criterion', criterion.criterion,
      'marks', criterion.marks, 'acceptedConcepts', criterion.accepted_concepts,
      'acceptedSynonyms', criterion.accepted_synonyms) order by criterion.display_order)
      filter (where criterion.id is not null), '[]'::jsonb)
  from public.quiz_questions quiz
  join public.content_units source_content on source_content.id = quiz.source_content_unit_id and source_content.status = 'published'
  join public.source_references source_ref on source_ref.content_unit_id = source_content.id
  left join public.quiz_marking_criteria criterion on criterion.question_id = quiz.id
  where quiz.id = p_quiz_id and quiz.question_type = 'subjective'
    and (quiz.status = 'approved' or (quiz.status = 'draft' and quiz.generated_by = 'deepseek_draft'))
  group by quiz.id;
$$;

revoke all on function public.get_public_exam_question_batch(text, text, public.quiz_question_type, integer) from public, anon, authenticated;
grant execute on function public.get_public_exam_question_batch(text, text, public.quiz_question_type, integer) to anon, authenticated;
revoke all on function public.get_quiz_answer_review(uuid, uuid) from public, anon, authenticated;
grant execute on function public.get_quiz_answer_review(uuid, uuid) to service_role;
revoke all on function public.get_subjective_question_marking_context(uuid) from public, anon, authenticated;
grant execute on function public.get_subjective_question_marking_context(uuid) to service_role;
