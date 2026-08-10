# UI/UX review — visual redesign (design-spec-2026-08-09)

**Date:** 2026-08-09
**Method:** `.claude/skills/ui-ux-review/SKILL.md` — Pass / Friction / Broken, concrete
evidence, judged against the worst-composed real topic rather than the spec's lead example.
**Target:** https://tourism-geography-tutor.vercel.app (live production, not localhost)
**Scope:** review only. No code, content or database was modified.

---

## Screens/topics reviewed

| Screen | Why | Modes checked |
|---|---|---|
| `/` (home) | shell + chapter cards | light, dark |
| **Highland climate** — `/chapters/CH2?topic=51c17acf-…` | **stub** (2 units, labels suppressed) | light |
| **Water environments** — `/chapters/CH4?topic=c5a8827e-…` | **largest glossary** (17 units) — the spec's own "single worst page on the site" | light, dark, **390×844 mobile** |
| **Natural landscapes and landforms** — `/chapters/CH4?topic=85c5385c-…` | **mixed-type, takeaway at index 3** — the worst-composed page in the corpus | light |
| **The seven continents** — `/chapters/CH2?topic=68393419-…` | spec's showcase lead+roster case (checked for fairness) | light |
| **Earth systems and global divisions** — `/chapters/CH3` | the only `learning_note` unit | light |
| `/chapters/CH1` | 9-topic sidebar, worst mobile stacking | 390×844 mobile |
| `/chapters/CH9` | `EmptyState` (no such chapter) | dark |
| Tutor panel, exercised for real | `grounded`, `ai_grounded`, `out_of_scope`, **and a forced network error** (Offline emulation) | light, dark |
| Citation deep-link | clicked a real citation → `#unit-…` | light |

**Quiz: not reviewable.** I fetched all 23 live topic pages across CH1–CH4 and **zero**
contain a `Self-check` panel — no topic has an approved quiz, so `QuizCard` never renders in
production. Its styling is code-reviewed only and is excluded from the verdict below.

Console (`list_console_messages`) checked on **three** pages — home, Water environments,
Earth systems: **zero messages of any level**. The only console errors seen in the whole
session were `net::ERR_INTERNET_DISCONNECTED`, which I induced deliberately.

---

## Findings

| Heuristic | Verdict | Evidence | Fix |
|---|---|---|---|
| **1. Hierarchy legible at a glance** | **Pass** | The flat-stack failure is genuinely gone. "The seven continents" renders three distinguishable shapes in sequence: unboxed lead with a meridian left rule → framed navy roster block (`bg-deep/6`, measured `oklab(0.3556 -0.0274 -0.0734 / 0.06)`, deep left bar) → 2-col numbered entry grid. Readable at a squint without reading a word. Water environments' 17 units are now grid×5 → 1 example card → grid×11 rather than 17 identical full-width cards. | — |
| **2. Sub-grouping reflects real structure** | **Pass** | Checked against the messiest real topic, not the tidy one. "Natural landscapes" produced exactly the spec's §4.4 prediction — Detail×2 → Key takeaways×1 → **Examples stack×2** → Detail×1 → **Examples grid×3** → Detail×1 — with curated `created_at` order intact and the takeaway still at index 3, not swept to the end. The grid/stack split is doing real work: the three 460-char prose examples stayed prose, the three short plateau examples gridded. | — |
| **2b. Section label duplicates the card badge** | **Friction** | On "Natural landscapes", the `h2` **"KEY TAKEAWAYS"** sits 32px above an eyebrow reading **"KEY TAKEAWAY"** — same mono, same uppercase, same `tracking-[0.14em]`, same `text-lowland` green. It reads as a rendering glitch. Same for **"EXAMPLES"** above **"EXAMPLE"** (twice), and "DETAIL" above "DEFINITION" (four times). The a11y tree confirms it is audible too: `region "KEY TAKEAWAYS" → heading "KEY TAKEAWAYS" lvl 2 → StaticText "KEY TAKEAWAY" → heading lvl 3`. The spec justified stack badges as "types genuinely differ inside stacks", but `bucket()` groups by type, so a takeaway stack is **always** 100% `key_takeaway` and the badge can never differ — the premise is falsified by the algorithm. | In `content-section.tsx:83-94`, pass `showBadge` only when the section's units do not all share one `CONTENT_TYPE_LABELS` value; and skip the hardcoded `KEY TAKEAWAY` eyebrow (`content-unit.tsx:122`) when `showLabel` is true. |
| **3. State must always be legible** | **Friction** | Two of three tutor response kinds are visually indistinguishable. `out_of_scope` — *"I could not find support for that in the approved material for this topic."* — renders as plain `text-[1.0625rem] text-ink` body copy, **identical** to a real grounded answer; only the absence of a citation card distinguishes a refusal from an authoritative answer. Separately, a forced offline submit surfaces the raw exception string **"Failed to fetch"** in `text-danger` (measured `rgb(241,160,162)`) — a developer string shown to a student. The friendly fallback `"The tutor could not answer right now."` is unreachable for transport failures because `TypeError: Failed to fetch` *is* an `Error`, so `caught.message` wins (`tutor-panel.tsx:41`). Loading state itself is fine — the button swaps to "Asking…". | Give `out_of_scope` the muted treatment plus a `NOT IN COURSE MATERIAL` mono eyebrow, reusing the pattern already at `tutor-panel.tsx:62`. In the catch, use `caught.message` only for errors thrown from the `!response.ok` branch. |
| **4. Empty and loading states** | **Pass (one nit)** | `/chapters/CH9` reads as intentional, not broken: display-scale `h1` "CH9 materials", a plain statement, and a forward-looking explanation. **Nit:** it is a dead end — `EmptyState` (`page.tsx:53-59`) renders no `ChapterNav` and no home link, so a stale URL traps the user on the browser back button. | Render `ChapterNav` above `EmptyState`, or add one link home. |
| **5. Citations read as authoritative** | **Friction** | The citation card itself is good — mono 13px on `bg-chart` inside a graticule border, with `SOURCE` in meridian. It reads technical and trustworthy. But **it does not read as clickable**: measured `text-decoration-line: none`, `color: rgb(74,107,114)` (`ink-muted`), no icon, no chevron; the only affordance is a `hover:border-meridian/50` border shift. A student has no reason to discover the deep-link. Separately, the **AI-generated caveat is styled weaker than the claim it qualifies** — "AI-GENERATED FROM COURSE MATERIAL — VERIFY AGAINST THE SOURCE BELOW" is 11px muted-grey uppercase mono wrapping to two lines, sitting above a 17px near-black answer. | Add `underline decoration-graticule underline-offset-2` to the `sourceFile` line, or a trailing `→`. Promote the caveat to `text-relief` (the token already means "caveat") at `meta` size. |
| **6. Consistency of mental model** | **Friction** | The same `content_type` wears two unrelated costumes **inside one topic under the same "EXAMPLES" label**. On "Natural landscapes": "World's highest mountains" and "Mountain ranges of the world" render as stack cards with a measured `border-left: 1.6px rgb(138,97,22)` (ochre) plus an `EXAMPLE` badge; six sections later "Tibetan / Antarctic / Andean Plateau" render as grid cells with `border-left: 0.8px rgb(203,218,216)` (plain graticule), **no ochre anywhere and no badge** — visually indistinguishable from the "Entries" definition grid on Water environments. A reader who learned "ochre = example" gets no such cue the second time. Compounded by the `bg-relief/5` bug below, which also strips the ochre tint from the stack version. | In `content-unit.tsx`'s `entry` branch, add `border-l-2 border-l-relief` when the section kind is `example` (pass `kind` down from `content-section.tsx:76`). |
| **6b. Two different serifs on every page** | **Friction** | **Every unit title on the site renders in `ui-serif, Georgia, Cambria, "Times New Roman", Times, serif` — not Source Serif 4.** `content-unit.tsx` uses `font-serif` (Tailwind's built-in default) at lines 78, 91, 109, 123, 142, while `h1`/panel `h2` use `font-display` (the `@theme` token). Verified live via `getComputedStyle` on all 17 `h3`s of Water environments, and measured: the string "Highland climate and elevation" renders **305.2px** in the shipped `ui-serif` vs **287.0px** in Source Serif 4 — a 6.3% difference, i.e. two genuinely different typefaces sitting 200px apart on the page. Source Serif 4 *is* downloaded and `loaded` — it is just never applied to card titles. | `font-serif` → `font-display` at `content-unit.tsx:78, 91, 109, 123, 142`. |
| **7. Touch targets, reachability, measure** | **Friction** | At 390×844, measured: chapter pills **61×33px**, topic links **343×35px** — both under the 44px comfortable target (they clear the WCAG 2.2 24px floor, so this is friction, not a failure). More significant, the spec's flagged §8.5 mobile stacking **is** a real problem in practice: on `/chapters/CH1` (9 topics) the `h1` sits at y=584 and the first content card at y=735 in an 844px viewport — **0.69 viewports of pure navigation before the topic title**, so the opening screen on a phone contains no course material at all. On CH4 (4 topics) it is y=372, tolerable. No horizontal overflow anywhere (`scrollWidth` 390 = `innerWidth` 390). Reading measure is well controlled by `max-w-[68ch]` / `[62ch]`. | `py-2.5` on both pill and topic-link classes → 44px. Wrap the mobile topic list in `<details>` (spec §8.5's own suggested fix) — it is worth doing now that it is measured. |
| **8. Accessibility** | **Friction** | **Real wins, verified not assumed:** keyboard `Tab` gives the CH1 pill `outline: 2px solid rgb(79,195,199)` at `offset: 2px` with `:focus-visible` matching — focus is visible and on-token. The reduced-motion guard is present in the *shipped* stylesheet (`@media (prefers-reduced-motion:reduce){*,:before,:after{…animation-duration:.01ms!important…}}`), so `unit-locate` is suppressed. Unit → section heading order is correct (`h1` → `h2 Entries` → `h3 Ocean` …). **Two problems:** (a) the sidebar `<h2>Topics</h2>` (`topic-list.tsx:7`) precedes the page `<h1>` in DOM order, so the document opens on an h2; (b) `<section aria-labelledby>` promotes every group to a **`region` landmark** — "Natural landscapes" exposes six, three of them identically named **"DETAIL"**, which makes the landmark list useless for navigation. | (a) Demote `Topics` to a `<p>` (the `<nav aria-label="Chapter topics">` already names the region), or move the aside after the content in DOM order. (b) Keep the visual `<h2>` but drop `aria-labelledby` from the `<section>` — headings alone already provide navigation and don't create duplicate landmarks. |

### Verified working (checked because it was easy to break)

- **Citation deep-link + highlight-on-arrival survived the redesign.** Clicked a real
  citation from a live tutor answer: URL became `…#unit-e55a19ac-…`, the correct card
  ("Plateau as a high plain") received `data-highlighted="true"`, computed
  `box-shadow: rgb(14,107,114) 0 0 0 2px` (the new 2px meridian ring, replacing `ring-4
  ring-sky-400`), and `animation-name: unit-locate` was running. Works.
  *Minor:* the target lands at `getBoundingClientRect().top === 0` — flush against the
  viewport edge with its section label scrolled off. Add `scroll-mt-8` to the article root.
- **Dark mode is real and complete.** Every screen checked under `emulate colorScheme:dark`
  renders on `#0A1417` with legible ink; no white slabs, no UA-default light chrome on the
  textarea. The diagram white plate (spec §5.9) is a bright rectangle in dark mode but that
  is the spec's deliberate, stated choice — raising it as an open question, not a finding.
- **The graticule motif is a non-issue.** A full-page screenshot appears to show heavy grid
  lines below the fold; that is a `position: fixed` capture artifact of `body::before`.
  Scrolling the real viewport to y=1400 shows a clean ground. *(Inverse observation: in light
  mode the graticule is invisible rather than "barely there" — the decorative motif does not
  actually land. Cosmetic, no action needed.)*

---

## Spec-conformance bugs (quick wins, separate from usability findings)

- **`content-unit.tsx:78, 91, 109, 123, 142`** — `font-serif` instead of `font-display`.
  §3.3 assigns Source Serif 4 to all `h3`/`h3-lg`; `font-serif` resolves to Tailwind's
  built-in `--font-serif` default, so card titles ship in Georgia/Times. → `font-display`.
- **`content-unit.tsx:137`** — `bg-relief/5` on example stack cards **never renders**. Both
  `bg-surface` and `bg-relief/5` are emitted onto the element, and `.bg-surface` appears
  **later** in the shipped stylesheet (byte 18625 vs 18449), so opaque white wins. Verified
  live: removing `bg-surface` from the class list changes the computed background; with both
  present it is `rgb(255,255,255)`, identical to a plain definition card. §4.5 requires the
  ochre tint. → make them mutually exclusive:
  `${kind === "example" ? "bg-relief/5" : "bg-surface"}`.
- **`content-section.tsx:58-63` / `content-unit.tsx:84-95`** — §4.5 says the in-lead roster
  renders unboxed, with its title as an `eyebrow` **mono** label in `--color-deep`. The
  implementation reuses the full `variant="roster"` card (border, `bg-deep/6`, `p-5`) with a
  `h3-lg` **serif** title. Flagging for the record only — on "The seven continents" the
  shipped version arguably reads better than the spec's. Confirm intent, then amend one or
  the other.
- **`content-unit.tsx:12`** — the `learning_note: "Note"` fix from §1.3 is correct but
  **dead**. The corpus' only `learning_note` (CH3 "Earth's position and habitability") is
  always the lead unit, and `variant="lead"` renders no badge. The original "renders with no
  label" symptom is resolved by the lead treatment, not by this map. No action; noted so
  nobody re-tests it.
- **`page.tsx:38`** — §5.6's topic-summary render is dead code. I fetched all 23 live topic
  pages; **0** emit the summary paragraph, confirming the §8.2 suspicion that
  `topic.summary` is unpopulated. Either backfill the data or drop the branch.
- **Quiz styling (§5.8) is unverifiable in production** — 0 of 23 topics have an approved
  quiz, so `QuizCard` never mounts. Not a bug in this pass, but the "Self-check" feature is
  currently invisible to every student.

---

## Overall verdict

**Usable with friction.**

Weighted, as the skill requires, toward the worst-composed real page rather than the demo:
"Natural landscapes and landforms" — mixed types, a takeaway at index 3, and both flavours of
example in one column. The redesign's core claim holds up there. The flat uniform card stack
that this project hit twice is genuinely dead: shape, density and layout now carry the
hierarchy, curated order is untouched, and the 17-unit glossary that the spec called the
site's worst page is now scannable. Dark mode, focus rings, the reduced-motion guard, heading
nesting and the citation deep-link with its highlight all survived the rewrite and were
verified live, not inferred from source. The console is silent on every page.

What keeps it off "ships as-is" is a cluster of small things that all pull in the same
direction — undermining the *distinctions* the redesign exists to make. Card titles ship in
the wrong typeface entirely, so every page quietly mixes two serifs. The ochre example tint
is emitted but loses a CSS cascade race and never paints, and the example *grid* carries no
ochre at all, so "this is an example" is signalled three different ways depending on where you
are — or not at all. Meanwhile the section labels the scheme added are printed twice, once as
an `h2` and again as a near-identical eyebrow 32px below, which is the single most visually
prominent artefact on the messiest page. On the tutor side, a refusal looks exactly like an
answer and a dropped connection says "Failed to fetch" to a student.

None of that is a redesign; it is roughly six one-line changes plus two small conditionals.
The typeface swap (`font-serif` → `font-display`), the `bg-surface`/`bg-relief/5` exclusivity,
and suppressing the redundant badge are the three highest-value edits and would move this to
ships-as-is on their own. The mobile topic-list stacking that the spec flagged as unresolved
is confirmed as a genuine problem — 0.69 viewports of navigation before the title on CH1 —
and is now worth the `<details>` fix rather than another deferral.
