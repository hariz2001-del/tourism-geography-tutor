from pathlib import Path


MIGRATION = Path("supabase/migrations/202608120001_exam_question_bank.sql")


def test_exam_question_bank_supports_subjective_questions_and_reviewed_rubrics() -> None:
    sql = MIGRATION.read_text(encoding="utf-8").lower()

    assert "create type public.quiz_question_type as enum ('mcq', 'subjective')" in sql
    assert "add column max_marks smallint not null default 1" in sql
    assert "add column subjective_answer_scheme text" in sql
    assert "create table public.quiz_marking_criteria" in sql
    assert "accepted_concepts text[]" in sql
    assert "accepted_synonyms text[]" in sql
    assert "source_content_unit_id uuid not null references public.content_units" in sql


def test_public_exam_batch_rpc_never_returns_answer_keys_or_rubrics() -> None:
    sql = MIGRATION.read_text(encoding="utf-8")
    lower_sql = sql.lower()
    public_rpc = lower_sql.split("create or replace function public.get_public_exam_question_batch", 1)[1].split("-- this is intentionally not callable", 1)[0]

    assert "security definer" in public_rpc
    assert "set search_path = pg_catalog, public" in public_rpc
    assert "quiz.status = 'approved'" in public_rpc
    assert "source_content.status = 'published'" in public_rpc
    assert "option_row.is_correct" not in public_rpc
    assert "subjective_answer_scheme" not in public_rpc
    assert "criteria" not in public_rpc
    assert "revoke all on function public.get_public_exam_question_batch" in lower_sql
    assert "grant execute on function public.get_public_exam_question_batch" in lower_sql


def test_private_subjective_context_is_service_role_only() -> None:
    sql = MIGRATION.read_text(encoding="utf-8").lower()

    assert "create or replace function public.get_subjective_question_marking_context" in sql
    assert "grant execute on function public.get_subjective_question_marking_context(uuid) to service_role" in sql
    assert "revoke all on function public.get_subjective_question_marking_context(uuid) from public, anon, authenticated" in sql
