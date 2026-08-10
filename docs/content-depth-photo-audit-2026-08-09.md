# Content depth + photo-opportunity audit — 2026-08-09

Report-only pass. Triggered by client feedback: *"i need more photos, please use the ones provided in slides… there are no photos of each humid subtropical climate, in fact the info is still too shallow from what the slides provide… please fix this and do for the others as well, not just the part i flagged."*

Two problem classes hunted, chapter by chapter, by re-reading every cited source page directly (vision) against the live `content_units` body:

1. **Shallow content** — the body drops real sub-facts, named sub-types, definitions, or examples that the same cited slide contains.
2. **Missing per-entity photo** — the slide carries a genuine photo/figure *of that specific named entity*, and it is captured nowhere (not in `diagrams.ts`, not per-entity).

**Baseline fact:** `web/src/lib/course-brain/content-images.ts` currently exports an **empty** `contentImages` map. There are **zero** per-entity photos in the app today. Every photo listed below is a real, unfilled gap. `diagrams.ts` has 8 topic-level entries (CH1 p20; CH2 p2, p7, p12; CH3 p5; CH4 p8, p16, p23) — those are the only source images live in the app.

Nothing in this pass was written to the database or to any app file.

---

## Chapter 2 — World Geography and Climate (`chapter-2.pdf`)

### Topic: Middle latitude climate (`343da11d`) — pages 18, 19, 20

This is the reported neighbourhood. **Every one of its five units is shallow**, and the topic is missing four photos plus an entire comparison table.

#### p18 — `1d47ba8b` "Middle latitude climates"
- **Body now:** "Middle latitude climates are usually temperate and do not experience the extreme conditions of tropical or high-latitude climates."
- **Verdict on text:** the yellow text box on p18 is transcribed faithfully and completely. Body is fine.
- **MAJOR MISSING CONTENT — the p18 "Mid-Latitude Climates" comparison table.** The bottom-right of p18 is a screenshot of a 5-column table (Latitude Range / World Location / Vegetation / Seasons-Rainfall) that **no content unit references at all**. Verified by decoding the embedded image (object 8, 426×260 px, FlateDecode/DeviceRGB) and zooming. Full contents:
  - **Humid Continental** — Latitude Range: "30 to 55 N and S, to 60 N in Europe"; World Location: "North central North America; north central Asia (China); Korea; Japan; central and eastern Europe"; Vegetation: "Mixed coniferous and deciduous forest"; Seasons/Rainfall: "Warm summer cold winters, moderate rainfall throughout the year".
  - **Marine-West Coast** — Latitude Range: "30 to 60 N and S"; World Location: "West coast of N. America, west coast of southern Chile, and northwestern Europe"; Vegetation: "Mixed coniferous and deciduous forests"; Seasons/Rainfall: "Cool summers, mild winters, high rainfall year round".
  - The table shows only these two rows (the screenshot is cropped that way in the source). This is direct, citable enrichment for units `856b9788` (Humid continental) and `fc62a899` (Marine west coast), and the table image itself is a strong topic-level `diagrams.ts` candidate for `343da11d`.
- **PHOTO OPPORTUNITY (p18, → unit `1d47ba8b` or the Mediterranean unit):** top-right of the slide, roughly the upper-right quadrant, ~525×426 px (embedded object 7, FlateDecode/DeviceRGB). Depicts a Mediterranean coastline: rocky cliff face descending to deep-blue sea with white surf on submerged rocks, bright pink oleander/bougainvillea blossoms and green foliage filling the right-hand foreground. Partly occluded on the slide by the table screenshot overlaid on its lower-left. **Confidence: genuine photo, high.**

#### p19 — `11b8ee9b` "Mediterranean climate"
- **Body now:** "Mediterranean climates have mild, wet winters and hot, dry summers, found in regions such as parts of Europe, California, and similar coastal areas."
- **Source (p19, top-left white box):** "A. Mediterranean Climates: mild winters, hot summers. Ex. California, Greece, Italy."
- **SHALLOW:** the source names **California, Greece, Italy** explicitly; the body vaguely says "parts of Europe, California, and similar coastal areas" — Greece and Italy are lost. Also flag: the body's "wet" winters / "dry" summers qualifiers are **not on this slide** (source says only "mild winters, hot summers") — likely benign general knowledge, but it is not source-faithful.
- No photo on p19 is attributable to Mediterranean climate specifically (the two p19 photos belong to the forest types — see below).

#### p19 — `1a02245b` "Humid subtropical climate" ← **the client's flagged unit**
- **Body now:** "Humid subtropical climates have hot, humid summers with heavy thunderstorms and mild, humid winters, and support deciduous, evergreen, and mixed forests."
- **Source (p19, centre column):** "B. Humid Subtropical Climates: hot humid summers and mild humid winters, heavy thunderstorms." Then: "Usually have some type of **forest:**"
  - "**Deciduous** - broad leafed trees that loose their leaves in the fall."
  - "**Evergreens** - needles or broad leaves, keep their leaves."
  - "**Mixed forest** - broad leafed and evergreen **(Georgia)**."
- **SHALLOW:** the forest types are now *named* in the body (a prior pass appears to have added the bare names since the client's report), but **all three definitions and the Georgia example are still missing**. Per the project's "one entity, one unit" rule these three forest types arguably deserve their own units (Deciduous forest / Evergreen forest / Mixed forest), each with the source's own definition, rather than a three-word list inside the climate unit.
- **PHOTO OPPORTUNITY 1 (p19, deciduous forest):** upper-right of the slide, ~270×190 px as rendered. Autumn deciduous forest — tall bare-ish trunks with vivid orange and red canopy, a blue lake/river behind them, green grass and low shrubs in the foreground, patch of blue sky top-left. This is *the* image for "Deciduous — broad leafed trees that lose their leaves in the fall". **Confidence: genuine photo, high.**
- **PHOTO OPPORTUNITY 2 (p19, evergreen forest):** lower-right of the slide, ~270×175 px, directly below photo 1 with a large white gap between them. Young evergreen conifers (spruce/fir saplings) in rows in a green grassy field, pale blue sky, treeline on the horizon. This is the image for "Evergreens — needles or broad leaves, keep their leaves". **Confidence: genuine photo, high.**
- Note: there is no third photo for "Mixed forest" on p19.
- Note: a **dark grey filled rectangle** sits at the top-centre of p19 (and recurs at the top of p20, p21, p22, p23). It is a slide-template artifact, not content — do not extract it.

#### p20 — `fc62a899` "Marine west coast climate"
- **Body now:** "Marine west coast climates have cool summers and mild, damp winters, kept humid year-round by nearby oceans."
- **Source (p20, upper-left):** "C. Marine West Coast Climates: between 30°- 60°N, on west coast of continents, cool summers, mild and damp winters, plenty rainfall. Ex. Western Europe, Seattle, Oregon."
- **SHALLOW:** missing the **latitude band 30°–60°N**, the **"on west coast of continents"** location rule, **"plenty rainfall"**, and the named examples **Western Europe, Seattle, Oregon**. Also flag: "kept humid year-round by nearby oceans" is **not on the slide** — an invented causal explanation. Additional depth available from the p18 table (see above): 30 to 60 N and S; west coast of N. America, southern Chile, northwestern Europe; mixed coniferous and deciduous forests; high rainfall year round.
- **PHOTO OPPORTUNITY (p20, → `fc62a899`):** upper-right of the slide, ~320×280 px as rendered. A marine west coast scene: grassy clifftop with wildflowers in the foreground, a dark rocky headland, a broad tan sandy beach and shallow turquoise-green bay, low white/grey storm clouds filling the upper half. **Confidence: genuine photo, high.**

#### p20 — `856b9788` "Humid continental climate"
- **Body now:** "Humid continental climates have four distinct seasons, with long, cold winters and short, warm summers."
- **Source (p20, lower-left):** "D. Humid Continental Climates: four distinct seasons, long cold winters, short warm summers, **climate varies with latitude**. Ex. **North East U.S.**"
- **SHALLOW:** missing "climate varies with latitude" and the "North East U.S." example. Plus everything in the p18 table row (30–55 N/S to 60 N in Europe; north central North America, north central Asia/China, Korea, Japan, central and eastern Europe; mixed coniferous and deciduous forest; warm summers, cold winters, moderate rainfall year round).
- **PHOTO OPPORTUNITY (p20, → `856b9788`):** lower-right of the slide, ~320×280 px, directly below the marine-west-coast photo. A satellite/aerial image of the **North East U.S. coastline** — green forested landmass at left with visible bays and river mouths, deep navy Atlantic at right, wispy white cloud across the lower right. Directly matches the slide's "Ex. North East U.S." **Confidence: genuine satellite photo, high** (not decorative — it is the illustration for the named example).

### Topic: Tropical climate (`fa1546b9`) — pages 14, 15

#### p14 — `e3ec1403` "Tropical climate conditions"
- **Body now:** "Tropical climates occur in the lowest latitudes, closest to the equator."
- **Source:** "Tropical climates exist in the lowest latitudes (areas closest to the equator)." Faithful and complete. **No shallowness.**

#### p14 — `0cf701f8` "Tropical humid climate features"
- **Body now:** "Tropical humid climates are warm and rainy throughout the year and are associated with monsoons and rain forests."
- **Source (p14, yellow boxes):** "A. Tropical Humid Climates: **occur along the equator**, warm and rainy year round – monsoons and rain forests result – **hot and wet (avg. temp. is 80 degrees)**." Plus the right-hand yellow box: "**Hot temperature all year long. / rainy all the year / Africa, South America and Asia**".
- **SHALLOW:** missing "occur along the equator", the **average temperature of 80 degrees**, and the named regions **Africa, South America and Asia**.
- **PHOTO OPPORTUNITY 1 (p14, → `0cf701f8`):** top-right of the slide, framed in a thick white border, ~430×370 px as rendered. Dense tropical **rain-forest canopy** viewed from above/across — large fan-like palm and bromeliad fronds in the foreground, layered green jungle receding into haze behind. Matches "rain forests result". **Confidence: genuine photo, high.**
- **PHOTO OPPORTUNITY 2 (p14, savanna/background):** the slide's centre band, spanning roughly x=460–1010 of a 1456-wide render, full height of the upper half, partly overlaid by a fine white grid and by the yellow text boxes. A **lion lying in dry golden grass** with a bare acacia tree and blue sky behind. Genuine photo, but it depicts savanna, so it is a better fit as a photo for the *tropical wet-and-dry* unit (`5991f254`) than for tropical humid — and p15 has cleaner savanna photos anyway. **Confidence: genuine photo, high; usefulness: medium (occluded by the grid overlay).**

#### p14 — `82c13fdc` "Summer monsoon" / `c31bc5c9` "Winter monsoon"
- Bodies: "A summer monsoon blows over water and brings moisture." / "A winter monsoon blows over land and is dry."
- Source: "Summer Monsoon : blows over water and brings moisture / Winter monsoon : blows over land and is dry." **Exact match, complete. No photo on the page depicts a monsoon.** Checked, nothing to do.

#### p15 — `5991f254` "Tropical wet-and-dry climate features"
- **Body now:** "Tropical wet-and-dry climates are warm all year with distinct wet and dry seasons and savanna vegetation."
- **Source (p15, yellow box):** "B. Tropical Wet and Dry Climate: warm all year round, distinct wet and dry seasons – **'savannas': Areas of tropical grasslands, scattered shrubs, and trees**" then bullets: "**very wet summer / very dry winter / grasess [grasses] and few tree / Kenya and Africa**".
- **SHALLOW:** the body compresses "savanna" to a single adjective and drops the source's actual **definition of savanna** ("areas of tropical grasslands, scattered shrubs, and trees"), the **very wet summer / very dry winter** seasonal contrast, "grasses and few trees", and the named example **Kenya (and Africa)**. Per the one-entity rule, "Savanna" is arguably its own `definition` unit.
- **PHOTO OPPORTUNITY 1 (p15, → `5991f254`):** upper-right of the slide, ~560×375 px as rendered, the top half of a two-photo stack. **African savanna at sunset** — burnt-orange sky, silhouetted flat-topped acacia trees scattered across a dry plain, a line of grazing animals on the horizon and a small group of zebra/antelope right of centre. **Confidence: genuine photo, high.**
- **PHOTO OPPORTUNITY 2 (p15, → `5991f254`, or a future "Savanna" unit):** lower-right of the slide, ~560×340 px, directly below photo 1. **Savanna in daylight** — a large flat-crowned acacia against a pale blue sky, bush and distant hills mid-frame, and four or five Thomson's gazelles standing in golden grass across the foreground. Illustrates "grasslands, scattered shrubs, and trees" precisely. **Confidence: genuine photo, high.**

### Topic: Dry climate (`aa696007`) — pages 16, 17

#### p16 — `a48bde3a` "Dry climates"
- **Body now:** "Dry climates have low rainfall, although their temperatures can vary greatly."
- **Source:** "All Dry Climates have low rainfall (but temps. can vary greatly) – they are **'arid': dry**."
- **SHALLOW (minor):** drops the source's own gloss that dry climates are termed **"arid," meaning dry** — the vocabulary item the slide is actually teaching.

#### p16 — `27a0eeb9` "Arid climate features"
- **Body now:** "Arid climates receive less than 10 inches of precipitation a year and are associated with deserts and oases."
- **Source (p16):** "A. Arid Climates: have precipitation of less than 10 inches a year – **sunny and hot** – 'deserts' and **'oasis': area of vegetation & water in a desert**." Plus the right column: "**plant life is almost immposible**", "**Sahara Desert (North Africa)**", "**Southwest Asia**".
- **SHALLOW — substantial:** missing "sunny and hot", the **definition of oasis** ("area of vegetation & water in a desert"), "plant life is almost impossible", and both named regions **Sahara Desert (North Africa)** and **Southwest Asia**. "Oasis" is a named glossary term on this slide and is a candidate for its own unit.
- **PHOTO OPPORTUNITY 1 (p16, → `27a0eeb9`):** right column, upper half, running off the right edge of the slide, ~470×450 px as rendered. Close-up of **cracked dry desert hardpan** — polygonal mud plates with deep dark cracks, warm low-angle light, receding to a blurred horizon with a hint of a bridge/structure at the very top. Illustrates "plant life is almost impossible". **Confidence: genuine photo, high.**
- **PHOTO OPPORTUNITY 2 (p16, → `27a0eeb9` / Sahara example):** right column, lower half, directly below photo 1, ~470×330 px. **Sand dunes at dawn/dusk** — smooth ridged dunes in soft apricot light with a hazy white sun low in a pale sky. Directly illustrates the "Sahara Desert (North Africa)" caption sitting immediately to its left. **Confidence: genuine photo, high.**

#### p17 — `3351e87e` "Semiarid climate features"
- **Body now:** "Semiarid climates receive about 10–20 inches of precipitation a year, with hot summers, cold winters, and steppe vegetation."
- **Source (p17):** "about 10-20 inches of precipitation a year – hot summers, cold winters – **'Steppe': dry areas bordering deserts, 10-20 inches of rain, bushes, short grasses, and few trees**."
- **SHALLOW:** "steppe vegetation" collapses the slide's whole **definition of Steppe** — dry areas *bordering deserts*, bushes, short grasses, and few trees. "Steppe" is a named glossary term and a candidate for its own unit.
- **PHOTO OPPORTUNITY 1 (p17, → `27a0eeb9` "Arid"/oasis, not semiarid):** **left** column, upper half, ~515×390 px as rendered. A **desert oasis** — rolling apricot sand dunes with a dense band of dark green date palms growing in the hollow between two dunes, hazy pale sky. Note it sits on the semiarid slide but depicts p16's "oasis" concept; it is the only oasis image in the deck. **Confidence: genuine photo (possibly a photo-realistic render), high-medium.**
- **PHOTO OPPORTUNITY 2 (p17, → `3351e87e`):** **left** column, lower half, ~515×345 px, directly below photo 1. A **steppe / semi-arid badlands** scene — a layered ochre-and-cream flat-topped butte with visible strata, misty grey sky, and a foreground of green grass, low scrub and bare gravel patches. Matches "dry areas bordering deserts… bushes, short grasses, and few trees". **Confidence: genuine photo, high.**

### Topic: High latitude climate (`e467b464`) — pages 21, 22

#### p21 — `c7aab0d3` "High-latitude climates"
- **Body now:** "High-latitude climates are the furthest from the equator and are usually the coldest climates on Earth."
- **Source:** "These climates are the furthest from the equator – and are usually the coldest climates on earth." Faithful, complete. **No shallowness.**

#### p21 — `6e94cafe` "Subarctic climate"
- **Body now:** "Subarctic climates have long, extremely cold winters and short, mild summers, with low precipitation and boreal forest."
- **Source (p21):** "A. Subarctic Climate: long cold winters, short mild summers, low precipitation." — that is the *entire* text.
- **NOT shallow, but SOURCE-FIDELITY PROBLEM:** "**boreal forest**" does **not** appear anywhere on p21 (or p22). It is an invented addition. So is "extremely" (source says "long cold winters"). Recommend trimming to the source. Flagging rather than fixing, per instructions.
- **FIGURE OPPORTUNITY (p21, → `6e94cafe`):** right side of the slide, ~330×420 px as rendered. A **greyscale distribution map of North America** with the subarctic belt filled dark grey — sweeping from Alaska across northern Canada to Labrador/Newfoundland — a white boxed label "**Subarctic**" at the top of the map, faint province/state boundaries and a scale bar bottom-right, plus a small **inset locator map** of North America in the lower-left corner of the figure. Not a photograph but a genuine source figure specific to this one climate. **Confidence: genuine per-entity figure, high; it is not decorative and is not covered by any `diagrams.ts` entry.**

#### p22 — `e6f73628` "Tundra climate" — **also a citation error**
- **Body now:** "Tundra climates are cold year-round with permafrost beneath the surface, supporting only low vegetation."
- **Cited page: 21. Actual page: 22.** Tundra does not appear on p21 at all; p21 ends with Subarctic. **The `source_references` row for `e6f73628` needs correcting to page 22.**
- **Source (p22):** "B. Tundra Climate: cold all year, **very long cold winters, short cool summers, low precipitation** – **'permafrost': soil which is consistently frozen**."
- **SHALLOW:** missing the seasonal detail (very long cold winters, short cool summers) and low precipitation, and it paraphrases permafrost as "beneath the surface" instead of the slide's actual definition, "**soil which is consistently frozen**". Also flag: "supporting only low vegetation" is **not on the slide** — invented.
- **PHOTO OPPORTUNITY (p22, → `e6f73628`):** upper-right of the slide, ~380×270 px as rendered. **Tundra landscape** — a vast flat snow-covered plain under a low sun sitting just above the horizon, pale blue-to-apricot gradient sky with streaked cloud, and small snow-covered ridges/hummocks at the right edge. A faint copyright watermark ("©2005 …") sits in the bottom-right corner of the photo. **Confidence: genuine photo, high.**

#### p22 — `7327549a` "Ice cap climate"
- **Body now:** "Ice cap climates stay below freezing year-round and are permanently covered in snow and ice, as in Antarctica and Greenland."
- **Source (p22):** "C. Ice Cap Climate: freezing cold, snow and ice year round – **the ice cap can be more than 2 miles thick** (Antarctica & Greenland)."
- **SHALLOW:** missing the striking concrete fact that **the ice cap can be more than 2 miles thick** — the one number on the slide.
- **PHOTO OPPORTUNITY (p22, → `7327549a`):** lower-right of the slide, ~370×310 px as rendered, on a black background. A **satellite view of Earth's polar ice cap** — the globe seen from above the North Pole, brilliant white ice sheet filling the centre, dark blue ocean, and green/tan landmasses curving around the limb; hard black space background. **Confidence: genuine satellite photo, high.**

### Topic: Highland climate (`51c17acf`) — page 23

#### p23 — `7bc6947d` "Highland climate and elevation"
- **Body now:** "Highland climates vary with elevation rather than latitude: temperature drops as elevation increases, and vegetation changes toward the treeline, the elevation beyond which trees can no longer grow."
- **Source (p23):** "These area have varying climates. **At the bottom of mountains, the climate is like the surrounding area.** As elevation increases, temperature and vegetation decrease. Nothing can grow past a certain height ('treeline')."
- **SHALLOW (minor but real):** missing the base-of-mountain baseline — "**at the bottom of mountains, the climate is like the surrounding area**" — which is the setup for the whole elevation gradient. Also the body says climate varies "rather than latitude", which the slide doesn't say.
- **PHOTO OPPORTUNITY (p23, → `7bc6947d`):** right side of the slide, ~330×250 px as rendered. A **highland/mountain landscape** — a broad grey rocky mountain massif with visible scree and bare rock in the upper half (no trees near the summit), green vegetated lower slopes with a cluster of small buildings, and a shallow lake/wetland with reeds across the foreground, under a pale blue sky with thin cloud. Illustrates the treeline idea directly. **Confidence: genuine photo, high.**

#### p23 — `5970c2f6` "Highland climate examples"
- Body: "Highland climates are found in the Scandinavian countries, including Norway, Sweden, and Iceland."
- Source: "Exp: Scandinavia countries, Norway, Sweden, Iceland." **Complete match. Nothing to do** (note: the source's inclusion of Iceland as Scandinavian is the source's own claim; leave as-is per the no-silent-correction rule).

### Topic: World climate classification (`dbb97956`) — pages 12, 13

#### p12 — `b7d73dcb` "The five major climate types"
- Body lists tropical, dry, middle latitude, high latitude, highland. Source p12 lists exactly those five. **Complete.** The p12 world climate/vegetation map is already captured as the topic diagram (`ch2-climate-types.jpg`). **Checked, nothing to do.**

#### p13 — `0e07433e` "Climate zones by latitude"
- Body describes the Arctic/mid-latitude/tropics/mid-latitude/Antarctic bands and their season counts. p13 is a **full-page banded world map** and the body transcribes every label on it (Arctic — two seasons — polar day, polar night; Mid-latitudes — four seasons — summer, autumn, winter, spring; Tropics — two seasons — wet and dry; and the mirrored southern bands). **Text is complete, no shallowness.**
- **FIGURE OPPORTUNITY (p13, → `0e07433e`):** the entire page is one landscape figure, ~1195×720 px as rendered, filling the slide edge to edge on a green background. A world map with five horizontal colour bands — dark blue "Arctic / Two seasons … Polar day, polar night" at top, light green "Mid-latitudes / Four seasons … Summer, autumn, winter, spring", orange "Tropics / Two seasons … Wet and dry" across the equator, a second green mid-latitude band, and a light blue "Antarctic / Two seasons … Polar day, polar night" at the bottom; landmasses shown in a lighter tint of each band's colour. **This is not in `diagrams.ts`** (the topic's diagram is the p12 map, a different image). Ideal as a **per-entity image on unit `0e07433e`**, since the unit is literally a transcription of this figure. **Confidence: genuine source figure, high.**

### Topic: The seven continents (`68393419`) — pages 2, 3, 4, 5, 6

**No photo opportunities anywhere in this cluster.** Pages 3–6 use a Canva "under the sea" template whose only images are flat teal **vector illustrations** — scallop shells, a sea turtle, coral/sponge shapes, a starfish, seahorses. These are decorative template art with no relationship to the content and must **not** be extracted. Pages 2 and 10 are the labelled world maps already in `diagrams.ts`.

The whole cluster is however **systematically shallow in one specific way: every continent's km² area figure is missing from its unit body**, even though the source states it. The 2026-08-08 scan explicitly deferred this as "low priority enrichment"; the client's current feedback makes it in scope.

| Unit | Title | Cited page | Missing from body (source text) |
|---|---|---|---|
| `0ddca5b3` | Asia | 4 | **"an area of 44.58 million km²"** |
| `b5c0b7d5` | Africa | 4 | **"an area of 30.37 million km²"** |
| `023fe353` | North America | 5 | **"an area of 24.71 million km²"** AND the entire second fact: **"Some of the Earth's youngest mountains are found in the Cascade Range in US, which spans over 500 miles."** (Also: the body's Isthmus-of-Panama clause is actually the *South America* entry's text on p5, not North America's.) — **worst offender in this cluster.** |
| `8327f8a6` | South America | 5 | Nothing. Body matches both source sentences (Isthmus of Panama; the Andes as Earth's longest terrestrial mountain range). **Complete.** |
| `9522cf38` | Europe | 6 | **"an area of 10.18 million km²"** |
| `57d9d29e` | Antarctica | 6 | Nothing. Body matches both source sentences. **Complete.** |
| `8c116a1f` | Australia | 6 | **"a land area of 7.692 million km²"** AND **"It is the lowest, the flattest, and one of the driest continents."** Also flag: the body's "sometimes called an island continent" is **not on p6** — invented. |

- **p3 — `f4099441` "Define a continent":** "A large, continuous mass of land. It also includes discrete islands surrounding it." Body matches exactly. **Complete, checked, nothing to do.**
- **p2 — `87a5e293` "The seven continents":** lists all seven; p2's labelled map is already `diagrams.ts` → `ch2-seven-continents.jpg`. **Complete, checked.**

### Topic: Major oceans (`f066f2b3`) — pages 3, 7, 8, 9, 10

Same template — **no photo opportunities**, only decorative vector coral/seahorse/shell art on pages 8 and 9.

| Unit | Title | Cited page | Missing from body (source text) |
|---|---|---|---|
| `e987bd6e` | Define an ocean | 3 | Nothing. Exact match. **Complete.** |
| `56d14e77` | The five major oceans | 7 | Nothing; p7's map is already `diagrams.ts` → `ch2-major-oceans.jpg`. **Complete.** |
| `c36b6047` | Pacific Ocean | 8 | Nothing substantive. **Complete.** |
| `101d077c` | Atlantic Ocean | 8 | **"covers about 25% of the Earth's surface"** — a concrete figure dropped entirely. |
| `1bba0e1f` | Indian Ocean | 9 | **"an area of about 70 million km²"** |
| `bdd6f07c` | Southern Ocean | 9 | **The reason it is a distinct ocean: "recognized as a distinct ocean due to the presence of the Antarctic Circumpolar Current (ACC)."** The current body is a bare five-word sentence ("The Southern Ocean surrounds Antarctica.") against a two-clause source. **Worst offender in this cluster.** |
| `86f2cfbc` | Arctic Ocean | 9 | Nothing. **Complete.** |
| `59d09fac` | Continents and their surrounding oceans | 10 | Nothing (it is a synthesis unit). **Checked, no photo opportunity: p10's map is the same graphic as p7's, already captured as `ch2-major-oceans.jpg`** — only the slide title differs ("SUMMARY" vs "MAJOR OCEANS"). Do not extract it a second time. |

### Chapter 2 pages checked with nothing to do — see end of Chapter 2 section
- **p1** — title slide ("World Climate"), already used for the chapter title.
- **p11** — pure section-divider slide, "DISTRIBUTION OF WORLD CLIMATE", decorative coral art only, no content and no photo.
- **p2, p3, p7, p10, p12** — verified complete against their units; figures already captured in `diagrams.ts` (or duplicated from one that is).

---

## Chapter 4 — Tourism Natural Resources (`chapter-4.pdf`)

Chapter 4 is the **richest photo source in the whole course** — unlike Chapter 2's Canva vector template, most Chapter 4 slides carry large, real, well-cropped photographs, and **page 24 carries four explicitly captioned per-entity photos**. None of it is in the app.

### Topic: Tourism natural resources (`ee46d675`) — pages 2, 3, 4, 5

Structural note first: the source presents three **numbered, named characteristics** — "1. TANGIBLES FEATURES" (p3), "2. MULTIPLES USE OF TOURISM RESOURCES" (p4), "3. PERISHABLE FEATURES" (p5). The DB units carry descriptive titles that don't reflect the source's own numbered scheme, and no unit states that these are "the three characteristics of tourism natural resources". Minor framing gap.

- **p2 — `15c93c2f` "Nature-based tourism and natural resources".** Text is complete (nature-based tourism / direct enjoyment of undisturbed natural environments / land, water, mineral etc.). **No shallowness.**
  - **PHOTO OPPORTUNITY (p2, → `15c93c2f`):** left half of the slide, portrait format inside a white mount and a green line-art floral frame, ~570×640 px as rendered. A **group of nature tourists** in a sunlit clearing — a man in a wide-brimmed hat seated on the ground beside a large mossy fallen log, a woman cross-legged on a white ground sheet, and five or six others standing with **tripods, spotting scopes, binoculars and cameras** trained into the trees; big deciduous tree and hazy mountain slope behind. A literal illustration of "nature based tourism". **Confidence: genuine photo, high.**
- **p3 — `7afef38e` "Recognition makes a natural feature a tourism resource".** Body matches the two source bullets. **Complete.**
- **p3 — `0da062ff` "Natural features can gain tourism value through changing perceptions".**
  - **Body now:** "Rugged mountains were once viewed as barriers rather than scenic attractions, showing that perceptions of natural features can change."
  - **Source:** "Eg: rugged mountain were viewed by most people **in the West** as barriers to be feared, rather than as scenic attraction **until the eighteen century**".
  - **SHALLOW:** drops both specifics — the geographic qualifier "**in the West**" and the historical anchor "**until the eighteenth century**", which is the only date in the passage and the thing that makes it an example rather than a platitude. Also softens "barriers **to be feared**" to plain "barriers".
  - **PHOTO OPPORTUNITY (p3, → `0da062ff` or `7afef38e`):** left-centre, ~600×385 px as rendered. A first-person shot of an **open hand and blue-sleeved forearm outstretched toward a forested mountain ridge**, with a wide grey gravel riverbed and scattered driftwood in the lower foreground and a pale washed-out sky. Reads as "recognising / laying claim to a landscape". **Confidence: genuine photo, high; topical fit: medium (it is a mood shot, not a documentary illustration).**
- **p4 — `44e6b7e6` "Tourism resources are often shared with other users".**
  - **SHALLOW (minor):** drops the source's contrast case — "**Apart from resort areas or theme parks where tourism makes a dominant use of land**, tourism shares the resource with…" — which is the condition under which the rule does *not* hold.
  - **PHOTO OPPORTUNITY (p4, low priority):** right side, ~645×490 px as rendered. Close-up of a **bare arm and ring-wearing hand brushing through a bank of green ferns** in shaded woodland. Genuine photo but essentially stock mood imagery with no specific link to "multiple use". **Confidence: genuine photo, high; usefulness: low — skip unless a photo is wanted on every card.**
- **p5 — `c8dd3427` "Tourism resources can be perishable".** Body matches both bullets; the source's own quoted phrase "this minute and perishable planet" is dropped but it is a dangling half-quotation in the source itself. **Effectively complete.**
  - **No new photo:** p5 reuses the **exact same** nature-tourists photo as p2. Do not extract twice.

### Topic: Tourist attractions and classification (`57682698`) — pages 6, 7, 8

- **p6 — `f650e118` "Tourist attraction".**
  - **Body now:** "…It may be ambient or specific to a location."
  - **Source:** "…Such features may be ambient in nature (**eg. climate, culture, vegetation or scenery**), or they may be specific to a location, such as **a theatre performance, a museum or a waterfall**."
  - **SHALLOW:** both parenthetical example lists — the *entire* concrete content of the second half of the definition — are dropped, leaving the abstract skeleton "ambient or specific to a location" that means little on its own.
  - **No photo on p6** (green vector foliage template art only, left half — decorative, do not extract).
- **p7 — `8df9799d` "Four attraction categories attributed to Swarbrooke".**
  - **SHALLOW:** the source says "**According to Swarbrooke (1995)**" — the **year 1995 is dropped**. More importantly the source's second category is "man-made but **not originally designed to attract tourists**", a distinction that is the whole point of separating it from category 3 ("purpose built"); the body's "existing man-made attractions" loses it.
- **p7 — `2fe03acb` "Examples across attraction categories".**
  - **Body now:** a flat list "beaches, caves, scenery, wildlife, historic houses, castles, museums, art galleries, exhibition centres, and special events."
  - **SHALLOW + one-entity violation:** the source pairs each example set to its category, and names the special events explicitly — "**World Cup, the Commonwealth Games**". Those two named events are **missing entirely**. Also "wildlife" drops the source's gloss "(**flora and fauna**)". The unit merges four categories' examples into one bullet-dump; per project convention the examples belong attached to their four categories.
  - **PHOTO OPPORTUNITY (p7, → `8df9799d` or `f650e118`):** left third of the slide, a full-bleed portrait photo ~525×818 px as rendered, running the entire slide height. A **lone figure silhouetted at the lip of a jungle waterfall**, backlit sky above, white water pouring down a dark mossy rock face below, framed by dense overhanging tropical foliage. Illustrates "scenic features"/"a waterfall" from the definition. **Confidence: genuine photo, high; usefulness: medium** (see p11 — the same photo family appears there too, so pick one page and cite it accurately).
- **p8 — `23711d5a` "Physical tourist attraction categories".** Body lists all seven categories; the p8 wheel diagram is already `diagrams.ts` → `ch4-tourist-attraction-wheel.jpg`. **Complete, checked, nothing to do.**

### Topic: Natural landscapes and landforms (`85c5385c`) — pages 9–18

#### p9 — `2d67b8a0` "Natural landscape"
- Text complete (unaffected by human activity; intact when living and non-living elements are free to move and change). **No shallowness.**
- **PHOTO OPPORTUNITY 1 (p9, → `2d67b8a0`) — best of the four:** right of centre, portrait, ~455×500 px as rendered. A **hiker with a large backpack standing on a lakeside boardwalk/jetty**, back to camera, facing a still green-blue alpine lake ringed by dense dark conifer forest with a pale misty sky. **Confidence: genuine photo, high.**
- **PHOTO OPPORTUNITY 2 (p9, bottom-left, ~330×230 px):** a **red sandstone natural arch** (Delicate Arch, Utah type) standing on slickrock against a deep blue sky. **Confidence: genuine photo, high.**
- **PHOTO OPPORTUNITY 3 (p9, bottom-centre, ~330×230 px):** a **wetland meadow** — tussocky green-gold grass with a scatter of small yellow wildflowers and a strip of blue water and low hills behind. **Confidence: genuine photo, high.**
- **PHOTO OPPORTUNITY 4 (p9, bottom-right, ~330×230 px):** a **forested mountain panorama** — dark conifer tops in the foreground stepping back to blue-grey ridgelines under cloud. **Confidence: genuine photo, high.**
- These four form a bottom strip plus one hero image. One (photo 1) is enough for the unit card; the strip could alternatively become a topic-level diagram.

#### p10 — a photo-only slide with **no content unit at all**
No text whatsoever. Four large photos, ~660×450 px each, in a 2×2 grid:
- **top-left:** backlit **green leaves** close-up with sun flare;
- **top-right:** a **broad valley/escarpment** seen from a ridge, a small hiker figure standing on the rock lip at the left, layered blue-green ridges receding to the horizon — *this is the only good "valley" image in the deck, and the deck has a "DESERTS AND VALLEY" heading with no valley content* (see p18);
- **bottom-left:** a **waterfall** dropping through dark wet rock into a plunge pool surrounded by moss and ferns;
- **bottom-right:** a **looking-straight-up tree-canopy** shot, trunks converging on a bright sky.
All four are **genuine photos, high confidence**. Best use: photo 2 for a (missing) valley unit or for `2d67b8a0`; photo 3 for `a46327c7` "Waterfall".

#### p11 — `1e70ba18` "Mountain compared with hill"
- Text complete against the slide. **No shallowness.**
- **PHOTO OPPORTUNITY (p11):** left-centre, full-height portrait photo ~530×818 px as rendered — **a person standing at the top of a jungle waterfall** looking out, backlit, heavy green canopy framing the top of the frame, white cascade below. **It depicts a waterfall, not a mountain or hill**, so it is a poor fit for this unit; it is a good fit for `a46327c7` "Waterfall" *if* a p11 citation is acceptable, otherwise prefer p10's waterfall photo. **Confidence: genuine photo, high; entity match: mismatched.**

#### p12 — `c53e4367` "Tourism and mountains"
- **Body now:** 50 M visitors/year; Alps 13 M residents / 100 M visitors; draw factors (climate and clean air, topography and scenery, local traditions, simpler lifestyles, slope/snow sports).
- **SHALLOW:** two whole paragraphs of the slide are missing —
  - "**Many mountain towns around the world depend on tourists to support them. People in the town provide food and lodging for tourists who come to enjoy the nearby mountains.**" (the economic-dependency mechanism, and the slide's opening line "Mountains can aid tourism and bring in money for the people who live there.")
  - "**Sport-based tourism has boomed over the past 30 years.**" (the slide's closing line)
  - Also the leisure-activity sentence: people **ski**, **climb**, or simply **visit to take photos and admire their beauty**.
- **NO usable photo on p12.** The page is a low-resolution screenshot of a web page (mandybarrow.com, visible watermark top-right); its two images — a snowboarder on a blue-sky piste (top-right) and an alpine valley with snow peaks (bottom-right) — are only ~140×100 px thumbnails. **Too small to extract; skip.**

#### p13 and p14 — two photo-only slides with **no content unit at all** ← significant unclaimed asset
- **p13:** no text. Three large photos: **left, ~450×700 px**, a climber on a **via ferrata cable traverse** on a sheer granite face with a red "Walk the Torq" sign; **top-right, ~640×340 px**, climbers in **portaledges/hanging tents** bolted to a vertical granite wall in cloud; **bottom-right, ~640×340 px**, a **tourist standing on the bare granite summit plateau** with the classic Kinabalu granite spires behind.
- **p14:** no text. Six photos in a grid, ~330×230 px each, including a group at the **"TAMAN KINABALU / LOW'S PEAK (4,095.2 M)" summit signboard**, climbers on fixed ropes, the granite summit plateau at dawn, and rope-course/via-ferrata shots.
- These are clearly the deck's **Mount Kinabalu mountain-tourism case study** — they are the visual payload for `c53e4367` "Tourism and mountains" and they connect to `1e70ba18`'s Mount Kinabalu (4,095 m) entry in the island-peaks table on p19. **Confidence: all genuine photos, high.** Best pick: the p14 **Low's Peak summit signboard** photo (self-captioning, unambiguous, names the mountain and its height) and the p13 via-ferrata traverse (dramatic, clearly mountain tourism). Worth a short new `example`/`case_study` unit citing p13–14 so the photos have a card to live on.

#### p15 — `10376fc0` "World's highest mountains"
- Body has all six mountains with metres and range. **SHALLOW (moderate):** the source table also gives, per mountain, **alternative names** ("Mount Everest / Sagarmatha / Chomolungma", "K2 / Qogir / Godwin Austen"), **height in feet** (29,029 / 28,251 / 28,169 / 27,940 / 27,838 / 26,864 ft) and **coordinates**. The alternative names in particular are real, teachable content sitting in the same table.
- The table itself is a clean screenshot, ~1130×420 px as rendered, occupying the lower two-thirds of the slide — a reasonable per-entity figure for `10376fc0` if a table image is wanted. **Not a photo; it is a text table, so lower priority.**

#### p16 — `c91a07a5` "Mountain ranges of the world"
- Body lists all six ranges with countries; the map is already `diagrams.ts` → `ch4-mountain-ranges.jpg`. **Complete, checked, nothing to do.**

#### p17 — plateau units `e55a19ac`, `878c9c02`, `d1a1ea5b`, `1138811c`
- All four bodies match the source text closely. **No shallowness found.**
- **PHOTO OPPORTUNITIES (p17) — three stacked photos filling the right-hand column, each ~390×230 px as rendered, top to bottom:**
  1. **top:** a wooded ridge in the foreground looking down onto a **large city sprawling across a flat valley floor** with mountains behind — a plateau-city view.
  2. **middle:** a **flat, hazy, low-contrast plain** running to a featureless horizon, muted brown-green, overcast.
  3. **bottom:** **rolling brown-green highland** with a **snow-capped ridge** on the skyline and a scatter of small white buildings on the slope — visually consistent with the Andean altiplano.
  - **Caveat:** none of the three is captioned, and the slide does not tie them to Tibetan / Antarctic / Andean in order. **Confidence they are genuine photos: high. Confidence in which plateau each depicts: low-to-medium.** Recommend using photo 1 or 2 as a generic illustration on `e55a19ac` "Plateau as a high plain", and photo 3 on `1138811c` "Andean Plateau" only if a reviewer is comfortable with a visual-inference match. Do **not** assign one to `d1a1ea5b` "Antarctic Plateau" — none of the three shows ice.

#### p18 — `145feea9` "Desert" ← **two findings**
- **SHALLOW:** body says "extremely low precipitation, insufficient to support most plant growth" but drops the source's **number**: "average annual **precipitation of less than 250 millimetres (10 in) per year**". It also drops "…in which **little precipitation occurs and consequently living conditions are hostile** for plant and animal life."
- **MISSING CONTENT — the "largest deserts" table.** The right half of p18 is a screenshot table ("Desert / Area (km²) / Area (mi²)") that **no unit references**. Contents, in the source's order: **Antarctic 13,829,430 km²; Sahara 9,100,000+ km²; Arabian 2,330,000 km²; Gobi 1,300,000 km²; Kalahari 900,000 km²; Patagonian 670,000 km²; Great Victoria 647,000 km²; Syrian 520,000 km²; Great Basin 492,000 km².** This is a direct sibling of the two already-flagged Chapter 4 tables (p19 continental landmasses, p20 seas/oceans) and is **not** in `docs/checklist.md`'s known-gaps list — it appears to have been missed by every prior pass.
- **STRUCTURAL GAP:** the slide is headed "**E. DESERTS AND VALLEY**" but there is **no content unit about valleys anywhere in the database**, and no valley definition on this slide either. The heading promises content the deck never delivers — flag to the client rather than inventing a definition. (p10's escarpment/valley photo is the only valley visual available.)
- **PHOTO OPPORTUNITY 1 (p18, → `145feea9`):** bottom-right, a wide strip ~660×160 px as rendered. **Sand dunes** — rippled pale-gold dunes in the foreground with a dark rocky escarpment/ridge behind under a bright sky. **Confidence: genuine photo, high.**
- **PHOTO OPPORTUNITY 2 (p18, → `145feea9`):** directly below photo 1, ~660×210 px. **Cactus desert** — tall columnar saguaro-type cacti and a pale twisted boojum-like trunk at the left, scrubby desert floor, hard blue sky. Illustrates "insufficient to support most plant growth" by contrast. **Confidence: genuine photo, high.**

### Topic: Water environments (`c5a8827e`) — pages 19, 20, 21, 22, 23, 24

#### p19 — `971fd72e` "Island" and `647e35d5` "Highest island peaks"
- **`971fd72e`** — definition matches the source. **Complete.**
- **`647e35d5`** — **SHALLOW (minor):** the source table also carries **heights in feet** (16,024 / 13,796 / 13,435 / 12,966 / 12,484 ft) and a "**Other countries/territories**" column — **Papua New Guinea** for New Guinea, and **Brunei / Indonesia** for Borneo — none of which is in the body.
- **MISSING CONTENT (already known, still open):** p19's second table, "**Continental landmasses**" — Afro-Eurasia / Mount Everest / 8,848 m / Nepal, China; Americas / Aconcagua / 6,962 m / Argentina; Antarctica / Vinson Massif / 4,892 m / None; Australia / Mount Kosciuszko / 2,228 m / Australia. Confirmed still absent.
- **STRUCTURAL GAP:** the slide heading reads "**ISLANDS AND BEACHES**" but there is **no beach content unit anywhere** and no beach definition on the slide. Same class of promise-without-content as p18's "valley". Flag, do not invent.
- **PHOTO OPPORTUNITY 1 (p19, → `971fd72e`):** top-right corner, ~200×195 px as rendered — small, but a real photo. A **tiny tree-covered islet** mirrored in perfectly still dark water, with autumn-toned foliage and a wooded shore behind. **Confidence: genuine photo, high; size: small, check native pixel dimensions before use.**
- **PHOTO OPPORTUNITY 2 (p19, → `971fd72e`):** bottom-right, ~490×200 px as rendered. An elevated coastal view of a **green island with rocky headlands** set in deep blue sea, with a grassy clifftop foreground. **Confidence: genuine photo, high.**

#### p20 — `7edee181` "Ocean" and `f71a055b` "Sea"
- Both bodies match the source text. **No shallowness.**
- **MISSING CONTENT (already known, still open):** the p20 table ranking the ten largest bodies of water by area/depth — **Pacific Ocean, Atlantic Ocean, Indian Ocean, Southern Ocean, Arctic Ocean, Coral Sea, Arabian Sea, South China Sea, Caribbean Sea, Bay of Bengal**. Confirmed still absent from the DB.
- **PHOTO OPPORTUNITY (p20, → `7edee181` or `f71a055b`):** lower-left of the slide, ~495×280 px as rendered. A **tropical sea horizon** — bands of pale turquoise shallows and deeper blue water in the lower third, and a towering white cumulus bank filling the upper two-thirds against a strong blue sky. **Confidence: genuine photo, high.**

#### p21 — `974cab55` "River" and `d73748a8` "Lake"
- Both definitions match the source exactly. **No shallowness.**
- **MINOR MISSING CONTENT:** p21 also carries a screenshot list of **North American rivers** — Alsek; Apalachicola (Chattahoochee, Flint); Colorado; Columbia (Okanagan, Kettle, Pend Oreille, Kootenay, Canoe, Kicking Horse); Dean; Embudo; Fraser (Pitt, Thompson, Chilcotin, Quesnel, Nechako) — with country columns. Not in the DB. **Low value** (an arbitrary alphabetical fragment of a longer list), but noted for completeness.
- **SOURCE ERROR to flag, not fix:** p21's heading reads "**G. SEA AND OCEANS**" while the slide is entirely about rivers and lakes (p20 is the real "F. SEA AND OCEANS"). Same class of source typo as Chapter 3's "Hindi"/"Artic" oceans.
- **PHOTO OPPORTUNITY 1 (p21, → `974cab55` "River"):** bottom-centre, ~570×220 px as rendered. A **forest stream/river** — white water tumbling over grey boulders, dark green conifers and mossy banks pressing in on both sides. **Confidence: genuine photo, high.**
- **PHOTO OPPORTUNITY 2 (p21, → `d73748a8` "Lake"):** bottom-right, ~480×220 px, immediately right of photo 1. A **still woodland lake/pond** — glassy dark water reflecting bright green foliage, fallen logs and reeds along the near edge. **Confidence: genuine photo, high.**

#### p22 — the 15-term glossary table
- All 11 DB units drawn from this table (`ae492e89` Cays, `53ea1015` Atoll, `8bb2eaca` Peninsula, `d3433b55` Coral reef, `f2488806` Gulf, `ce182424` Bay, `014b51e6` Fiord, `14c2ee87` Lagoon, `6dd27876` Springs, `a46327c7` Waterfall, `2b2a285e` Glacier) were re-checked line by line against the table. **Every body faithfully reproduces its row. No shallowness found anywhere on p22.** The remaining four rows (Continents, Island, River, Lake) are covered by units citing other pages, correctly.
- **No photo on p22** — green vector foliage template art only.

#### p23 — the labelled "floor plan" schematic
Already `diagrams.ts` → `ch4-hydrosphere-lithosphere-floor-plan.png`. **Checked, nothing to do.**

#### p24 — **the single highest-value photo page in the course** ← four captioned per-entity photos
No body text; four large photos in a 2×2 grid, **each with its own printed caption underneath**, ~600×330 px each as rendered. This removes all guesswork about what each depicts:
1. **top-left, captioned "Continents":** a flat political **world map** with continents in different flat colours. Duplicates `ch2-seven-continents.jpg` in substance — **skip**, or use for `f4099441` if a CH4-cited version is wanted.
2. **top-right, captioned "Atoll":** an aerial photo of a **ring-shaped coral reef enclosing a pale turquoise lagoon**, deep navy ocean outside the ring, white surf on the windward rim, a few green vegetated islets on the rim. → **`53ea1015` "Atoll"**. **Confidence: genuine, captioned photo, highest.**
3. **bottom-left, captioned "Island & Cays":** an aerial photo of a **small green vegetated island fringed by white sand** in bright turquoise shallows, with a tiny white boat visible near the bottom edge. → **`971fd72e` "Island"** and/or **`ae492e89` "Cays"**. **Confidence: genuine, captioned photo, highest.**
4. **bottom-right, captioned "Peninsula / Foreland":** an aerial photo of a **green peninsula jutting out into dark blue sea**, with a snow-capped mountain range on the far shore behind it. → **`8bb2eaca` "Peninsula"**. **Confidence: genuine, captioned photo, highest.**

**This page should be the first thing extracted in the build pass** — captioned, unambiguous, one photo per existing unit, no inference required.

### Chapter 4 pages checked with nothing to do
- **p1** — title slide. **p8, p16, p23** — figures already in `diagrams.ts`, bodies complete.
- **p5** — photo is a byte-identical reuse of p2's; text complete.
- **p22** — glossary table fully and faithfully captured by 11 units; no images.
- **p25, p26, p27** — closing/credits slides (author "Ruhana Wati Binti Iran", "Jabatan Pelancongan Dan Hospitaliti"); no content, no usable images. Not re-read this pass beyond confirming the 2026-08-08 scan's finding.

---

## Chapter 1 — Tourism Geography (`chapter-1-candidate-a.pdf` / local `chapter-1.pdf`)

Chapter 1 has a **different failure pattern from Chapters 2 and 4**. Its slides are mostly numbered/lettered bullet lists, and the units repeatedly capture **only the first one or two bullets of a list**, silently dropping the rest. That reads as complete prose but loses half the slide every time. Photos are plentiful (this is the most photo-rich deck after CH4) but they are mostly generic travel stock rather than photos *of a specific named entity* — so photo value here is moderate, not high, except for a handful noted below.

### Topic: Geography foundations and tourism relevance (`485bee15`) — pages 3, 4, 5, 6

- **p3 — `8b79a0ba` "Working definition of geography".**
  - **Body now:** "Geography can be introduced as the study of natural features and circulation together with how people respond to them."
  - **Source:** "It is a science of nature circulation which involved **topography, climate, soils, flora & fauna** and the way of human react to it."
  - **SHALLOW:** the source names **four** components — topography, climate, soils, flora & fauna — and the body compresses all four into the phrase "natural features". This is a clean, enumerable loss.
- **p4 — `312f4696` "Topography".** Confirms the previously-flagged gap: body drops "**and other observable astronomical objects including planets, moons, and asteroids**". **SHALLOW** (already flagged 2026-08-09, still open).
- **p5 — `8b013727` "Geography as the study of places and relationships".** Confirms the previously-flagged gap: body is only the first sentence; the whole second sentence — "It is an education of understanding **internation**[al], concerns of **multi-cultural** and educations of **environmental**" — is missing. **SHALLOW** (already flagged, still open).
  - **PHOTO OPPORTUNITY (p3/p4/p5 share one image, → `312f4696` "Topography" is the best host):** centre of each slide, a tilted white "FILM NEGATIVE" polaroid strip containing **two stacked photos, each ~300×310 px** as rendered: (top) **apricot desert sand dunes at dusk** with two tiny distant figures on the crest and a smooth pastel sky; (bottom) **green rolling hills** under a strong blue sky with big white cumulus, dark scrub in the foreground. Together they illustrate "the shape and features of the surface of the Earth". **Confidence: genuine photos, high.** Note the identical strip appears on p3, p4 and p5 — extract once, cite p4.
- **p6 — `90510d10` "Why geography matters to tourism".**
  - **Body now:** "Geography helps learners recognize destinations, understand world conditions such as climate and currencies, and identify tourism-related employment."
  - **Source (a lettered A–E list):** "A. To make us realize about places on the world map… B. **People travel to experience the different ambience.** C. To have knowledge about the world conditions such as climate, currency, transportation. D. **To expand the function of the world.** E. To realize about the career opportunity in tourism."
  - **SHALLOW:** **two of five lettered reasons (B and D) are missing entirely.** Item C's third element, "**transportation**", is also dropped.
  - **PHOTO OPPORTUNITY (p6, → `90510d10`):** left half of the slide, portrait, ~690×790 px as rendered, with the slide title and washi-tape graphics overlaid on top of it (the text is separate vector, so the underlying image extracts clean). A **top-down aerial photo of a shoreline** — deep turquoise water at the left, a diagonal band of white breaking surf, and warm pink/coral-toned sand at the right. **Confidence: genuine photo, high; entity match: generic (it illustrates "the world", not a named thing).**

### Topic: Leisure, recreation, and tourism (`09f03c3a`) — pages 7, 8, 9

- **p7 — `cb85a578` "Leisure".** Body covers both source sentences. **SHALLOW (minor):** drops the framing "Leisure is often seen as a **measure of time**" — the slide's own conceptual handle on the term.
  - **PHOTO OPPORTUNITY (p7, → `cb85a578`):** right of centre, ~535×420 px as rendered. A woman photographed **from behind with both arms flung wide open, facing a calm turquoise sea** under a soft sky; blue-and-white striped shirt, straw tote bag with red flowers on her shoulder. A direct visual for "free time to use as they wish". **Confidence: genuine photo, high.**
- **p8 — `95b44f13` "Recreation".**
  - **Source:** "Recreation is refer to the activity that people do during their leisure time, from watching television to holidaying abroad. **It refreshes a person's strength and spirit.**"
  - **SHALLOW:** the second sentence — the *purpose* of recreation — is missing entirely.
  - **PHOTO OPPORTUNITY 1 (p8, → `95b44f13`) — best of three:** top-left, ~360×360 px as rendered. A **group of four or five hikers with large backpacks, seen from behind**, walking away up a dirt trail through open green forest in dappled light. **Confidence: genuine photo, high.**
  - **PHOTO OPPORTUNITY 2 (p8, mid-left, ~370×290 px):** a first-person shot of **two bare feet dangling over a rock ledge** above a rugged turquoise coastline far below. **Confidence: genuine photo, high.**
  - **PHOTO OPPORTUNITY 3 (p8, bottom-left, ~355×315 px):** a **man in a green hooded jacket, seen from behind**, standing at the edge of a still forest lake looking at conifer-covered slopes. **Confidence: genuine photo, high.**
- **p9 — `eef870d4` "Tourism".** Body matches the UNWTO-style definition on the slide (travel to and stay in places outside the usual environment, not more than one consecutive year, for leisure, business and other purposes). **Complete.**
  - **PHOTO on p9 (low priority):** right half, ~660×640 px — **four young women in white/cream clothing posed together on a grassy slope** in front of a hanging white sheet backdrop among pine trees. Genuine photo but a stylised fashion/lifestyle shot with no tourism-specific content. **Confidence it is a photo: high; usefulness: low — skip.**

### Topic: Geography and the tourism system (`a9ec4d1f`) — pages 11, 13, 14, 15

This topic has the **worst bullet-truncation in the chapter** — three of its four units drop entire numbered bullets.

- **p11 — `002cac2b` "Spatial study of tourism".**
  - **Source:** "…the spatial study of tourism will focus at the tourist generating area, tourist receiving areas and the links between them. Such studies can be at any scale, **from the world distribution of climatic zones to the regional assessment of tourist resources.**"
  - **SHALLOW:** the two named scale examples — **world distribution of climatic zones** and **regional assessment of tourist resources** — are dropped, leaving only the abstract "at different scales". These examples also tie Chapter 1 to Chapter 2's climate content, so they have cross-chapter teaching value.
  - **SOURCE DEFECT to flag, not fix:** p11's text begins mid-sentence ("…the human activities that involved the tourism can be spatial…"), i.e. the slide appears to be missing its own opening words. p10 is a pure section divider and does not carry the missing half.
  - No photo on p11 (grid-paper/washi-tape graphics only, decorative).
- **p13 — `3868dc9c` "Tourist-generating areas".**
  - **Source (4 numbered bullets):** "1. Represent the tourists' home areas… 2. It is the major market of tourism… where the journey begins and ends. 3. The demand-stimulating features here include the **geographical location of the area, its socioeconomic and demographic characteristics.** 4. **The major marketing functions of the tourist industry are found here, such as tour operation and travel retailing.**"
  - **SHALLOW:** the body has bullets 1–2 and only gestures at 3 ("tourism demand is stimulated"). **The specifics of bullet 3 and the whole of bullet 4 are missing.**
  - **PHOTO OPPORTUNITY 1 (p13, → `3868dc9c`):** top-left, ~470×470 px as rendered. **Plaza de España, Seville** — the semicircular brick-and-ceramic palace with its two towers, the canal and an ornate tiled bridge in the foreground, blue sky with scattered cloud. **Confidence: genuine photo, high.**
  - **PHOTO OPPORTUNITY 2 (p13, bottom-left, ~300×290 px):** **Tower Bridge, London**, at sunset — the bascule bridge with its two towers silhouetted under a pink-and-violet cloudscape, river in the foreground. **Confidence: genuine photo, high.**
  - **PHOTO OPPORTUNITY 3 (p13, bottom-centre, ~180×310 px, portrait):** **Galata Tower, Istanbul** — the cylindrical stone tower with its conical roof against heavy dark-blue cloud, rooftops below. **Confidence: genuine photo, high.**
- **p14 — `25f51ac3` "Tourist destinations".**
  - **Source (4 numbered bullets):** "1. It is the place that attract tourists for temporary stay… **with features and attractions that may not be found in the generating areas.** 2. It ranges in functions from accommodation, retail, service, entertainment and recreation. 3. **It is the most important part of the tourism system, which attracts tourists and energizes the system.** 4. **It is recognized as the impacts recipient of the tourism industry, and therefore where the planning and management of tourism is so important.**"
  - **SHALLOW — worst single unit in Chapter 1:** the body captures bullets 1 (partially) and 2 only. **Bullets 3 and 4 are missing in full** — including the claim that the destination is the most important part of the tourism system, and the entire impacts/planning-and-management point.
  - **PHOTO OPPORTUNITY 1 (p14, → `25f51ac3`):** top-left, ~455×355 px as rendered. **Kuala Lumpur skyline at night** — the illuminated Petronas Twin Towers with their spires at centre, surrounded by lit high-rises against a deep blue dusk sky. **Confidence: genuine photo, high; strong tourism-destination fit and locally relevant to this Malaysian course.**
  - **PHOTO OPPORTUNITY 2 (p14, bottom-left, ~455×430 px):** a **traditional Southeast Asian dancer** in a vivid pink and gold costume with an elaborate gold-and-feather headdress and long earrings, holding a pink-and-blue folding fan, against dark foliage. Illustrates cultural attractions at a destination. **Confidence: genuine photo, high.**
- **p15 — `a92b84df` "Travel routes".**
  - **Source (3 numbered bullets):** "1. It is the link between the generating and destination areas… 2. The effectiveness of the route will shape the size and the direction of the tourist flows. 3. **It represents the location of the main transportation component of the tourist industry.**"
  - **SHALLOW:** bullet 3 is missing entirely.
  - **PHOTO OPPORTUNITY 1 (p15, → `a92b84df`):** top-right, in a tilted white polaroid frame, ~350×290 px as rendered (crop inside the white border). An **airliner seen from directly underneath** — belly, wings and engines filling the frame against blue sky with white cloud. **Confidence: genuine photo, high.**
  - **PHOTO OPPORTUNITY 2 (p15, left, tilted polaroid, ~390×330 px):** an **empty straight two-lane road** running dead ahead to a vanishing point, golden crop fields either side, heavy grey-white cloud above. **Confidence: genuine photo, high.** Together these two are an unusually good literal match for "travel routes".

### Topic: Push and pull factors (`c8cb74d2`) — pages 17, 18, 19, 20, 21

- **p17 — `68fb52c1` "Push and pull relationship".**
  - **Source:** "Push factors are those that encourage tourist to leave a place **(psychologically or physically)** meanwhile the destination pull factors will seek to match the potential tourists motivation. **Examples of push factors are a desire to experience weather, extra money, the promise of encounter/fun and a desire to see a new culture.**"
  - **SHALLOW:** the parenthetical "(psychologically or physically)" and the **entire second sentence of named push-factor examples** are missing. Note this is *different* content from p18's economic list and from p20's diagram list — it is a third, unrecorded set.
  - **PHOTO OPPORTUNITY 1 (p17, → `68fb52c1` or the topic):** full-bleed slide background, ~910×818 px as rendered, with the text panel overlaid on its left. A **top-down aerial beach photo** — golden sand with neat rows of blue-and-white striped parasols and sun loungers, bathers on the sand, and turquoise shallows with swimmers at the right. **Confidence: genuine photo, high.** Caveat: text sits on top of it in the slide, but the underlying image extracts clean.
  - **PHOTO OPPORTUNITIES 2–5 (p17, left column):** a vertical "film negative" strip containing **four small photos, each ~185×165 px** as rendered, top to bottom: (a) an **airliner from below** against blue sky; (b) **two backpackers walking at golden hour** on a dirt path, seen from behind; (c) a **flat-lay of a vintage world map with a film camera and a passport**; (d) a **resort at dusk** — palm trees around a lit swimming pool with the sky going violet. All **genuine photos, high confidence**, but small; check native pixel dimensions before use.
- **p18 — `b64ba9e3` "Push factors in generating areas".**
  - **Source:** "1. The push factors are mainly concerned with **the stage of economic development in the generating area**. 2. It will include the level of affluence, mobility and holiday entitlement. 3. **The economic development may cause the pressure of life will provide the 'push' to engage in tourism.** 4. Unfavorable climate condition in the generating area will influence the tourist to travel."
  - **SHALLOW:** all the individual factors are present in the body, but as a flat comma-list — the source's **organising claim** (they are all *mainly concerned with the stage of economic development*) and its **causal chain** (economic development → pressure of life → the push to travel) are both gone. The list reads as six unrelated items instead of one mechanism.
  - **PHOTO OPPORTUNITY (p18, → `b64ba9e3`):** top-right, rounded-corner image ~730×410 px as rendered. A studio shot on a **flat cyan background**: a smiling man in a light-blue shirt and straw sun hat with a **yellow suitcase hoisted on his shoulder and a large orange suitcase** in his other hand, beside a laughing red-haired woman in sunglasses and a white top holding a **red passport and boarding-pass tickets**. **Confidence: genuine (stock) photo, high; thematic fit for "motivation to travel": high.**
- **p19 — `132c9f68` "Pull factors in destination areas".** Body lists accessibility, attractions, amenities, relative cost, marketing and promotion — matches the slide's four bullets. **Complete.**
  - **PHOTO OPPORTUNITY (p19, → `132c9f68`, medium value):** right half, full slide height, ~915×818 px as rendered, largely covered by the green text panel. A **wooden signpost among palm fronds** carrying a white directional arrow sign reading "**Beirut 1.460 km**", pale washed sky behind. A neat literal image for "accessibility"/distance-to-destination, if the visible portion crops well. **Confidence: genuine photo, high; usable area: limited by the overlay.**
- **p20 — `c403af77` "The Push-Pull Model".** Verified complete against the diagram in the 2026-08-09 pass; the diagram is already `diagrams.ts` → `ch1-push-pull-model.jpg`. **Nothing to do.**
- **p21 — `23d2636a` "Distance, connectivity, and attractiveness in tourist flows".** Enriched with the Williams and Zelinsky (1970) attribution in the 2026-08-09 pass. **Verified, nothing to do.**

### Topic: Forms of tourism (`254db3b5`) — page 25

All four units (`ec537a47` Domestic, `05319d3a` International, `c020c1b6` Inbound, `641ede37` Outbound) were checked word-by-word against p25. **Every one matches its source line exactly. No shallowness.** The slide's art is flat vector claymation-style illustrations (a plane, a suitcase, little figures) — **decorative, no photos, nothing to extract.**

### Topic: Tourism markets and products (`74ff4641`) — pages 26, 27, 28, 29, 30, 31

- **p26 — `0d3cb1ed` "Tourism products and types".** Body matches the slide (the tourism product shapes the tourism system; rural, urban, heritage, cultural, eco-tourism). **Complete** — but note the source **never defines any of the five product types anywhere in the deck**, so the "one entity, one unit" rule cannot be applied here without inventing content. Leave merged; flag to the client that the deck itself is thin here. No photos (vector art only).
- **p27 — `00b45e0c` "Holiday tourism market".**
  - **Source:** "Holiday tourism: **a. Sun, sea, sand — where good weather and beach related activities are important. b. Touring, sightseeing and culture — where new destinations, and different life styles are sought.**"
  - **SHALLOW:** the body keeps the two category *names* and drops both of the source's explanatory clauses — i.e. the entire reason each category exists. Also missing the slide's framing line: "Forms of tourism based on its market, **in terms of the purpose of visit of the tourist**", which currently has no unit anywhere in the topic.
  - No photo (a line-art globe icon only — decorative).
- **p28 — `6f990b48` "Common-interest tourism".** ← **previously flagged, confirmed still shallow**
  - **Source (3 bullets):** "a. **Those travelling with a purpose common to those visited at the destination.** b. Includes visiting friends and relatives, religion, health, education. c. **This group makes little or no demand upon accommodation or other tourist facilities at the destination.**"
  - **SHALLOW:** the body has only bullet b. **The definition itself (bullet a) and the distinctive economic characteristic (bullet c) are both missing** — meaning the unit currently never says what common-interest tourism *is*, only what it includes.
  - No photo (a flat browser-window/UI graphic — decorative).
- **p29 — `10f721f6` "Business and professional tourism".** ← **previously flagged, confirmed still shallow**
  - **Source (3 bullets):** "a. It includes trade fairs, conference and incentive travel. b. **This form of tourism is characterized by the fact that the decision to travel and the choice of destination are often not made by the traveller.** c. **Business travellers use the same facilities as leisure travellers, but their preferences may be different — they are less affected by price and generate more revenue.**"
  - **SHALLOW — the single worst omission in Chapter 1 alongside p14:** the body has only bullet a. **Both bullets b and c are absent**, and they carry the entire analytical content of the slide (who actually makes the booking decision; why business travellers are commercially attractive).
  - **PHOTO on p29 (low priority):** bottom-left, ~550×280 px visible (cropped by the slide edge). A man in a denim shirt and a woman in a yellow top **working together at a laptop with notebooks** at a table beside a window with greenery outside. Reads as students studying rather than business travel. **Confidence it is a photo: high; entity match: weak — skip unless the build pass wants a card image regardless.**
- **p30 — `571f3d66` "Halal tourism".**
  - **Source (an abstract from Battour & Ismail, 2015, *Tourism Management Perspectives*, Elsevier):** "…Halal tourism can be summarized by any object or action which is permissible to use or engage by Muslims in tourism industry, according to Islamic teachings. **In addition, the success of developing and marketing Halal tourism destination must be guided by the adoption of Islamic teachings and principles in all aspects of tourism activities.**"
  - **SHALLOW:** the second sentence — the success condition for developing and marketing a halal destination — is missing, as is the academic attribution ("Battour & Ismail, 2015"), which is printed on the slide and which the 2026-08-08 scan recorded but did not put in the body. Also "by **Muslims**" is dropped from the definition itself.
  - **PHOTO OPPORTUNITY (p30, → `571f3d66`) — one of the best entity-specific photos in Chapter 1:** top-left, ~735×410 px as rendered. A dusk photograph of **Hagia Sophia / the Sultanahmet district, Istanbul** — the great dome and flanking minarets rising behind a low brick wall, with a tree-lined paved promenade and ornate street lamps in the foreground, warm sky. A caption banner is **baked into the image**: "WHAT IS HALAL TOURISM? / MUSLIM CONSUMER MARKET 101 SERIES / BY CRESCENTRATING". **Confidence: genuine photo, high.** Caveat: the CrescentRating branding is part of the raster and cannot be removed by cropping without losing the lower band — acceptable if the caption credits it, otherwise crop above the banner.
- **p31 — `7e0adbdc` "Grey tourism (seniors)" and `d88c8e92` "Tourism Queensland's 2002 review".**
  - **`7e0adbdc` SHALLOW:** the slide's opening claims are missing — "**Seniors are the fastest growing market segment**" and the framing that the seniors market represents "a golden opportunity" for the domestic tourism industry. The body only gives the age definition and the discretionary-income/free-time rationale.
  - **`d88c8e92`:** matches the four listed objectives well. **SHALLOW (very minor):** objective 1 in the source is "develop a market profile of the seniors tourism sector **in Queensland**" — the geographic scope is dropped.
  - No photos on p31 (vector icons only).

### Topic: Types of travel arrangement (`7eda75b6`) — page 32

`80d123ed` Inclusive tour, `46db337a` Independent, `3fb9bb00` Tailor-made, `e1b66746` Youth tourism and `1ed16972` Gay tourism were all re-checked against p32. **All match the source; no shallowness.** The source names youth/grey/gay tourism with **zero elaboration on any of them**, which the two segment units correctly reflect rather than padding.
- **No photo opportunity on p32:** the only image is a flat single-colour **vector world-map silhouette** with no labels — decorative template art, not a figure. Do not extract.

### Topic: Measuring tourist flows (`1091bb83`) — pages 22, 23

`5d433a4b`, `57aa58f3`, `694caf3c` and `c6e926f2` were all enriched and verified against p22/p23 in the 2026-08-09 pass, including the "quality of flows" detail and the "money earned in one place, spent in another" clause. **Re-confirmed as complete this pass; not re-read page-by-page.** Photo status for p22/p23 was **not** re-checked this pass — see "Not covered" at the end.

### Topic: Travel distance (`1d1086bb`) — page 33

`7a91260a` Long-haul, `eb56c15f` Short-haul, `04677b30` (why the distinction matters) and `1feb7dff` (closing synthesis) all match p33 exactly. **Complete, nothing to do.**
- **PHOTO on p33 (low priority):** centre-right, a polaroid-framed **flat-lay photo** — an old world map on a wooden surface with a brown leather hat, a vintage film camera, a phone and two film canisters arranged on it. Genuine photo but pure scrapbook decoration. **Skip.**

### Chapter 1 pages checked with nothing to do
- **p1** — title slide ("TOURISM GEOGRAPHY"), already used for the chapter title.
- **p2, p10, p12, p16, p24** — section-divider slides carrying no content. Each has a genuine but generic banner photo: p2 a **close-up of a laser-engraved wooden map of Europe** with country names (~780×560 px, attractive, could serve as a topic-level image for `485bee15` if one is wanted); p12 **hiking boots on a boardwalk**; p16 a **sandstone vaulted colonnade / caravanserai interior**; p24 the "FORMS OF TOURISM" three-column contents slide (no photo). **All low priority.**
- **p20, p21, p22, p23, p25, p26, p32** — content verified complete against their units (p20/p21/p22/p23 in the 2026-08-09 pass, p25/p26/p32 re-verified this pass).

---

## Chapter 3 — Geographical Time Zone (`chapter-3.pdf`)

Much shorter deck (11 pages, 2 topics, 11 units total) and a much cleaner one — no
merged entities, no structural gaps (no heading promises content the deck never
delivers), and the two known source typos/errors on p2 ("nine planet[s]"; ocean names
"Hindi"/"Artic"; the Equator-diameter "north to east" wording) were **already** found,
flagged in `docs/checklist.md`, and handled correctly (omitted/corrected with a
documented rationale, not silently reproduced or silently miscorrected) in the
2026-08-09 pass — re-verified here, nothing further to do on those three items.
Pixel dimensions below are the **native embedded-image size** (read directly from
each JPEG/image XObject in the PDF, not a visual estimate), which is more precise
than the "as rendered" estimates used in the Ch1/2/4 sections above. Every page in
the deck repeats one 1287×12 decorative gradient header strip — noted once here,
skipped everywhere below, not a photo opportunity anywhere it appears.

### Topic: Earth systems and global divisions (`171860d9`) — page 2

- **p2 — `3c779620` "Earth's position and habitability", `199a1e35` "Hydrosphere", `9c311f4e` "Lithosphere", `9778dbb4` "Biosphere", `59312e55` "The Equator".** All five units re-checked word-by-word against p2. **Every one matches its source clause, including the two intentional, already-documented departures** (the false "nine planet[s]" claim omitted; "Hindi"/"Artic" spelled as "Indian"/"Arctic"; the Equator's "north to east" rendered as "north to south"). **No shallowness. Nothing to do.**
- **No photo on p2** — pure text slide, no image (confirmed both visually and against the embedded-image inventory: p2 has only the repeated decorative header strip).

### Topic: Latitude and longitude (`a457ad66`) — pages 3, 4, 5, 6, 7, 8, 9, 10, 11

- **p3 — `ab312ce7` "Latitude parallels and principal lines".** Body captures both source bullets (parallels; the five named lines — Arctic Circle, Tropic of Cancer, Equator, Tropic of Capricorn, Antarctic Circle) in full. **Complete.**
  - **PHOTO OPPORTUNITY (p3, → `ab312ce7`), native 550×384 px.** A labelled globe diagram (credited "www.visualdictionaryonline.com") showing the Earth with **North Pole, Arctic Circle, Northern Hemisphere, Tropic of Cancer, Equator, Southern Hemisphere, Tropic of Capricorn, Antarctic Circle, South Pole** all named directly on the sphere. This is a closer, more literal match for the unit's text than the topic-level `ch3-latitude-longitude-comparison.png` already in `diagrams.ts` (that one shows the north/south sign convention; this one names the actual five lines the unit lists). **Confidence: genuine diagram, high.**
- **p4 — `04c61a82` "Longitude".** Body captures all five source bullets (meridian lines; north-south direction; equal length, 15° segments; 15° = 1 hour; Greenwich Meridian in England as the reference). **Complete.**
  - **PHOTO OPPORTUNITY (p4, → `04c61a82`), native 320×312 px.** A companion globe diagram showing longitude lines converging at the poles, labelled "180 degrees of west longitude" / "180 degrees of east longitude" and degree markings around the equator. **Confidence: genuine diagram, high.** Pairs naturally with p3's — extracting both gives the Latitude and Longitude units matching illustrations.
- **p5 — the Latitude/Longitude sign-convention comparison chart.** Already `diagrams.ts` → `ch3-latitude-longitude-comparison.png` (native 572×312 px in the source, `FlateDecode`, not a JPEG — consistent with it being a rendered chart rather than a photo). **Checked, nothing to do.**
- **p6 — `2aa381ff` "Greenwich Mean Time as a reference time".**
  - **Source:** "Greenwich Mean Time (GMT) is the mean solar time at the Royal Observatory in Greenwich, London. Greenwich Mean Time is international time, the basis of the world time clock. **It defines date and time and the exact time.**"
  - **SHALLOW (minor):** the closing clause — that GMT "**defines date and time and the exact time**" — is dropped; the body keeps "the basis of...world timekeeping" but loses the more specific "defines date and time" framing.
  - **PHOTO OPPORTUNITY (p6, → `2aa381ff`), native 220×262 px.** A real photograph of the **"Royal Observatory Greenwich" clock and plaque** mounted on a brick wall — the actual physical clock the unit's text refers to. **Confidence: genuine photo, high; entity match: exact.**
- **p7/p8 — `6fd79ae0` "The Prime Meridian as a tourist attraction" (cited to p7).** No body text on either slide — the unit's description (visitors straddling the meridian line, one foot in each hemisphere) is a faithful, well-grounded synthesis of what the photos actually show, not an invention. **No shallowness — but this is the best photo set in the chapter, currently completely unused:**
  - **PHOTO OPPORTUNITY 1 (p7, → `6fd79ae0`), native 500×375 px.** A woman posing at the stainless-steel **Prime Meridian marker sculpture** at the Royal Observatory, Greenwich (credited "www.shutterstock.com – 226636570"). **Confidence: genuine (stock) photo, high.**
  - **PHOTO OPPORTUNITY 2 (p7, → `6fd79ae0`), native 300×470 px — the strongest single image in the chapter.** A first-person photo of two feet in sneakers **straddling the physical Prime Meridian line** embedded in the pavement, with brass plaques on either side giving real longitude/city labels: **"Bogota 74°05' W," "Quito 78°39' W"** on the west side and **"Singapore 103°...," "36°50' E," "106°45' E"** on the east side. A literal, unambiguous illustration of "one foot in the Eastern Hemisphere, one in the Western." **Confidence: genuine photo, high.**
  - **PHOTO OPPORTUNITY 3 (p7, low priority), native 262×192 px.** A smaller "alamy stock photo"-credited image of a compass/sundial marker in a paved plaza — likely a different meridian-line installation nearby. Genuine but redundant next to photos 1–2. **Skip unless a second image is wanted.**
  - **PHOTO OPPORTUNITY 4 (p8, → `6fd79ae0`), native 367×388 px.** Continuation shot: the same steel meridian sculpture from a different angle, with the meridian line running down a cobblestone path toward a brick gatehouse. **Confidence: genuine photo, high.**
  - **PHOTO OPPORTUNITY 5 (p8, → `6fd79ae0`), native 211×239 px.** A closer shot of the pavement plaques, this time showing **"Anchorage," "Dublin 6°15' W," "Greenwich 00°00' W"**. Good alternative or second image to photo 2. **Confidence: genuine photo, high.**
- **p9 — the Greenwich Meridian graticule map.** No unit currently cites p9. It's a black-and-white equirectangular world map with the Prime Meridian and Equator both drawn and labelled, gridlines every 15°. It doesn't add any fact beyond what `04c61a82` "Longitude" and `59312e55` "The Equator" already state — **not a missing-content gap**, just an uncited reinforcing map.
  - **PHOTO OPPORTUNITY (p9, low priority), native 804×535 px.** The graticule map itself, `FlateDecode` (a rendered chart, not a photo). Could serve either the Longitude unit or as a second topic-level diagram if one is wanted, but photos 1–5 above are higher-value picks for this topic. A second, smaller embedded image (native 480×238 px) was also detected on this page in the PDF's resource table but wasn't distinguishable as a separate visible element in the rendered page — low priority either way, not investigated further.
- **p10 — `a6943945` "Time zones and the International Date Line".** No body text on the slide — the unit's description (standard time zones radiating from Greenwich in hourly steps; the International Date Line near 180°; the Sunday/Monday boundary) matches the map's content exactly. **No shallowness — but this is the highest-value missing diagram in the chapter:**
  - **PHOTO OPPORTUNITY (p10, → `a6943945`), native 839×495 px.** The **"TIME ZONE" world map** — a full-colour equirectangular map with a row of 24 clock faces along the top (Noon to Midnight), colour-banded time-zone strips, the **Greenwich Meridian** and **International Date Line** both explicitly labelled, and the **"MONDAY / SUNDAY"** boundary marked exactly where the unit's text describes it. This is the single figure that would make the chapter's most abstract unit concrete. **Confidence: genuine diagram, high; directly and completely matches the unit's text.**
- **p11 — `3922aa2c` "Relating longitude to time differences".**
  - **Source (4 bullets):** "Different location varies different time. 15 degrees difference in meridian line differs to 1 hour differences. **Each degree is divided into minutes and minutes into seconds** [bolded in the source]. The Earth takes 24 hours to complete one rotation or to cover 360° of longitudes. This means that the Earth covers 15° of longitudes every hour. One degree of longitude takes 4 minutes **(1 hour = 60 minutes, divided by 15° per hour = 4 minutes per longitude)**."
  - **Body now:** "Earth rotates through 360° of longitude in 24 hours, equivalent to 15° per hour and 4 minutes per degree."
  - **SHALLOW:** the body keeps only the final derived numbers. Two things the slide treats as important enough to bold are missing entirely: **"each degree is divided into minutes and minutes into seconds"** (the arcminute/arcsecond precision concept — a distinct fact, not just phrasing) and **the worked arithmetic itself** ("1 hour = 60 minutes ÷ 15° per hour = 4 minutes per longitude") that shows *how* the 4-minutes figure is derived rather than just stating it. The opening framing line ("different location varies different time") is also dropped but is low-value filler.
  - **No photo on p11** — pure text slide (confirmed against the embedded-image inventory: only the repeated decorative header strip is present).

### Chapter 3 pages checked with nothing to do
- **p1** — title slide ("GEOGRAPHICAL TIME ZONE") with a genuine, detailed **"WORLD STANDARD TIME ZONES"** reference map (native 800×426 px, credited mapsofworld.com, showing real UTC offsets including half/quarter-hour zones like +5:30, +5:45, +3:30). Richer in geographic detail than p10's map but a weaker match for any single unit's text (no International Date Line callout) — **low priority**; p10's map above is the better pick if only one time-zone image is wanted for the topic.
- **p5** — already covered by the existing `ch3-latitude-longitude-comparison.png` topic diagram.

---

## Audit complete — all 4 chapters covered

Chapters 1, 2, 3, and 4 have all now been read page-by-page against their live
content units. Nothing below this line is a new finding — this is a wrap-up index for
whoever does the build/fix pass next.

**Scale of what's open, roughly:**
- Shallow-content findings needing a `content_units.body` rewrite: several per
  chapter (worst offenders: Chapter 1 p14 "Tourist destinations" and p29 "Business
  and professional tourism," each missing two whole source bullets; Chapter 3 p11
  "Relating longitude to time differences," missing a bolded-in-source concept and
  the worked arithmetic).
- One citation correction: Chapter 2 unit `e6f73628` "Tundra climate" is cited to
  page 21, content is actually on page 22.
- Missing-content tables with no content unit at all: Chapter 4 p18 (largest
  deserts), p19 (continental landmasses), p20 (sea/ocean ranking) — these need new
  units created, not existing ones edited.
- Structural gaps to flag to the client, not fix: Chapter 4's "valley" (p18 heading)
  and "beach" (p19 heading) — the deck promises content under these headings and
  never delivers it.
- Photo opportunities identified: roughly 40–45 across all four chapters, ranging
  from single highest-value pages (Chapter 4 p24's four captioned photos; Chapter 3
  p10's time-zone map; Chapter 3 p7's Prime-Meridian photo set) down to low-priority
  decorative-but-genuine images explicitly marked "skip" above.

**Recommended extraction order for the build pass** (highest-value, lowest-ambiguity
first): Chapter 4 p24 (four captioned photos, unambiguous unit matches) → Chapter 3
p10 (single diagram, completes the chapter's most abstract unit) → Chapter 3 p6/p7/p8
(Prime Meridian photo set) → Chapter 1's named-landmark photos (Plaza de España,
Tower Bridge, Galata Tower, KL skyline, Hagia Sophia — all high-confidence, specific
entities) → the remaining Chapter 2/4 photo opportunities → the harder-to-extract
`/Indexed`-colorspace diagrams if any remain.

See `docs/handoff.md` for what to do next and the standing workflow this project
follows.
