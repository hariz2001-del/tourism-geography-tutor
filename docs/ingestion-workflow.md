# Course Material Ingestion Workflow

1. Place an approved chapter PDF in `data/course-materials/`.
2. Run `scripts/extract_course_materials.py` to produce a page-level JSONL draft.
3. Validate required provenance fields with `scripts/validate_content_units.py`.
4. Review and split draft pages into topical content units.
5. Insert reviewed content and source references into Supabase in one transaction.
6. Validate reviewed JSON with `scripts/import_reviewed_content.py --dry-run`.
7. With an approved local `COURSE_BRAIN_DATABASE_URL` configured, run `uv run python scripts/import_reviewed_content.py path/to/reviewed.json --apply`; the importer uses one transaction, a transaction advisory lock, stable identities, and parameterized SQL.
8. Mark content `published` only after its provenance is attached.

## Extraction limits

The first extractor reads a PDF text layer. It marks image-only/scanned pages as `needs_ocr`; it does not pretend that unextracted text is complete. OCR or vision-derived material must be human-reviewed before it enters the Course Brain.

## Future delegated extraction

A dedicated extraction subagent may classify and structure the Chapter materials, but its output is input to human review—not a source of truth by itself. Preserve original page/slide references for every proposed content unit.
