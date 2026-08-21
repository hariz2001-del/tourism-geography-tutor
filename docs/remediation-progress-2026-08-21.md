# Remediation progress checkpoint — live state

**Purpose:** this file is the resume point. If a session dies mid-pass, read this first, then
`docs/content-fidelity-remediation-plan-2026-08-21.md`. It records what has *actually* been
written to the live database, not what was intended.

**Critical:** database writes are live to production immediately (content is served from Supabase
at runtime, no deploy needed). A unit marked DONE below is already changed for learners.

---

## Status

| Phase | State |
|---|---|
| 0 — contain contaminated audit doc | NOT STARTED |
| 1 — fix fabrications (4 units + 1 question) | NOT STARTED |
| 2 — restore missing content (4 units) | NOT STARTED |
| 3 — silent-correction policy ruling | **BLOCKED — needs client** |
| 4 — Tier 3 drift batch | BLOCKED on Phase 3 |
| 5 — re-scan CH4, CH2, CH3 | NOT STARTED |
| 6 — quiz re-audit, SKILL.md, handoff | NOT STARTED |

## Phase 1 unit-by-unit

| Unit | Page | State | Verified live |
|---|---|---|---|
| `90510d10` "Why geography matters to tourism" | 6 | NOT STARTED | — |
| `10f721f6` "Business and professional tourism" | 29 | NOT STARTED | — |
| `571f3d66` "Halal tourism" | 30 | NOT STARTED | — |
| `7e0adbdc` "Grey tourism (seniors)" | 31 | NOT STARTED | — |
| quiz question (stem + scheme + criterion) | 6 | NOT STARTED | — |

## Phase 2 unit-by-unit

| Unit | Page | State | Verified live |
|---|---|---|---|
| `23d2636a` distance/connectivity/attractiveness | 21 | NOT STARTED | — |
| `57aa58f3` volume statistics | 22 | NOT STARTED | — |
| `00b45e0c` holiday tourism market | 27 | NOT STARTED | — |
| `312f4696` topography | 4 | NOT STARTED | — |

---

## Rollback

Original body text for every unit touched is recorded in
`docs/ch1-pdf-vs-db-discrepancies-2026-08-21.md` (each finding quotes the "Current body" verbatim
before the change). To revert a unit, restore that quoted string.

## Notes for a resuming agent

- Body rewrites are in-place `UPDATE`s. The unit keeps its existing `source_references` row, so
  the insert-then-delete rule does not apply here. It *does* apply if any unit ever needs splitting.
- Do not trust the 2026-08-09 audit doc for quotations. Re-read the PDF page.
- Render slides: `.venv/Scripts/python.exe`, `pymupdf`, `page.get_pixmap()` →
  `.tobytes("jpg", jpg_quality=70)`.
