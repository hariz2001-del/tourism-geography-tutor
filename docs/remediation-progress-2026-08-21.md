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

---

## CH4: COMPLETE (except the shared policy ruling)

Fabrications fixed (`145feea9` Desert, `d0887588` Mount Kinabalu, `c53e4367` Tourism and
mountains), `Continents` unit added, four image citations corrected p24 → p25. All verified live.
Commits `1bac4f0`, `15d64ab`.

## Phase 5 — CH2 re-scan (IN PROGRESS)

Rendered assets: `scratchpad/ch2_pages/p01..p23.jpg`, `scratchpad/ch2_text.json`.

**DB scan: DONE** (`scratchpad/ch2_db_inventory.md`). 41 units, 8 topics, all published, all
cited, no orphans. Only pages **1 and 11** have zero citing units — the tightest coverage of any
chapter so far. 16 distinct climate types/sub-types appear as unit titles (5 major + 11 sub-types).
20 units under 120 chars.

**Merged-entity candidates flagged — treat with caution, likely false positives.** The scanner
lists "The seven continents", "The five major oceans", "Continents and their surrounding oceans",
"The five major climate types" and "Climate zones by latitude". **`docs/checklist.md` records that
the continents and oceans were already split into 7 + 5 individual units in August**, and that the
list units were deliberately kept and reordered to match the individual units' sequence. So these
are almost certainly legitimate list/synthesis units coexisting with per-entity units, not the
historical merge defect. **Do not split anything here without checking the per-entity units exist
and confirming with the client.**

**PDF scan: awaiting.** **Not yet started:** main-thread comparison, Opus verification, any fix.

## CH3: NOT STARTED

Rendered assets already prepared: `scratchpad/ch3_pages/p01..p11.jpg`, `scratchpad/ch3_text.json`.
**6 of 11 slides have no text layer** — the most vision-dependent deck in the project.

### CH2 PDF scan: DONE. Comparison found two strong fabrication candidates.

`scratchpad/ch2_pdf_inventory.md`. ~98 teachable items. No teachable content on p1 (title) and
p11 (section divider) — matching exactly the two uncited pages, so **CH2 coverage is complete**.
16 climate types/sub-types in the deck; 16 appear as unit titles. Good structural match.

**RETRACTED 2026-08-21 — the two "fabrication candidates" below were WRONG. DO NOT DELETE THAT
TEXT.** The Opus verifier refuted them and I re-verified by reading `ch2_pages/p18.jpg` myself.
The disputed sentences are transcribed accurately from an **embedded screenshot table on p18**
("Mid-Latitude Climates": latitude range, world location, vegetation, seasons/rainfall). Every
disputed string is there verbatim — "30 to 55 N and S, to 60 N in Europe", "Korea; Japan",
"Mixed coniferous and deciduous forest", "west coast of southern Chile".

**These are WRONG CITATIONS, not fabrications** — both units cite p20 while half their body comes
from p18.

**Why the main thread got it wrong, and the standing rule that follows:** the text-layer sweep for
"coniferous"/"korea"/"japan" returned NONE, and that was read as evidence the text was nowhere in
the deck. But **p18 HAS a text layer — it just silently omits the embedded 525x426 screenshot.**
The blind spot was never the image-only pages (everyone reads those); it is pages that *look*
covered by their text layer while carrying content only in an embedded raster.
**Standing rule for CH3 and the CH1/CH4 re-checks: enumerate embedded image XObjects per page and
visually read any page carrying a large one, regardless of text-layer status.**

Superseded original claim, kept for the record:

**Strong fabrication candidates — confirmed by main thread against the page images, awaiting the
Opus verdict before any write:**

- **`Marine west coast climate` (p20).** The slide reads only: *"between 30°- 60°N, on west coast
  of continents cool summers, mild and damp winters, plenty rainfall. Ex. Western Europe, Seattle,
  Oregon"*. The DB body appends a **second sentence that is not on the slide**: "The wider
  30–60°N/S band — including the west coasts of North America and southern Chile — supports mixed
  coniferous and deciduous forests with high rainfall year round."
- **`Humid continental climate` (p20).** Slide reads only: *"four distinct seasons, long cold
  winters, short warm summers, climate varies with latitude Ex. North East U.S."*. The DB appends:
  "The wider 30–55°N/S band (to 60°N in Europe) — including north central North America, north
  central Asia/China, Korea, Japan, and central and eastern Europe — supports mixed coniferous and
  deciduous forest…" **Not on the slide.**

Both read like biome/ecoregion reference prose, not deck content. p12 (the biome map) was checked
and does not carry it either — p12 has only the 5-type list and a 9-key legend with no descriptive
text. A text-layer sweep confirms "coniferous", "deciduous", "southern chile", "korea" and "japan"
appear on **no text-layer page** in the deck; the only pages that could still carry them are the
image-only 13, 19, 21, 23, which the Opus verifier is checking.

**Verified faithful by main thread:** p22 Tundra (permafrost, "soil which is consistently frozen")
and Ice cap ("more than 2 miles thick (Antarctica & Greenland)") both match the slide exactly —
my suspicion about those two figures was wrong.

**Confirmed source defects:** the grey redaction bar over screenshot headers is real and systemic
across pp.18-23; p12 shows two different classification systems side by side (the 5-type climate
taxonomy and a 9-key biome legend) with "Desert" and "Tundra" in both, unreconciled.

**Merged-entity candidates: still treat as likely false positives** — see the CH2 DB scan note.

---

## CH2: COMPLETE (except the shared policy ruling). Commit `de67722`.

1 fabrication (`Antarctica` p6), 3 unsupported insertions (Pacific "deepest ocean", Evergreen
"year-round", Ice cap "in places"), and 1 wrong-citation pair fixed structurally — the p18
embedded table now has its own unit, `Mid-latitude climates compared`. All verified live.

## Phase 5 — CH3 re-scan (IN PROGRESS, dispatched 2026-08-23)

Rendered assets: `scratchpad/ch3_pages/p01..p11.jpg`, `scratchpad/ch3_text.json`.

**XObject enumeration done up front this time** (the CH2 lesson applied). Results, which both
scanners were given:

| Page | Text layer | Large embedded images | Note |
|---|---|---|---|
| 1 | none | 800x426 | image is only source |
| 2 | 738 ch | title strip only | **the four known source defects live here** |
| 3 | 177 ch | 550x384 | text layer + large image |
| 4 | 285 ch | 320x312 | text layer + large image |
| 5 | none | 572x312 | image is only source |
| 6 | 222 ch | title strip only | text layer + image |
| 7 | none | 500x375, 300x470 | image is only source |
| 8 | none | 367x388 | image is only source |
| 9 | none | 804x535, 480x238 | image is only source, richest page |
| 10 | none | 839x495 | image is only source |
| 11 | 441 ch | title strip only | text layer + image |

**Every page renders its slide TITLE as an image strip (~500-950 x 42 px)**, so titles are often
absent from the text layer even where one exists. The 1287x12 strip on every page is decorative.

**Conclusion: all 11 pages must be read visually.** No page can be cleared from its text layer
alone. This is the most image-dependent deck in the project — its content was originally extracted
under the least reliable conditions of any chapter.

**Known source defects to confirm, not fix** (already flagged on p2 in earlier passes): the "nine
planet[s]" claim, ocean names "Hindi" and "Artic", and the Equator diameter described as running
"north to east". Per the source-fidelity rule these stay flagged. Note the earlier pass chose to
**correct** "Hindi"/"Artic" to "Indian"/"Arctic" in the DB and to render "north to east" as "north
to south" — decisions made the opposite way from the flag-don't-fix rule, and part of the pending
client policy question.

**Not yet started:** main-thread comparison, Opus verification, any CH3 fix.

### CH3 both scans DONE; Opus verification IN FLIGHT

**PDF scan** (`scratchpad/ch3_pdf_inventory.md`): ~256 teachable items, **no page classified NO
TEACHABLE CONTENT** — every one of the 11 slides carries something transcribable. Counts are
dominated by two dense world maps (p1, p10). All four known p2 source defects confirmed verbatim:
"There is nine planet in the world", oceans listed as "Pacific / Atlantic / **Hindi** / **Artic** /
Antarctic", and the Equator diameter "7,899.8 mile from **north to east**".

**DB scan** (`scratchpad/ch3_db_inventory.md`): 11 units, 2 topics, all published, all cited, no
orphans. Chapter + both topic summaries NULL; all 11 excerpts NULL.

**Uncited pages: 1, 5, 8, 9** — and since no page is contentless, each needs a ruling:
- **p9 is the prime suspect** — image-only, rich (world map with EQUATOR 0°, PRIME MERIDIAN,
  degree gridlines, scale bar), nothing cites it.
- p5 is likely already covered: `diagrams.ts` has a CH3 entry at `pageOrSlide: 5`.
- p1 is the title slide bearing a time-zone map; p8 is light (2 photos + coordinates, 2 illegible).
Precedent to apply: CH4's p23 diagram already rendered via `diagrams.ts` was judged NOT to need a
supporting unit, while CH2's genuinely uncaptured p18 table WAS given one.

**Silent corrections already in CH3 bodies (policy question, not defects):** `Hydrosphere` renders
"Hindi"/"Artic" as "Indian"/"Arctic"; `The Equator` renders "north to east" as "north to south";
`Earth's position and habitability` omits the "nine planet" claim entirely. **CH3 is the chapter
where the flag-don't-fix rule was most often decided the other way** — the clearest illustration of
why one uniform client ruling is needed.

**Merged-entity candidates judged NOT defects** (put to the verifier): `Hydrosphere` (5 oceans) and
`Lithosphere` (7 continents) list entities that **CH2 already covers with individual units**, so
splitting here would duplicate, not fix. The skill file directs cross-checking against what is
already in the DB and skipping true duplicates.

**Additional source defects found:** p3 title typo "LOGITUDE"; p3 "Antartic circle"; chapter-wide
"Meridien" for "Meridian" on pp.4/6/9; **p8 has no slide title at all**; coordinate labels cropped
at the slide edge on p7 and genuinely illegible on p8 (flagged unreadable, not guessed).

**Nothing written to CH3 yet.**
