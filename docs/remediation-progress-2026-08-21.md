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
| 0 — contain contaminated audit doc | **DONE** — commit `1ff1f46` |
| 1 — fix fabrications (4 units + 1 question) | **DONE** — written + verified live |
| 2 — restore missing content (4 units) | **DONE** — written + verified live |
| 3 — silent-correction policy ruling | **BLOCKED — needs client** |
| 4 — Tier 3 drift batch | BLOCKED on Phase 3 |
| 5 — re-scan CH4, CH2, CH3 | NOT STARTED |
| 6 — quiz re-audit, SKILL.md, handoff | NOT STARTED |

## Phase 1 unit-by-unit

| Unit | Page | State | Verified live |
|---|---|---|---|
| `90510d10` "Why geography matters to tourism" | 6 | **DONE** | yes — prod |
| `10f721f6` "Business and professional tourism" | 29 | **DONE** | yes — prod |
| `571f3d66` "Halal tourism" | 30 | **DONE** | yes — prod |
| `7e0adbdc` "Grey tourism (seniors)" | 31 | **DONE** | yes — prod |
| quiz question `1e2ac649` (stem + scheme + criterion `f04ba733`) | 6 | **DONE** | yes — re-queried |

## Phase 2 unit-by-unit

| Unit | Page | State | Verified live |
|---|---|---|---|
| `23d2636a` distance/connectivity/attractiveness | 21 | **DONE** | yes — prod |
| `57aa58f3` volume statistics | 22 | **DONE** | yes — prod |
| `00b45e0c` holiday tourism market | 27 | **DONE** | yes — prod |
| `312f4696` topography | 4 | **DONE** | yes — prod |

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

---

## Phase 5 — CH4 re-scan (IN PROGRESS)

Rendered assets (regenerate with `pymupdf` if the scratchpad is gone):
`scratchpad/ch4_pages/p01.jpg`..`p27.jpg`, `scratchpad/ch4_text.json`.

**DB scan: DONE** (`scratchpad/ch4_db_inventory.md`). 40 units, 4 topics, all published,
all cited, no orphans, no wrong source_file/chapter_label. All 4 topic summaries NULL.

**Confirmed: the database cites nothing beyond page 22.** Pages with zero citing units:
**1, 10, 13, 23, 24, 25, 26, 27**. Whether 23–27 represents a real content gap depends on the
PDF scan — pages 22–26 are all vision-only (no text layer), so nothing about their contents can
be assumed.

16 of 40 units are single-sentence stubs under ~120 chars, consistent with a glossary deck.

**Merged-entity candidates flagged (NOT yet judged).** Six are source *tables* rendered as one
unit each — World's highest mountains (6), Mountain ranges (6), Largest deserts (9), Largest
bodies of water (10), Highest island peaks (5), Continental landmasses (4). **Note:
`docs/checklist.md` records the deserts/landmasses/water-bodies units as having been created
deliberately as whole-table units on 2026-08-11**, so this is a prior decision to revisit with
the client, not an unnoticed defect. Three softer cases bundle category labels
(Physical attraction categories, Swarbrooke's four categories, Examples across categories).
Mount Everest appears in two units.

**PDF scan: awaiting.** Key question put to it: do pages 23–27 carry real teachable content?

**Not yet started:** main-thread comparison, Opus verification, any CH4 fix.

### CH4 PDF scan: DONE, comparison done, Opus verification IN FLIGHT

`scratchpad/ch4_pdf_inventory.md`. ~141 teachable items. No teachable content on p1 (title),
p10 (uncaptioned photo grid), p26 (pixel-duplicate of p10), p27 (credits).

**Main-thread comparison result — CH4 looks materially healthier than CH1.** Spot-checked
p19/p20/p21/p22 definitions against the raw slides: River, Lake and Ocean appear verbatim on
their slides. **No fabrication found so far** (full 40-unit sweep delegated to the Opus verifier).

Candidate findings, NOT yet acted on:

1. **"Continents" has no content unit.** p22's 15-row glossary defines it ("Main land masses of
   the earth"). 14 of the 15 terms have units; this one does not. `Continental landmasses` (p19)
   is a highest-point table, not a definition. **Clearest real gap in CH4.**
2. **Four `content-images.ts` entries look mis-cited.** Eight entries say `pageOrSlide: 24`, but
   the Coral/Reef, Gulf/Bay, River and Fiord grid is on **p25**. Citation error, not content.
3. **Ocean unit may drop "361,000,000 square kilometers"** (slide 20 gives it).
4. p23 floor-plan has no supporting unit — judged **marginal**, since the diagram already renders
   via `diagrams.ts` and all 15 glossary units sit on the same topic.
5. **Disagreed with the PDF scanner** on p24/p25: it says they "must be captured"; their payload
   is which photo illustrates which term, and those eight photos are already in
   `content-images.ts` attached to the matching units. Capturing them as content units would
   duplicate p22's definitions. Put to the verifier.
6. New source defects found (flag, don't fix): p3 "RESOUCES", p4 "MULTIPLES USE"/"mangement",
   p6 "PYHSICAL…WORD", p15 "MOUNTAIN", p16 "Columbia" + Taurus grouped under Europe, p17
   grammar, p22's glossary grammar throughout, p27 "HOSPTITALITI", p1/p27 byline mismatch.
   **p7 structural gap:** the third classification bullet has no category label unlike the other
   three. **p21 heading defect reconfirmed** (reads "G. SEA AND OCEANS", body is rivers/lakes).
7. **Possible information loss at deck-authoring time:** p15/p19/p20/p21 tables look hard-cropped
   at the bottom edge (last rows Cho Oyu / Sumatra / Bay of Bengal / Nechako). If real, the
   source itself lost rows — the DB can only be faithful to what the slide shows.

**Nothing written to CH4 yet.** No DB writes, no repo edits, pending verification.

### CH4 Opus verification: DONE — my "no fabrications" claim was REFUTED

`scratchpad/ch4_verification.md`. **Two fabrications plus one figure distortion, all now fixed
and verified live.** They sat outside the pp.19-22 range I had spot-checked, which is exactly why
the spot-check was not sufficient evidence.

| Unit | Page | Was | Now |
|---|---|---|---|
| `145feea9` Desert | 18 | "...in which living conditions are hostile for plant and animal life" — the next sentence of the Wikipedia desert lede, on no slide | slide text only; ends at "250 millimetres (10 in) per year" |
| `d0887588` Mount Kinabalu | 14 | "in Sabah, Malaysia" and "via ferrata" appear nowhere in the deck; the portaledge/cable material is on p13, which the unit does not cite | describes only what p14 shows, incl. the signboard's "Low's Peak 4,095.2 m" |
| `c53e4367` Tourism and mountains | 12 | "an estimated 50 million" — turns the slide's floor into a point estimate | "More than 50 million", per the slide; also restores "steep slopes or winter snow" |

Verified against production: all four fabricated strings absent, all corrections present.

**Verifier also corrected me on:**
- **V6 REFUTED** — the Ocean unit does carry "about 361,000,000 square kilometers". No gap.
- **V8** — **p13 is not contentless**; it is uncited because its content was written into p14's unit.
- **V7 detail** — the cropped table on p19 is the *island-peaks* table (continental-landmasses above
  it is complete); p21's cropped item is a bulleted river-name list, not a table. DB is faithful to
  what the slides show, so no change needed.
- **V3/V5 PARTIALLY CORRECT** — I was right that p24/p25 need no content units and that p23 needs no
  supporting unit, but: p24's **Continents photo is stranded** with no unit to host it, and p25's
  "Gulf / Bay" photo is wired only to Bay, leaving **Gulf with no image**.

**Still open (next chunk):**
1. **Create the missing `Continents` unit** (p22: "Main land masses of the earth"). V2 CONFIRMED.
   Also gives p24's stranded Continents photo a host.
2. **Fix 4 mis-cited image entries** — Coral reef, Bay, River, Fiord are on **p25**, not p24. Wrong
   in `pageOrSlide`, in the rendered caption, in the filename, and restated in `checklist.md` L72.
3. **New policy question, do not act unilaterally:** p22's glossary has been silently rewritten out
   of its broken source grammar, with **three semantic additions** (Coral reef "formed by", Cays
   "made up largely of", Peninsula "almost completely") and three silent typo corrections elsewhere
   ("eighteen century"→"eighteenth", "Columbia"→"Colombia", "km"→"km²"). Same class as the CH1
   Phase 3 ruling — needs the client, then uniform application.
4. p22's own River and Lake definitions are nowhere in the DB (those units carry p21's different
   wording); the p16 unit names 6 of ~20 ranges on the map.
