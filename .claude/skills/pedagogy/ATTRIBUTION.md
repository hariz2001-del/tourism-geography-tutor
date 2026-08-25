# Vendored pedagogical skills — attribution and licence

The nine `SKILL.md` files in this directory are **copied verbatim, unmodified** from the
[Education Agent Skills Library](https://github.com/GarethManning/education-agent-skills)
by Gareth Manning (165 skills across 20 domains).

- **Licence:** Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)
- **Copyright:** (c) 2026 Gareth Manning
- **Vendored:** 2026-08-25, from `main`

Under CC BY-SA 4.0 you must keep this attribution, and any adapted or derived version of
these files must be shared under the same licence. **Note the rest of this repository is
not CC BY-SA** — keep derivations of these skills inside this directory so the licence
boundary stays legible.

## Why these nine, and why nested here

They are stored at `.claude/skills/pedagogy/<name>/SKILL.md` — one level deeper than
Claude Code's project-skill discovery path — **on purpose**. Nesting keeps them inert:
they do not register as auto-invocable project skills and cannot fire in ordinary
sessions. The `course-pedagogy-reviewer` agent loads them by explicit path when a review
calls for one. That keeps the upstream files byte-identical and avoids nine unrelated
skills competing for attention during content work.

| Skill | What it audits here |
|---|---|
| `cognitive-load-analyser` | Density and chunking of `content_units` bodies |
| `text-complexity-analyser` | Readability of bodies against learner level |
| `dual-coding-designer` | Whether `diagrams.ts` / `content-images.ts` visuals earn their place |
| `retrieval-practice-generator` | Quality bar for quiz items |
| `elaborative-interrogation-generator` | Why/how prompts over transcribed fact lists |
| `assessment-validity-checker` | The 208-question bank: construct validity, alignment |
| `feedback-quality-analyser` | The 80 written-answer `subjective_answer_scheme` entries |
| `learning-progression-builder` | Unit ordering within and across topics |
| `udl-lesson-auditor` | Access barriers in the learner experience |

## Considered and rejected

- **`curriculum-alignment/coverage-audit`** — the highest-value audit available, and
  currently **blocked**. It needs the official DTM10333 syllabus / course learning
  outcomes as its framework input. The repo has no machine-readable copy:
  `data/course-materials/fyp cb.pdf` is a single image-only page with no text layer.
  Obtain the syllabus from the client and this becomes the first review to run.
- Generative design skills (`backwards-design-unit-planner`, `explicit-instruction-*`,
  `project-brief-designer`, and similar) — they author new teaching content, which
  collides head-on with this project's source-fidelity rule. Excluded deliberately.
- The `student-learning` domain (`retrieve-first-gate`, `explain-first-interrogator`,
  `ai-claim-checker`, `progressive-hint-ladder`) — genuinely interesting as *product
  features* for a tutor app, but they shape live AI-learner interaction rather than
  review existing content. Out of scope for this agent; worth a separate look.
