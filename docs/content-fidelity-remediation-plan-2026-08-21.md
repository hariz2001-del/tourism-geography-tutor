# Content-fidelity remediation plan (2026-08-21)

## What we're focusing on next

Three Chapter 1 units state things their slides do not say, and one draft question can mark a
learner wrong for giving the source-correct answer. All four came from one contaminated document
being trusted as a substitute for the PDF. Fix those, then find out how far the same failure
spread through Chapters 2–4.

---

## The actual problem

This is not a content-coverage problem. Coverage is good: 132 published units, every one cited,
no orphans, no drafts. The problem is a **process defect with a known blast radius**.

```
chapter-N.pdf  ──read──▶  audit doc (2026-08-09)  ──implemented──▶  content_units  ──derived──▶  quiz bank
                             ▲                                                                      │
                    transcription errors                                          fabrications propagate
                    entered HERE                                                  into marking criteria
```

The 2026-08-09 audit paraphrased slides into `Source:` quotations that were **not verbatim**. The
2026-08-11 enrichment pass then rewrote 41 bodies across all four chapters from those quotations
instead of from the PDFs. Wherever the audit's quotation was wrong, the database faithfully
encoded the error — and because the enrichment pass was *adding depth*, the errors are additions,
which read as richer and more authoritative than the thin-but-true text they replaced.

**Measured CH1 defect rate: 3 fabrications across the ~17 pages that pass touched.** The same
document drove the equivalent work in CH2, CH3 and CH4, which have not been re-checked since.

Three aggravating factors:

- **The audit is still the project's reference document.** Until it is marked, the next pass
  reintroduces the same errors.
- **Errors propagate downstream.** The quiz bank was generated from these bodies; at least one
  marking criterion inherited a fabrication.
- **CH3 and CH4 are far more OCR-dependent than CH1.** 6 of CH3's 11 slides and 10 of CH4's 27
  have no text layer at all — precisely the pages where a paraphrase-from-memory error is most
  likely and least detectable. CH4 also cites nothing past p22 despite having 27 slides.

---

## Guiding rules for this work

Non-negotiable, from `AGENTS.md`, `docs/handoff.md` and the standing owner instructions:

1. **The slide governs.** Not the audit doc, not the published paper an abstract came from, not
   what reads better. If a string is not on the slide, it does not go in the database.
2. **Source defects are flagged, never silently corrected** — and this now needs a *uniform*
   ruling, because CH1 currently does it both ways (see Phase 4).
3. **Insert-then-delete**, never the reverse, when replacing a unit. Body rewrites in place are
   fine — the unit keeps its citation.
4. **Small chunks, verified and committed individually.** No single uncommitted mega-pass.
5. **Independently re-verify against the shipped result** — re-query the DB or re-load the page;
   do not trust a self-report or a subagent's summary.
6. **Never invent content to fill a gap.** Structural gaps stay flagged.

---

## Phase 0 — Contain the contaminated source *(do first, ~10 min)*

Before any fix, put a header on `docs/content-depth-photo-audit-2026-08-09.md`:

> ⚠️ **UNTRUSTED AS A SOURCE OF QUOTATIONS (2026-08-21).** This document's `Source:` strings are
> paraphrases, not verbatim transcriptions. They are the demonstrated origin of three fabrications
> in Chapter 1's content units, four Tier-3 drift items, and one contaminated quiz marking
> criterion. Its *findings* (which pages are shallow, where photos are) remain useful as leads.
> **Never copy a quotation out of this file into the database — re-read the PDF page.**

Why first: it is the input to every later phase, it costs minutes, and it is the only step that
prevents recurrence. Also append the dated entry to `docs/checklist.md`.

---

## Phase 1 — Fix the fabrications *(one chunk, one commit)*

Live to learners right now. All are in-place `body` updates — no splits, no inserts, no deletes.

| Unit | Page | Change |
|---|---|---|
| `90510d10` | 6 | Rewrite to the slide's five lettered reasons in order. Remove "transportation" and the "in tourism" qualifier on job opportunities. |
| `10f721f6` | 29 | Remove both fabricated sentences. Restore bullets 2–3: not permanent employees/residents of the host destination → therefore must be counted as tourists; constrained in where and when they travel. |
| `571f3d66` | 30 | Delete "by Muslims". Two-word edit. |
| `7e0adbdc` | 31 | Restore "Queensland's domestic market"; restore that seniors *choose to spend* more time and a greater share of income on travel. |

Plus the one contaminated question, **all three fields in the same row**: the stem ("one *career*
benefit"), `subjective_answer_scheme`, and the `quiz_marking_criteria` row whose accepted concepts
are `career opportunities in tourism` / `tourism careers`.

**Escalate p30 to the client explicitly** rather than folding it into a batch summary — it narrows
a definition along a religious-participation axis. The correction restores the slide's wording; the
client should still be told it happened and why.

**Verification gate:** re-query all four units and the question row; load each topic page on the
live site; confirm the rendered text matches the slide. Commit only after that.

---

## Phase 2 — Restore genuinely missing content *(one chunk)*

| Unit | Page | Change |
|---|---|---|
| `23d2636a` | 21 | Add the 14-country study design and both parentheticals — the inverse distance/volume relationship, and connectivity as shared business or cultural ties. Largest real gap in the chapter. |
| `57aa58f3` | 22 | Add "provides a basic count of the volume of tourist traffic". Low value; batch it. |
| `00b45e0c` | 27 | Restore the "based on its market" classificatory axis. |
| `312f4696` | 4 | Restore the first sense of topography (the surface shapes and features themselves). |

Same verification gate.

---

## Phase 3 — Decide the silent-correction policy *(client decision, blocks Phase 4)*

Chapter 1 currently handles source typos **both ways**, which is the real finding here:

- p3 "nature circulation" → body says "nature **and** circulation" (corrected)
- p5 "internation… multi-cultural… environmental" → fully rewritten *and* re-parsed (corrected)
- p23 "spends in another" → "spent" (corrected)
- but p6 "INRELATED", p26 "determine", p33 "involve" → left alone (flagged)

The rule says flag, don't fix. The database does not follow it consistently. **This needs one
ruling from the client**, then uniform application — including to CH2–CH4, and including the CH3
"nine planets" / "Hindi" / "Artic" decisions already made on the other basis.

Reasonable default if the client has no preference: **preserve source wording in the body, and
carry the correction in a note** — that satisfies fidelity without teaching typos as fact. But
this is the client's call, not ours.

---

## Phase 4 — Tier 3 drift batch *(after Phase 3 rules)*

p3, p5, p15, p17, p18, p23, p28 `[VFR]`, p31 `d88c8e92`, p33 `1feb7dff`. Individually cosmetic;
worth one clean sweep once the policy is settled, not before.

Also in this phase, cheap and unrelated to the ruling:
- Populate the **NULL chapter summary and all 9 NULL topic summaries** for CH1 — or confirm the
  app does not surface them and close the finding.
- Normalise the CH4 chapter title, `"Chapter 4 — Tourism Natural Resources"`, to match the
  cleaned-up style of the other three.

---

## Phase 5 — Re-scan CH2, CH3, CH4 *(the large one)*

**Raised from last to near-first in importance.** Same two-scanner-plus-verifier method that
worked for CH1, one chapter at a time.

Per chapter: render pages to JPEG with `pymupdf`; PDF scanner (Sonnet, two passes) inventories
every slide; DB scanner (Sonnet, two passes, read-only) inventories the units; main thread
compares and re-verifies every candidate finding against the raw text layer; Opus verifier
independently rules on the claims and sweeps for anything missed.

Suggested order and why:

1. **CH4** — 40 units, 27 slides, **10 with no text layer**, and **nothing cited past p22**
   despite 27 slides. Largest unexamined surface, highest OCR dependence, plus a known coverage
   gap. Also carries two already-flagged structural gaps ("valley" p18, "beach" p19) that must
   stay unfixed.
2. **CH2** — 41 units, 23 slides, 6 vision-only. Most units of any chapter; the enrichment pass
   trimmed several previously-invented clauses here, so it has prior fabrication history.
3. **CH3** — 11 units, 11 slides, but **6 of 11 vision-only**. Smallest and probably cleanest
   (the audit found no merged entities or structural gaps), but the highest *proportion* of
   pages where text extraction was blind. Also where the "nine planets" typo decisions live.

Each chapter is its own chunk, its own report, its own commit. Do not start the next until the
previous is verified.

---

## Phase 6 — Close the loop

- **Re-audit the quiz bank against corrected bodies.** 208 questions were generated from these
  units. Only CH1's four were checked, and one of four was contaminated. That ratio does not
  justify assuming the other 204 are clean.
- **Update `.claude/skills/course-content/SKILL.md`** with two things learned here:
  - the "never copy a quotation from a secondary document — re-read the page" rule, with this
    incident as the worked example;
  - the corrected tooling note. The skill currently states no PDF rasterizer is available and
    pages cannot be rendered. **That is out of date** — `pymupdf` in `.venv` renders all 33 CH1
    slides to JPEG in seconds (`get_pixmap` → `tobytes("jpg", jpg_quality=70)`, ~140 KB/page),
    which is what made this pass's OCR path cheap. Given CH3/CH4's dependence on vision, this
    matters.
- **Update `docs/handoff.md` and `docs/checklist.md`** as each phase lands, per standing rules.

---

## Sequencing, and what needs a decision

```
Phase 0 ─▶ Phase 1 ─▶ Phase 2 ─┬─▶ Phase 5 (CH4 ─▶ CH2 ─▶ CH3) ─▶ Phase 6
                               │
        Phase 3 (client) ─▶ Phase 4
```

Phases 1 and 2 are unambiguous corrections toward the source and need no decision. Phase 3 blocks
Phase 4 but nothing else, so Phase 5 can proceed in parallel with waiting on the client.

**Three things need the client, not us:**

1. The silent-correction policy ruling (Phase 3).
2. Acknowledgement of the p30 "by Muslims" correction.
3. Whether p26's five tourism types stay merged. The deck names Rural, Urban, Heritage, Cultural
   and Eco-Tourism and defines none of them, so splitting them into five units — which the
   one-entity-one-unit rule would otherwise demand — would require inventing definitions.
   Recommendation: **leave merged, flag to client.** Same for CH4's "valley" and "beach"
   structural gaps.
