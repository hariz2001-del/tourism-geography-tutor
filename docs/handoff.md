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

**A content-fidelity incident has been remediated across all four chapters (last updated
2026-08-25). The re-scan is complete; one policy ruling is still blocked on the project owner,
and `main` is deployed through 2026-08-25. A second workstream — pedagogical quality — is now
running.**

**Read these three files before touching anything:**
- `docs/remediation-progress-2026-08-21.md` — **the live resume point.** Per-unit DONE state,
  rollback pointers, and what is mid-flight. Read this first if a session died.
- `docs/content-fidelity-remediation-plan-2026-08-21.md` — the six-phase plan and its sequencing.
- `docs/ch1-pdf-vs-db-discrepancies-2026-08-21.md` — the Chapter 1 findings in full.

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

Still open from the review: topic-level elaboration prompts (~23, to lift germane load — 73% of
units are bare definitions), which need a UI slot first; and the quiz-bank review of all 208
questions, which needs the service-role key and a separate pass.

**Ask the client for a machine-readable DTM10333 syllabus.** It unblocks a coverage audit — the
one check that would tell us whether the app covers what the course promises — and it would settle
the learner reading-level assumption the review's Chapter 1 finding rests on.

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

### Git state

Branch **`agent/content-fidelity-remediation`**, off `main` at `6bd5d64`. Nine commits, one per
chunk, working tree clean, **nothing pushed**. The first commit is unrelated pre-existing
2026-08-20 doc work found uncommitted in the tree and preserved separately.

**Build and test from `C:\Users\User\dev\tourism-geography-tutor`,** not the Google Drive
checkout — see the working-directory note further down.

**`SUPABASE_SERVICE_ROLE_KEY` is deliberately never stored on this machine.** `vercel env pull`
returns it as the literal string `"[SENSITIVE]"`. `web/.env.local` holds the Supabase URL, the
anon key, and the DeepSeek key.

### Older open items, still valid but lower priority than the remediation

1. **Investigate the GitHub to Vercel production hook.** Merging PR #6 to `main` produced no
   Production deployment after ten minutes; only the branch push produced a Preview. Worked around
   with `npx vercel promote <preview-url>`. **If a future merge looks like it failed to build, run
   `npx vercel ls` before assuming anything broke.**
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

**Superseded 2026-08-21.** This section previously read "the content-depth/photo audit
build-and-review pass is closed" and pointed at feature work. That is no longer true: the pass it
called closed is the one that introduced the fabrications described in "Right now". Do the
remediation before any new product work.

In order:

1. **Finish the Chapter 2 re-scan** (dispatched, may need re-dispatching), then **Chapter 3**.
   Same method: two Sonnet scanners, main-thread comparison re-verified against the raw text
   layer, then an independent Opus verifier. Do not skip the Opus pass — it has already caught
   findings the main thread missed on both chapters it has run against.
2. **Get the project owner's ruling on the silent-correction policy**, then apply it uniformly
   across all four chapters in one batch. This is Phase 3/4 of the plan and it blocks nothing
   else, so it can wait on the owner while scanning continues.
3. **Re-audit the 208 draft quiz questions against the corrected bodies.** One of the four
   Chapter 1 questions checked so far was contaminated by a fabricated body, and its marking
   criterion could fail a learner for the source-correct answer. The other 204 have not been
   checked. Do this **after** the chapter re-scans, so the questions are checked against final
   text rather than text that is about to change again.
4. **Update `.claude/skills/course-content/SKILL.md`** with the two lessons from this incident:
   never copy a quotation from a secondary document into the database (re-read the PDF page), and
   the corrected tooling note — `pymupdf` in `.venv` renders slides to JPEG, contradicting the
   skill's current claim that no rasterizer is available.
5. Only then return to feature work, with quiz approval the highest-value open MVP item.

Standing constraints that still apply:

- Do NOT invent content for "STRUCTURAL GAP" items — Chapter 4's "valley" (p18) and "beach" (p19)
  headings that the deck never delivers content for, and now also p7's third classification
  bullet, which has no category label unlike the other three. These stay flagged in
  `docs/checklist.md`, not fixed, per the source-fidelity rule.
- AI-drafted questions remain `draft` until explicitly approved, and must be grounded in a
  published, cited source unit.

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
