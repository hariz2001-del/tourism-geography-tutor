# Design spec — visual hierarchy, sub-grouping, and colour/type system

**Date:** 2026-08-09
**Scope:** `web/` (Next.js 16.3.0, React 19.2.8, Tailwind CSS 4.3.3)
**Status:** Specification only. No code was written for this document.

This document is written to be executed literally. Where a choice exists, this
document makes it. The implementer should not need to exercise design judgement.

---

## 0. What triggered this

Client, verbatim:

> "please scrape for better ui/ux skills for this, and reall improve it also the
> dsieng for this. yes i see you rearranged some but its still far beyond par.
> find ways to make the contents look more arranged under its supposed
> subcontents or contents."

Content *ordering* was fixed in a prior pass. This pass is about **visual**
hierarchy. Plus the previously deferred "Colorful UI" ask, now in scope.

---

## 1. Audit of what exists

### 1.1 There is no design system to honour

`web/src/app/globals.css` is five lines:

```css
@import "tailwindcss";
:root { --background: #f8fafc; --foreground: #0f172a; }
* { box-sizing: border-box; }
body { margin: 0; background: var(--background); color: var(--foreground); font-family: Arial, Helvetica, sans-serif; }
```

- Zero `@theme` tokens. Every component hard-codes `slate-*` utilities.
- **Zero dark-mode handling.** No `prefers-color-scheme` block, no
  `color-scheme` declaration, no `dark:` utilities anywhere in the codebase.
  On a dark-mode OS the app renders as a bright white slab and the tutor
  `<textarea>` / quiz radios get UA-default light chrome.
- `font-family: Arial, Helvetica, sans-serif` — the browser default stack, not
  a decision. `next/font` is not used at all.

There is therefore very little to preserve. What **must** be preserved is
listed in §7.

### 1.2 The flat-stack problem, measured

`web/src/components/materials/content-unit.tsx` renders every unit identically:
`rounded-lg border p-5 shadow-sm`, a pill badge, an `<h2>`, a `<p>`. The only
variation in the entire component is `isExample` → amber instead of white.

I pulled the live site (https://tourism-geography-tutor.vercel.app) and dumped
the real composition of all 26 topics across CH1–CH4. Key findings:

**Finding A — `content_type` alone cannot drive grouping.**
On `/chapters/CH2?topic=68393419-…` ("The seven continents") **all nine units
are `definition`**. Nine identical `DEFINITION` badges stacked vertically. The
badge carries zero information there; it is pure noise. The same is true of
"Water environments" (16 of 17 units are `definition`) and "Middle latitude
climate" (5 of 5).

**Finding B — the real structure is positional, not type-based.** "The seven
continents" is:

| # | type | title | body len |
|---|---|---|---|
| 1 | definition | Define a continent | 93 |
| 2 | definition | The seven continents | 127 |
| 3–9 | definition | Asia / Africa / North America / South America / Europe / Antarctica / Australia | 74–146 |

That is: *opener → roster → seven parallel entries*. Three distinct kinds of
thing, rendered identically. Same shape in "Major oceans" (opener → roster →
5 entries → takeaway).

**Finding C — topic profiles cluster into four shapes.**

1. **Roster topics** — opener, enumeration, N parallel entities.
   *The seven continents (9), Major oceans (8).*
2. **Glossary topics** — long runs of short parallel definitions, no opener.
   *Water environments (17 units, bodies 39–154 chars), Natural landscapes (10).*
   A 17-card flat stack of full-width prose cards is the single worst page on
   the site.
3. **Prose topics** — 4–6 mixed-type units with long bodies that genuinely read
   as sequential prose. *Push and pull factors (max body 460), Latitude and
   longitude (max 346), Tourism natural resources.*
4. **Stub topics** — 2 units. *World climate classification, Highland climate.*

A grouping scheme must produce a good result for all four without a human
deciding per-topic.

**Finding D — ordering is fragile and must not be disturbed.**
`repository.getPublishedTopicContent()` orders by `created_at`, which is how
the prior pass's curated sequence is encoded. In "Natural landscapes and
landforms" the order is Definition, Definition, **Key takeaway**, Example,
Example, Definition (Plateau), Example (Tibetan), Example (Antarctic), Example
(Andean), Definition (Desert). A key takeaway sits at index 3, and the three
plateau examples are children of the plateau definition immediately above them.

> **Any scheme that buckets units by `content_type` and re-sorts them destroys
> the prior pass's work.** The grouping algorithm in §4 is strictly run-based:
> it walks the array in order and never moves a unit past another.

### 1.3 Bugs / gaps found while auditing

- **`learning_note` renders with no badge at all.** `CONTENT_TYPE_LABELS` in
  `content-unit.tsx` omits it, though the DB `check` constraint
  (`supabase/migrations/202608050001_course_brain.sql:36`) allows it and CH3
  "Earth systems and global divisions" unit 1 uses it. It currently renders as
  a bare card with no label. Fix in this pass (§5.4).
- Heading levels: the topic name is `<h1>` and *every* card title is `<h2>`.
  With sections introduced, section headers become `<h2>` and card titles
  `<h3>` — an accessibility improvement, not just cosmetics.
- Diagram PNGs are light-background raster images. In dark mode they will
  glare. Handled in §5.9.

---

## 2. Research grounding

Two things from the research actually changed the design, rather than
decorating it:

1. **A controlled vocabulary of section labels, applied consistently, is what
   makes a reference product scannable** — this is the core of the Diátaxis
   argument: each kind of content gets its own form and style, and the kinds
   are kept visibly distinct. Diátaxis explicitly notes you may rename the
   categories as long as the purpose stays clear. Applied here: a **fixed set
   of six section labels** (§4.3), never improvised per topic, never derived
   from the unit's own wording.
2. **Hierarchy is produced by size, spacing, proximity and layout shape — not
   by recolouring an otherwise-identical object.** A coloured badge on a card
   that is the same size, same width, same border-radius and same spacing as
   every other card produces no hierarchy at all. This is exactly the current
   failure. So the scheme below changes **layout shape** (grid vs. stack vs.
   unboxed prose) and **density**, and uses colour only as a secondary cue.

Sources:
- [Start here — Diátaxis in five minutes](https://diataxis.fr/start-here/)
- [Diátaxis](https://diataxis.fr/)
- [We fixed our documentation with the Diátaxis framework — Sequin](https://blog.sequinstream.com/we-fixed-our-documentation-with-the-diataxis-framework/)
- [Visual Hierarchy in UX: Definition — Nielsen Norman Group](https://www.nngroup.com/articles/visual-hierarchy-ux-definition/)
- [What is Visual Hierarchy? — Interaction Design Foundation](https://ixdf.org/literature/topics/visual-hierarchy)
- [6 principles of visual hierarchy for designers — 99designs](https://99designs.com/blog/tips/6-principles-of-visual-hierarchy/)
- [Dark mode — Tailwind CSS](https://tailwindcss.com/docs/dark-mode)
- [Tailwind v4 dark/light CSS variables — tailwindlabs discussion #15083](https://github.com/tailwindlabs/tailwindcss/discussions/15083)

---

## 3. Visual identity

### 3.1 Concept: the hypsometric atlas

The subject is continents, oceans, climate belts, latitude/longitude,
landforms. The palette is taken from **hypsometric and bathymetric map tints** —
the standard colour ramp used in physical atlases to encode elevation and
depth: abyssal navy → shelf teal → chart paper → dry-lands ochre → lowland
green. The one decorative motif is the **graticule**: the faint meridian /
parallel grid printed on chart paper.

Explicitly avoided, per brief:

- warm cream + serif + terracotta (the ground here is a **cool** off-white with
  a green-cyan cast, `#F2F6F5`, and the warm accent is a muted map-legend ochre
  `#8A6116`, not terracotta)
- near-black + single neon accent
- purple→blue gradient hero (there is no gradient hero; there is no hero)
- Inter / Space Grotesk
- `rounded-lg` everywhere (radii are `2px`/`3px`; see §3.5)
- emoji as section markers (section markers are a mono rule + label)

### 3.2 Colour tokens

Six core tokens. Hexes are final — do not substitute.

| Token | Light | Dark | Used for |
|---|---|---|---|
| `--color-chart` | `#F2F6F5` | `#0A1417` | Page ground. Chart paper: cool off-white with a faint green-cyan cast in light; abyssal near-black in dark. |
| `--color-surface` | `#FFFFFF` | `#12242B` | Card, panel and input fills. The only surface that sits above the ground. |
| `--color-graticule` | `#CBDAD8` | `#22424B` | Every hairline: card borders, section dividers, table rules, the background grid. Never used for text. |
| `--color-ink` | `#12333B` | `#DDEAE8` | Body copy, `<p>`, list text. |
| `--color-ink-strong` | `#06232B` | `#F2FAF8` | Headings, card titles, `<h1>`–`<h3>`, active nav. |
| `--color-meridian` | `#0E6B72` | `#4FC3C7` | The brand/primary. Links, focus rings, primary buttons, active chapter pill, the lead rule. Bathymetric shelf teal. |

Three semantic accents. These are what deliver the "Colorful UI" ask: they are
tied to *meaning*, so the page gains colour without gaining decoration.

| Token | Light | Dark | Meaning |
|---|---|---|---|
| `--color-deep` | `#163E63` | `#7FA9D4` | **Roster / "At a glance"** blocks. Open-ocean navy. |
| `--color-relief` | `#8A6116` | `#D9A94A` | **Examples and case studies.** Dry-lands ochre from the hypsometric ramp. Replaces the current `amber-50/300`. |
| `--color-lowland` | `#2C6A45` | `#6FC08D` | **Key takeaways.** Vegetated-lowland green. |

Two support tokens:

| Token | Light | Dark | Used for |
|---|---|---|---|
| `--color-ink-muted` | `#4A6B72` | `#8FAFB4` | Captions, citation meta, entry index numerals, inactive nav. |
| `--color-danger` | `#9B2226` | `#F1A0A2` | `role="alert"` error text only. |

**Contrast (WCAG 2.1, computed):** ink/chart 11.9:1 · meridian/surface 6.2:1 ·
relief/surface 5.6:1 · lowland/surface 6.5:1 · deep/surface 11.2:1 ·
ink-muted/surface 5.1:1. Dark: meridian/chart 8.9:1 · relief/surface 7.4:1 ·
lowland/surface 7.2:1 · deep/surface 6.5:1. All pass AA for normal text.

### 3.3 Typography

Three roles. All via `next/font/google` (self-hosted at build time by Next —
no CDN `<link>`, no data URIs). All three are variable fonts.

| Role | Family | Why |
|---|---|---|
| **Display / headings** | **Source Serif 4** | Variable, with an optical-size axis. A text serif for headings over a sans body is the gazetteer/encyclopedia inversion — it reads as *reference*, not as marketing. Not on the cliché list. |
| **Body / UI** | **Source Sans 3** | Humanist sans; the lineage of map lettering. Holds up at 15–17px for the short 40–350-char bodies this content actually has. Family-mate of Source Serif 4, so metrics and colour match. |
| **Data / caption / label** | **IBM Plex Mono** | Section eyebrow labels, entry index numerals, citation page/slide refs, chapter codes. Instrument-panel character; gives coordinates and references a distinct, technical voice. Weight 400/500 only. |

Type scale — final values, use these exact Tailwind arbitrary sizes:

| Name | Size / line-height | Family | Weight | Where |
|---|---|---|---|---|
| `eyebrow` | `text-[0.6875rem]/[1.2]` · `tracking-[0.14em]` · `uppercase` | mono | 500 | Section labels, type badges |
| `meta` | `text-[0.8125rem]/[1.5]` | mono | 400 | Citations, page/slide, entry numerals |
| `body-sm` | `text-[0.9375rem]/[1.6]` | sans | 400 | Entry-card bodies, sidebar |
| `body` | `text-[1.0625rem]/[1.7]` | sans | 400 | Stacked-card bodies, tutor answers |
| `body-lead` | `text-[1.25rem]/[1.55]` | sans | 400 | The lead unit's body |
| `h3` | `text-[1.0625rem]/[1.35]` | serif | 600 | Entry-card titles |
| `h3-lg` | `text-[1.1875rem]/[1.35]` | serif | 600 | Stacked-card titles |
| `h2` | `text-[1.375rem]/[1.3]` | serif | 600 | Tutor / Self-check panel headings |
| `h1` | `text-[2rem]/[1.15] md:text-[2.5rem]` · `tracking-[-0.015em]` | serif | 600 | Topic title, chapter title |
| `display` | `text-[2.5rem]/[1.1] md:text-[3.25rem]` · `tracking-[-0.02em]` | serif | 600 | Home page title |

Measure: cap prose at `max-w-[68ch]`; cap the lead body at `max-w-[62ch]`.

### 3.4 Motion

CSS transitions only. **Do not install `framer-motion` or any animation
library** — nothing in this spec needs interruptible, spring, or layout-shared
animation, and the bundle cost is not justified for four transitions.

Total motion budget:
1. Card border colour on hover — `transition-colors duration-150`.
2. Nav/link colour — `transition-colors duration-150`.
3. The existing hash-highlight — restyled (§5.4), `1.4s` one-shot.
4. Focus ring appearance — no transition (must be instant).

A global reduced-motion guard goes in `globals.css` (§5.1).

### 3.5 Shape and elevation

- Radius: `--radius-card: 3px`, `--radius-pill: 999px`. **Nothing gets
  `rounded-lg`.** Cards, inputs, buttons and diagrams all use `rounded-[3px]`
  (i.e. `rounded-card` once the token exists). Chapter pills keep the pill
  radius.
- **No `shadow-sm` anywhere.** Remove every existing `shadow-sm`. Separation
  comes from a 1px `--color-graticule` border plus the ground/surface
  luminance step. Shadows on a chart-paper ground look like a mistake, and they
  are invisible in dark mode anyway.
- Accent bars are `border-l-2`, never `border-l-4`.

---

## 4. The grouping scheme

### 4.1 Principles

1. **Order is sacred.** The algorithm walks `units` front-to-back and only ever
   groups *contiguous* runs. No unit is ever moved past another. (See §1.2
   Finding D.)
2. **Shape carries the hierarchy.** The four levels are, from most to least
   prominent: unboxed lead prose → framed roster block → full-width stacked
   cards → compact grid cells. A reader can tell them apart at a squint,
   without reading a badge.
3. **The badge is demoted.** A type badge only appears where types actually
   differ within the section (stacked sections). In a grid of nine
   `definition`s it is suppressed entirely and replaced by an index numeral.

### 4.2 The algorithm

Pure function, no I/O, fully deterministic. Put it in
`web/src/lib/course-brain/group-units.ts`.

```
ROSTER_RE = /\b(two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|\d+)\b/i
GRID_MIN_RUN   = 3     // a run needs at least 3 units to become a grid
GRID_MAX_BODY  = 280   // …and no body longer than this
GRID_WIDE_BODY = 140   // …and if no body exceeds this, allow a 3rd column at xl

bucket(contentType):
  "example" | "case_study" -> "example"
  "key_takeaway"           -> "takeaway"
  "learning_note"          -> "note"
  anything else            -> "overview"      // definition, explanation, unknown

isRoster(unit) = ROSTER_RE.test(unit.title)
words(s)       = s.trim().split(/\s+/).length

buildSections(units):
  if units is empty: return []

  # --- step 1: the intro section (0, 1 or 2 units, taken from the front) ---
  intro = []
  u0 = units[0]; u1 = units[1]            // u1 may be undefined
  takeU0 = isRoster(u0)
        || u0.contentType !== "definition"
        || words(u0.title) >= 3
        || (u1 !== undefined && isRoster(u1))
  if takeU0:
    intro.push(u0)
    if u1 !== undefined && isRoster(u1) && !isRoster(u0):
      intro.push(u1)

  rest = units.slice(intro.length)

  # --- step 2: split `rest` into maximal contiguous runs ---
  # A run breaks when bucket() changes OR when a roster unit is encountered
  # (a roster unit always forms a run of exactly one).
  runs = []
  for each unit in rest (in order):
    if isRoster(unit):
      runs.push({ kind: "roster", units: [unit] })
    else if last run exists && last run.kind === bucket(unit) && last run is not a roster:
      append unit to last run
    else:
      runs.push({ kind: bucket(unit), units: [unit] })

  # --- step 3: choose a layout per run ---
  sections = []
  if intro is not empty:
    sections.push({ id, kind: "intro", layout: "lead", units: intro })
  for each run in runs:
    maxBody = max(u.body.length for u in run.units)
    canGrid = (run.kind === "overview" || run.kind === "example")
              && run.units.length >= GRID_MIN_RUN
              && maxBody <= GRID_MAX_BODY
    layout  = run.kind === "roster" ? "roster"
            : canGrid               ? "grid"
            :                         "stack"
    sections.push({ id, kind: run.kind, layout,
                    columns: layout === "grid" && maxBody <= GRID_WIDE_BODY ? 3 : 2,
                    units: run.units })

  return sections
```

`id` is `` `sec-${index}` `` — used only as a React key and for `aria-labelledby`.

### 4.3 Section labels — the controlled vocabulary

Exactly six strings. Never generated, never varied, never pluralised
dynamically.

| `layout` / `kind` | Label |
|---|---|
| `layout === "lead"` | *(no label — it is the opening)* |
| `layout === "roster"` | `At a glance` |
| `kind === "overview"` && `layout === "grid"` | `Entries` |
| `kind === "overview"` && `layout === "stack"` | `Detail` |
| `kind === "example"` (either layout) | `Examples` |
| `kind === "takeaway"` | `Key takeaways` |
| `kind === "note"` | `Notes` |

**Label suppression rule:** if `buildSections()` returns fewer than **two**
sections with a non-empty label, render no labels at all. This keeps 2-unit
topics ("Highland climate", "World climate classification") free of ceremony.
Compute once in the page and pass `showLabels: boolean` down.

Duplicate labels within one topic are acceptable and expected (e.g. "Water
environments" produces `Entries` → `Examples` → `Entries`). Do not dedupe.

### 4.4 Verification against real data

I ran this algorithm by hand against all 26 live topics. Selected results —
use these as acceptance cases:

| Topic | Units | Sections produced |
|---|---|---|
| **The seven continents** (CH2) | 9 | lead(2: *Define a continent* + *The seven continents*) → **Entries grid ×7** (2 cols; max body 146) |
| **Major oceans** (CH2) | 8 | lead(2) → **Entries grid ×5** (3 cols; max body 111) → Key takeaways ×1 |
| **Water environments** (CH4) | 17 | *(no lead)* **Entries grid ×5** (2 col) → Examples ×1 → **Entries grid ×11** (3 col; max 122) |
| **Natural landscapes** (CH4) | 10 | *(no lead)* Detail ×2 → Key takeaways ×1 → Examples stack ×2 → Detail ×1 → **Examples grid ×3** (the three plateaus) → Detail ×1 |
| **Push and pull factors** (CH1) | 5 | lead(1) → Detail stack ×4 (max body 460 → correctly stays prose) |
| **Forms of tourism** (CH1) | 4 | *(no lead)* **Entries grid ×4** — Domestic/International/Inbound/Outbound stay together |
| **Tourism markets and products** (CH1) | 7 | lead(1) → **Entries grid ×5** → Examples ×1 (the Queensland case study) |
| **Measuring tourist flows** (CH1) | 4 | roster-lead(1: *Three types of tourist-flow measurement*) → **Entries grid ×3** |
| **World climate classification** (CH2) | 2 | lead(2) → *(nothing)* — labels suppressed |
| **Highland climate** (CH2) | 2 | lead(1) → Examples ×1 — labels suppressed |
| **Earth systems** (CH3) | 5 | lead(1, the `learning_note`) → **Entries grid ×4** |
| **Latitude and longitude** (CH3) | 6 | lead(1) → Detail ×2 → Examples ×1 → Detail ×2 |
| **Leisure, recreation, and tourism** (CH1) | 3 | *(no lead)* **Entries grid ×3** — the three parallel terms |

Every one of the 26 topics produces a sensible result. The two thresholds that
matter were tuned against this data: `GRID_MAX_BODY = 280` keeps "Measuring
tourist flows" (max 246) as a grid while keeping "Push and pull" (max 460) and
"Latitude and longitude" (max 346) as prose. `GRID_MIN_RUN = 3` lets the three
plateau examples grid while keeping 2-unit runs as stacks.

### 4.5 How each layout looks

Vertical rhythm between sections: `space-y-10`. Within a section: `space-y-3`.

**`lead`** — not a card.
- No border, no fill, sits directly on `--color-chart`.
- Left accent: `border-l-2 border-l-meridian pl-5`.
- Unit title as `h3-lg` serif in `--color-ink-strong`; body as `body-lead` in
  `--color-ink`, `max-w-[62ch]`.
- If the intro holds two units, the second (the roster) renders **inside** the
  lead block, separated by `mt-4 border-t border-graticule pt-4`, its title in
  `eyebrow` mono `--color-deep` and its body at `body` size. This is what makes
  "Define a continent → The seven continents" read as one opening statement
  with its enumeration attached.
- Followed by `pb-2`, then the first section divider.

**`roster`** (a roster that is *not* in the intro) — the most framed object.
- `rounded-card border border-graticule border-l-2 border-l-deep bg-deep/6 p-5`.
- Title `h3-lg` serif `--color-deep`; body `body`.

**`grid`** — the answer to the nine-identical-cards problem.
- Container: `grid gap-3 sm:grid-cols-2` plus `xl:grid-cols-3` **only when**
  `section.columns === 3`.
- Cell: `<article>` with
  `relative flex h-full flex-col rounded-card border border-graticule bg-surface px-4 pt-4 pb-3.5 transition-colors duration-150 hover:border-meridian/50`.
- Title `h3` serif `--color-ink-strong`, `pr-8` to clear the numeral.
- Body `body-sm` `--color-ink`, `mt-1.5`.
- **Index numeral:** `absolute right-3 top-3` · `meta` mono ·
  `--color-ink-muted` · `tabular-nums` · zero-padded to 2 digits (`01`, `02`, …)
  numbered from 1 within the section · `aria-hidden="true"`.
- **No type badge.** The section label already states the kind.

**`stack`** — full-width prose cards.
- `<article>`: `rounded-card border border-graticule border-l-2 bg-surface p-5 transition-colors duration-150`.
- Left accent colour by `kind`: `overview` → `border-l-graticule`;
  `example` → `border-l-relief`; `note` → `border-l-ink-muted`.
- `example` also gets `bg-relief/5`.
- Title `h3-lg` serif; body `body` `--color-ink` `max-w-[68ch]`.
- **Type badge shown** (types genuinely differ inside stacks) — see §5.4 for
  the new badge treatment.

**`takeaway`** — always a stack, always distinct.
- `rounded-card border border-lowland/30 bg-lowland/8 p-5`.
- Eyebrow `KEY TAKEAWAY` in mono `--color-lowland`; title `h3-lg` serif
  `--color-ink-strong`; body `body`.
- Takeaways are **not** moved to the end. They render wherever the curated
  order puts them (see "Natural landscapes", where one sits at index 3).

### 4.6 Section header markup

```
<section aria-labelledby={`${id}-label`}>
  <div className="mb-3 flex items-center gap-2.5">
    <span aria-hidden="true" className="h-px w-6 bg-{accent}" />
    <h2 id={`${id}-label`} className="{eyebrow} text-{accent}">{LABEL}</h2>
  </div>
  …section content…
</section>
```

`{accent}` by kind: `roster` → `deep`; `overview` → `ink-muted`;
`example` → `relief`; `takeaway` → `lowland`; `note` → `ink-muted`.

When `showLabels` is false, render the `<section>` without the header div and
without `aria-labelledby`.

A `border-t border-graticule pt-8` sits above every section **except the first**
— use `[&:not(:first-child)]:border-t` on the section wrapper, or emit the
divider conditionally by index. This is the "divider" half of the grouping.

---

## 5. Implementation instructions

Files are listed in the order they should be changed. Nine files touched, two
created.

> **Before writing any code**, read
> `web/node_modules/next/dist/docs/01-app/01-getting-started/13-fonts.md` and
> `web/node_modules/next/dist/docs/01-app/03-api-reference/02-components/font.md`.
> `web/AGENTS.md` warns that this Next.js version's APIs may differ from
> training data. I verified `next/font/google` with the `variable` option is
> current in 16.3.0; verify anything else you reach for.

### 5.1 `web/src/app/globals.css` — replace entirely

**Verified empirically against the installed `tailwindcss@4.3.3`**: a plain
`@theme` block emits its variables into an unlayered `:root, :host` rule and
generates utilities that reference them (`.bg-chart { background-color:
var(--color-chart) }`). A later, unlayered `@media (prefers-color-scheme: dark)
{ :root { … } }` block therefore overrides them and every utility follows. Do
**not** use `@theme inline` with literal hex values — that inlines the value
into the utility and breaks the override. (`@theme inline { --color-x:
var(--x) }` with an indirection also works, but the pattern below is one block
fewer and is the one I tested.)

```css
@import "tailwindcss";

@theme {
  /* surfaces & ink */
  --color-chart:       #F2F6F5;
  --color-surface:     #FFFFFF;
  --color-graticule:   #CBDAD8;
  --color-ink:         #12333B;
  --color-ink-strong:  #06232B;
  --color-ink-muted:   #4A6B72;

  /* brand + semantic accents */
  --color-meridian:    #0E6B72;
  --color-deep:        #163E63;
  --color-relief:      #8A6116;
  --color-lowland:     #2C6A45;
  --color-danger:      #9B2226;

  /* type */
  --font-sans:    var(--font-source-sans), ui-sans-serif, system-ui, sans-serif;
  --font-display: var(--font-source-serif), Georgia, "Times New Roman", serif;
  --font-mono:    var(--font-plex-mono), ui-monospace, SFMono-Regular, monospace;

  /* shape */
  --radius-card: 3px;
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-chart:      #0A1417;
    --color-surface:    #12242B;
    --color-graticule:  #22424B;
    --color-ink:        #DDEAE8;
    --color-ink-strong: #F2FAF8;
    --color-ink-muted:  #8FAFB4;
    --color-meridian:   #4FC3C7;
    --color-deep:       #7FA9D4;
    --color-relief:     #D9A94A;
    --color-lowland:    #6FC08D;
    --color-danger:     #F1A0A2;
  }
}

:root { color-scheme: light dark; }

* { box-sizing: border-box; }

body {
  margin: 0;
  background-color: var(--color-chart);
  color: var(--color-ink);
  font-family: var(--font-sans);
  font-synthesis-weight: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;

  /* graticule: meridians and parallels on chart paper */
  background-image:
    repeating-linear-gradient(to right,  var(--color-graticule) 0 1px, transparent 1px 64px),
    repeating-linear-gradient(to bottom, var(--color-graticule) 0 1px, transparent 1px 64px);
  background-blend-mode: normal;
}

/* Keep the graticule barely there. Do not raise these values. */
body::before {
  content: "";
  position: fixed;
  inset: 0;
  pointer-events: none;
  background-color: var(--color-chart);
  opacity: 0.965;
  z-index: -1;
}

/* Hash-target highlight, used by ContentUnit */
@keyframes unit-locate {
  0%   { background-color: color-mix(in oklab, var(--color-meridian) 18%, transparent); }
  100% { background-color: transparent; }
}
[data-highlighted="true"] { animation: unit-locate 1.4s ease-out 1; }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

> If the `body::before` scrim approach renders oddly on any page, the fallback
> is to drop `body::before` and instead set the two `repeating-linear-gradient`
> stops to `color-mix(in oklab, var(--color-graticule) 22%, transparent)` and
> remove `background-color` from the gradients. Pick one; do not ship both.

### 5.2 `web/src/app/layout.tsx` — wire the fonts

```tsx
import { IBM_Plex_Mono, Source_Sans_3, Source_Serif_4 } from "next/font/google";

const sourceSans = Source_Sans_3({
  subsets: ["latin"], display: "swap", variable: "--font-source-sans",
});
const sourceSerif = Source_Serif_4({
  subsets: ["latin"], display: "swap", variable: "--font-source-serif",
});
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"], weight: ["400", "500"], display: "swap", variable: "--font-plex-mono",
});
```

Apply all three variable classes to `<html>`:

```tsx
<html lang="en" className={`${sourceSans.variable} ${sourceSerif.variable} ${plexMono.variable}`}>
```

Also add to the exported `metadata`:
`themeColor: [{ media: "(prefers-color-scheme: light)", color: "#F2F6F5" }, { media: "(prefers-color-scheme: dark)", color: "#0A1417" }]`
— in Next 16 this belongs on the separate `viewport` export, not `metadata`;
confirm against the local metadata docs before writing.

Source Serif 4, Source Sans 3 and IBM Plex Mono are all variable fonts on
Google Fonts; only Plex Mono needs an explicit `weight` array here because we
use just two weights of it.

### 5.3 `web/src/lib/course-brain/group-units.ts` — **new file**

Export the algorithm from §4.2 plus its types:

```ts
export type SectionKind = "intro" | "roster" | "overview" | "example" | "takeaway" | "note";
export type SectionLayout = "lead" | "roster" | "grid" | "stack";
export type ContentSectionModel = {
  id: string;
  kind: SectionKind;
  layout: SectionLayout;
  columns: 2 | 3;
  label: string | null;   // null for the lead section
  units: PublishedContentUnit[];
};
export function buildSections(units: PublishedContentUnit[]): ContentSectionModel[];
export function shouldShowLabels(sections: ContentSectionModel[]): boolean; // >= 2 labelled sections
```

Pure, synchronous, no React import. Add `group-units.test.ts` alongside it
covering at minimum the acceptance cases in §4.4: the seven-continents shape,
Water environments' grid→example→grid, Push-and-pull staying a stack, Forms of
tourism gridding all four, and a 2-unit topic returning `shouldShowLabels ===
false`.

### 5.4 `web/src/components/materials/content-unit.tsx` — add a variant prop

New signature:

```tsx
type Variant = "lead" | "roster" | "entry" | "stack" | "takeaway" | "note";
export default function ContentUnit({
  unit, variant, index, showBadge,
}: { unit: PublishedContentUnit; variant: Variant; index?: number; showBadge?: boolean })
```

**Preserve exactly** (existing tests and the citation deep-link depend on these):

- The root element stays `<article id={`unit-${unit.id}`} data-highlighted={…}>`.
- The `hashchange` effect and its 1800ms timeout stay as-is. Only the *styling*
  of the highlighted state changes: replace
  `${isHighlighted ? "ring-4 ring-sky-400" : ""}` with
  `${isHighlighted ? "ring-2 ring-meridian" : ""}` — the background flash now
  comes from the `[data-highlighted="true"]` keyframe in `globals.css`.
- The unit title stays a heading element. Change `<h2>` → `<h3>` (section
  labels are now the `<h2>`s). `getByRole("heading", { name })` in
  `content-unit.test.tsx` is level-agnostic, so it keeps passing.
- Do **not** re-introduce a per-unit source/citation box —
  `content-unit.test.tsx` asserts it is absent.

**Fix the `learning_note` gap:** add `learning_note: "Note"` to
`CONTENT_TYPE_LABELS`.

**Badge treatment** (rendered only when `showBadge` is true — i.e. `variant`
is `stack` or `note`, never `entry`):
replace the filled pill with a flat mono label — no fill, no radius:

```
<span className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-{accent}">
```

`{accent}`: `example`/`case_study` → `relief`; `key_takeaway` → `lowland`;
`learning_note` → `ink-muted`; everything else → `ink-muted`.

Per-variant classes are exactly as specified in §4.5. Delete the `isExample`
amber branch entirely; `bg-amber-50 / border-amber-300 / bg-amber-200` are all
replaced by the `relief` token.

### 5.5 `web/src/components/materials/content-section.tsx` — **new file**

Server component (no `"use client"`). Takes
`{ section: ContentSectionModel; showLabel: boolean; isFirst: boolean }` and
renders the §4.6 header plus the correct container:

- `layout === "lead"` → the unboxed lead block (§4.5), rendering
  `section.units[0]` with `variant="lead"` and, if present,
  `section.units[1]` with `variant="roster"` inside the same block.
- `layout === "roster"` → single `ContentUnit variant="roster"`.
- `layout === "grid"` → `<div className={`grid gap-3 sm:grid-cols-2 ${section.columns === 3 ? "xl:grid-cols-3" : ""}`}>`
  mapping to `ContentUnit variant="entry" index={i + 1}`.
- `layout === "stack"` → `<div className="space-y-3">` mapping to
  `ContentUnit variant={section.kind === "takeaway" ? "takeaway" : section.kind === "note" ? "note" : "stack"} showBadge`.

Note both class strings for the grid must appear literally in source so
Tailwind's scanner emits them — do not build `sm:grid-cols-${n}` by
interpolation.

### 5.6 `web/src/app/chapters/[chapterCode]/page.tsx`

Replace the flat map:

```tsx
{chapter.units.length ? chapter.units.map((unit) => <ContentUnit key={unit.id} unit={unit} />) : …}
```

with:

```tsx
const sections = buildSections(chapter.units);
const showLabels = shouldShowLabels(sections);
…
{sections.length
  ? sections.map((section, i) => (
      <ContentSection key={section.id} section={section} showLabel={showLabels} isFirst={i === 0} />
    ))
  : <p role="status" …>No approved material is available for this topic yet.</p>}
```

Other changes in this file:

- Container: `max-w-7xl` → `max-w-[86rem]`; padding `p-6` → `px-6 py-8`.
- Sidebar grid: `lg:grid-cols-[15rem_minmax(0,1fr)_22rem]` →
  `lg:grid-cols-[16rem_minmax(0,1fr)_21rem]`, `gap-6` → `gap-8`.
- Content column: `space-y-4` → `space-y-10` (this is the section rhythm).
- Chapter code line: `font-semibold text-slate-700` →
  `font-mono text-[0.8125rem] uppercase tracking-[0.14em] text-ink-muted`.
- `<h1>`: `text-3xl font-bold` →
  `font-display text-[2rem] font-semibold leading-[1.15] tracking-[-0.015em] text-ink-strong md:text-[2.5rem]`.
- Insert the topic summary, if `chapter.topic.summary` is non-null, directly
  under the `<h1>` as `text-[1.0625rem]/[1.7] text-ink-muted max-w-[62ch]`.
  It is currently fetched (`ChapterTopic.summary`) and never rendered.
- `EmptyState`: swap `text-slate-800` / `text-slate-700` → `text-ink` /
  `text-ink-muted`, and the `<h1>` to the display treatment above.

### 5.7 Navigation and shell restyle (token swap, no structural change)

**`chapter-nav.tsx`** — chapter codes should read as map-margin labels:
- Active: `rounded-full bg-meridian px-4 py-1.5 font-mono text-[0.8125rem] font-medium uppercase tracking-[0.1em] text-chart`
- Inactive: `rounded-full border border-graticule bg-surface px-4 py-1.5 font-mono text-[0.8125rem] font-medium uppercase tracking-[0.1em] text-ink-muted transition-colors duration-150 hover:border-meridian hover:text-meridian focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meridian`
- Wrap the nav in `border-b border-graticule pb-5`.

**`topic-list.tsx`** — currently a flat list of `<Link>`s with a grey active
fill. Make the active state a rule, not a fill:
- `<h2>`: `font-mono text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-ink-muted`
- Wrap the `<ul>` in `border-l border-graticule` and give each link
  `-ml-px block border-l-2 py-1.5 pl-4 text-[0.9375rem] transition-colors duration-150`.
- Active: `border-l-meridian font-medium text-ink-strong`
- Inactive: `border-l-transparent text-ink-muted hover:border-l-graticule hover:text-ink`
- Focus: `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meridian` (replace every `outline-slate-900` in the file).
- `lg:sticky lg:top-8 lg:self-start` on the `<aside>` in the chapter page so the
  topic list tracks the reader on long topics like Water environments.

**`page.tsx` (home)** — token swap only, no restructure:
- Eyebrow `Tourism Geography Tutor` → mono eyebrow, `text-meridian`.
- `<h1>` → the `display` scale, `font-display`, `text-ink-strong`.
- Lead paragraph → `text-[1.25rem]/[1.55] text-ink max-w-[62ch]`.
- Chapter cards: `rounded-lg border border-slate-300 bg-white p-5 shadow-sm` →
  `rounded-card border border-graticule bg-surface p-5`.
- Chapter `<h2>` → `font-display text-[1.375rem] font-semibold text-ink-strong`;
  the topic-count span → mono `meta` in `text-ink-muted`.
- Topic links → `text-ink underline decoration-graticule underline-offset-4 transition-colors duration-150 hover:decoration-meridian hover:text-meridian`.
- CTA button → `rounded-card bg-meridian px-5 py-3 font-medium text-chart transition-colors duration-150 hover:bg-ink-strong`.
- Container `max-w-4xl` → `max-w-[52rem]`.

### 5.8 `tutor-panel.tsx`, `quiz-card.tsx`, `citation-card.tsx` — styling only

**Do not touch behaviour.** No changes to `submit()`, `checkAnswer()`, the
fetch calls, `role="status"` / `aria-live="polite"` / `role="alert"`, the
`aria-labelledby` wiring, `maxLength`, or the disabled-state logic.
`tutor-panel.live-region.test.tsx` and `quiz-card.test.tsx` assert on these.

Swap only:
- `rounded-lg … shadow-sm` → `rounded-card border border-graticule bg-surface`
  (drop the shadow).
- `text-slate-950` → `text-ink-strong`; `text-slate-800`/`text-slate-700` →
  `text-ink`/`text-ink-muted`; `border-slate-*` → `border-graticule`.
- `bg-slate-900` buttons → `bg-meridian text-chart hover:bg-ink-strong`;
  `disabled:bg-slate-500` → `disabled:bg-ink-muted`.
- `text-red-800` → `text-danger`.
- Panel `<h2>`s → `font-display text-[1.375rem] font-semibold text-ink-strong`.
- Textarea → `rounded-card border border-graticule bg-surface p-3 text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meridian`.
- Quiz option labels → `rounded-card p-2 hover:bg-meridian/6`; add
  `accent-meridian` to the `<input type="radio">`.
- `citation-card.tsx`: `bg-slate-50` → `bg-chart`; the whole card body to
  `font-mono text-[0.8125rem] text-ink-muted`; the `Source` line to
  `uppercase tracking-[0.14em] text-meridian`. Keep it a plain `<a>` (the
  comment in that file explains why — native `hashchange` is required for the
  ContentUnit highlight). Keep `aria-label="Go to this source in its topic"`.
- Every `focus-visible:outline-slate-900` across all files →
  `focus-visible:outline-meridian` with `focus-visible:outline-offset-2`.

### 5.9 `topic-diagram.tsx` — dark-mode plate

The diagram PNGs are light-background raster images and will glare on
`#0A1417`. Do not invert them.

- `<figure>`: `rounded-lg … shadow-sm` → `overflow-hidden rounded-card border border-graticule bg-surface`.
- Wrap the `<Image>` in `<div className="bg-white p-2 dark:p-3">` so the image
  always sits on its own white plate with a visible inset in dark mode.
- `<figcaption>`: `border-t border-graticule bg-chart px-4 py-2.5 font-mono text-[0.8125rem] text-ink-muted`.
- Lightbox overlay: `bg-slate-950/95` → `bg-[#050C0F]/96`; the close button's
  `border-white/40` → `border-graticule/60`, text `text-chart`.
- Keep the Escape handler, the `document.body.style.overflow` lock, `role="dialog"`,
  `aria-modal`, and both zoom states exactly as they are —
  `topic-diagram.test.tsx` covers them.

---

## 6. Accessibility requirements

These are not optional and are not covered by the styling swaps above.

1. **Heading order:** `h1` topic title → `h2` section labels → `h3` unit titles.
   When `showLabels` is false there are no `h2`s; that is an acceptable skip
   because there is exactly one implicit group.
2. Entry index numerals are decorative — `aria-hidden="true"`. Never the only
   way to identify a card.
3. Every section is a `<section>` with `aria-labelledby` pointing at its label
   `<h2>`; when unlabelled, omit both the header and the attribute (do not
   emit a dangling `aria-labelledby`).
4. Colour is never the sole carrier of meaning: every accent-coloured section
   also has a text label, and every accent-coloured card also has a left border
   or an eyebrow.
5. Focus visible on every interactive element:
   `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meridian`.
   Remove nothing that currently has a focus style.
6. `color-scheme: light dark` on `:root` so the tutor textarea, quiz radios and
   scrollbars pick up dark UA chrome.
7. Verify the reduced-motion block actually suppresses the `unit-locate`
   keyframe (it is in the global guard, so it will — but check it in DevTools
   with "Emulate prefers-reduced-motion" on).

---

## 7. Must not change

- `<article id={`unit-${unit.id}`}>` and the `data-highlighted` attribute —
  the citation deep-link (`citation-card.tsx` → `#unit-{id}`) and
  `content-unit.test.tsx` both depend on them.
- The absence of a per-unit source box (asserted by test).
- `repository.ts` — no query changes. In particular, **do not add an `ORDER BY
  content_type`.** `order("created_at")` is the curated sequence.
- Any DB schema, migration, or content. The `content_type` vocabulary stays as
  the six values in `202608050001_course_brain.sql`.
- Tutor and quiz *behaviour*, the API routes, and every `role`/`aria-live`
  attribute.
- `topic-diagram.tsx` interaction model (open / Escape / zoom / scroll lock).

## 8. Out of scope for this pass — flagged, not fixed

1. **Diagram coverage.** Only some topics have an entry in
   `lib/course-brain/diagrams.ts`; most render with no figure at all, which
   makes those pages notably plainer. Worth a content pass, not a design pass.
2. **`topic.summary` is fetched and never rendered.** §5.6 puts it on the page,
   but nothing verifies it is populated for all 26 topics — check the data.
3. **Tutor panel is hidden/deferred per the previous commit** (`f30cd8e`). This
   spec restyles it so it is ready, but does not re-enable or re-position it.
4. **No topic-to-topic previous/next navigation.** On an 8-topic chapter the
   only way forward is the sidebar. A `Previous / Next topic` pair at the foot
   of the content column would help, but it is a new feature.
5. **Mobile layout below `lg` collapses to a single column with the topic list
   above the content** — a reader on a phone scrolls past 8 topic links to
   reach the material every time. A collapsible `<details>` topic list on small
   screens is the fix; not attempted here.
6. **`GRID_MAX_BODY = 280` and `GRID_MIN_RUN = 3` are tuned to the current 26
   topics.** If a lot of new content lands, re-run the check in §4.4 before
   assuming they still hold. They are constants in one file for exactly this
   reason.
7. **No dark-mode toggle.** This spec implements `prefers-color-scheme` only.
   A manual override needs a `data-theme` attribute, an inline
   no-flash script in `layout.tsx`, and a `@custom-variant`; that is a
   separate piece of work.
8. **Home page card grid.** Chapter cards remain full-width stacked. With only
   four chapters that is fine; revisit if chapters are added.
