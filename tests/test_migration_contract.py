from pathlib import Path


MIGRATION = Path("supabase/migrations/202608050001_course_brain.sql")


def test_course_brain_migration_has_source_grounding_contract() -> None:
    sql = MIGRATION.read_text(encoding="utf-8")

    assert "create table public.content_units" in sql
    assert "create table public.source_references" in sql
    assert "content_unit_requires_source_reference" in sql
    assert "deferrable initially deferred" in sql


def test_course_brain_migration_requires_review_for_ai_quizzes() -> None:
    sql = MIGRATION.read_text(encoding="utf-8")

    assert "generated_by in ('human', 'deepseek_draft')" in sql
    assert "status != 'approved' or source_content_unit_id is not null" in sql
