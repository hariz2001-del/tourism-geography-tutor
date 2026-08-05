-- Public learner policy for the no-login MVP.
-- Trust boundary: anon/authenticated callers can read only published, cited material.
-- All mutations remain database-owner/importer operations; public roles receive no table writes.

revoke all on table public.chapters, public.topics, public.content_units,
  public.source_references, public.quiz_questions, public.quiz_question_options,
  public.content_ingestion_runs, public.anonymous_feedback from anon, authenticated;

grant select on table public.chapters, public.topics, public.content_units,
  public.source_references to anon, authenticated;

alter table public.chapters enable row level security;
alter table public.topics enable row level security;
alter table public.content_units enable row level security;
alter table public.source_references enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.quiz_question_options enable row level security;
alter table public.content_ingestion_runs enable row level security;
alter table public.anonymous_feedback enable row level security;

create policy public_reads_published_chapters on public.chapters
  for select to anon, authenticated
  using (exists (
    select 1 from public.topics topic
    join public.content_units content_unit on content_unit.topic_id = topic.id
    where topic.chapter_id = chapters.id
      and content_unit.status = 'published'
  ));

create policy public_reads_published_topics on public.topics
  for select to anon, authenticated
  using (exists (
    select 1 from public.content_units content_unit
    where content_unit.topic_id = topics.id
      and content_unit.status = 'published'
  ));

create policy public_reads_published_content on public.content_units
  for select to anon, authenticated
  using (content_units.status = 'published');

create policy public_reads_citations_for_published_content on public.source_references
  for select to anon, authenticated
  using (exists (
    select 1 from public.content_units content_unit
    where content_unit.id = source_references.content_unit_id
      and content_unit.status = 'published'
  ));

-- Quiz options are intentionally not selectable. The first function produces the
-- safe shape (no answer-key field); the second validates a submitted option.
create or replace function public.get_public_topic_quiz(p_topic_id uuid)
returns table (
  id uuid,
  question text,
  explanation text,
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
    quiz.question,
    quiz.explanation,
    source_ref.source_file,
    source_ref.chapter_label,
    source_ref.page_or_slide,
    jsonb_agg(
      jsonb_build_object('id', option_row.id, 'text', option_row.option_text)
      order by option_row.display_order
    ) as options
  from public.quiz_questions quiz
  join public.content_units source_content
    on source_content.id = quiz.source_content_unit_id
   and source_content.status = 'published'
  join public.source_references source_ref
    on source_ref.content_unit_id = source_content.id
  join public.quiz_question_options option_row
    on option_row.question_id = quiz.id
  where quiz.topic_id = p_topic_id
    and quiz.status = 'approved'
  group by quiz.id, source_ref.id
  order by min(quiz.created_at)
  limit 1;
$$;

create or replace function public.check_public_quiz_answer(
  p_quiz_id uuid,
  p_option_id uuid
)
returns table (is_correct boolean, explanation text)
language sql
security definer
set search_path = pg_catalog, public
stable
as $$
  select option_row.is_correct, quiz.explanation
  from public.quiz_questions quiz
  join public.content_units source_content
    on source_content.id = quiz.source_content_unit_id
   and source_content.status = 'published'
  join public.source_references source_ref
    on source_ref.content_unit_id = source_content.id
  join public.quiz_question_options option_row
    on option_row.question_id = quiz.id
  where quiz.id = p_quiz_id
    and quiz.status = 'approved'
    and option_row.id = p_option_id;
$$;

revoke all on function public.get_public_topic_quiz(uuid) from public, anon, authenticated;
revoke all on function public.check_public_quiz_answer(uuid, uuid) from public, anon, authenticated;
grant execute on function public.get_public_topic_quiz(uuid) to anon, authenticated;
grant execute on function public.check_public_quiz_answer(uuid, uuid) to anon, authenticated;
