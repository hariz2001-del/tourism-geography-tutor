# Handoff / progress doc — read this first

Purpose: if work on this project gets interrupted (rate limit, session switch, moving
to a different coding tool entirely), whoever picks it up next should be able to read
this one file and continue without re-deriving context. This doc is intentionally
written for **any coding agent or human**, not tool-specific — it assumes only that
you have a shell, a filesystem, and (for DB work) Supabase REST access.

Update this file whenever you finish a chunk of work or change plan. Keep the
"Right now" section accurate above all else — that's the part a resuming agent reads
first.

---

## Right now

*(state of play last refreshed 2026-09-09, after the floating-tutor and visual-refresh merge)*

**The Tutor is now a floating chatbot, and a batch of work that had been stranded in the Google
Drive checkout is finally on `main`.**

The tutor: `TutorPanel` was rebuilt as a multi-turn chat thread and moved into `TutorWidget`
(`web/src/components/tutor/tutor-widget.tsx`), rendered once in the root layout, so it is
reachable from every page instead of only from the chapter page's third column. It starts
minimized as a bottom-right launcher and closes by its ✕, the launcher, or Escape. The panel
stays mounted while minimized, so a conversation survives minimizing, reopening, and
client-side navigation between pages; a full reload still clears it. Notes for whoever
touches it next:

- Focus moves to the composer on open and back to the launcher on close. The launcher is
  `hidden` while the panel is open so the two never stack on a phone.
- Any page opens the tutor by dispatching the `tgt:open-tutor` window event — `requestTutor()`
  in `web/src/lib/tutor/open-event.ts`, wrapped by `OpenTutorButton`. The homepage hero CTA and
  the chapter page's "Ask tutor" action use it; the old `#tutor` anchor is gone.
- Only the newest reply carries `role="status"`, so a screen reader is not re-read the whole
  thread as it grows. Enter sends, Shift+Enter adds a line.
- `ActiveTutorPanel` was deleted from `chapter-topics.tsx`: the tutor no longer sits outside
  the topic panels, so it no longer needs telling which topic is on screen. The chapter page
  and its loading skeleton are both two columns now.

Also landed in the same merge, all of it previously uncommitted in the Drive checkout:

- `CHAPTER 1`–`CHAPTER 4` label expansion via `chapter-label.ts`, now applied on chapter nav,
  the chapter page eyebrow and empty state, flashcards, citations, and assessment return
  links. Database codes, routes, query parameters and citation keys still use `CH1`.
- A header restyle that puts GUIDE first as pill navigation, and a warmer homepage with
  colour-coded chapter cards.
- A manual light/dark `ThemeToggle` in the header, persisted in `localStorage` under
  `tgt-theme` and applied before paint by an inline script in the layout. It reads the applied
  theme through `useSyncExternalStore`, not a mount effect — `react-hooks/set-state-in-effect`
  rejects the latter.

**Provenance warning for the next session.** That Drive checkout (`7a9beeb`) is 80 commits
behind this repository and its `node_modules` is corrupt (zero-byte files, so test commands
there exit 0 having run nothing). Its `web/src/app/dashboard/`, `web/src/app/login/`,
`web/src/lib/auth/`, `web/src/proxy.ts` and its `supabase/server.ts` edits are an **older
variant** of the accounts work this repository already has committed — do not port them.
Everything worth taking from it has now been taken.

Verified on the merge branch before pushing: Vitest 217/217 passed, `tsc --noEmit` passed,
ESLint passed, `next build` passed with 24 routes, and a `next start` pass returned 200 for
`/`, `/about`, `/flashcards`, `/chapters/CH1`, `/practice/course` and `/login` with the
launcher rendering minimized and chapter labels expanded.

### Earlier — 2026-08-28

**Nothing is mid-flight. The working tree is clean, `main` is pushed, and everything written so
far is live to learners.** A resuming session can pick any item from "Next step" without first
untangling someone else's half-finished pass.

Three workstreams exist, in the order they were started:

1. **Content fidelity — finished and deployed.** All four chapters were re-scanned against their
   PDFs after a 2026-08-11 pass wrote 41 bodies from a contaminated secondary document instead of
   the source slides. Nothing outstanding except **one policy ruling from the owner** (silent
   corrections — see "Blocked on the project owner").
2. **Pedagogical quality — running.** Read-only reviewer agent plus nine vendored skills. Its
   governing rule, the **Layer 1 / Layer 2 split**, is what keeps this workstream from becoming a
   second route to rewriting slides: source prose may only be *flagged*; the scaffolding around it
   is open to change. Remaining item: topic-level elaboration prompts (needs a UI slot).
3. **The visual layer — two passes done 2026-08-26, both deployed.** CH1's two diagrams became
   native components; every CH2 climate topic now carries HD licensed photography; the
   mid-latitude comparison table became a real table. See "How the visual layer works" below
   before adding or replacing any image — the rules there are load-bearing and partly legal.

**The single highest-value unstarted job is the quiz-bank audit** (208 draft questions, four ever
checked, one of those four contaminated). It needs the service-role key, which is not on disk.

**Continuing on a different machine?** Everything durable is in git — `main` is pushed and the
working tree is clean. What git does *not* carry is listed, with the values and commands to
recreate each piece, in **`SETUP.md`** inside the Drive package
(`G:\My Drive\Vibecode\Tourism Geography Tutor - handoff\SETUP.md`): `web/.env.local`, the
source PDFs, the `uv`-managed `.venv`, `web/node_modules`, Playwright's browsers, and the Claude
Code plugin/MCP config. Do that first, then come back here. Note that `~/.claude` memory does not
travel and is not worth migrating — this file and `docs/checklist.md` are the durable record.

**Read before touching anything, depending on what you are about to do:**
- **`content_units` (any database write)** → `.claude/skills/course-content/SKILL.md`, then
  `docs/content-fidelity-remediation-plan-2026-08-21.md` for why the rules are what they are.
- **Images, diagrams or a topic's layout** → "How the visual layer works" below.
- **Anything to do with teaching quality** → `docs/pedagogy-review-content-units-2026-08-25.md`.
- **A session that died mid-remediation** → `docs/remediation-progress-2026-08-21.md` holds the
  per-unit DONE state and rollback pointers. It is history now, not a live resume point.

### What went wrong

`docs/content-depth-photo-audit-2026-08-09.md`'s `Source:` strings are **paraphrases, not
verbatim transcriptions**. The 2026-08-11 body-enrichment pass rewrote 41 bodies across all four
chapters *from that document instead of from the PDFs*, so wherever its quotation was wrong the
database faithfully encoded the error. Because that pass was *adding depth*, the errors are
additions — they read richer and more authoritative than the thin-but-true text they replaced.

That audit doc now carries an **UNTRUSTED** header. Its findings (which pages are shallow, where
photos are) remain useful as leads. **Never copy a quotation out of it — re-read the PDF page.**

### Fixed and verified live

**Chapter 1 — five units plus one quiz question.** Three units asserted things on no slide:
`90510d10` (p6 — invented "transportation", narrowed "job opportunities" to "career opportunities
in tourism"), `10f721f6` (p29 — two invented sentences while the slide's real bullets 2-3 were
absent), `571f3d66` (p30 — "by Muslims", which the deck's abridged Battour & Ismail abstract does
not contain). `7e0adbdc` (p31) had generalised "Queensland's domestic market" into an unqualified
claim. One draft question could **mark a learner wrong for the source-correct answer** — the
narrowing sat in its stem, its `subjective_answer_scheme` and its marking criterion. Phase 2 then
restored genuinely missing content: p21's Williams and Zelinsky study design and both
parentheticals, p22, p27's "based on its market" axis, and p4's first sense of topography.

**Chapter 4 — three units corrected, one added, four image citations fixed.** `145feea9` Desert
(p18) carried a sentence from the **Wikipedia** desert lede; `d0887588` Mount Kinabalu (p14)
asserted "in Sabah, Malaysia" and "via ferrata", neither anywhere in the deck; `c53e4367` (p12)
turned the slide's "More than 50 million" into "an estimated 50 million". Added the missing
**`Continents`** unit (p22 defines 15 glossary terms; 14 had units). Corrected Coral reef / Bay /
River / Fiord from p24 to **p25** — the deck has two sibling photo grids and an earlier pass
conflated them.

Every fix was verified **against production**, not self-reported. Content is served from Supabase
at runtime, so database writes are live immediately with no deploy.

### The re-scan is finished — all four chapters *(updated 2026-08-23)*

**Chapter 2** — one fabrication, three unsupported insertions and one wrong-citation pair fixed
(commit `de67722`). **Chapter 3 — zero fabrications, the only clean chapter** (commit `adbde9a`);
it dropped one unsourced editorial phrase and a wrong `diagrams.ts` alt-text claim. CH3 is clean
because no CH3 body had been written since 2026-08-08, *before the contaminated audit document
existed* — the cleanest evidence yet that the document, not the extraction process, caused this.

Nothing in the re-scan is outstanding, and **everything is deployed** — `main` was fast-forwarded
to `159740b` and pushed on 2026-08-25, so the code-side fixes that had been stranded on the branch
(the p24→p25 photo captions, the CH3 diagram alt text) are live and verified. What remains is the
**policy ruling** below.

Worth keeping in mind for anything that follows: database fixes are live the moment they commit,
because content is served from Supabase at runtime; code fixes are not live until `main` is pushed
and Vercel rebuilds. That asymmetry is what let finished work sit invisible for four days.

### A second workstream now exists: pedagogical quality *(started 2026-08-25)*

Separate lens, separate agent, no overlap with accuracy. `.claude/agents/course-pedagogy-reviewer.md`
(Opus, read-only) reviews whether the content *teaches*, using nine evidence-based skills vendored
at `.claude/skills/pedagogy/`. Its governing rule is the **Layer 1 / Layer 2 split** — source prose
can only be flagged; the scaffolding around it can be proposed. First report:
`docs/pedagogy-review-content-units-2026-08-25.md`.

Landed: seven flattened-table units got their source tables back as figures (no prose changed),
bodies now keep line breaks, a test makes the visual maps fail loud instead of silently dropping
images, and **the 18 tie-ordered units now have a deterministic sequence** — course-wide ties went
18 to 0, verified against production, and CH4's chapter-opening sentence is no longer arbitrary
(`docs/unit-ordering-fix-plan-2026-08-25.md`).

Also landed 2026-08-25: **CH4's 20-unit *Water environments* scroll is now three topics**
(Seas and oceans / Islands and coastal features / Inland and glacial water), with three misfiled
land units moved back to *Natural landscapes and landforms*; and **CH1 *Forms of tourism* has the
project's first constructed diagram**, a 2x2 matrix of the four definitions on p25. Every quoted
label in it is verbatim and its caption states that it is drawn rather than extracted.

### Deployed 2026-08-26: native study models (CH1) and licensed HD photography (CH2)

**Two client-directed changes, merged to `main` and live at `793dcaa`.** Started by Codex, whose
session ended mid browser-verification; the work was re-verified independently, committed in
chunks, and deployed the same day — no repeat of the four-day invisible-work gap.

1. **The two CH1 diagrams became native components.** *Push and pull factors* and *Forms of
   tourism* no longer render a flat image with the same definitions repeated in cards below it.
   `web/src/components/materials/topic-learning-model.tsx` builds both models out of the published
   units: no wording changed, the push/pull factor lists are parsed out of `c403af77`'s stored body
   rather than retyped, every unit keeps its anchor, bookmark and citation, and each model states
   the source file and page range it was assembled from. It claims a topic only when every required
   unit id is present, so a re-imported unit falls back to ordinary cards instead of disappearing.
   **Deleted:** `ch1-push-pull-model.jpg` (the deck's own p20 figure) and yesterday's constructed
   `ch1-forms-of-tourism-matrix.png` with its build script — both recoverable from history.
2. **Five CH2 climate photos are now high-resolution Wikimedia images**, four replacing
   low-resolution deck crops and one filling *Summer monsoon*'s empty slot. **This is the first
   content imagery in the project that does not come from the course deck, and it is
   client-directed.** Each figure renders creator, source and licence links; `ATTRIBUTION.md`
   records them; two new tests refuse any `contentImages` entry that has neither a course source
   nor a complete attribution. The Dry-climate table asset was left untouched, as instructed.

Verified before committing, not self-reported: 94/94 tests (including the live Supabase half),
typecheck, lint, production build, and both CH2 topics fetched at 1440px and 390px with no failed
requests and no horizontal overflow. Verified again **against production** after the deploy: all
six new images return 200 and the four replaced deck crops plus `ch1-push-pull-model.jpg` now 404;
the push-pull table serves all 17 factors with its `pages/slides 17-20` provenance line, the Forms
matrix serves its empty fourth cell, and both monsoon figures serve with their creator and licence
links intact.

**One known warning, not fixed:** Next flags the first climate photo on each topic as the LCP
element and asks for `loading="eager"`. `UnitImage` has no notion of which unit is above the fold,
so doing it properly means passing position down from the section — worth a small follow-up now
that these files are 1600px rather than 300px crops.

*Winter monsoon* was initially left image-less on the argument that a still landscape cannot show
air moving off the land; the owner ruled otherwise, and it now carries a dry-season Nan Province
photo that works because it sits directly under the summer-monsoon image — the pair is the lesson,
not either photo alone.

**Second pass the same day, also deployed:** the three remaining CH2 climate topics — Middle
latitude, High latitude, Highland — got the same treatment. Twelve HD photographs (nine
replacements, three units that never had an image), and the **Mid-Latitude Climates table is now a
native table**: cells parsed out of the stored unit body, axes transposed so attributes are rows
and the two climates are columns, and the deck's own column headings. It had been rendering twice,
as the topic diagram and as the unit image; both raster bindings are gone.

That table also moved. Models now declare a **placement** — *leading* models replace a topic
(Push-Pull, Forms of tourism), *trailing* models consolidate a topic already read. The comparison
was arriving before two of the sub-types it compares and before the vegetation terms its rows use;
as a trailing model the section reads intro, sub-types, vegetation vocabulary, comparison. Fixing
the order this way needed **no database write**, which matters while the service-role key is off
disk.

**Third pass, also 2026-08-26:** CH3's time-zone raster became **`TimeZoneExplorer`**, a trailing
model on *Latitude and longitude*. Hovering or focusing any of the 25 bands names its offset,
longitude range and three cities; a converter reads city A → Greenwich → city B and handles the
day rollover. The deck's own figure stays one click away, because it carries the clock faces and
Sunday/Monday labels the tool does not.

Two things about it that a resuming session must not undo:
1. **The base map's extent is load-bearing.** Bands are positioned by `(longitude + 180) / 360`,
   correct only on a cylindrical projection spanning exactly -180° to 180°. Verified before use;
   `component-assets.ts` says so. Do not swap the file without re-checking.
2. **`time-zones.ts` is reference data with no test that can catch staleness.** Offsets change by
   legislation — the independent check found Vancouver and Calgary already wrong, because British
   Columbia and Alberta abolished standard time in 2026. The file header carries the verification
   date. Re-check it whenever a country changes its clock; nothing will fail if you do not.

**Fourth pass, 2026-08-27:** CH2's seven-continents raster became **`ContinentExplorer`**, a
trailing model on *The seven continents*. Pointing at a continent shows its own sentence, size and
ranking, and highlights its real coastline; seven buttons below the map do the same by keyboard and
on touch. The highlight uses no polygon data — `scripts/build_continent_regions.py` flood-fills the
CC0 base map into one hit-test index image and seven masks, 64 KB in total, regenerable. Read that
script before changing the regions: the cuts at Suez, Panama and the Ural/Caucasus line, and the
override that keeps Sulawesi with Asia, are judgements the deck does not make.

The pattern is now established enough to name: **a deck figure that asserts a relationship becomes
a model that lets the learner test it, the units keep their own words, anything parsed comes out of
the stored body, and the slide's own figure stays one click away inside the model.** Three of these
exist (CH1 push-pull and forms of tourism, CH2 mid-latitude table and continents, CH3 time zones).

**Fifth pass, 2026-08-28 — and it crosses a line the earlier passes did not.** At the owner's
request the maps now show figures the deck does not contain: the two continents it never sizes,
and the ocean areas, ranks and depths it mostly omits. **Every such value is tagged `added` in the
panel and its source is named**, the deck's own figures are shown plainly and are never
overwritten, and the added values live in separate fields (`addedArea`, `addedRank`) so the deck's
silence stays visible in the data. Both tables — `continents.ts` and `oceans.ts` — are single
files, so swapping in the lecturer's own figures is a one-file change.

The oceans map joins the continents map (one shared `region-map-explorer.tsx`), and the
world-climate topic's two maps now share one window behind tabs — the latitude bands interactive,
the deck's climate-and-vegetation map shown as it is, because its legend mixes two systems the deck
never reconciles and making it clickable would mean inventing the mapping.

**One rule to carry forward if you touch `scripts/build_ocean_regions.py`:** a cut line only works
if it starts and ends inside land. Three leaks were closed during that build and every one was a
line that stopped short of a coast or dangled in open water.

**Also 2026-08-28:** the five-climate-types map was rebuilt from a published Köppen-Geiger map
(the deck's own raster could not be made clickable — its legend mixes two systems), and **the
chapter page stopped re-fetching itself**. It now loads every topic once and hides all but one, so
switching topic is a state change rather than five or six database round trips. Measured in Chrome
DevTools: zero requests per switch, INP 58 ms. If you touch that page, the invariants are that the
URL still leads (deep links render server-side, switching uses `history.pushState`), the sidebar
entries stay real links, hidden panels use the `hidden` attribute so they leave the accessibility
tree and skip their images, and reading history follows what is on screen rather than what was
fetched.

**Also 2026-08-28:** CH3's two flat globe pictures became **one globe you can turn** — an
orthographic projection drawn on a canvas, with buttons to isolate parallels, meridians, or the
five principal lines. Pointing at it reads the position and gives that meridian's hour, tying it to
the time-zone explorer lower down the same topic. A topic can now carry both a leading and a
trailing model, which is what that arrangement needs.

**Also 2026-08-28:** Chapter 4's five figures that were **screenshots of Wikipedia are now real
tables**, parsed from the unit bodies, with the columns the transcriptions dropped restored from
the slides and each linked to its source article as the slide captured it. The Greenwich meridian
photo is replaced with a legible one. The chapter's 14 low-resolution photographs are the work in
flight; maps and mind maps are deliberately out of scope for that pass.

**Six things left open for the client:**
1. Whether the deck's own p20 Push-Pull figure should return as a unit-level figure now that the
   native table has replaced it.
2. The Subarctic unit's old image was a low-resolution *map* of the Canadian subarctic, not a
   photo. Its HD replacement shows what the climate looks like but not where it is — if the
   distribution matters, it should come back as its own figure.
3. **The deck sizes only five of its seven continents.** Areas are given for Asia, Africa, North
   America, Europe and Australia; Europe is ranked "sixth-largest"; South America and Antarctica
   are never sized or ranked. The continent map now says "not given on this slide" for those two.
   Filling them in needs figures from the lecturer.
4. **Supplied figures are now shown to learners** (2026-08-28, at the owner's request): the two
   continent areas the deck omits, and most of the ocean figures. All are tagged `added` with the
   source named. If any should instead be the lecturer's own numbers, say which and it is a
   one-file change.
5. **The second Greenwich photo (CH3 p7) was not replaced.** Its unit reads the plaques in that
   exact picture — Bogota, Quito, Kuala Lumpur, Singapore — and every HD alternative shows a
   different stretch of the line, engraved with Rome, Istanbul and Beijing. Replacing it means
   accepting that mismatch or rewording the unit; both are the lecturer's call.
6. **The time-zone tool is the first non-deck *factual* data in the app.** External imagery was
   approved on 2026-08-26; city names and UTC offsets go a step further. They are labelled in the
   interface as reference data, not course content, and no unit body was written from them — but
   the owner should know it is there.

Still open from the review: topic-level elaboration prompts (~23, to lift germane load — 73% of
units are bare definitions), which need a UI slot first; and the quiz-bank review of all 208
questions, which needs the service-role key and a separate pass.

**Ask the client for a machine-readable DTM10333 syllabus.** It unblocks a coverage audit — the
one check that would tell us whether the app covers what the course promises — and it would settle
the learner reading-level assumption the review's Chapter 1 finding rests on.

### Deployed 2026-08-28: figures you can interact with, and the last of the image gaps

Four things the owner asked for, all live and verified against production.

**Every figure opens full screen.** The dialog the topic diagrams already had moved into
`web/src/components/materials/image-lightbox.tsx`, and now serves unit photographs, the "slide's
own map/diagram" figures, and the table previews below. Click the picture inside the dialog to
switch between fitting the screen and full size; Escape or the backdrop closes it. The
interactive canvases (globe, time zones, region maps) are deliberately *not* wrapped — they
answer to the pointer already.

**Country flags in the Chapter 4 tables**, the way the Wikipedia tables the deck screenshotted
do. Ten public-domain SVGs in `web/public/flags/`, declared in
`web/src/lib/course-brain/flags.ts` and credited in `ATTRIBUTION.md` by the same generator as
everything else. A column opts in with `country: true`; a cell may name two countries
("Nepal/China") or none — Antarctica's highest point belongs to "no country", which stays as the
slide has it, flagless. A test walks all five tables and fails if a country is ever named
without a flag to print.

**Hover previews on the place names.** 23 photographs in `web/public/place-previews/`, declared
in `web/src/lib/course-brain/place-previews.ts`, shown when a reader hovers a mountain or a
desert (`place: true` on the column). Three things worth knowing before touching it:

- The card is `position: fixed`, not absolute. The table scrolls sideways inside its own
  container and `overflow-x: auto` forces `overflow-y` to match, so anything absolute is clipped.
- Only one card exists at a time, keyed by `useId()`. Hover alone would guarantee that; focus
  does not, and a reader tabbing while the pointer rests elsewhere opened two. **This was found
  by driving the live page, not by reading the code** — the test that meant to check keyboard
  focus failed because two cards answered to it.
- The bodies-of-water table has no previews on purpose. A photograph of open water does not tell
  a reader which sea it is, and the location maps that would are drawn in five different styles.
  If the owner wants them anyway, that is the decision to reverse.

**Sixteen units that had no example image now have one** — CH4's two plateaus, hill, gulf, sea,
lagoon, spring and glacier; CH2's tropical, dry and high-latitude overviews; CH1's four market
types. Deliberately left bare, and worth re-deciding only with the owner:

- **The mid-latitude overview.** All seven subtype cards below it already carry a photograph; an
  eighth temperate scene would repeat them.
- **The definitional cards** — "Working definition of geography", the three "tourism resource"
  principles, and similar. A stock photograph there decorates rather than teaches.

Every image was chosen off a **contact sheet**, and that step earned its keep again: the first
pass returned a collage, a signboard, a watermarked satellite tile, a portrait of a man in front
of a lake, and a concrete water tank. None of them show what the card is about. The rule from the
Chapter 4 photo pass still holds — **fetch, then look, then wire**, never fetch-and-wire.

### Deployed 2026-08-28 (second pass): the mountain-range map, and a photograph for halal tourism

**The Chapter 4 mountain-range map is now interactive**, in
`web/src/components/materials/mountain-range-explorer.tsx` with its close-up in
`range-close-up.tsx` and its data in `lib/course-brain/mountain-ranges.ts`.

The point worth carrying forward: **the deck's raster names twenty-four ranges; the unit's
learning note names six.** The other eighteen existed only as coloured squares in a legend. All
twenty-four are now selectable, grouped under the slide's own six regional headings.

How it draws, so nobody has to reverse-engineer it:

- Each range is a **spine** (the line it follows) plus a width in degrees — not a polygon. The
  map strokes that line, and hit-testing uses `isPointInStroke` on the same `Path2D`, so what
  the pointer finds and what the eye sees cannot drift apart.
- The topography is NASA's SRTM elevation model, colourised by `scripts/build_relief_texture.py`
  from `data/relief-source/srtm-ramp2-grey.webp`. **The hypsometric stops are keyed to metres,
  not to raw grey values** — keyed to grey, nearly every range on Earth fell in the bottom third
  of the scale and drew flat green.
- On the world map the relief is stencilled to the range with `destination-in` compositing.
  The ring is stroked **before** the stencil; stroked after, it covers the relief entirely.
- `reliefTexture.width/height` in `component-assets.ts` is the coordinate space the close-up
  crops from. It must match the file on disk — when the file went from 2560 to 3840 wide and
  the record did not, every close-up silently framed the wrong place.

**Source fidelity, applied to a figure rather than to prose.** The legend is transcribed exactly
— "Crystal Mountians", "Columbia" for Colombia, Tibet and Kashmir listed among countries — and
where the slide's geography is wrong the range is drawn **where it actually is** with the
slide's claim flagged beside it. Five entries carry a flag: the Caucasus placed in Ukraine, the
Mitumba in Zambia, the Taurus filed under Europe, and the Tian Shan listed twice — once under
Europe as the "Thian Mountains" in Eastern Europe and once under Asia. Both duplicate entries
are kept and both point at the real range. Drawing a range where the slide wrongly puts it would
make the map assert something untrue about the world; relabelling it silently would hide a
ruling that belongs to the owner.

**The map used to appear twice** on that topic — once as the topic diagram and once as the
unit's own figure. The model now claims the topic diagram and consumes the unit, so it appears
once, with the deck's original one click away under "The slide's own map".

One range has no photograph: **no openly licensed picture of the Mitumba Mountains exists on
Commons.** An 1881 engraving from Verney Lovett Cameron's account of crossing Africa stands in,
and its caption says exactly that rather than passing itself off as a photograph.

**Halal tourism (CH1) had no photograph either** — what sat there was a marketing title card
("WHAT IS HALAL TOURISM?") carrying another company's logo, at 800px. Replaced with the Sultan
Omar Ali Saifuddien Mosque, Bandar Seri Begawan.

### Deployed 2026-08-28 (third pass): the attraction wheel as an index, and a faster chapter load

**The Chapter 4 attraction wheel is now the chapter's index.** `attraction-wheel.tsx`, data in
`lib/course-brain/attraction-categories.ts`. The seven categories are parsed out of the unit
body (fails closed to the deck's figure); which cards belong under which heading is the
editorial part and lives in one table with its reasoning. Choosing a card jumps to it wherever
in the chapter it lives, via `useGoToUnit` in `chapter-topics.tsx` — which switches the panel,
waits two frames for React to paint, then sets the hash with `replaceState` and dispatches
`hashchange` by hand. Assigning `location.hash` instead would push a second history entry and
make the back button need two presses to undo one click.

Two gaps the wheel exposes, flagged not filled: **the slide's headings name valleys and
beaches, and Chapter 4 teaches neither.**

**Chapter loads got faster.** Three things, all in that one commit:

- `getProfile` is deduplicated per request with React's `cache`. The layout and the page both
  asked who was signed in, and each ask is two round trips — every page was paying for four.
- The chapter's shared content (chapters, topics, units, quizzes — about ten round trips) is
  cached across requests under the `course-content` tag. **Every one of those queries runs as
  the anonymous role**, so the answer is identical for every visitor; there was never a reason
  to ask again. The lecturer's approve action clears the tag with `updateTag` (Next 16 wants
  `updateTag` inside a Server Action; `revalidateTag` now takes a second argument).
- Quiz options are re-shuffled per request *outside* the cache. A cached shuffle would hand
  every learner the same running order until the entry expired.

Measured on production, in-browser: TTFB **51–61 ms** and DOMContentLoaded **~505–554 ms**,
against 1.7–3.1 s total before. The first hit after a deploy or an expiry still pays full price.

**The loading screen said "Loading Chapter 1 materials…" whichever chapter you opened.** A
route-level `loading.tsx` renders before the params resolve, so it cannot know which chapter is
coming; it is now a skeleton in the page's own grid instead of a wrong sentence.

### How the visual layer works *(written 2026-08-26 — read before touching any image)*

Three separate mechanisms decide what a learner sees above and around the prose. Confusing them
is how figures get orphaned, so they are spelled out here.

| Mechanism | File | Scope | Renders |
| --- | --- | --- | --- |
| `contentImages` | `web/src/lib/course-brain/content-images.ts` | one image per **content unit**, keyed by unit UUID | inside that unit's card |
| `topicDiagrams` | `web/src/lib/course-brain/diagrams.ts` | one figure per **topic**, keyed by topic UUID | above the topic's cards |
| Native models | `web/src/components/materials/topic-learning-model.tsx` | a whole topic, or one unit inside it | in place of the raster it replaced |

**Both maps are hardcoded literals keyed on database UUIDs, and the lookup fails silent.** A
re-imported unit gets a new UUID — which is exactly what the insert-then-delete split procedure
produces — and its image vanishes with no error. `web/src/lib/course-brain/visual-maps.test.ts`
turns that silent failure loud: every key must resolve to a live published row, every `src` must
exist on disk, every entry must declare **either** a course source **or** a complete attribution,
and every attributed file must appear in `ATTRIBUTION.md`. Run it after any change here.

**Provenance is not optional, and it is partly a legal obligation.** Images extracted from the
approved PDFs record `sourceFile` and `pageOrSlide`. Images from anywhere else record `creator`,
`sourceUrl`, `license` and (for CC licences) `licenseUrl`, which the figure renders under the
caption. Public-domain works omit `licenseUrl` — there is no deed to link to — and the test knows
that. Non-deck imagery exists **because the owner asked for it** ("you may scrape the internet for
images", 2026-08-26); it is a standing permission for *illustration only*. **Unit prose still may
never come from anywhere but the source PDFs.**

**To add or replace an image**, use the committed tooling rather than hand-copying credits:

```
python scripts/commons_images.py search "arctic tundra autumn"
python scripts/commons_images.py make "File:Some file.jpg" web/public/content-images/name-hd.webp
python scripts/build_image_attribution.py     # regenerates ATTRIBUTION.md
npx vitest run src/lib/course-brain/visual-maps.test.ts
```

`make` prints the exact `attribution` block to paste in. Two gotchas are already handled in it:
Wikimedia returns **HTTP 429 within a handful of requests** for full-size originals (use the
standard thumbnail widths, which the script does), and licence/creator fields must be read from
the file page's metadata, never from a search snippet or from memory.

**Choosing an image is a pedagogical decision, not a decorative one.** The rule taken from
`.claude/skills/pedagogy/dual-coding-designer/SKILL.md`: the visual must show what the words
cannot. A photo that merely decorates *increases* load (Mayer's coherence principle). That is why
the deciduous card shows leaves actually turning, the mixed-forest card is shot straight down so
both canopies appear at once, and the highland card shows the tree line as a line. It is also why
CH4 p7's waterfall photo was deliberately left unused.

**Native models replace a raster when the picture and the prose were saying the same thing
twice.** A model is assembled from the published units themselves and never retypes their text —
the push/pull factor lists and the mid-latitude table cells are *parsed out of* the stored bodies,
so they cannot drift, and an unparseable body falls back to prose rather than rendering a broken
table. Each model claims a topic only when **every** required unit id is present; a re-imported
unit therefore falls back to ordinary cards instead of disappearing.

Models declare a **placement**, which is also the cheapest way to fix a section's order:
- **leading** — replaces the topic, renders first (CH1 *Push and pull factors*, *Forms of tourism*)
- **trailing** — consolidates a topic already read, renders after the cards (CH2 *Mid-latitude
  climates compared*)

Pulling a unit into a trailing model reorders the section **without a database write**, which
matters whenever the service-role key is not on disk. Ordering otherwise lives in `created_at`
(see `docs/unit-ordering-fix-plan-2026-08-25.md`) and needs a write.

### Blocked on the project owner — do not guess these

1. **The silent-correction policy.** The database currently handles source typos *both ways*.
   Silently corrected: CH1 p3 ("nature circulation" to "nature and circulation"), p5 (three
   defects rewritten and the sentence re-parsed), p23 ("spends" to "spent"); CH4's entire p22
   glossary rewritten out of its broken grammar, with **three semantic additions** ("formed by",
   "made up largely of", "almost completely") plus "Columbia" to "Colombia" and "eighteen century"
   to "eighteenth". Left alone: CH1 p6 "INRELATED", p26 "determine", p33 "involve". The standing
   rule says flag, don't fix. **One ruling is needed, then uniform application** — including to
   the CH3 "nine planets" / "Hindi" / "Artic" decisions already made the other way.
2. **The p30 "by Muslims" removal** wants explicit acknowledgement: it narrows a definition along
   a religious-participation axis, and the published paper does carry the phrase even though the
   deck's abridged abstract does not.
3. **CH1 p26's five tourism types stay merged** — the deck names Rural, Urban, Heritage, Cultural
   and Eco-Tourism and defines none, so splitting would require inventing definitions. Same
   posture as CH4's "valley"/"beach" structural gaps. Confirm.
4. **Possible information loss in the CH4 deck itself** — the tables on p15, p19, p20 and p21 look
   hard-cropped, as if truncated screenshots were pasted. Only the lecturer can supply the full
   tables if they exist.

### Method that works, and one hard-won lesson

Two Sonnet scanners (one PDF, one database, **two passes each**), a main-thread comparison that
re-verifies every candidate finding against the raw text layer, then an **independent Opus
verifier** that rules on each claim and sweeps for what was missed.

**The Opus pass is not optional.** It caught a third Chapter 1 fabrication after the main thread
had concluded there were two, and it **refuted** the main thread's "Chapter 4 looks clean" — that
call rested on a spot-check of pp.19-22, and both CH4 fabrications sat outside that range.
**Sampling is not sufficient evidence for this defect class.**

**Tooling correction:** `.claude/skills/course-content/SKILL.md` claims no PDF rasterizer exists
on this machine. That is out of date. `.venv` has **`pymupdf`**:
`page.get_pixmap(matrix=fitz.Matrix(s,s))` then `.tobytes("jpg", jpg_quality=70)` renders a whole
chapter to ~140 KB/page JPEGs in seconds, which is what makes the OCR path cheap. Pages with no
text layer: **CH1 4/33, CH2 6/23, CH3 6/11, CH4 10/27** — CH3 and CH4 are the most
vision-dependent, and both CH4 fabrications were on text-layer-less pages.

### Git state *(2026-08-26)*

**`main` is at `07da1d2`, pushed, deployed, working tree clean.** Two branches were merged into it
today, both fast-forward, both deleted afterwards: `agent/native-learning-models` (CH1 native
models, CH2 tropical/dry photography) and `agent/ch2-climate-visuals` (the remaining three climate
topics and the native mid-latitude table). `agent/content-fidelity-remediation` still points at
`159740b` and can be deleted; it holds nothing `main` does not.

**The working pattern, if you are picking this up:** branch `agent/<topic>`, commit in small
chunks with the reasoning in the message, `git checkout main && git merge --ff-only`, push, then
**verify against production** — not against your own summary. `curl` the deployed page and grep
for the strings you expect, and confirm the assets you retired now return 404.

**`agent/learner-accounts` (`80afd05`) is NOT merged** and was deliberately left alone. Separate
feature branch, already pushed to origin, unrelated to the remediation.

Remember the asymmetry that has already caused confusion once: **database writes are live to
learners the moment they commit** (content is served from Supabase at runtime), while **code
changes are not live until `main` is pushed and Vercel rebuilds.** A p24-to-p25 citation fix made
on the 21st sat invisible for four days because of exactly this.

**Build and test from `C:\Users\User\dev\tourism-geography-tutor`,** not the Google Drive
checkout — see the working-directory note further down.

**`SUPABASE_SERVICE_ROLE_KEY` is deliberately never stored on this machine.** `vercel env pull`
returns it as the literal string `"[SENSITIVE]"`. `web/.env.local` holds the Supabase URL, the
anon key, and the DeepSeek key.

### Older open items, still valid but lower priority than the remediation

1. **The GitHub to Vercel production hook works.** Previously open: merging PR #6 to `main`
   produced no Production deployment after ten minutes, and it had to be worked around with
   `npx vercel promote <preview-url>`. **Resolved 2026-08-25** — a direct `git push origin main`
   auto-deployed Production within a couple of minutes and served the new assets. So the hook is
   healthy for direct pushes; whether the original PR-merge case is still broken is untested.
   **If a future deploy looks like it failed, run `npx vercel ls` before assuming anything broke.**
2. **Phase 2, not started: the AI PDF-to-questions importer for lecturers.** Needs a Node-side PDF
   text extractor — `unpdf` is the serverless-friendly pick; the repo's Python/`pymupdf` tooling
   will not run on Vercel. Extracted questions must land as `draft` and be given a topic and a
   published, cited source unit before approval.
3. **Lecturer features scoped but not built:** item analysis, manual mark override on auto-graded
   written answers, CSV export of the roster, and a review queue surfacing the source defects the
   checklist flags but deliberately leaves unfixed.
4. **All 208 generated questions are still `draft` / `generated_by='deepseek_draft'`.** The
   approval queue exists; nothing has been approved through it. **The remediation found one of the
   four CH1 questions it checked was contaminated — the other 204 have not been re-audited against
   corrected bodies.**
5. **Older backlog:** anonymous helpfulness feedback (the table exists, but it needs a secure
   server/RPC write path plus abuse-conscious validation before learner controls go live), and a
   manual light/dark override on top of the working OS-level preference.

---

**Last shipped: learner accounts, roles, and both dashboards (2026-08-18).** PR #6 merged to
`main`; live at https://tourism-geography-tutor.vercel.app/login with the seeded `lecturer` and
`student` accounts.

**The previously-unverified assessment path was verified** as part of that release, against
production, where the service-role key exists. A full course exam was submitted as `student`:
16 answers stored, all carrying their answer scheme, citation, and topic; all 6 written answers
marked per-criterion. Confirmed by querying the database directly, not by reading the screen.
The synthetic attempt was then deleted, so both demo accounts start empty.

**Live verification run:** 12 auth/dashboard e2e tests plus the assessment round trip, all
against the production URL — `BASE_URL=https://tourism-geography-tutor.vercel.app npx playwright test`.

---

**Previous task: learner accounts, roles, and the two dashboards (2026-08-17).**

Two seeded Supabase accounts, `lecturer`/`lecturer` and `student`/`student`. Supabase Auth
needs an email, so the login form maps username to `<username>@tgtutor.local`; learners type
only the username. Accounts were created directly in `auth.users` (with matching
`auth.identities` rows) because the service-role key is not persisted on this machine; a
trigger on `auth.users` creates the matching `public.profiles` row from user metadata.

Migration `202608170001_learner_accounts.sql` adds profiles, classrooms, bookmarks,
topic_progress, assessment_attempts, and attempt_answers. **Read the header comment before
touching any policy** — the role separation is deliberate and was verified by probing the
database as each role before any UI existed:

- Lecturers have **no policy at all** on `bookmarks` or `topic_progress`, so a learner's saved
  material and reading history cannot leak through a dashboard bug.
- Students have no insert policy on `assessment_attempts`; results are written server-side only.
- `quiz_questions` / `_options` / `_marking_criteria` are now granted to `authenticated` but
  every policy requires the lecturer role, so a student still reads zero answer keys. This is
  the one place the change could have widened the trust boundary; it is covered by e2e tests.

Shipped and verified: login and role routing, both dashboards, question-bank list/filter/CRUD,
the draft-approval queue, saved material (course units and flashcards), and reading history.

**Not yet verified: assessment marking and recording** (`/api/attempts`). The code is written,
typechecks, builds, and has unit tests asserting the browser sends no marks and renders the
server's totals — but the live round trip needs `SUPABASE_SERVICE_ROLE_KEY`, which is not on
this machine. `vercel env pull` returns it as the literal string `"[SENSITIVE]"`. Ask the
project owner for it, put it in `web/.env.local`, restart `next dev`, then run
`BASE_URL=http://localhost:3000 npx playwright test e2e/assessment.spec.ts`.

**Working directory changed.** Build and test from the local clone at
`C:\Users\User\dev\tourism-geography-tutor`, not the Google Drive checkout. Drive's file
provider truncates and fails to materialise `node_modules` — 758 zero-byte `package.json`
files and 13,022 zero-byte `.js` files out of 28,115, against zero on local disk. A single
small `npm install` there took over five minutes and left 120 of 130 files empty. The Drive
copy still holds `data/course-materials/` and is where the owner keeps the handoff package.

**Running the e2e suite.** `npm run test:e2e` starts its own server with the Supabase env
deliberately blanked, which is what the pre-existing empty-state spec needs; the auth,
dashboard, learner-activity, and assessment specs skip themselves there. To run those, point
the suite at a configured server: `BASE_URL=http://localhost:3000 npx playwright test`.

---

**Previous task: source-grounded flashcards (2026-08-16, production release).**
GitHub `main` remains the build source of truth; the Google Drive checkout holds the
approved local materials and editable handoff workspace. The new `/flashcards` route
derives 103 cards directly from the 97 published definitions and 6 key takeaways.
It adds chapter/topic filters, shuffle, answer reveal, self-rating, a marked-card
review deck, and exact source links back to each learning note. Entry points are
present in the global header, homepage, study guide, chapter cards, and topic pages.

No content rows or facts were added or changed. A clean Git checkout passes 67 web
tests, ESLint, TypeScript, and the Next.js production build. PR #4 is merged at
`554f412` and its Vercel production deployment is Ready. A 390 px Chrome check on
the existing production domain loaded all 103 cards, filtered CH4 to 27 cards,
revealed a cited answer, advanced progress from 0 to 1, found no horizontal overflow,
and logged no browser errors. Keyboard skip navigation was also verified. The
temporary PR preview was removed.

**Active task: generated assessment banks and learner assessment flow (2026-08-12).**
The learner-facing assessment routes now generate a fresh shuffled set at launch:
topic quiz (3 MCQ + 2 written), chapter mini exam (5 + 3), and full four-chapter
exam (10 + 6). After submission, the learner sees the score, a question-specific
answer scheme, and a clickable **Which to refer** citation that opens the exact
chapter/topic/source unit, matching the Tutor flow. The marking API keeps answer
keys and rubrics server-only until submission; written responses use the existing
Tutor/DeepSeek grader with conservative configured synonym and typo matching.

`202608120001_exam_question_bank.sql` establishes safe exam records and private
marking data. `202608120002_shuffle_exam_batches_and_reviews.sql` randomizes batch
selection and adds server-only MCQ answer review; `202608120003_restore_exam_batch_grants.sql`
restores public access to the safe question-only batch RPC after the function was
replaced. All three are applied to Supabase.

Question banks remain labelled **draft-only** (`generated_by=deepseek_draft`), but
the owner explicitly deferred lecturer approval/login and enabled this
source-validated generated bank for learner practice on 2026-08-12. Answer keys and
subjective rubrics remain server-only until a learner submits an answer.
The completed, reviewed banks total **208** drafts: CH1 53 (33 MCQ/20 written), CH2
75 (41/34), CH3 30 (18/12), and CH4 50 (36/14). Source/citation validation,
idempotent chapter-scoped replacement, and importer tests passed; the banks were
remediated for answer leakage, duplicate patterns, cross-source criteria, and
distinct-list scoring. Ignored fixtures remain under `data/extracted/`; use
`scripts/import_draft_exam_questions.py` with service-role REST access for future
draft imports. Never bulk-approve these rows.

**Shipped (2026-08-12):** commit `fd3547c` was deployed to Vercel production at
`https://tourism-geography-tutor.vercel.app`. Vercel’s production build compiled,
type-checked, and generated the assessment route successfully. The visible learner
flow is ready for approved records: select a topic/chapter/course assessment, receive
a shuffled set, submit for a score and answer schemes, then use **Which to refer** to
open the exact cited source unit.

**Active task:** content-depth-and-photo audit of the course content database against
the 4 source PDFs, followed by a build/fix pass. This is a quality pass, not a
from-scratch build — the app is live and working; this pass is about making the text
in each content unit match the full depth of its source slide, and adding real photos
extracted from the slides where they add value.

**Status of the audit itself: DONE, all 4 chapters.**
`docs/content-depth-photo-audit-2026-08-09.md` is the finished audit document —
Chapters 1, 2, 3, and 4 have all been read page-by-page against the live database and
have full write-ups. Its final section ("Audit complete — all 4 chapters covered")
summarizes the scale of what's open and a recommended extraction order. There is no
remaining audit work — the next step is the build/fix pass, not more auditing.

**Status of the fix/build pass and independent live review: COMPLETE (2026-08-12).**
The DB-write and photo-extraction tracks are complete across all four chapters. The
deployed result was independently reviewed in Chrome DevTools across representative
CH1–CH4 topics, an intentional empty state, the Tutor flow, and desktop/mobile
accessibility audits. Review findings were fixed, pushed to `main`, and re-verified
on the Vercel production deployment.

*Photo extraction* (`web/src/lib/course-brain/content-images.ts`): all four chapters
are done. **Chapter 1 was completed by Codex on 2026-08-12** using the project's
Claude-style workflow: separate Terra extraction passes for p3–16 and p17–33, a Sol
selection review, then Codex's own visual inspection and single-map consolidation.
Seven new entries cover p4 Topography, p6 geography/tourism, p7 Leisure, p8 Recreation,
p17 push-pull, p18 push factors, and p19 pull factors; its prior named-landmark entries
p13/p14/p15/p30 remain. Weak, decorative, duplicate, vector, and already-diagrammed
assets were deliberately not added.

*DB-write work* (Supabase, `content_units`/`source_references`): **done, 2026-08-11.**
Fixed the one known citation error, added the 3 flagged missing-table units, then fixed
every **SHALLOW** finding — 41 body rewrites across all 4 chapters plus a 3-unit split
(Deciduous/Evergreen/Mixed forest, the client's originally-flagged case). During the
Chapter 4 photo pass, also added one new content unit (**Mount Kinabalu mountain
tourism**, filling a real content gap the audit flagged) and corrected one body that had
wrong data (the "Largest bodies of water" unit — see checklist for what was wrong and
why). DB is at 132 published content units, up from 125 at the start of this pass. Two
structural gaps and two source defects remain found-and-flagged, not fixed, per the
source-fidelity rule. See `docs/checklist.md`'s 2026-08-11 entries for the full list.
**The build/fix implementation is complete.**

**Latest UI correction (Codex, 2026-08-12):** small-screen topic navigation had
become closed by default because `TopicList` used a native `<details>` without the
`open` attribute. This made subtopic/sibling-topic links appear to disappear after a
topic was opened. The disclosure now starts open; users can still collapse it
manually. A regression test covers the open state.

**Independent deployment review (Codex, 2026-08-12):** Chrome DevTools verified
the homepage, CH1 Tutor response and citation link, large CH2 glossary/roster topic,
small CH2 topic, dense CH3 topic, mixed CH4 topic, and the CH99 empty state. There
were no console errors or failed document/fetch requests. Two accessibility findings
were fixed and deployed: compact sections now retain a real screen-reader `h2` before
their `h3` entries, and citation link accessible names include their visible source
text. The selected subtopic now has a persistent tinted background, bold label, and
teal marker rather than relying on the marker alone. Production Lighthouse snapshot
audits now score 100 for accessibility, best practices, SEO, and agentic browsing on
both desktop and mobile. Commits: `ea4b81e`, `2881c68`.

**Why work is being done directly instead of via subagents:** large parallel subagent
dispatches (both the audit pass and an earlier design-fix pass) repeatedly hit an
account-level session/usage rate limit mid-task and died silently. Direct main-thread
tool calls (shell, file read/write, browser devtools) do not seem to be affected by
this limit and have worked reliably throughout. Until that's no longer true, prefer
doing this work directly, in small chunks, saving/committing after each chunk, over
dispatching a big subagent for it.

## Next step

*(rewritten 2026-08-25 — the remediation is finished and deployed; the previous list is done)*

*(refreshed 2026-08-26: the visual-layer passes are done and deployed; two small client
questions came out of them and are listed as item 0, since they cost the owner a sentence each and
unblock tidy-up work.)*

In order:

0. **Two quick client answers, both from the 2026-08-26 visual work.**
   - **Should the deck's own p20 Push-Pull figure come back?** The native table carries the same
     labels, so nothing is lost factually, but the slide's own figure is now shown nowhere. If it
     should return, it returns as a unit-level figure on `c403af77`, not as the topic diagram.
   - **The Subarctic unit lost a map, not just a photo.** Its old image was a low-resolution scan
     of a *distribution map* of the Canadian subarctic; the taiga photograph replacing it shows
     what the climate looks like, not where it is. If the distribution matters, it should return as
     its own figure.

1. **Get the project owner's ruling on the silent-correction policy.** The one thing blocking
   settled work. The database currently handles source typos *both ways* across all four chapters,
   and CH3 alone accounts for seven items — see "Blocked on the project owner" above. One ruling,
   then apply it uniformly in a single batch (Phase 3/4 of the remediation plan). Nothing else
   depends on it, so it can sit with the owner while other work proceeds.

2. **Re-audit the 208 draft quiz questions.** The highest-value unstarted work. Only four have
   ever been checked, and **one of those four was contaminated** by a fabricated body — its
   marking criterion could fail a learner who gave the source-correct answer. The other 204 are
   unexamined. Unit bodies are final now, so this is the right moment.
   - Needs `SUPABASE_SERVICE_ROLE_KEY`: `quiz_questions` returns `42501` to the anon key.
   - `.claude/skills/pedagogy/assessment-validity-checker/SKILL.md` and
     `feedback-quality-analyser/SKILL.md` are the right instruments; the second targets exactly
     the marking-scheme failure above.
   - Expect a recall skew: 73% of content units are bare `definition` type, so questions drafted
     from them likely test recognition rather than understanding. Coverage across the 134 units is
     the specific thing to measure.

3. **Update `.claude/skills/course-content/SKILL.md`** with the two lessons from this incident:
   never copy a quotation out of a secondary document into the database (re-read the PDF page),
   and the corrected tooling note — `pymupdf` in `.venv` renders slides to JPEG, contradicting the
   skill's current claim that no rasterizer exists.

4. **Ask the client for two things.** Both unblock work that cannot otherwise start:
   - A **machine-readable DTM10333 syllabus / course learning outcomes.**
     `data/course-materials/fyp cb.pdf` is a single image-only page with no text layer. Without
     this, nothing verifies that the app covers what the course actually promises — the most
     valuable audit still unavailable.
   - The **actual entry English requirement.** The pedagogy review assumed CEFR B1; its Chapter 1
     finding (FK median 15.2, 52% of units at grade 15+, least illustrated, and it comes first)
     weakens considerably if the cohort reads at B2+.

5. **Remaining pedagogy item:** topic-level elaboration prompts — roughly 23, not one per unit —
   to lift germane load. Needs a UI slot built first. Findings 5 and 8 of
   `docs/pedagogy-review-content-units-2026-08-25.md` argue the dormant summary columns and this
   prompt slot should be designed together rather than separately.

6. Only then return to feature work, with quiz approval the highest-value open MVP item.

Standing constraints that still apply:

- Do NOT invent content for "STRUCTURAL GAP" items — Chapter 4's "valley" (p18) and "beach" (p19)
  headings that the deck never delivers content for, and p7's third classification bullet, which
  has no category label unlike the other three. These stay flagged in `docs/checklist.md`, not
  fixed, per the source-fidelity rule.
- AI-drafted questions remain `draft` until explicitly approved, and must be grounded in a
  published, cited source unit.

## Continuing in a different tool (Codex, or anything that is not Claude Code)

This doc is deliberately tool-agnostic, but three things will not follow you automatically:

1. **`AGENTS.md` in the repo root is read by Codex; the `.claude/` directory is not.** The
   project's binding content rules live in **`.claude/skills/course-content/SKILL.md`** — one
   entity per unit, citation requirements, insert-before-delete ordering, the visual-scan
   extraction process. **Read that file yourself before touching `content_units`.** It is plain
   markdown and needs no Claude-specific tooling.

2. **The pedagogy workstream's rules live in `.claude/agents/course-pedagogy-reviewer.md`** and
   its nine vendored skills under `.claude/skills/pedagogy/`. The load-bearing idea is the
   **Layer 1 / Layer 2 split**: source-derived prose may only be *flagged*, never rewritten, while
   the scaffolding around it — ordering, topic boundaries, which figure pairs with which unit,
   question design, marking schemes, summaries — is open to change. Keep that distinction whatever
   tool you are in. It is what stops "improving the pedagogy" from becoming a second route to
   rewriting the slides, which is how this project got into a four-chapter remediation. Those
   skills are CC BY-SA 4.0; see `ATTRIBUTION.md` in that directory before adapting them.

3. **Python tooling lives in `.venv`** (`pymupdf`, for rendering slides and extracting embedded
   images; `Pillow`, for the image pipeline). Node tooling is under `web/`. Both are on local disk;
   neither works from the Google Drive checkout. The reusable scripts are
   `scripts/commons_images.py` (search / metadata / download-and-convert for openly licensed
   photography) and `scripts/build_image_attribution.py` (regenerates the credit file); both carry
   their rules in their docstrings.

4. **The gate before any merge is the same in every tool:** `npm run typecheck`, `npx vitest run`,
   `npm run lint`, `npm run build` from `web/`, then the pages themselves in a browser at 1440px
   and 390px. The vitest run includes a live Supabase half that needs `web/.env.local`; it skips
   cleanly without credentials, which means a green run in an environment without them has
   verified less than you think.

## Standing workflow (established and requested by the project owner)

1. A planning/review pass writes the spec or audit (research + judgment).
2. Execution happens (can be parallelized per-chapter if subagents are available and
   not rate-limited).
3. An independent review pass checks the *actual shipped result* — re-read the live
   site / re-run the query / re-check computed styles, don't just read the executor's
   summary.
4. Findings from the review get fixed and re-verified before commit/deploy.

Other standing instructions from the project owner:
- When a content problem is found in one place, check for the same problem everywhere
  else too, not just the reported instance.
- Keep `.claude/skills/*/SKILL.md` files updated with anything learned along the way —
  techniques, gotchas, corrections.
- Keep `docs/checklist.md` updated as a living project checklist (check off `- [x]`
  items, append dated `**Status/Update (date):**` notes rather than rewriting prior
  entries).
- When presenting a plan, lead with one short "what we're focusing on next" section —
  keep it brief, no noise.
- Never touch the ~18 other unrelated projects in the project owner's Vercel account
  without them explicitly naming one.

## Project shape (for orientation)

Next.js 16 (App Router, Turbopack) + React 19 + Tailwind v4 app, Supabase
(Postgres/PostgREST/RLS) backend, deployed on Vercel. Teaches Tourism Geography from 4
real course-slide PDFs in `data/course-materials/`. Source of truth for detailed
architecture: `docs/architecture.md` and `docs/course-brain-content-model.md`.

Key schema (Supabase): `chapters` → `topics` → `content_units` (each with a
`source_references` row for citation/provenance), plus `quiz_questions` /
`quiz_question_options` (currently empty — quiz content doesn't exist yet, out of
scope for the current task). Full mechanics (the `created_at`-as-display-order quirk,
the insert-before-delete safety rule, the PostgREST embedded-filter gotcha) are
documented in `.claude/skills/course-content/SKILL.md` — read that before making any
DB write.

Live site: https://tourism-geography-tutor.vercel.app — auto-deploys from `main` via
GitHub → Vercel integration (push to `main` = production deploy, no manual step
needed).

## Credentials

No credentials are stored in this repo or in any doc, by design. If you need them:
- Supabase URL + anon key + DeepSeek key: `web/.env.local` (gitignored, already
  populated on this machine — if working from a fresh checkout, ask the project owner).
- Supabase service-role ("secret") key and Vercel API token: not stored anywhere
  persistent on this machine either; ask the project owner directly if a DB write or
  Vercel API call needs elevated access beyond what the anon key allows. **Never write
  any of these values into a committed file, including this one.**

**What the anon key can and cannot do** — established 2026-08-25 by testing, not assumed.
`content_units`, `topics`, `chapters` and `source_references` are all readable with it.
`quiz_questions` is not: PostgREST returns `42501`. All writes need the service-role key.

**Gotcha when writing through PostgREST:** the `+00:00` in a `created_at=eq.` filter must be
percent-encoded. Left raw it arrives as a space and Postgres rejects it with
`22007 invalid input syntax for type timestamp with time zone`.

**Action for the owner:** the service-role key was pasted into a chat session on 2026-08-25 so
the ordering fix could be applied. That transcript is stored on disk, so the key is no longer
ephemeral. **Rotate it in the Supabase dashboard.**

## Other open items (lower priority than the current audit/fix pass)

From `docs/checklist.md`, not part of the active task but tracked there:
- ~~Quiz content is completely empty~~ — out of date. The bank holds 208 questions
  (128 MCQ, 80 written), all still `status='draft'`, `generated_by='deepseek_draft'`.
  They serve learners today via `202608120007_enable_generated_practice_bank.sql`;
  the lecturer can now review and approve them at `/dashboard/lecturer/review`.
- Phase 2 of the learner-accounts work, not started: the AI PDF-to-questions importer
  for the lecturer. Needs a Node-side PDF text extractor (`unpdf` is the
  serverless-friendly pick — the repo's existing PDF tooling is Python/`pymupdf`,
  which will not run on Vercel). Extracted questions must land as `draft` and be given
  a topic and a published source unit before they can be approved, per the
  source-fidelity rule.
- Lecturer features scoped but not built: item analysis (% correct per question from
  real attempt data), manual mark override on auto-graded written answers, CSV export,
  and a review queue for the source defects `docs/checklist.md` flags but deliberately
  does not fix.
- No manual dark/light mode toggle exists in the app (only OS-level
  `prefers-color-scheme` is respected).
- A few source-fidelity issues are flagged-but-not-fixed on purpose (e.g. Chapter 3
  has "nine planets" / ocean-name typos in the source slides themselves — see
  checklist for the full list). Per the source-fidelity rule, these get flagged to the
  client, not silently corrected.
