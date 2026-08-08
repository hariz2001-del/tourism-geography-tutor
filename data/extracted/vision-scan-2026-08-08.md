# Full visual scan of all 4 chapter PDFs — 2026-08-08

Read directly (vision, not OCR/text-layer extraction) page-by-page across all 4 source decks, specifically to recover content on `needs_ocr` pages that `scripts/extract_course_materials.py`'s text-layer extractor cannot see (image-only slides, text baked into images, diagrams). This is the raw record of that pass — kept so a future session can pull from it instead of re-scanning the PDFs from scratch. Source PDFs themselves live in `data/course-materials/` (gitignored, get them from the Google Drive folder linked in `docs/checklist.md` if missing).

Every fact below was cross-checked against what's already in `content_units` at the time of this scan; "NEW" means it was not represented in the DB before this session, "already covered" means an existing content unit already captures it (title noted for reference).

## chapter-1.pdf (= chapter-1-candidate-a.pdf; identical content, per docs/course-material-inventory.md's duplicate-check) — 33 pages

PDF metadata: Title "DTM10103 TOURISM GEOGRAPHY", Author "Ruhana Wati Iran", Creator/Producer "Canva".

Pages 1–29 and 32–33: matches existing DB content unit-for-unit (geography definitions, leisure/recreation/tourism, tourist-generating/destination areas, push-pull factors, tourist flow measurement, tourism forms/markets, travel distance). No new facts found there beyond what's already imported.

- **p30 — Halal tourism (NEW, inserted 2026-08-08):** "Halal tourism can be summarized by any object or action which is permissible to use or engage in tourism industry, according to Islamic teachings." (academic citation on-slide: Battour & Ismail, 2015)
- **p31 — Grey tourism / seniors (NEW, inserted 2026-08-08):** dedicated slide on senior tourists (60+), driven by discretionary income and free time; referenced research context but I was not confident enough in the exact cited figures/study name to transcribe them verbatim — the DB entry for this is deliberately general. Worth a follow-up read of this exact page if precise stats are wanted.

Gaps not yet followed up (existing DB citations skip pages 1, 2, 10, 12, 16, 20, 24 — these were not specifically re-checked this pass; likely more recoverable content here on a future pass).

## chapter-2.pdf — 23 pages — **chapter title confirmed: "World Climate"** (p1, updated in DB 2026-08-08)

Pages 2–18: matches existing DB (continents, oceans, climate classification intro, tropical, dry/semiarid climates, generic middle-latitude intro). Existing DB has real km²/named-landmark stats for continents/oceans that are close to but not identical to the source's more precise figures (e.g. exact km² per continent/ocean) — not re-imported, low priority enrichment if wanted later.

- **p19 — Middle-latitude subtypes 1/2 (NEW, inserted):** Mediterranean Climate (mild wet winters, hot dry summers) and Humid Subtropical Climate (hot humid summers w/ thunderstorms, mild humid winters, deciduous/evergreen/mixed forest).
- **p20 — Middle-latitude subtypes 2/2 (NEW, inserted):** Marine West Coast Climate (cool summers, mild damp winters, ocean-humidified) and Humid Continental Climate (four distinct seasons, long cold winters, short warm summers).
- **p21 — High-latitude climates 1/2 (NEW topic + content, inserted):** section intro + Subarctic Climate (long extreme-cold winters, short mild summers, low precipitation, boreal forest) + Tundra Climate (cold year-round, permafrost, low vegetation).
- **p22 — High-latitude climates 2/2 (NEW, inserted):** Ice Cap Climate (perpetually below freezing, year-round snow/ice, Antarctica/Greenland).
- **p23 — Highland climates (NEW topic + content, inserted):** climate varies by elevation not latitude; introduces the treeline concept.

This closes the gap where "high latitude" and "highland" were named as 2 of the "five major climate types" (p12) but had zero supporting content before this session.

## chapter-3.pdf — 11 pages

- **p1 — title/section slide + world time-zone map (diagram, not re-captured as a content unit).**
- **p2 — Earth/planets facts:** existing DB unit ("Earth's position and habitability") already covers the accurate parts. **Flagged, not imported:** this slide states "nine planet[s]" and lists an ocean named "Hindi" (should be Indian) and "Artic" (Arctic) — both look like source typos/errors, not something to silently correct or silently propagate as fact. Worth flagging to whoever owns this slide deck.
- **p3 — Latitude:** already covered (existing "Latitude parallels and principal lines").
- **p4 — Longitude definition (NEW, inserted):** meridian lines, north-south, 15°-per-hour segments, reference = Greenwich Meridian in England.
- **p5 — (not specifically re-checked this pass, likely diagram-only).**
- **p6 — GMT definition:** already covered (existing "Greenwich Mean Time as a reference time").
- **p7 — Prime Meridian tourist photos (NEW, inserted as an `example`):** real photos of tourists at the physical meridian-line marker at the Royal Observatory, Greenwich — straddling both hemispheres. Genuinely tourism-relevant, on-theme visual example.
- **p8 — more Prime Meridian/longitude photo examples (same theme as p7, not separately re-imported).**
- **p9 — world map diagram (Prime Meridian/Equator), no new text.**
- **p10 — world time-zone map (diagram), no new text.**
- **p11 — Time Calculation:** already covered (existing "Relating longitude to time differences"); source also has a minutes/seconds subdivision detail not imported (low priority).

## chapter-4.pdf — 27 pages — chapter title already correct in DB ("Chapter 4 — Tourism Natural Resources")

Pages 1–7, 9, 11, 17–21: matches existing DB (tourism-resource concepts, attraction definition/categories, natural landscape, mountain-vs-hill, plateau, desert, island, sea/ocean, river/lake).

- **p8 — Physical Tourist Attraction categories (NEW, inserted):** 7-way taxonomy diagram — natural landscape, hills & mountains, rivers & lakes, seas & oceans, islands & beaches, deserts & valleys, plateaus. Complements (doesn't replace) the existing Swarbrooke 4-category unit at p7 — different classification scheme from a different source.
- **p10 — photo collage only, no new text.**
- **p12 — Tourism and mountains (NEW, inserted):** ~50M visitors/year worldwide to mountain destinations; Alps ~13M residents / ~100M visitors/year; draw factors = climate/clean air, topography/scenery, local traditions, simpler lifestyles, slope/snow sports.
- **p13–16 — not specifically re-checked this pass.**
- **p22 — "Other forms of hydrosphere & lithosphere" table (NEW, inserted, split into 6 grouped content units):** Cays/keys, Atoll, Peninsula/foreland, Coral/Reef, Gulf, Bay, Fiord, Glacier, Water falls, Lagoon, Springs — 11 terms not in the DB before, defined in a table alongside terms that were already covered (Continents, Island, River, Lake, Sea).
- **p23 — same 15 terms as a labelled diagram/floor-plan graphic (not re-imported as text; good `diagrams.ts` candidate if per-topic diagrams are extended to this topic later).**
- **p24 — photo collage (Continents/Atoll/Island&Cays/Peninsula), no new text.**
- **p25–27 — closing/credits (author: Ruhana Wati Binti Iran, "Jabatan Pelancongan Dan Hospitaliti").**

## Not yet done

- Chapter 1 pages 1, 2, 10, 12, 16, 20, 24 weren't specifically re-checked against the DB for gaps (existing citations skip them, so there's likely more recoverable content — just not chased down this session).
- Chapter 3 page 5 wasn't specifically re-checked.
- Chapter 4 pages 13–16 weren't specifically re-checked.
- No diagram/image assets were captured into `web/src/lib/course-brain/diagrams.ts` this pass — several good candidates were spotted (CH2 world-climate visuals, CH3's time-zone map and Prime-Meridian photos, CH4's attraction-category and hydrosphere-floor-plan diagrams) but adding them is a separate, not-yet-done task.
