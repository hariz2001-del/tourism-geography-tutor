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

**Status of the audit itself:** `docs/content-depth-photo-audit-2026-08-09.md` is the
working document. As of this doc's last update:
- Chapter 2 (`chapter-2.pdf`) — audited, complete.
- Chapter 4 (`chapter-4.pdf`) — audited, complete (all 27 pages).
- Chapter 1 (`chapter-1.pdf` / `chapter-1-candidate-a.pdf`) — audited, complete.
- Chapter 3 (`chapter-3.pdf`) — **not yet audited.** This is the only remaining gap in
  the audit itself. See "Next step" below.

**Status of the fix/build pass:** not started at all. The audit file so far is
findings-only — no DB writes, no image extraction, no `content-images.ts` entries have
happened yet for this pass. Every "SHALLOW" / "PHOTO OPPORTUNITY" / "MISSING CONTENT"
item in the audit file is still open.

**Why work is being done directly instead of via subagents:** large parallel subagent
dispatches (both the audit pass and an earlier design-fix pass) repeatedly hit an
account-level session/usage rate limit mid-task and died silently. Direct main-thread
tool calls (shell, file read/write, browser devtools) do not seem to be affected by
this limit and have worked reliably throughout. Until that's no longer true, prefer
doing this work directly, in small chunks, saving/committing after each chunk, over
dispatching a big subagent for it.

## Next step

1. Audit Chapter 3 (`data/course-materials/chapter-3.pdf`, 11 pages, ~650KB — small
   enough to `Read` as a whole file directly, no need to split it). Follow the exact
   method and write-up format already used for Chapters 1/2/4 in
   `docs/content-depth-photo-audit-2026-08-09.md` — read that file first for the
   format (per-page findings: body-vs-source diff, SHALLOW/MISSING/STRUCTURAL GAP
   callouts, PHOTO OPPORTUNITY callouts with position/size/confidence). Also see
   `.claude/skills/course-content/SKILL.md`'s "When asked to audit for oversimplification"
   section.
2. Append the Chapter 3 section to `docs/content-depth-photo-audit-2026-08-09.md`
   (don't rewrite the existing Chapter 1/2/4 sections). Commit after.
3. Once all 4 chapters are audited, do the build/fix pass:
   - Enrich shallow `content_units.body` rows with the missing source detail found.
   - Extract the identified real photos from the PDFs (technique in the course-content
     skill) and populate `web/src/lib/course-brain/content-images.ts` (currently an
     empty scaffold — `Record<contentUnitId, ContentImage>`).
   - Fix the one known citation error: content unit `e6f73628` ("Tundra climate") is
     cited to page 21 but its content is actually on page 22 of `chapter-2.pdf`.
   - Decide what to do about the "MISSING CONTENT" tables the audit found with no
     corresponding content unit (e.g. Chapter 4 p18 "largest deserts" table, p19
     continental-landmasses table, p20 sea/ocean ranking table) — these need new
     content units created, not existing ones edited.
   - Do NOT invent content for the "STRUCTURAL GAP" items (e.g. Chapter 4's "valley"
     and "beach" headings that the source deck never actually delivers content for) —
     flag those to the client instead, per the course-content skill's source-fidelity
     rule.
   - Test, build, deploy, and independently re-verify each fix (don't just trust a
     subagent's self-report — check the actual rendered result), per the workflow
     below.
4. Once the build/fix pass is done, run an independent review pass against the live
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
