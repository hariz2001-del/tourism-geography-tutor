-- Course Brain v1: source-grounded Tourism Geography teaching material.
-- Published content must have a source reference. No user/auth tables are included in this MVP.

create extension if not exists pgcrypto;

create type public.content_status as enum ('draft', 'published', 'archived');
create type public.quiz_status as enum ('draft', 'approved', 'archived');

create table public.chapters (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code ~ '^CH[0-9]+$'),
  title text not null check (char_length(trim(title)) > 0),
  summary text,
  display_order integer not null unique check (display_order > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.topics (
  id uuid primary key default gen_random_uuid(),
  chapter_id uuid not null references public.chapters(id) on delete cascade,
  name text not null check (char_length(trim(name)) > 0),
  summary text,
  display_order integer not null check (display_order > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (chapter_id, name),
  unique (chapter_id, display_order)
);

create table public.content_units (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.topics(id) on delete restrict,
  title text not null check (char_length(trim(title)) > 0),
  body text not null check (char_length(trim(body)) > 0),
  content_type text not null check (content_type in ('definition', 'explanation', 'example', 'key_takeaway', 'case_study', 'learning_note')),
  status public.content_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.source_references (
  id uuid primary key default gen_random_uuid(),
  content_unit_id uuid not null unique references public.content_units(id) on delete cascade,
  source_file text not null check (char_length(trim(source_file)) > 0),
  chapter_label text not null check (char_length(trim(chapter_label)) > 0),
  page_or_slide integer not null check (page_or_slide > 0),
  excerpt text,
  created_at timestamptz not null default now()
);

create table public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.topics(id) on delete restrict,
  source_content_unit_id uuid references public.content_units(id) on delete restrict,
  question text not null check (char_length(trim(question)) > 0),
  explanation text not null check (char_length(trim(explanation)) > 0),
  difficulty text not null check (difficulty in ('introductory', 'intermediate', 'application')),
  status public.quiz_status not null default 'draft',
  generated_by text not null default 'human' check (generated_by in ('human', 'deepseek_draft')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (status != 'approved' or source_content_unit_id is not null)
);

create table public.quiz_question_options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.quiz_questions(id) on delete cascade,
  option_text text not null check (char_length(trim(option_text)) > 0),
  display_order integer not null check (display_order between 1 and 6),
  is_correct boolean not null default false,
  unique (question_id, display_order)
);

create table public.content_ingestion_runs (
  id uuid primary key default gen_random_uuid(),
  source_file text not null check (char_length(trim(source_file)) > 0),
  source_checksum text,
  extractor_version text not null,
  status text not null check (status in ('started', 'completed', 'needs_review', 'failed')),
  details jsonb not null default '{}'::jsonb,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

create table public.anonymous_feedback (
  id uuid primary key default gen_random_uuid(),
  content_unit_id uuid references public.content_units(id) on delete set null,
  question_text text,
  rating smallint check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  check (rating is not null or char_length(trim(coalesce(comment, ''))) > 0)
);

create index topics_chapter_id_idx on public.topics(chapter_id);
create index content_units_topic_id_idx on public.content_units(topic_id);
create index content_units_status_idx on public.content_units(status);
create index quiz_questions_topic_id_idx on public.quiz_questions(topic_id);
create index source_references_source_file_page_idx on public.source_references(source_file, page_or_slide);

create or replace function public.require_source_reference_for_published_content()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'published'
     and not exists (
       select 1
       from public.source_references source_ref
       where source_ref.content_unit_id = new.id
     ) then
    raise exception 'Published content unit % requires a source reference', new.id;
  end if;
  return null;
end;
$$;

create constraint trigger content_unit_requires_source_reference
  after insert or update of status on public.content_units
  deferrable initially deferred
  for each row
  execute function public.require_source_reference_for_published_content();
