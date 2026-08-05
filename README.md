# Tourism Geography Tutor

A course-grounded Tourism Geography learning platform. Its Course Brain is built from approved Chapter 1–4 teaching materials, with traceable citations supporting the future side-panel tutor and self-assessment quizzes.

## Course Brain v1

This repository begins with the data foundation:

- Supabase/Postgres schema for chapters, topics, source-grounded content, and quizzes.
- Source-reference enforcement for published learning content.
- PDF extraction and content validation scripts.
- No login or personal student accounts in the MVP.

## Trust model

The Course Brain—not an AI model—is the academic source of truth. A future tutor must retrieve approved material and show its chapter/page or slide citation. AI-generated quiz questions remain drafts until approved.

## Local setup

```bash
uv sync --dev
supabase start
supabase db reset
uv run pytest
```

Place approved source PDFs in `data/course-materials/` locally. They are ignored by Git.

## Ingest materials

```bash
uv run python scripts/extract_course_materials.py \
  data/course-materials/chapter-1.pdf \
  --chapter-code CH1 \
  --output data/extracted/chapter-1.jsonl

uv run python scripts/validate_content_units.py data/extracted/chapter-1.jsonl
```

Extraction output is a reviewable draft; it is not automatically published to the Course Brain.

## Documentation

- [Architecture](docs/architecture.md)
- [Course Brain content model](docs/course-brain-content-model.md)
- [Ingestion workflow](docs/ingestion-workflow.md)
