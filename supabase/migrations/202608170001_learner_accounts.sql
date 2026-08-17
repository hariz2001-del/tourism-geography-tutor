-- Learner accounts, classrooms, and persisted learner activity.
--
-- This migration lifts the MVP's "no login" exclusion. Two roles exist: student
-- and lecturer. The trust boundary stays in Postgres, not in the app:
--
--   * A logged-in learner becomes the `authenticated` role. That role must NOT
--     gain read access to answer keys (quiz_question_options), rubrics
--     (quiz_marking_criteria), or explanations (quiz_questions). Those tables are
--     granted to `authenticated` here only so a lecturer can administer them;
--     every policy on them requires the lecturer role, so a student's select
--     returns zero rows. Learner delivery still goes through the existing
--     SECURITY DEFINER RPCs.
--   * Lecturers can read their classroom's assessment results, and deliberately
--     have NO policy at all on bookmarks or topic_progress. A learner's saved
--     material and reading history are private to them by construction, so no
--     dashboard bug can expose them.
--   * Students can read their own attempts but never write them. Attempts are
--     inserted only by the server-side marking route using the service-role key,
--     so a learner cannot post themselves a score.

create type public.app_role as enum ('lecturer', 'student');
create type public.bookmark_source as enum ('content', 'flashcard');
create type public.assessment_mode as enum ('topic', 'chapter', 'course');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique check (username ~ '^[a-z0-9_]{3,32}$'),
  display_name text not null check (char_length(trim(display_name)) > 0),
  role public.app_role not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.classrooms (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) > 0),
  lecturer_id uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now()
);

create table public.classroom_members (
  classroom_id uuid not null references public.classrooms(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (classroom_id, student_id)
);

-- Flashcards are derived from published content units (definitions and key
-- takeaways), so one content_unit_id covers both bookmarking surfaces. `source`
-- only records where the learner saved it from.
create table public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  content_unit_id uuid not null references public.content_units(id) on delete cascade,
  source public.bookmark_source not null default 'content',
  note text,
  created_at timestamptz not null default now(),
  unique (student_id, content_unit_id, source)
);

-- Topic-grained rather than an event log: 23 topics means a bounded row count
-- per learner and a direct "N of 23 topics studied" read.
create table public.topic_progress (
  student_id uuid not null references public.profiles(id) on delete cascade,
  topic_id uuid not null references public.topics(id) on delete cascade,
  first_viewed_at timestamptz not null default now(),
  last_viewed_at timestamptz not null default now(),
  view_count integer not null default 1 check (view_count > 0),
  primary key (student_id, topic_id)
);

create table public.assessment_attempts (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  mode public.assessment_mode not null,
  scope_value text,
  scope_label text not null check (char_length(trim(scope_label)) > 0),
  awarded_marks integer not null check (awarded_marks >= 0),
  total_marks integer not null check (total_marks > 0),
  question_count integer not null check (question_count > 0),
  started_at timestamptz not null default now(),
  submitted_at timestamptz not null default now(),
  check (awarded_marks <= total_marks),
  check (
    (mode = 'course' and scope_value is null)
    or (mode <> 'course' and char_length(trim(coalesce(scope_value, ''))) > 0)
  )
);

-- A recorded answer is a self-contained historical record, not a pointer into the
-- live question bank. Two reasons:
--   * Students have no read access to quiz_questions (that is the whole point of
--     the policies below), so a past attempt could not be replayed through a join.
--   * A lecturer editing or deleting a question must not rewrite or block history,
--     hence the denormalised question_text/topic_id and the nullable question_id.
create table public.attempt_answers (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.assessment_attempts(id) on delete cascade,
  question_id uuid references public.quiz_questions(id) on delete set null,
  topic_id uuid references public.topics(id) on delete set null,
  chapter_code text,
  question_text text not null check (char_length(trim(question_text)) > 0),
  question_type public.quiz_question_type not null,
  display_order integer not null check (display_order > 0),
  selected_option_id uuid references public.quiz_question_options(id) on delete set null,
  answer_text text,
  awarded_marks integer not null check (awarded_marks >= 0),
  max_marks integer not null check (max_marks > 0),
  -- The rendered result for this answer (explanation, answer scheme, per-criterion
  -- feedback, citations) so a past attempt can be replayed exactly as it was marked.
  feedback jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (attempt_id, display_order),
  check (awarded_marks <= max_marks),
  check (
    (question_type = 'mcq' and answer_text is null)
    or (question_type = 'subjective' and selected_option_id is null and char_length(trim(coalesce(answer_text, ''))) > 0)
  )
);

create index classrooms_lecturer_id_idx on public.classrooms(lecturer_id);
create index classroom_members_student_id_idx on public.classroom_members(student_id);
create index bookmarks_student_id_idx on public.bookmarks(student_id);
create index topic_progress_student_id_idx on public.topic_progress(student_id);
create index assessment_attempts_student_id_idx on public.assessment_attempts(student_id, submitted_at desc);
create index attempt_answers_attempt_id_idx on public.attempt_answers(attempt_id);
create index attempt_answers_question_id_idx on public.attempt_answers(question_id);
create index attempt_answers_topic_id_idx on public.attempt_answers(topic_id);

-- Keeps profiles in step with Supabase Auth. Accounts are created through the
-- Admin API with username/display_name/role in user metadata; see
-- scripts/seed_prototype_accounts.py.
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  insert into public.profiles (id, username, display_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'display_name', initcap(split_part(new.email, '@', 1))),
    coalesce((new.raw_user_meta_data ->> 'role')::public.app_role, 'student')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_auth_user();

-- Reading the caller's role from inside a policy on `profiles` would recurse, so
-- these are SECURITY DEFINER and bypass RLS on the tables they inspect.
create or replace function public.current_app_role()
returns public.app_role
language sql
security definer
set search_path = pg_catalog, public
stable
as $$
  select profile.role from public.profiles profile where profile.id = (select auth.uid());
$$;

create or replace function public.is_lecturer_of(p_student_id uuid)
returns boolean
language sql
security definer
set search_path = pg_catalog, public
stable
as $$
  select exists (
    select 1
    from public.classrooms classroom
    join public.classroom_members member on member.classroom_id = classroom.id
    where classroom.lecturer_id = (select auth.uid())
      and member.student_id = p_student_id
  );
$$;

-- The classrooms and classroom_members policies each need to consult the other
-- table. Doing that with a plain subquery makes the two policies recurse into
-- each other ("infinite recursion detected in policy"), so both lookups go
-- through SECURITY DEFINER helpers that bypass RLS.
create or replace function public.owns_classroom(p_classroom_id uuid)
returns boolean
language sql
security definer
set search_path = pg_catalog, public
stable
as $$
  select exists (
    select 1
    from public.classrooms classroom
    where classroom.id = p_classroom_id
      and classroom.lecturer_id = (select auth.uid())
  );
$$;

create or replace function public.is_member_of_classroom(p_classroom_id uuid)
returns boolean
language sql
security definer
set search_path = pg_catalog, public
stable
as $$
  select exists (
    select 1
    from public.classroom_members member
    where member.classroom_id = p_classroom_id
      and member.student_id = (select auth.uid())
  );
$$;

revoke all on function public.current_app_role() from public;
revoke all on function public.is_lecturer_of(uuid) from public;
revoke all on function public.owns_classroom(uuid) from public;
revoke all on function public.is_member_of_classroom(uuid) from public;
grant execute on function public.current_app_role() to authenticated;
grant execute on function public.is_lecturer_of(uuid) to authenticated;
grant execute on function public.owns_classroom(uuid) to authenticated;
grant execute on function public.is_member_of_classroom(uuid) to authenticated;

alter table public.profiles enable row level security;
alter table public.classrooms enable row level security;
alter table public.classroom_members enable row level security;
alter table public.bookmarks enable row level security;
alter table public.topic_progress enable row level security;
alter table public.assessment_attempts enable row level security;
alter table public.attempt_answers enable row level security;

revoke all on table public.profiles, public.classrooms, public.classroom_members,
  public.bookmarks, public.topic_progress, public.assessment_attempts,
  public.attempt_answers from public, anon, authenticated;

-- Identity and roster: readable, never writable from the browser.
grant select on table public.profiles, public.classrooms, public.classroom_members to authenticated;

create policy profiles_read_self on public.profiles
  for select to authenticated
  using (profiles.id = (select auth.uid()));

create policy profiles_lecturer_reads_own_students on public.profiles
  for select to authenticated
  using (public.is_lecturer_of(profiles.id));

create policy classrooms_read_own on public.classrooms
  for select to authenticated
  using (
    classrooms.lecturer_id = (select auth.uid())
    or public.is_member_of_classroom(classrooms.id)
  );

create policy classroom_members_read_own on public.classroom_members
  for select to authenticated
  using (
    classroom_members.student_id = (select auth.uid())
    or public.owns_classroom(classroom_members.classroom_id)
  );

-- Saved material: the owning learner only. No lecturer policy exists by design.
grant select, insert, update, delete on table public.bookmarks to authenticated;

create policy bookmarks_owner_reads on public.bookmarks
  for select to authenticated
  using (bookmarks.student_id = (select auth.uid()));

create policy bookmarks_owner_inserts on public.bookmarks
  for insert to authenticated
  with check (bookmarks.student_id = (select auth.uid()));

create policy bookmarks_owner_updates on public.bookmarks
  for update to authenticated
  using (bookmarks.student_id = (select auth.uid()))
  with check (bookmarks.student_id = (select auth.uid()));

create policy bookmarks_owner_deletes on public.bookmarks
  for delete to authenticated
  using (bookmarks.student_id = (select auth.uid()));

-- Reading history: the owning learner only. No lecturer policy exists by design.
grant select, insert, update on table public.topic_progress to authenticated;

create policy topic_progress_owner_reads on public.topic_progress
  for select to authenticated
  using (topic_progress.student_id = (select auth.uid()));

create policy topic_progress_owner_inserts on public.topic_progress
  for insert to authenticated
  with check (topic_progress.student_id = (select auth.uid()));

create policy topic_progress_owner_updates on public.topic_progress
  for update to authenticated
  using (topic_progress.student_id = (select auth.uid()))
  with check (topic_progress.student_id = (select auth.uid()));

-- Results are read-only to the browser. Only the service-role marking route writes them.
grant select on table public.assessment_attempts, public.attempt_answers to authenticated;

create policy assessment_attempts_owner_reads on public.assessment_attempts
  for select to authenticated
  using (assessment_attempts.student_id = (select auth.uid()));

create policy assessment_attempts_lecturer_reads on public.assessment_attempts
  for select to authenticated
  using (public.is_lecturer_of(assessment_attempts.student_id));

create policy attempt_answers_readable_with_attempt on public.attempt_answers
  for select to authenticated
  using (exists (
    select 1 from public.assessment_attempts attempt
    where attempt.id = attempt_answers.attempt_id
      and (
        attempt.student_id = (select auth.uid())
        or public.is_lecturer_of(attempt.student_id)
      )
  ));

-- Question-bank administration. These tables were previously revoked from
-- `authenticated` outright. They are granted here so the lecturer dashboard can
-- administer them; every policy requires the lecturer role, so a student's
-- select returns zero rows and answer keys stay hidden.
grant select, insert, update, delete on table public.quiz_questions,
  public.quiz_question_options, public.quiz_marking_criteria to authenticated;

create policy quiz_questions_lecturer_manages on public.quiz_questions
  for all to authenticated
  using (public.current_app_role() = 'lecturer')
  with check (public.current_app_role() = 'lecturer');

create policy quiz_question_options_lecturer_manages on public.quiz_question_options
  for all to authenticated
  using (public.current_app_role() = 'lecturer')
  with check (public.current_app_role() = 'lecturer');

create policy quiz_marking_criteria_lecturer_manages on public.quiz_marking_criteria
  for all to authenticated
  using (public.current_app_role() = 'lecturer')
  with check (public.current_app_role() = 'lecturer');
