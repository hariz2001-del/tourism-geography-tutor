# Course Material Inventory

## Scope and method

The six public Google Drive sources were downloaded to `data/course-materials/` and processed with the repository extractor. Each output record retains `chapter_code`, `source_file`, `page_or_slide`, `extraction_status`, and `text`. No OCR text was invented: pages without usable extracted text remain marked `needs_ocr` with an empty text field.

## Inventory

| Source filename | Selected chapter identity | Page count | Extraction status | Draft JSONL |
| --- | --- | ---: | --- | --- |
| `chapter-1-candidate-a.pdf` | **Selected canonical Chapter 1 representative** | 33 | 31 `extracted`; 2 `needs_ocr` | `data/extracted/chapter-1-candidate-a.jsonl` |
| `chapter-1-candidate-b.pdf` | Duplicate of selected Chapter 1 representative | 33 | 31 `extracted`; 2 `needs_ocr` | `data/extracted/chapter-1-candidate-b.jsonl` |
| `chapter-1-candidate-c.pdf` | Duplicate of selected Chapter 1 representative | 33 | 31 `extracted`; 2 `needs_ocr` | `data/extracted/chapter-1-candidate-c.jsonl` |
| `chapter-2.pdf` | Chapter 2 | 23 | 17 `extracted`; 6 `needs_ocr` | `data/extracted/chapter-2.jsonl` |
| `chapter-3.pdf` | Chapter 3 | 11 | 5 `extracted`; 6 `needs_ocr` | `data/extracted/chapter-3.jsonl` |
| `chapter-4.pdf` | Chapter 4 | 27 | 17 `extracted`; 10 `needs_ocr` | `data/extracted/chapter-4.jsonl` |

## Chapter 1 duplicate finding

**Verified:** the three Chapter 1 candidate PDFs are byte-identical. Their downloaded SHA-256 values match, and their page-level extracted-text hash sequences also match. Candidate A is recorded as the canonical representative for subsequent review; candidates B and C are retained as downloaded provenance artifacts and duplicate evidence.

## Extraction status

The JSONL drafts are reviewable extraction outputs, not published Course Brain content. The repository validation command accepted every generated record.

## Unresolved review work

- Human review is required for every page marked `needs_ocr`; the drafts intentionally contain no invented replacement text.
- A lecturer/content owner must confirm the canonical Chapter 1 filename before publication and decide whether duplicate source artifacts should remain archived outside the published content set.
- Extracted text still requires human review and topical splitting before any content-unit import or publication.
