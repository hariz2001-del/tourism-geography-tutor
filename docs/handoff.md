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

**Status of the fix/build pass: in progress, on both tracks.**

*Photo extraction* (`web/src/lib/course-brain/content-images.ts`): well underway.
Populated so far, in the audit's recommended order: Chapter 4 p24 (4 photos), all 5
Chapter 3 photo/diagram opportunities (p3, p4, p6, p7, p10), Chapter 1's 4 named-landmark
photos (p13 Plaza de España, p14 KL skyline, p15 travel route, p30 Hagia Sophia), and
Chapter 2's Middle latitude climate photos (p18 Mediterranean, p20 marine-west-coast +
NE-US satellite). Still open: the rest of Chapter 2 (p14/15 tropical, p16/17 dry, p19
forests, p22 tundra/ice-cap, p23 highland), most of Chapter 4 (p2–p21), and most of
Chapter 1 (p3–p19 topic photos, plus p13's Tower Bridge/Galata Tower and p14's dancer
photo). See the audit's "Recommended extraction order" for the next chunk.

*DB-write work* (Supabase, `content_units`/`source_references`): started 2026-08-11.
Done so far: the one known citation fix (Chapter 2 `e6f73628` "Tundra climate," p21→p22),
and the 3 flagged missing-table units (Chapter 4 "Largest deserts" p18, "Continental
landmasses" p19, "Largest bodies of water by area" p20) — all published and verified live.
DB is at 128 published content units. **Not started yet:** the much larger
body-enrichment pass — several dozen `content_units.body` rows across all 4 chapters
the audit flagged **SHALLOW** (dropped named examples, numbers, or sub-details their
source page actually gives). See `docs/checklist.md`'s 2026-08-11 entry for the exact
scope done vs. open.

**Why work is being done directly instead of via subagents:** large parallel subagent
dispatches (both the audit pass and an earlier design-fix pass) repeatedly hit an
account-level session/usage rate limit mid-task and died silently. Direct main-thread
tool calls (shell, file read/write, browser devtools) do not seem to be affected by
this limit and have worked reliably throughout. Until that's no longer true, prefer
doing this work directly, in small chunks, saving/committing after each chunk, over
dispatching a big subagent for it.

## Next step

Read `docs/content-depth-photo-audit-2026-08-09.md`'s final "Audit complete" section
for the recommended photo-extraction order. Two tracks remain open, either can be
picked up next:

1. **Photo extraction** — continue down the recommended order into Chapter 2's
   remaining opportunities (p14/15 tropical, p16/17 dry, p19 forests, p22 tundra/ice-cap,
   p23 highland), then the bulk of Chapter 4 (p2–p21) and Chapter 1 (p3–p19), populating
   `web/src/lib/course-brain/content-images.ts`. Technique is in
   `.claude/skills/course-content/SKILL.md`'s image-extraction section. Do this in
   chunks and commit after each chunk.
2. **Body enrichment** — the bulk of remaining DB-write work: several dozen shallow
   `content_units.body` rows across all 4 chapters (see the audit doc's **SHALLOW**
   markers for the full list, chapter by chapter). Follow the DB-write mechanics in the
   course-content skill (draft → add `source_references` → publish; never
   delete-then-insert). ~~Fix the one known citation error~~ and ~~add the 3 known
   missing tables~~ — **done 2026-08-11**, see `docs/checklist.md`.
3. Do NOT invent content for the "STRUCTURAL GAP" items (e.g. Chapter 4's "valley"
   and "beach" headings that the source deck never actually delivers content for) —
   flag those to the client instead, per the course-content skill's source-fidelity
   rule.
4. Test, build, deploy, and independently re-verify each fix (don't just trust a
   subagent's self-report — check the actual rendered result), per the workflow
   below.
5. Once the build/fix pass is done, run an independent review pass against the live
   site before considering this done (see "Standing workflow" below).

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
