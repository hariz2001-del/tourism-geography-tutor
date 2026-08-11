-- Exam question-bank foundation for the no-login MVP.
-- Public callers receive only an exam delivery shape. Answer schemes, marking
-- criteria, explanations, and correct-option flags remain server-side.

create type public.quiz_question_type as enum ('mcq', 'subjective');

alter table public.quiz_questions
  add column question_type public.quiz_question_type not null default 'mcq',
  add column max_marks smallint not null default 1 check (max_marks > 0),
  add column subjective_answer_scheme text,
  add constraint quiz_questions_subjective_answer_scheme_chk check (
    (question_type = 'mcq' and subjective_answer_scheme is null)
    or (question_type = 'subjective' and char_length(trim(subjective_answer_scheme)) > 0)
  );

create table public.quiz_marking_criteria (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.quiz_questions(id) on delete cascade,
  source_content_unit_id uuid not null references public.content_units(id) on delete restrict,
  criterion text not null check (char_length(trim(criterion)) > 0),
  marks smallint not null check (marks > 0),
  accepted_concepts text[] not null default '{}'::text[],
  accepted_synonyms text[] not null default '{}'::text[],
  display_order integer not null check (display_order > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (question_id, display_order)
);

create index quiz_marking_criteria_question_id_idx
  on public.quiz_marking_criteria(question_id);

alter table public.quiz_marking_criteria enable row level security;

-- Delivers approved questions scoped to one topic, one chapter, or the whole
-- course. Course scope has no course table in this MVP, so it requires NULL.
create or replace function public.get_public_exam_question_batch(
  p_scope_type text,
  p_scope_id uuid default null,
  p_limit integer default 10
)
returns table (
  id uuid,
  topic_id uuid,
  source_content_unit_id uuid,
  question_type public.quiz_question_type,
  question text,
  difficulty text,
  max_marks smallint,
  source_file text,
  chapter_label text,
  page_or_slide integer,
  options jsonb
)
language sql
security definer
set search_path = pg_catalog, public
stable
as $$
  select
    quiz.id,
    quiz.topic_id,
    quiz.source_content_unit_id,
    quiz.question_type,
    quiz.question,
    quiz.difficulty,
    quiz.max_marks,
    source_ref.source_file,
    source_ref.chapter_label,
    source_ref.page_or_slide,
    coalesce(
      jsonb_agg(
        jsonb_build_object('id', option_row.id, 'text', option_row.option_text)
        order by option_row.display_order
      ) filter (where option_row.id is not null),
      '[]'::jsonb
    ) as options
  from public.quiz_questions quiz
  join public.topics topic on topic.id = quiz.topic_id
  join public.content_units source_content
    on source_content.id = quiz.source_content_unit_id
   and source_content.status = 'published'
  join public.source_references source_ref
    on source_ref.content_unit_id = source_content.id
  left join public.quiz_question_options option_row
    on option_row.question_id = quiz.id
  where quiz.status = 'approved'
    and (
      (p_scope_type = 'topic' and quiz.topic_id = p_scope_id)
      or (p_scope_type = 'chapter' and topic.chapter_id = p_scope_id)
      or (p_scope_type = 'course' and p_scope_id is null)
    )
  group by quiz.id, source_ref.id
  order by min(quiz.created_at), quiz.id
  limit least(greatest(coalesce(p_limit, 10), 1), 50);
$$;

-- This is intentionally not callable by anon/authenticated roles. A future
-- server-only subjective-marking route can use it with SUPABASE_SERVICE_ROLE_KEY
-- to obtain the reviewed scheme and criteria for the existing grounded fallback.
create or replace function public.get_subjective_question_marking_context(p_quiz_id uuid)
returns table (
  id uuid,
  question text,
  max_marks smallint,
  source_content_unit_id uuid,
  subjective_answer_scheme text,
  criteria jsonb
)
language sql
security definer
set search_path = pg_catalog, public
stable
as $$
  select
    quiz.id,
    quiz.question,
    quiz.max_marks,
    quiz.source_content_unit_id,
    quiz.subjective_answer_scheme,
    coalesce(
      jsonb_agg(
        jsonb_build_object(
          'id', criterion.id,
          'sourceContentUnitId', criterion.source_content_unit_id,
          'criterion', criterion.criterion,
          'marks', criterion.marks,
          'acceptedConcepts', criterion.accepted_concepts,
          'acceptedSynonyms', criterion.accepted_synonyms
        ) order by criterion.display_order
      ) filter (where criterion.id is not null),
      '[]'::jsonb
    ) as criteria
  from public.quiz_questions quiz
  join public.content_units source_content
    on source_content.id = quiz.source_content_unit_id
   and source_content.status = 'published'
  join public.source_references source_ref
    on source_ref.content_unit_id = source_content.id
  left join public.quiz_marking_criteria criterion
    on criterion.question_id = quiz.id
  where quiz.id = p_quiz_id
    and quiz.status = 'approved'
    and quiz.question_type = 'subjective'
  group by quiz.id;
$$;

revoke all on function public.get_public_exam_question_batch(text, uuid, integer) from public, anon, authenticated;
grant execute on function public.get_public_exam_question_batch(text, uuid, integer) to anon, authenticated;

revoke all on function public.get_subjective_question_marking_context(uuid) from public, anon, authenticated;
grant execute on function public.get_subjective_question_marking_context(uuid) to service_role;
