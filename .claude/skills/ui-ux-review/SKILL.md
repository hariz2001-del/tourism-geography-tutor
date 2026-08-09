---
name: ui-ux-review
description: Evaluates UI/UX quality for the Tourism Geography Tutor against usability heuristics tailored to a reference/reading product — not just visual-system conformance. Use when critiquing an existing screen, reviewing a design implementation against its spec, or judging whether a student could actually read/scan/use a page without confusion. Adapted from a sibling project's ui-ux-designer/ui-ux-evaluator skills (Aztech Calli), retargeted from a stressed-cashier POS context to a reading/reference context.
---

## What this skill does

Judges whether a screen is *usable and legible*, not just whether it matches a design spec. A design spec (e.g. `docs/design-spec-<date>.md`) defines *how things should look*. This skill defines *whether the result actually works* for a student scanning a topic page for the fact they need, or a tutor-panel user waiting to see if their question got answered. Use it to review an implementation after it's built, or to sanity-check a design before it ships.

## Heuristics, in priority order

### 1. Hierarchy is legible at a glance, not just on close reading
A reader should be able to tell a topic's opening definition apart from its list of examples apart from a synthesizing takeaway *without reading every word* — from shape, spacing, and position alone. If every content block is the same size/border/shape with only a small badge differing, this fails regardless of how correct the badge text is. This is the core failure mode this project has hit twice (flat, uniform card stacks).

### 2. Sub-grouping reflects real structure, not decoration
Section groupings (e.g. "At a glance" / "Entries" / "Examples" / "Key takeaways") must correspond to an actual structural difference in the content, not be applied for visual variety. Check a grouping algorithm's output against a few real, data-dense topics (not just the tidiest one) — a scheme that looks good on a 3-unit topic and falls apart on a 17-unit glossary topic is broken.

### 3. State must always be legible
For anything interactive (tutor Q&A, quiz), the screen should answer without ambiguity: is this loading, did it fail, did it succeed, what will the primary action do. Silent state (a submit button with no loading indicator, a failed fetch with no visible error) is a bug, not a rough edge.

### 4. Empty and loading states are not optional
"No approved material is available for this topic yet" and the tutor's pre-answer state are real states a real user hits — not just implementation placeholders. Judge whether they read as intentional, not broken.

### 5. Citations must read as authoritative, not buried
This is a course tool — a claim's source (file/page, or an AI-generated flag) is part of what makes it trustworthy. A citation styled identically to decorative metadata, or visually weaker than the claim it supports, undermines the product's core value proposition.

### 6. Consistency of mental model across the app
A pattern learned on one topic page (how an "example" looks, how a citation link behaves, what a highlighted/deep-linked unit looks like) should hold everywhere. A grid-entry card and a stacked-prose card representing the same `content_type` should still feel like the same *kind* of thing wearing different clothes, not unrelated components.

### 7. Touch targets, reachability, and reading measure
Nav pills, topic links, and buttons meet real touch-target sizing on mobile. Body text sits within a readable measure (roughly 60–75 characters per line) rather than stretching full-width on wide viewports.

### 8. Accessibility is load-bearing, not a checklist
Heading order (`h1` → section `h2` → unit `h3`) must be real, not just visually implied. Colour is never the sole carrier of meaning (a coloured accent needs a text label or icon too). Focus states must be visible on every interactive element. Verify against actual DevTools tools (accessibility tree, `prefers-reduced-motion` emulation), not by inspecting class names and assuming.

## Review workflow

1. **Read the spec** the implementation claims to follow (if one exists) — know what was intended before judging what was built.
2. **Look at the real, live result** — navigate the actual site (chrome-devtools tools if available) across a *range* of topics: a small stub topic, a large glossary-style topic, a topic with mixed content_types, not just the one screenshot in the spec's own acceptance table. Screenshot what you check.
3. **Read the component code** for every state a screen can be in (loading/error/success/empty), not just the happy path.
4. **Score each heuristic**: Pass / Friction / Broken, with concrete evidence (a screenshot description, a file:line, or both).
5. **Separate spec-conformance bugs from usability findings.** "This class doesn't match §5.4 line X" is a conformance bug — quick, mechanical, list it separately. "This grouping is technically per-spec but unreadable on topic Y" is a usability finding — the more important kind, and the reason this skill exists alongside plain code review.
6. **Propose the smallest concrete fix** for anything scored Friction or Broken — not a redesign.

## Output format

```
## Screens/topics reviewed
[list — include at least one small, one large, one mixed-type topic]

## Findings
| Heuristic | Verdict | Evidence | Fix |
|---|---|---|---|
| ... | Pass/Friction/Broken | screenshot/file:line | ... |

## Spec-conformance bugs (quick wins, separate from usability findings)
- file:line — [deviation from spec] → [fix]

## Overall verdict
**Ships as-is** / **Usable with friction** / **Would confuse or lose the reader** —
one paragraph, weighted toward the worst-composed real topic you checked, not
the cleanest one.
```

## Common pitfalls

- Don't judge only the topic the spec used as its lead example — that one was tuned first and will always look best. Judge the messiest real topic in the corpus too.
- Don't flag a spec-literal implementation as a *usability* problem just because you'd have designed it differently — that's a design disagreement, raise it as an open question, not a Broken verdict.
- Don't skip states that are hard to trigger (an actual network error, an actual empty topic) — these are exactly where real usability bugs hide.
- A "Pass" needs the same evidence bar as a "Broken" — cite what you actually saw, don't assume conformance from reading source alone when the live site is checkable.

## Origin

Adapted 2026-08-09 from `ui-ux-designer.md` / `ui-ux-evaluator.md` in the sibling `aztech-calli` project (a POS system), whose heuristics were tuned for a stressed cashier mid-rush. This project is a reading/reference tool, not a high-pressure transactional one — heuristics about destructive-action confirmation, brand-switching, and gloved-hand touch targets were dropped or replaced; the underlying discipline (concrete evidence, Pass/Friction/Broken scoring, separating conformance bugs from usability findings, judging the worst real case not the demo case) carried over directly.
