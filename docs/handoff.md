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

**Nothing is in flight (state checked 2026-08-20).** `main` is clean and in sync with
`origin/main` at `6bd5d64`; `agent/learner-accounts` is merged, so there is no unpushed work
anywhere. Production answers 200 on `/`, `/login`, and `/flashcards`. The last release was
2026-08-18 and nothing has changed since — whoever picks this up is starting from a green,
deployed state, not resuming a half-finished task.

**If you are a new agent on this project, read in this order:** this file, then
`docs/checklist.md` for the dated history, then `AGENTS.md` for the hard rules, and
`.claude/skills/course-content/SKILL.md` before touching `content_units` (draft →
source_references → publish, insert-before-delete, ordering-via-`created_at`, and the
PostgREST embedded-filter gotcha). The two rules that bite hardest: **never invent course
content** — every fact traces to a PDF in `data/course-materials/`, and apparent source errors
get transcribed faithfully and flagged in `docs/checklist.md` rather than silently corrected —
and **insert-then-delete**, never delete-then-insert, when replacing a `content_units` row.
Work in small committed chunks; a background agent was once interrupted between a delete and
its replacement and left the live site with no content for a topic.

**Build and test from `C:\Users\User\dev\tourism-geography-tutor`,** not the Google Drive
checkout — see the working-directory note further down. Content is served live from Supabase
at runtime, so database writes are visible in production without a Vercel deploy.

**`SUPABASE_SERVICE_ROLE_KEY` is deliberately never stored on this machine.** `vercel env pull`
returns it as the literal string `"[SENSITIVE]"`. Anything needing it either runs against
production (which has the real key) or waits for the owner to supply it for that session.
`web/.env.local` holds the Supabase URL, the anon key, and the DeepSeek key.

**Open items, roughly in the order they are worth doing:**

1. **Investigate the GitHub → Vercel production hook.** Merging PR #6 to `main` produced no
   Production deployment after ten minutes; only the branch push produced a Preview. Worked
   around with `npx vercel promote <preview-url>`, after confirming
   `git rev-parse origin/main^{tree}` matched the tested build's tree exactly, so promoting was
   equivalent to building `main`. This doc used to claim "push to `main` = production deploy,
   no manual step" — that was not true on that occasion. **If a future merge looks like it
   failed to build, run `npx vercel ls` before assuming anything broke.** Fixing this de-risks
   every future release, which is why it is first.
2. **Phase 2, not started: the AI PDF-to-questions importer for lecturers.** Needs a Node-side
   PDF text extractor — `unpdf` is the serverless-friendly pick; the repo's Python/`pymupdf`
   tooling will not run on Vercel. Extracted questions must land as `draft` and be given a topic
   and a published, cited source unit before they can be approved, per the source-fidelity rule.
3. **Lecturer features scoped but not built:** item analysis (% correct per question from real
   attempt data), manual mark override on auto-graded written answers, CSV export of the roster,
   and a review queue surfacing the source defects the checklist flags but deliberately leaves
   unfixed.
4. **All 208 generated questions are still `draft` / `generated_by='deepseek_draft'`.** The
   lecturer approval queue now exists and the database refuses to approve a question that is not
   complete and traceable to a published, cited unit — but nothing has actually been approved
   through it yet. The owner enabled the draft bank for learner practice on 2026-08-12 knowing
   this.
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
