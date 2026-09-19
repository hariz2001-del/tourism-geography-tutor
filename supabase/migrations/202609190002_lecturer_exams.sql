-- Exams the lecturer builds herself.
--
-- Until now an assessment was a random draw from the question bank: a different
-- paper every time, assembled by drawCoursePaper(). The lecturer asked for the
-- opposite — she picks the questions, puts them in an order, names the set, and
-- publishes it. Students sit exactly that paper. Sets she is still working on, or
-- has retired, stay out of their sight.

create type public.exam_status as enum ('draft', 'published', 'archived');

create table public.exams (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(trim(title)) > 0),
  description text,
  status public.exam_status not null default 'draft',
  created_by uuid not null references public.profiles(id) on delete restrict,
  -- Whether a student sees the answers once they submit. Her call per paper.
  show_answers boolean not null default true,
  -- The shape she chose when creating it, so the builder can say "15 of 20 added".
  -- A target, not a rule: the paper is whatever questions are actually in it.
  target_mcq smallint not null default 0 check (target_mcq >= 0),
  target_subjective smallint not null default 0 check (target_subjective >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.exam_questions (
  id uuid primary key default gen_random_uuid(),
  exam_id uuid not null references public.exams(id) on delete cascade,
  -- restrict, not cascade: deleting a question that is sitting in a paper would
  -- silently shorten that paper. The lecturer is told to take it out first.
  question_id uuid not null references public.quiz_questions(id) on delete restrict,
  display_order integer not null check (display_order > 0),
  created_at timestamptz not null default now(),
  unique (exam_id, display_order),
  unique (exam_id, question_id)
);

create index exam_questions_exam_id_idx on public.exam_questions (exam_id, display_order);

-- An attempt at a built exam points back at it. scope_value carries the same id so
-- the existing results grouping keeps working without a special case.
alter table public.assessment_attempts
  add column exam_id uuid references public.exams(id) on delete set null,
  add constraint assessment_attempts_exam_mode_check
    check ((mode = 'exam' and exam_id is not null) or (mode <> 'exam' and exam_id is null));

create index assessment_attempts_exam_id_idx on public.assessment_attempts (exam_id, submitted_at desc);

alter table public.exams enable row level security;
alter table public.exam_questions enable row level security;

revoke all on table public.exams from public, anon, authenticated;
revoke all on table public.exam_questions from public, anon, authenticated;
grant select, insert, update, delete on table public.exams to authenticated;
grant select, insert, update, delete on table public.exam_questions to authenticated;

-- The lecturer owns the whole lifecycle.
create policy exams_lecturer_manages on public.exams
  for all to authenticated
  using (public.current_app_role() = 'lecturer')
  with check (public.current_app_role() = 'lecturer');

create policy exam_questions_lecturer_manages on public.exam_questions
  for all to authenticated
  using (public.current_app_role() = 'lecturer')
  with check (public.current_app_role() = 'lecturer');

-- A student sees a paper only once it is published. Draft and archived sets are
-- invisible to them, which is the point of archiving one.
create policy exams_student_reads_published on public.exams
  for select to authenticated
  using (status = 'published');

create policy exam_questions_readable_with_exam on public.exam_questions
  for select to authenticated
  using (exists (
    select 1 from public.exams exam
    where exam.id = exam_questions.exam_id and exam.status = 'published'));

/**
 * The paper as the student receives it: in the lecturer's order, and carrying no
 * answer key. Same columns as get_public_exam_question_batch so the app maps both
 * the same way — but ordered, not random, and with nothing that reveals the answer
 * (no is_correct, no explanation, no subjective_answer_scheme, no criteria).
 *
 * A lecturer may read her own paper before publishing it, so she can preview.
 */
create or replace function public.get_exam_questions(p_exam_id uuid)
returns table (id uuid, topic_id uuid, source_content_unit_id uuid,
  question_type public.quiz_question_type, question text, difficulty text,
  max_marks smallint, source_file text, chapter_label text, page_or_slide integer,
  chapter_code text, options jsonb, display_order integer)
language sql security definer set search_path = pg_catalog, public stable as $$
  select quiz.id, quiz.topic_id, quiz.source_content_unit_id, quiz.question_type,
    quiz.question, quiz.difficulty, quiz.max_marks, source_ref.source_file,
    source_ref.chapter_label, source_ref.page_or_slide, chapter.code,
    coalesce(jsonb_agg(jsonb_build_object('id', option_row.id, 'text', option_row.option_text)
      order by option_row.display_order) filter (where option_row.id is not null), '[]'::jsonb),
    paper.display_order
  from public.exam_questions paper
  join public.exams exam on exam.id = paper.exam_id
  join public.quiz_questions quiz on quiz.id = paper.question_id
  join public.topics topic on topic.id = quiz.topic_id
  join public.chapters chapter on chapter.id = topic.chapter_id
  join public.content_units source_content on source_content.id = quiz.source_content_unit_id and source_content.status = 'published'
  join public.source_references source_ref on source_ref.content_unit_id = source_content.id
  left join public.quiz_question_options option_row on option_row.question_id = quiz.id
  where paper.exam_id = p_exam_id
    and quiz.status <> 'archived'
    and (exam.status = 'published' or public.current_app_role() = 'lecturer')
  group by quiz.id, source_ref.id, chapter.code, paper.display_order
  order by paper.display_order;
$$;

revoke all on function public.get_exam_questions(uuid) from public, anon, authenticated;
grant execute on function public.get_exam_questions(uuid) to authenticated, service_role;
