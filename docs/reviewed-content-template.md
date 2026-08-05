# Reviewed Course Brain content template

Create a local JSON array outside Git. Every record must have: `chapter_code`, `topic_name`, `title`, `body`, `source_file`, `chapter_label`, `page_or_slide`, and `reviewed_status: "reviewed"`.

Only enter text a reviewer has checked against an approved, non-OCR source page. Extraction output is never publishable input by itself. Run the importer in `--dry-run` mode before `--apply`; `--apply` requires an approved local `COURSE_BRAIN_DATABASE_URL` and never prints it.
