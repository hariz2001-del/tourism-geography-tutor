# Tourism Geography Tutor — Project Instructions

## Product purpose
Build a course-grounded Tourism Geography learning platform. The product is a learning platform first; its persistent side-panel tutor is an assistant across materials, topics, and quizzes.

## Source of truth and trust boundary
- The approved Chapter 1–4 course materials are the Course Brain for the MVP.
- The tutor may explain, summarize, and generate learning activities from retrieved approved content.
- Every learner-facing factual answer must return a chapter and slide/page citation.
- If no relevant approved source is retrieved, the tutor must state that limitation rather than present unsupported information as course fact.
- Do not scrape or incorporate external tourism knowledge into the MVP without an explicit content-approval decision.

## MVP scope
- Include: course-material browser, topic explorer, citation-grounded tutor, basic self-assessment quizzes, anonymous helpfulness feedback.
- Include as of 2026-08-17: username/password login, student and lecturer roles, saved
  bookmarks, reading history, recorded assessment results, and a lecturer dashboard with
  question-bank CRUD and a draft-approval queue.
- Exclude for now: self-registration, public web knowledge, and multiple classrooms.
- The course materials, flashcards, and practice assessments stay open without an account.
  Signing in adds persistence and the dashboards; it does not gate the learning content.
- The UI design/branding is intentionally deferred until functionality is reviewed.

## Quiz policy
- Initial questions are sourced from or derived from approved Chapter 1–4 content.
- A future DeepSeek integration may draft questions from approved content, but AI-generated questions must remain `draft` until lecturer/admin review explicitly approves them.
- The lecturer approval UI now exists at `/dashboard/lecturer/review`. All 208 generated
  questions are still `draft`; approving one is a deliberate act, and the database refuses
  to approve any question that is not complete and traceable to a published, cited unit.

## Architecture preferences
- Use Supabase/Postgres as the system of record.
- Preserve source provenance at content-unit level: source file, chapter, and page/slide are mandatory for published content.
- Keep the initial architecture a modular monolith; do not introduce microservices.
- Store original material files outside Git by default. Commit structure, migrations, scripts, fixtures, and docs—not course PDFs—unless the owner explicitly approves distribution.

## DONGENG methodology — apply to every response and change
1. Premise check — verify the question before answering. Is the assumption correct?
2. Load-bearing flaw — identify the single root cause, not neighbors or symptoms.
3. Probe order — cheapest queries first, highest evidence half-life first.
4. Right-house test — name the concrete, falsifiable experiment that would confirm or disprove the finding.
5. Tripwire check — every number has a tool receipt; every present-tense claim is re-observed; output wins over claim if they disagree.
6. FAME vs FAMILY — distinguish known patterns from novel mechanisms.
7. Use VERIFIED / INFERRED / ASSUMED confidence buckets in reports.

## OMH evidence discipline
- Treat OMH routing, plans, and handoffs as preparation—not proof of implementation, testing, review, CI, deployment, or delivery.
- State observed artifacts separately from proposed work.
- Keep source acquisition, content extraction, and content synthesis distinct.

## Working conventions
- Read relevant files before editing existing code.
- Keep secrets only in local `.env` files. Never commit tokens, database passwords, service-role keys, or original unapproved course materials.
- Add or update automated tests whenever changing the schema or ingestion behavior.
- Make small, reversible changes and verify them before reporting completion.
