from pathlib import Path


MIGRATION = Path("supabase/migrations/202608050002_public_reader_rls.sql")


def test_public_reader_migration_enforces_published_only_boundaries():
    sql = MIGRATION.read_text(encoding="utf-8").lower()

    for table in (
        "chapters",
        "topics",
        "content_units",
        "source_references",
        "quiz_questions",
        "quiz_question_options",
        "anonymous_feedback",
    ):
        assert f"alter table public.{table} enable row level security" in sql

    assert "content_units.status = 'published'" in sql
    assert "quiz.status = 'approved'" in sql
    assert "source_content.status = 'published'" in sql
    assert "for insert" not in sql
    assert "for update" not in sql
    assert "for delete" not in sql


def test_public_quiz_rpcs_pin_search_path_and_never_return_correctness():
    sql = MIGRATION.read_text(encoding="utf-8")
    lower_sql = sql.lower()

    assert "create or replace function public.get_public_topic_quiz" in lower_sql
    assert "create or replace function public.check_public_quiz_answer" in lower_sql
    assert "security definer" in lower_sql
    assert "set search_path = pg_catalog, public" in lower_sql
    assert "is_correct" not in lower_sql.split("create or replace function public.get_public_topic_quiz", 1)[1].split("create or replace function public.check_public_quiz_answer", 1)[0]
    assert "revoke all on function public.get_public_topic_quiz" in lower_sql
    assert "grant execute on function public.get_public_topic_quiz" in lower_sql
