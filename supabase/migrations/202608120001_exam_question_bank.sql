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

-- Rubrics contain answer schemes and must never be readable directly by public
-- roles. The service-only function below is the sole supported access path.
revoke all on table public.quiz_marking_criteria from public, anon, authenticated;

-- An approved question is a complete, source-grounded assessment item. This is
-- deferred because an importer commonly creates the question, options, rubric,
-- and citations in one transaction.
create or replace function public.require_complete_approved_exam_question()
returns trigger
language plpgsql
as $$
declare
  affected_question_ids uuid[];
  affected_content_unit_id uuid;
  affected_question_id uuid;
  approved_question public.quiz_questions%rowtype;
  option_count integer;
  correct_option_count integer;
  criterion_count integer;
  criterion_marks integer;
begin
  if tg_table_name = 'quiz_questions' then
    affected_question_ids := array[coalesce(new.id, old.id)];
  elsif tg_table_name in ('quiz_question_options', 'quiz_marking_criteria') then
    affected_question_ids := array_remove(array[new.question_id, old.question_id], null);
  else
    if tg_table_name = 'source_references' then
      affected_content_unit_id := coalesce(new.content_unit_id, old.content_unit_id);
    else
      affected_content_unit_id := coalesce(new.id, old.id);
    end if;
    select array_agg(distinct question_id)
      into affected_question_ids
      from (
        select quiz.id as question_id
          from public.quiz_questions quiz
         where quiz.source_content_unit_id = affected_content_unit_id
        union
        select criterion.question_id
          from public.quiz_marking_criteria criterion
         where criterion.source_content_unit_id = affected_content_unit_id
      ) affected_questions;
  end if;

  foreach affected_question_id in array coalesce(affected_question_ids, '{}'::uuid[])
  loop
    select * into approved_question
      from public.quiz_questions
     where id = affected_question_id
       and status = 'approved';
    if not found then
      continue;
    end if;

    if approved_question.source_content_unit_id is null
       or not exists (
         select 1
           from public.content_units content_unit
           join public.source_references source_ref on source_ref.content_unit_id = content_unit.id
          where content_unit.id = approved_question.source_content_unit_id
            and content_unit.status = 'published'
       ) then
      raise exception 'Approved question % requires a published, cited question source', approved_question.id;
    end if;

    select count(*), count(*) filter (where is_correct)
      into option_count, correct_option_count
      from public.quiz_question_options
     where question_id = approved_question.id;
    select count(*), coalesce(sum(marks), 0)
      into criterion_count, criterion_marks
      from public.quiz_marking_criteria
     where question_id = approved_question.id;

    if approved_question.question_type = 'mcq' then
      if option_count < 2 or correct_option_count <> 1 or criterion_count <> 0 then
        raise exception 'Approved MCQ % requires at least two options, exactly one correct option, and no marking criteria', approved_question.id;
      end if;
    elsif option_count <> 0 or criterion_count < 1 or criterion_marks <> approved_question.max_marks then
      raise exception 'Approved subjective question % requires no options and criteria totalling max_marks', approved_question.id;
    elsif exists (
      select 1
        from public.quiz_marking_criteria criterion
        left join public.content_units content_unit
          on content_unit.id = criterion.source_content_unit_id
         and content_unit.status = 'published'
        left join public.source_references source_ref on source_ref.content_unit_id = content_unit.id
       where criterion.question_id = approved_question.id
         and (content_unit.id is null or source_ref.id is null)
    ) then
      raise exception 'Approved subjective question % requires every criterion source to be published and cited', approved_question.id;
    end if;
  end loop;
  return null;
end;
$$;

create constraint trigger approved_exam_question_is_complete
  after insert or update or delete on public.quiz_questions
  deferrable initially deferred for each row
  execute function public.require_complete_approved_exam_question();

create constraint trigger approved_exam_question_options_are_complete
  after insert or update or delete on public.quiz_question_options
  deferrable initially deferred for each row
  execute function public.require_complete_approved_exam_question();

create constraint trigger approved_exam_question_criteria_are_complete
  after insert or update or delete on public.quiz_marking_criteria
  deferrable initially deferred for each row
  execute function public.require_complete_approved_exam_question();

create constraint trigger approved_exam_question_sources_are_complete
  after insert or update or delete on public.content_units
  deferrable initially deferred for each row
  execute function public.require_complete_approved_exam_question();

create constraint trigger approved_exam_question_citations_are_complete
  after insert or update or delete on public.source_references
  deferrable initially deferred for each row
  execute function public.require_complete_approved_exam_question();

-- Delivers approved questions scoped to one topic, one chapter, or the whole
-- course, of one explicitly requested type. Callers request MCQs and subjective
-- questions separately, so they can guarantee each count. Chapter scope uses
-- the stable chapter code, not its internal UUID.
create or replace function public.get_public_exam_question_batch(
  p_scope_type text,
  p_scope_value text default null,
  p_question_type public.quiz_question_type default 'mcq',
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
    and quiz.question_type = p_question_type
    and (
      (p_scope_type = 'topic' and quiz.topic_id::text = p_scope_value)
      or (p_scope_type = 'chapter' and exists (
        select 1 from public.chapters chapter
         where chapter.id = topic.chapter_id
           and chapter.code = p_scope_value
      ))
      or (p_scope_type = 'course' and p_scope_value is null)
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

-- The legacy answer checker exposes answer validation directly to browser roles.
-- Retain it only for the server-side answer route.
revoke all on function public.check_public_quiz_answer(uuid, uuid) from anon, authenticated;
grant execute on function public.check_public_quiz_answer(uuid, uuid) to service_role;

revoke all on function public.get_public_exam_question_batch(text, text, public.quiz_question_type, integer) from public, anon, authenticated;
grant execute on function public.get_public_exam_question_batch(text, text, public.quiz_question_type, integer) to anon, authenticated;

revoke all on function public.get_subjective_question_marking_context(uuid) from public, anon, authenticated;
grant execute on function public.get_subjective_question_marking_context(uuid) to service_role;
