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

**Active task: focused UI/UX learner-flow pass (2026-08-16, production release).**
GitHub `main` at `e69043d` is the build source of truth; the Google Drive checkout is
used for the approved local course materials and as the editable handoff workspace.
The current UI/UX change set adds global Course/Guide/Full exam navigation, a skip
link, a `/about` study guide, homepage Start learning / Ask the tutor actions, compact
long topic menus on mobile, a direct mobile tutor jump, assessment return/retry
actions, and valid progressbar semantics. It also fixes clean-checkout test/lint/type
failures exposed when the build was moved out of Google Drive. Validation currently
passes 61 web tests, ESLint, TypeScript, and a production Next.js build; the local
mobile assessment Lighthouse snapshot is 100 across accessibility, best practices,
SEO, and agentic browsing. See `docs/audits/ui-ux-review-2026-08-16.md`.

This batch is released through GitHub PR #1 and the existing Vercel production
project. The production domain must show commit `72543dd` or a descendant before
the release is reported as verified.

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

The content-depth/photo audit build-and-review pass is closed. **Next product work
should be a separately scoped feature decision, with quiz content the highest-value
open MVP item.**

1. Do NOT invent content for "STRUCTURAL GAP" items (Chapter 4's "valley" p18 and
   "beach" p19 headings the deck never delivers content for) — these stay flagged in
   `docs/checklist.md`, not fixed, per the source-fidelity rule.
2. Before authoring quiz records, decide the lecturer review workflow and write only
   questions grounded in the approved Chapter 1–4 material; AI drafts remain `draft`
   until explicitly approved.

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

## Other open items (lower priority than the current audit/fix pass)

From `docs/checklist.md`, not part of the active task but tracked there:
- Quiz content is completely empty (0 rows in `quiz_questions`) — no quiz exists for
  any topic yet.
- No manual dark/light mode toggle exists in the app (only OS-level
  `prefers-color-scheme` is respected).
- A few source-fidelity issues are flagged-but-not-fixed on purpose (e.g. Chapter 3
  has "nine planets" / ocean-name typos in the source slides themselves — see
  checklist for the full list). Per the source-fidelity rule, these get flagged to the
  client, not silently corrected.
