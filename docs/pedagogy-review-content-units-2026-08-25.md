# Pedagogy review — the 134 published `content_units`

**Date:** 2026-08-25
**Scope:** teaching quality of the prose learners read. Not factual accuracy.
**Reviewer:** course-pedagogy-reviewer (read-only; no database writes, no content edits)

---

## 1. What we're focusing on next

Three things, in order.

1. **Six units flatten a source *table* into a single run-on sentence.** The worst is 53 words
   in one sentence with no full stop until the end. The source slide is a real 6-column
   ranked table — I rendered it and looked at it. There is a fix here that changes **zero
   words of source prose**: the table images already exist inside the PDFs and can be
   extracted into `content-images.ts` exactly like the 48 photos already there. That is a
   Layer 2 change, it is safe, and it is the single highest-value item in this review.

2. **Chapter 1 is the hardest chapter to read and the least illustrated — and it comes
   first.** Median Flesch–Kincaid grade 15.2 vs 11.7 / 10.5 / 12.5 for CH2/3/4; 52% of its
   units sit at grade 15+; it has **1 topic diagram across 9 topics**, and 5 of those 9
   topics have no visual of any kind. Every abstract Tier-2 term in the deck ("ambience",
   "connectivity", "discretionary", "affluence", "propensity"-class vocabulary) clusters in
   it. The prose is source-locked, but the visual layer is not — and CH1 is where visuals
   would pay most.

3. **Unit order within a topic is not deterministic for 18 units, and the app's layout
   engine is order-sensitive.** `repository.ts` orders by `created_at` with no tiebreaker;
   the bulk importer commits every unit in one transaction, so ties are common. Meanwhile
   `group-units.ts` promotes `units[0]` to the large-type page lead. A tie reshuffle
   silently changes which unit is the page's opening statement. One `PATCH` per affected
   row fixes it.

---

## 2. Scope and method

### What I read

- **All 134 published `content_units`**, live from Supabase via anon-key `GET` only
  (`content_units`, `topics`, `chapters`, `source_references`). No `POST`/`PATCH`/`DELETE`
  was issued at any point. The DB was the source of truth; I did not rely on any prior
  report.
- **`web/src/lib/course-brain/diagrams.ts`** (9 entries) and **`content-images.ts`**
  (48 entries), on the current working branch `agent/content-fidelity-remediation`.
- **The app's rendering path** — `repository.ts`, `group-units.ts`,
  `components/materials/content-unit.tsx`, `content-section.tsx`, `topic-diagram.tsx`,
  `app/chapters/[chapterCode]/page.tsx` — to establish how units are ordered, chunked and
  displayed, and whether NULL summaries are actually visible to a learner.
- **Two source slides rendered directly from the PDFs** (`chapter-4.pdf` p15 and p20, via
  `pymupdf` at 110 dpi) to verify a structural claim about the source rather than infer it.
  I did not read any secondary summary document.
- `.claude/skills/course-content/SKILL.md` for this project's own granularity and ordering
  rules.

### Skills loaded

| Skill | Used for |
|---|---|
| `cognitive-load-analyser` | Findings 1, 4, 5, 6, 7 — element interactivity, split attention, germane load |
| `text-complexity-analyser` | Findings 2, 5 — three-dimensional complexity, Tier 2/3 vocabulary |
| `dual-coding-designer` | Findings 1, 2, 8 — matching visual type to knowledge structure |
| `learning-progression-builder` | Findings 3, 4, 9 — prerequisites, stuck points, sequencing |

Each finding names the skill and the principle behind it.

### The reading-level assumption — please correct me if this is wrong

**This is an assumption, not a known fact, and several findings depend on it.**

DTM10333 is a Malaysian polytechnic diploma-level course. I have assumed learners are
roughly 18–21, post-SPM, studying in English as a **second** language, with functional
English reading somewhere around **CEFR B1 (some B2)**. B1 independent reading maps
roughly to a **Flesch–Kincaid grade 7–9** comfort band — meaning text at FK 12+ is
readable with effort and support, and text at FK 15+ is a genuine barrier for a
substantial share of the cohort.

If the real cohort reads at B2+, the readability findings soften considerably (though the
cognitive-load and sequencing findings do not — those are structural). **If someone can
supply the actual entry English requirement for DTM10333, this section should be revisited
before acting on Finding 2.**

### A caveat on the readability numbers

Flesch–Kincaid is unreliable on very short texts, and this deck's mean unit is 30 words.
The clearest example: *Pull factors in destination areas* (`132c9f68`) is 12 words long and
scores FK 21.5 purely because "accessibility", "amenities" and "promotion" are
polysyllabic. That is a formula artefact, not a hard sentence.

So I have used FK **in aggregate only**, and cross-checked every individual claim against
average sentence length and the actual text. Per `text-complexity-analyser`
(Shanahan et al., 2012), quantitative measures are one of three dimensions — the
qualitative knowledge demands (Finding 5) and the reader-task gap matter at least as much,
and I have weighted them accordingly.

### What I could not access

`quiz_questions` (208 items) is service-role gated and no service-role key was available
this session. I did not attempt to read it. See section 5.

---

## 3. Findings

### Finding 1 — Six units flatten a source table into one unpunctuated sentence

**Label: `NEEDS-CLIENT-RULING` on the prose · `SAFE-TO-APPLY` on the visual remedy**
**Skill:** `cognitive-load-analyser` (element interactivity; Sweller 1988) and
`dual-coding-designer` (Mayer 2009 — match the visual type to the knowledge structure)

Six units are a **single sentence of 43–61 words** carrying an embedded list:

| Unit id | Chapter / page | Title | Words | Sentences | FK |
|---|---|---|---|---|---|
| `10376fc0-3ac2-4747-9972-c64ab1e089d4` | CH4 p15 | World's highest mountains | 53 | **1** | 28.0 |
| `647e35d5-2d4c-4a48-a26c-ae943eb83085` | CH4 p19 | Highest island peaks | 56 | **1** | 26.1 |
| `0b0aa4a1-67fa-484f-9dce-f385fdf71e91` | CH4 p20 | Largest bodies of water by area | 53 | **1** | 23.6 |
| `c91a07a5-dd5b-4db2-9f5d-3d4e8b56d8ad` | CH4 p16 | Mountain ranges of the world | 47 | **1** | 26.3 |
| `2fe03acb-3cd8-49ea-a3c7-3f967c8651a9` | CH4 p7 | Examples across attraction categories | 47 | **1** | 26.1 |
| `dbdbc094-1f0b-4804-a65a-7f118991f5f1` | CH4 p19 | Continental landmasses | 43 | **1** | 23.1 |

Plus two close relatives: `0e758a6f` (*Largest deserts*, 9 deserts + 9 areas, 1 sentence)
and `d18c0a11` (*Mid-latitude climates compared*, 90 words).

The evidence, verbatim from `10376fc0`:

> The world's six highest mountains are Mount Everest, also known as Sagarmatha or
> Chomolungma (8,848 m / 29,029 ft, Mahalangur Himalaya range), K2, also known as Qogir or
> Godwin Austen (8,611 m / 28,251 ft, Baltoro Karakoram), Kangchenjunga (8,586 m /
> 28,169 ft, Kangchenjunga Himalaya), Lhotse (8,516 m / 27,940 ft, Mahalangur Himalaya),
> Makalu (8,485 m / 27,838 ft, Mahalangur Himalaya), and Cho Oyu (8,201 m / 26,864 ft,
> Mahalangur Himalaya).

That is six entities × three attributes each = **18 elements plus their cross-relations,
delivered in one sentence with no structural break.** Sweller's working-memory bound is
4–7 elements. This is not a hard *concept* — it is an easy concept made unreadable by
form. In CLT terms it is almost pure extraneous load: the intrinsic load of "Everest is the
tallest" is trivial, and essentially all the difficulty is transcription format.

**The decisive evidence.** I rendered `chapter-4.pdf` page 15. The source is not prose at
all — it is a **six-column table**: `Rank | Mountain | Height (m) | Height (ft) | Range |
Coordinates`, six rows. Page 20 is likewise a **ten-row ranked table**:
`Rank | Body of water | Square miles (square kilometres)`.

Two consequences follow, and the second is the important one:

1. The current prose is *already* a transformation of the source, not a transcription of
   it. The `Rank` column and the `Coordinates` column are gone from `10376fc0` entirely;
   `0b0aa4a1` keeps all ten names but reports only the first and last area values
   ("ranging from the Pacific's… down to the Bay of Bengal's…"), dropping eight of ten
   numbers. *I am flagging this as a pedagogical loss — the rank ordering is the entire
   teaching point of a ranked table — and deliberately not adjudicating it as an accuracy
   question. It belongs to the accuracy workstream if anyone wants to pursue it.*
2. **Restoring a tabular presentation is therefore arguably *more* faithful to the source,
   not less.** The fidelity rule protects the source's content. Here the source's own form
   was a table, and prose linearisation is what departed from it.

Unit `d18c0a11` makes the point by itself. Its body opens:

> The Mid-Latitude Climates **table** compares two sub-types. Humid Continental: latitude
> range 30 to 55 N and S…

The prose names the form it lost.

**Recommendations, cheapest and safest first:**

- **`SAFE-TO-APPLY` — extract the source table images into `content-images.ts`.** These
  tables are embedded raster images in the PDF; `.claude/skills/course-content/SKILL.md`
  already documents the extraction procedure (`pdf-lib`, walk
  `enumerateIndirectObjects()`, `DCTDecode` → JPEG). Key them by the six unit ids above,
  exactly like the 48 images already in that file. **This changes no source prose at all**,
  needs no client ruling, and restores the comparative structure the table was carrying.
  Per `dual-coding-designer`, ranked comparative data is precisely the knowledge structure
  a table serves and prose cannot — this is a complementary visual in Mayer's sense, not a
  decorative one. This is the recommendation I would act on first.
- **`NEEDS-CLIENT-RULING` — is re-formatting the *same words* into a list a "rewrite"?**
  The Layer 1 / Layer 2 boundary in my instructions does not settle this case, and it is
  worth an explicit ruling because it unlocks a large win across the deck. Turning
  `10376fc0` into six lines, one per mountain, with no word changed and nothing added or
  removed, would take it from FK 28 to trivially scannable. My reading is that this is
  closer to the sanctioned "the split is structural; the words move unchanged" pattern than
  to a rewrite — but it changes the stored `body` string, so I am not treating it as
  pre-approved. **Note the dependency:** this option is currently blocked by Finding 6
  regardless — the renderer would collapse the line breaks anyway.
- **`SAFE-TO-APPLY` — split the roster units per this project's own "one entity, one unit"
  rule.** `10376fc0` is six named mountains in one row; the standing rule says that is six
  units. Same for `647e35d5` (5 peaks), `c91a07a5` (6 ranges), `dbdbc094` (4 landmasses).
  The words move unchanged. Caveat: at 20 units, CH4's *Water environments* topic is
  already the longest scroll in the app (Finding 7) — splitting into ~20 more single-fact
  units would worsen that unless paired with the sub-topic split proposed there. **My
  preference is the table image, not the split**, for these particular units: a ranked
  table is a legitimate single coherent idea under the rule's own stated exception, and
  splitting it destroys the ranking that makes it meaningful.

---

### Finding 2 — The hardest chapter is the least illustrated, and learners meet it first

**Label: `SAFE-TO-APPLY` (visual layer) · `BLOCKED-BY-FIDELITY` (prose)**
**Skills:** `text-complexity-analyser`, `dual-coding-designer`, `learning-progression-builder`

Reading difficulty and visual support run in **opposite** directions across the four
chapters:

| Chapter | Units | FK median | % units FK ≥ 15 | Content images | Topic diagrams |
|---|---|---|---|---|---|
| **CH1 Tourism Geography** | 40 | **15.2** | **52%** | 11 (28%) | **1 of 9 topics** |
| CH2 World Geography and Climate | 42 | 11.7 | 17% | 14 (33%) | 4 of 8 topics |
| CH3 Geographical Time Zone | 11 | 10.5 | 9% | 5 (45%) | 1 of 2 topics |
| CH4 Tourism Natural Resources | 41 | 12.5 | 32% | 18 (44%) | 3 of 4 topics |

CH1 is the hardest chapter on every quantitative measure, has the thinnest visual support,
and is the first thing a learner opens.

This is not a coincidence — it is a *predictable* consequence of how the visual layer was
built. CH2 and CH4 are about concrete, photographable things (continents, waterfalls,
atolls, climates), so the source decks are full of usable images and 44% of CH4's units got
one. CH1 is about **abstract relational structures** — push/pull, tourism systems,
inbound/outbound, distance decay, tourist flows — which have no photograph. So they got
nothing.

But per `dual-coding-designer` (Paivio 1986; Mayer 2009), abstract relational content is
*exactly* where dual coding pays the highest dividend. A photo of a beach adds little to
the word "beach". A 2×2 matrix adds a great deal to four tourism definitions. **The
chapter with no photographs available is the chapter that most needs constructed
diagrams.**

Five of CH1's nine topics have zero visuals of any kind:

- **t5 Forms of tourism** (4 units, `ec537a47` Domestic, `05319d3a` International,
  `c020c1b6` Inbound, `641ede37` Outbound) — no diagram, no images.
- **t7 Types of travel arrangement** (5 units) — none.
- **t8 Measuring tourist flows** (4 units) — none.
- **t9 Travel distance** (4 units) — none.
- **t6 Tourism markets and products** (7 units, 385 words — CH1's densest topic) — 1 image.

**Concrete recommendation, `SAFE-TO-APPLY`** (new artwork, not source prose — Layer 2 by
my instructions' explicit listing of "which diagram or photo pairs with which unit"):

*Forms of tourism* (t5) is the clearest single win in the deck. Those four units are not
four independent definitions — they are **one 2×2 matrix** that the prose never reveals:

```
                    │  Resident travelling   │  Non-resident arriving
────────────────────┼────────────────────────┼────────────────────────
 Within own country │      DOMESTIC          │        —
 Across a border    │      OUTBOUND          │      INBOUND
                         ( both are INTERNATIONAL tourism )
```

Per Mayer's multimedia principle the visual must *add* what words cannot efficiently
convey; here it adds the entire relational structure — that inbound and outbound are the
same flow seen from two ends, which is the exact thing learners confuse. Per the contiguity
principle, the labels belong inside the cells, not in a legend below.

Note this would be the **first constructed diagram in the project** — all 9 existing
diagrams are extracted from source pages. That is a small precedent worth a nod, though
diagram choice is squarely Layer 2 and the matrix asserts no fact the four units don't
already state.

Similar candidates, in priority order: **t9 Travel distance** (long-haul vs short-haul —
a labelled distance band, and `04677b30` explicitly explains *why* the distinction matters,
so the diagram has ready-made narration); **t8 Measuring tourist flows** (`5d433a4b` says
there are "three types" — volume / characteristics / expenditure — a three-branch tree
maps it directly and the three child units already exist as `57aa58f3`, `694caf3c`,
`c6e926f2`).

**The prose itself is `BLOCKED-BY-FIDELITY`.** CH1's reading level is driven by
source-derived abstraction and Tier-2 academic vocabulary I cannot touch. Worth naming for
a client ruling on scaffolding (a glossary is Layer 2, the prose is not): **"ambience"**
(`90510d10`), **"connectivity"** (`23d2636a`), **"discretionary"** (`7e0adbdc`),
**"affluence"** (`b64ba9e3`), **"accessibility" / "amenities"** (`132c9f68`). Per Beck et
al. (2013) these are Tier 2 — high-utility, cross-subject, and the ones worth pre-teaching,
as distinct from the Tier 3 technical terms ("atoll", "fiord") which the deck already
defines well.

---

### Finding 3 — CH2's climate taxonomy is built on latitude, which CH3 defines afterwards

**Label: `NEEDS-CLIENT-RULING`**
**Skill:** `learning-progression-builder` (Daro et al. 2011 — hard prerequisites)

Chapter 2 organises its entire climate classification around latitude and the equator:

- `0e07433e` *Climate zones by latitude*: "The world's climate zones run in bands by
  latitude. The tropics, nearest the equator… The mid-latitudes, on either side of the
  tropics…"
- `b7d73dcb` *The five major climate types*: "tropical, dry, **middle latitude**, **high
  latitude**, and highland"
- Plus `e3ec1403` *Tropical climate conditions*, `0cf701f8` *Tropical humid climate
  features*, `1d47ba8b` *Middle latitude climates*, `856b9788` *Humid continental climate*,
  `c7aab0d3` *High-latitude climates*, `d18c0a11` *Mid-latitude climates compared* — **8 CH2
  units in total use "latitude" or "equator" as load-bearing terms**, and two entire topics
  are *named* for them (*Middle latitude climate*, 9 units; *High latitude climate*,
  4 units).

The equator is formally defined in unit **`59312e55-7f96-4ac8-8d00-65ad610a5955`
("The Equator")** — which sits in **CH3 topic 1**, an entire chapter later. Four CH2 units
use the term before it is defined.

Worse: **latitude itself is never actually defined anywhere in the deck.** The closest is
CH3's `Latitude parallels and principal lines`, which begins "Latitude lines are
parallels" — that presupposes the concept rather than introducing it.

This is a hard prerequisite violation in Daro's sense: not "easier with", but "cannot be
correctly understood without". A learner meeting "middle latitude climate" in CH2 has no
construct to attach it to, and per Hattie & Donoghue (2016) will fall back on surface
memorisation of the label — which is exactly the failure mode this content is otherwise
well designed to avoid.

There is a second, related problem. **CH3 is really two chapters glued together.** Its
title is *Geographical Time Zone*, but topic 1 (*Earth systems and global divisions*,
5 units: hydrosphere, lithosphere, biosphere, Earth's position, the Equator) is not about
time zones at all. It is foundational world geography that belongs **before** CH2. Only
topic 2 is about time.

And CH3 t1 partly **restates** CH2 in compressed form, after the fact — `Hydrosphere`
lists the five oceans and `Lithosphere` lists the seven continents, after CH2 has already
spent **17 units** on exactly those two sets. Per Mayer's redundancy effect, re-presenting
known material in a lower-detail form adds load without adding learning.

**Why this is `NEEDS-CLIENT-RULING` and not `SAFE-TO-APPLY`:** chapter order is Layer 2 by
my instructions, so I *may* propose it — but DTM10333 chapter numbering very likely mirrors
the official syllabus and the exam structure, and I have no visibility into that. Resequencing
chapters is not a call I should make.

Options, cheapest first:

1. **Cheapest, no resequencing:** add a prerequisite pointer at the head of CH2 t3
   ("World climate classification") linking to CH3 t1's *The Equator* and t2's latitude
   units. Pure navigation — no content moves, no chapter renumbering. This is Layer 2 UI
   and would be `SAFE-TO-APPLY` on its own.
2. **Middle:** move CH3 **topic 1** only (the 5 Earth-systems units) to the front of CH2 or
   the end of CH1, leaving CH3 as a coherent time-zone chapter and leaving chapter numbers
   intact. This also resolves the redundancy, since the foundational statement would then
   precede rather than follow CH2's detail.
3. **Most invasive:** reorder chapters to CH1 → CH3 → CH2 → CH4. Best pedagogical
   sequence, almost certainly unacceptable against a fixed syllabus. Noted for
   completeness; I do not recommend it.

I would put option 1 in front of the client with option 2 as the substantive fix.

*Adjacent, handing off rather than adjudicating:* CH3's `Hydrosphere` names the five oceans
as "Pacific, Atlantic, Indian, Arctic, and **Antarctic**", while the CH2 major-oceans
diagram alt text says "Arctic, Atlantic, Pacific, Indian, and **Southern**". A learner sees
two different names for one ocean in one course. Whether either is wrong is an accuracy
question and explicitly not mine; the *coherence* problem is pedagogical and real. Flagging
for the accuracy workstream.

---

### Finding 4 — Unit order is non-deterministic for 18 units, and the layout engine depends on it

**Label: `SAFE-TO-APPLY`**
**Skill:** `learning-progression-builder` (sequence integrity)

`content_units` has **no `display_order` column**. The learner-facing query at
`web/src/lib/course-brain/repository.ts:91-100` is:

```ts
.eq("topic_id", topicId)
.eq("status", "published")
.order("created_at")
```

No secondary sort key, and `group-units.ts` never re-sorts — it only groups.

The importer (`scripts/import_reviewed_content.py:81-123`) inserts every unit and commits
**once**, and Postgres `now()` is `transaction_timestamp()` — constant across a
transaction. So every unit from one import run carries an **identical** `created_at`, and
`ORDER BY created_at` degenerates to no ordering at all: ties come back in
heap/plan-dependent order, which can change after any `UPDATE`, `VACUUM`, or plan switch.

**18 of 134 units, across 5 topics, currently sit in a tied group:**

| Chapter | Topic | Units tied |
|---|---|---|
| CH1 | Leisure, recreation, and tourism | 3 of 3 |
| CH1 | Geography and the tourism system | 4 of 4 |
| CH2 | Dry climate | 3 of 3 |
| CH4 | Tourism natural resources | 5 of 5 |
| CH4 | Tourist attractions and classification | 3 of 4 |

This would be cosmetic if display were order-independent. It is not. `group-units.ts:56-71`
promotes **`units[0]`** to the large-type page lead, and `:73-89` builds "maximal contiguous
runs" that decide section headings and grid-vs-stack layout. `isRoster()` (`:33-35`) adds
further order sensitivity. **A tie reshuffle changes which unit is the page's opening
statement and how the page is sectioned** — for whole topics at a time, since in four of
the five cases *every* unit in the topic is tied.

Note the pedagogical stakes are highest in CH4 *Tourism natural resources*, where all 5
units are tied: this is the chapter's opening topic, so which sentence introduces the
chapter is currently arbitrary.

**Fix:** `PATCH` a distinct `created_at` onto each of the 18 rows, in the deliberate order
given by the source page sequence — the project's own documented convention
(`.claude/skills/course-content/SKILL.md`: general concept → taxonomy → instances →
examples → synthesis last). The skill also warns, correctly, to give **every** row in a
tied group its own value rather than nudging one. This is a database write and therefore
outside my remit; I have not made it.

**Worth considering separately:** adding a real `display_order` column would remove this
whole class of bug permanently, rather than encoding sequence in a timestamp that any
future bulk import will re-tie. That is a schema change and a bigger conversation, but the
current arrangement will keep producing this bug.

---

### Finding 5 — The deck defines; it rarely explains. Germane load is low by construction

**Label: `SAFE-TO-APPLY`**
**Skill:** `cognitive-load-analyser` (germane load — schema construction vs recall)

`content_type` distribution across all 134 units:

| Type | Count | Share |
|---|---|---|
| `definition` | 98 | **73%** |
| `explanation` | 14 | 10% |
| `example` | 13 | 10% |
| `key_takeaway` | 6 | 4% |
| `case_study` | 2 | 1.5% |
| `learning_note` | 1 | 0.7% |

Schema-building types (`explanation` + `key_takeaway` + `case_study`) per chapter:
**CH1 25%, CH3 18%, CH2 12%, CH4 12%.**

Chapter 2 is the sharpest case: 36 of 42 units are definitions. A learner can read the
entire chapter and encounter almost no sentence explaining *why* climate varies with
latitude, only statements that it does.

In CLT terms the load profile is: intrinsic load **low** (each unit is one short, clean
fact — genuinely well chunked), extraneous load **low to moderate** (except Findings 1
and 6), and germane load **low** — the material asks for recognition, not schema
construction. Sweller's point is that low total load is not the goal; *productive* load is.
A deck this easy to skim is easy to skim without learning much.

This is a faithful reflection of the source — the slides are largely definitional — so the
**prose is `BLOCKED-BY-FIDELITY`**. But my instructions explicitly place "retrieval prompts,
self-explanation prompts, elaboration questions the app could add" in Layer 2. That is the
opening, and it is a large one.

**Recommendation, `SAFE-TO-APPLY`:** add an elaboration prompt as a new field or a new
`learning_note`-typed sibling unit, generated per topic rather than per unit (134 prompts
is its own load problem — ~23 topic-level prompts is right). These are *questions about*
source content, not restatements of it, so they sit cleanly in Layer 2. Examples grounded
in units that already exist:

- CH2 t3, after `0e07433e`: *"Why do the tropics have two seasons while the mid-latitudes
  have four? Use what the unit says about distance from the equator."*
- CH1 t4, after `c403af77`: *"A push factor and a pull factor can describe the same trip.
  Give one trip and name both."*
- CH1 t5, after the four Forms-of-tourism units: *"A Malaysian flies to Bangkok. Which two
  of the four terms apply, and from whose point of view?"* — pairs directly with the 2×2
  matrix in Finding 2.
- CH4 t1: *"Why is it a problem that tourism resources are 'shared with other users'
  (`44e6b7e6`)? Name one conflict this could cause."*

Local relevance is a live opportunity here: Mount Kinabalu already appears in `d0887588`
and `647e35d5`, and Kuala Lumpur in `6fd79ae0`. Per `text-complexity-analyser`'s
reader-task dimension, anchoring abstract prompts to destinations these learners know
reduces the knowledge-demand gap at no fidelity cost, since the anchors are already in the
source.

If this lands, `elaborative-interrogation-generator` and `retrieval-practice-generator`
are the right skills for the generation pass — neither was in scope for this review.

---

### Finding 6 — The renderer silently discards any structure a body contains

**Label: `SAFE-TO-APPLY`**
**Skill:** `cognitive-load-analyser` (extraneous load)

`content_units.body` is interpolated raw into a `<p>` in five places in
`web/src/components/materials/content-unit.tsx` (lines 105, 122, 142, 163, 186), e.g.:

```tsx
<p className="max-w-[68ch] text-[1.0625rem]/[1.7] text-ink">{unit.body}</p>
```

There is no Markdown renderer in the app (`web/package.json` has no `react-markdown`,
`remark`, or `marked`), and **none of these five call sites sets `whitespace-pre-wrap`** —
so any newline inside a body collapses into one continuous run of text.

The bookmarks page does the opposite. `web/src/app/dashboard/student/bookmarks/page.tsx:71`:

```tsx
<p className="whitespace-pre-wrap text-ink">{bookmark.body}</p>
```

**The same body string renders with structure on the bookmarks page and without it on the
page learners actually study from.** That inconsistency is a bug on its own terms.

It also **blocks the cheapest possible fix for Finding 1**: even if the client rules that
re-formatting `10376fc0`'s six mountains onto six lines is permissible, the main learner
view would collapse them straight back into one run-on line. Finding 6 is a prerequisite
for that option, which is why the table-image route in Finding 1 is the one I would take
first.

**Fix:** add `whitespace-pre-wrap` to the five `<p>` elements. One-line change per site,
no content touched, no behaviour change for the 134 bodies that currently contain no
newlines. It converts "add structure to a body" from impossible into a live option, and
makes the two views consistent.

*Smaller, related:* `content-section.tsx:102-103` and `group-units.ts:130-132` suppress the
`content_type` badge and section headings unless a topic has ≥2 labelled sections. In a
topic with one intro plus one run of examples, the definition/example distinction survives
only as a thin left-border colour. Given how heavily this deck leans on `content_type` to
carry structure (Finding 5), that is a signalling loss — Mayer's signalling principle says
cue the structure, and here the cue is switched off exactly when the topic is simple enough
that it would be cheap to show.

---

### Finding 7 — Topic sizes vary 10-fold; one topic is a 20-unit scroll

**Label: `SAFE-TO-APPLY`**
**Skill:** `cognitive-load-analyser` (chunking; segmenting principle)

There is no pagination anywhere — `app/chapters/[chapterCode]/page.tsx:57-66` renders every
published unit in a topic at once, and the only "next" affordance is the sidebar topic link.
So topic size *is* page length.

| Topic | Units | Total words |
|---|---|---|
| **CH4 t4 Water environments** | **20** | 396 |
| CH4 t3 Natural landscapes and landforms | 12 | 489 |
| CH2 t1 The seven continents | 9 | 202 |
| CH2 t6 Middle latitude climate | 9 | 243 |
| CH1 t6 Tourism markets and products | 7 | 385 |
| … | | |
| CH2 t3 World climate classification | 2 | — |
| CH2 t8 Highland climate | 2 | — |

CH4 *Water environments* is 20 units — ten times the smallest topic — and reads as an
undifferentiated glossary wall. The full list, in current display order: *Fiord, Largest
bodies of water by area, Lagoon, Glacier, Atoll, Highest island peaks, Springs, Ocean,
Peninsula, Island, River, Waterfall, Cays, Continents, Bay, Coral reef, Lake, Continental
landmasses, Gulf, Sea* — roughly 20 words each, in one scroll, with no internal landmark
and no discernible organising order.

Note also that **three of those 20 units are not water features at all**: *Continents*,
*Continental landmasses* (highest points of each landmass) and *Highest island peaks* are
land topics filed under water. This project has caught this class of error before — the
2026-08-09 pass moved an "Island" unit out of landscapes into water. These three look like
the same misfiling in the other direction, and relocating them to CH4 t3 *Natural
landscapes and landforms* is a `SAFE-TO-APPLY` Layer 2 move that also trims the scroll.

This is the segmenting principle: a 20-item list with no superordinate structure gives
working memory nothing to hang items on, and per Miller/Sweller the learner will retain the
first few and the last few. The irony is that CH4 t4 is the **best-illustrated topic in the
app** (11 of 20 units have a real extracted photo) — the visuals are doing real work, and
the organisation is what's missing.

**Recommendation:** after relocating the three land units, split the remaining 17 into 3
sub-topics along a distinction the content already makes:

- **Seas and oceans** — Sea, Ocean, Gulf, Bay
- **Islands and coastal features** — Island, Cays, Atoll, Coral reef, Lagoon, Peninsula
- **Inland and glacial water** — River, Lake, Waterfall, Springs, Fiord, Glacier

Topic boundaries are explicitly Layer 2, the words move unchanged, and this project has
done exactly this before (CH1's *Forms and markets of tourism* was split into 3 on
2026-08-09). CH4 t3 at 12 units is a milder version of the same case.

Splitting also gives each new topic a slot for its own `topicDiagrams` entry, which
currently maxes out at one figure per topic no matter how large the topic is — a 20-unit
topic and a 2-unit topic get the same single diagram.

---

### Finding 8 — NULL summaries: currently a non-issue, and I'd leave them alone

**Label: `NEEDS-CLIENT-RULING` (low priority — my recommendation is "do nothing yet")**

I was asked to check the app before asserting either way. I did.

- **`chapters.summary` is never even selected.** `repository.ts:72-79` selects
  `"code, title, display_order"`. `ChapterNav` renders `chapter.code` only.
- **`topics.summary` is selected and typed but never rendered.** `repository.ts:81-89`
  selects it; `types.ts:10-15` carries it as `summary: string | null`; the only UI consumer,
  `components/materials/topic-list.tsx`, uses **only** `topic.id` and `topic.name`. (The
  word "summary" in that file is the HTML `<summary>` element of a mobile `<details>`
  disclosure — unrelated.)
- No fallback text, no `??` default, no empty div. The importer never writes them either
  (`scripts/import_reviewed_content.py:87,94`).

**Verdict: these are dormant columns, not a learner-facing gap.** Nothing renders and
nothing degrades. Populating them today would change what a learner sees by exactly
nothing — it would need new JSX first.

So I would **not** treat this as a content debt to pay down now. It is worth revisiting
only in a specific order: build the UI slot first (a topic-page overview line, or chapter
cards on the index), *then* write summaries against a known display context. Writing 4
chapter and 23 topic summaries with no rendering target risks 27 rows of prose that never
appear, or appear in a shape they weren't written for.

One caveat that would change the answer: a summary is also the natural place to put the
prerequisite pointer from Finding 3 and the topic-level elaboration prompt from Finding 5.
If either of those lands, the summary field acquires a real job and this stops being
dormant. Worth sequencing them together.

---

### Finding 9 — The visual maps are correct today but structurally fragile

**Label: `SAFE-TO-APPLY` (test only — no data change needed)**

I checked referential integrity across both maps against the live DB:

- All **9** `topicDiagrams` keys resolve to live `topics.id` values. Zero orphans.
- All **48** `contentImages` keys resolve to live **published** `content_units.id` values.
  Zero orphans.

That is a genuinely clean result and worth recording. But both maps are hardcoded
TypeScript literals keyed on database UUIDs, and the lookup fails silent:
`content-unit.tsx:40-51` is `const image = contentImages[unitId]; if (!image) return null;`

If a unit is ever re-imported and gets a new UUID — which is exactly what an insert-then-delete
split does, and Findings 1 and 7 both propose splits — its image **disappears with no error,
no warning, and no test failure**. The 48-image layer is one careless split away from
silently thinning out, and nobody would notice until a learner did.

**Recommendation:** a single CI test asserting every key in both maps resolves to a live
published row. Cheap, and it converts a silent failure into a loud one. Worth adding
*before* acting on the split recommendations, not after.

*Minor:* image captions duplicate provenance as free text (`"Atoll — chapter-4.pdf, p24"`)
while `sourceFile` and `pageOrSlide` sit in the adjacent fields. `topic-diagram.tsx:39`
already derives its figcaption from the structured fields — `content-images.ts` could do
the same and remove the drift risk.

---

## 4. What is already good

This deck is in materially better shape than a findings list suggests, and several things
in it are done properly rather than adequately.

**Unit-level chunking is genuinely well done.** Mean body length is 30 words; the median
unit is a single clean fact. The "one entity, one unit" rule is visibly enforced — CH2 has
**9 separate continent units and 8 separate ocean units**, which is precisely the merge
problem that `.claude/skills/course-content/SKILL.md` records as a past failure. That fix
held. Intrinsic load per unit is low, and that is the hardest thing to get right.

**Alt text is real alt text.** All 9 diagrams and all 48 images carry descriptive alt
text — not filenames, not "image of a diagram". The push-pull entry reads:

> "Push-Pull Model diagram: push factors (escape, self-discovery, rest and relaxation,
> prestige, challenge, adventure, excitement, family togetherness, health and fitness)
> pointing away from the tourist, and pull factors (scenic beauty, historical areas,
> cultural attractions and events, sporting events, beaches, parks, recreation facilities,
> shopping) pointing toward the destination."

A screen-reader user gets the diagram's actual information content, not a label. This is
better than most production courseware and it was clearly done deliberately.

**`content_type` drives real layout, not decoration.** `group-units.ts:26-31` buckets types
into overview / example / takeaway / note, derives section headings from them ("At a
glance", "Entries", "Detail", "Examples", "Key takeaways"), and switches between card grid
and vertical stack based on run length and body length. Key takeaways get a tinted panel;
examples get a coloured left border. This is dual coding operating at the layout level —
the structure of the knowledge is visible in the structure of the page. It is the reason
Finding 6's badge suppression is worth fixing rather than shrugging at: the machinery is
already there and good.

**Provenance is airtight.** Every one of the 134 units has at least one `source_references`
row — I checked, there are zero orphans. `topic-diagram.tsx:39` prints
`caption — sourceFile, page/slide N` in the figcaption, so a learner disputing a fact can
find the slide. Very few course apps do this at all.

**Visuals genuinely earn their place where they exist.** The 48 content images are real
extractions from source pages, not stock photography — the atoll image is an actual aerial
photo of an atoll bound to the atoll unit. Per Mayer's coherence principle, decorative
imagery actively harms learning, and I found none. Where this deck has a visual, the visual
is doing work. My complaint in Finding 2 is about where they are *absent*, not about the
quality of what's there.

**The bones for good pedagogy are in place.** A clean content model, enforced citations,
type-driven layout, real alt text, and short well-formed units. Most of my recommendations
are additive — a diagram here, a prompt there, a `whitespace-pre-wrap` — precisely because
the foundation does not need rework.

---

## 5. Explicitly out of scope

**The 208-question quiz bank.** `quiz_questions` is service-role gated (PostgREST returns
`42501` to the anon key) and no service-role key was available this session. Per my
instructions I did not attempt to read it. **Nothing in this report says anything about
question quality, difficulty spread, distractor plausibility, or coverage across the 134
units** — and coverage is the one I'd prioritise, since Finding 5's definition-heavy
profile makes it likely the bank skews to recall items. `assessment-validity-checker` and
`retrieval-practice-generator` are the right skills; both need a service-role key and a
separate pass.

**`subjective_answer_scheme` and marking fairness.** Same access barrier.
`feedback-quality-analyser` was not loaded.

**Factual accuracy.** Deliberately excluded — the remediation workstream is complete and
this review's lens was purely "does this teach well". Two places where I noticed something
adjacent, I flagged and handed off rather than adjudicating: the dropped table columns in
Finding 1, and the Antarctic/Southern Ocean naming inconsistency in Finding 3. **Neither is
an accuracy finding; both are pedagogical observations that happen to touch content.**

**Source typos and defects.** "INRELATED", "nine planet", "Artic" — a client policy ruling
is pending and I did not pre-empt it. I did not survey for them.

**UDL and accessibility.** `udl-lesson-auditor` was not loaded — not in the four requested
dimensions. Alt-text quality is noted in section 4 as an observation, but **no systematic
accessibility audit was performed.** Colour contrast, keyboard navigation, and screen-reader
flow are all unexamined. Given how well the alt text is done, a proper UDL pass would
likely find this codebase receptive.

**Actual learner data.** No completion rates, quiz scores, time-on-page, or drop-off data
was available. Every claim about how learners *will* experience this content is a
prediction from instructional-design principle, not an observation. `cognitive-load-analyser`
names this as its first limitation and it applies squarely here: two learners can experience
the same unit at very different loads depending on prior knowledge. **Finding 2 in
particular rests on the reading-level assumption in section 2 — if that assumption is wrong,
that finding weakens.**

**The `main` branch.** I read the working branch `agent/content-fidelity-remediation`
throughout. My instructions note `main` and the working branch currently differ; all
`file:line` references and both visual-map counts (9 diagrams, 48 images) are from the
working branch and should be re-checked against `main` before anyone acts on them there.
