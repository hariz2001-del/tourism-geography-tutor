# UI/UX review — learner orientation and practice flow

**Date:** 2026-08-16

**Baseline:** GitHub `main` at `e69043d`

**Scope:** landing page, CH2 large-topic navigation at 390 px and 320 px, tutor reachability, topic-practice entry and assessment page, keyboard/ARIA structure, loading/error code paths
**Methods:** production and local Chrome DevTools snapshots, mobile/desktop viewport emulation, console/network inspection, Lighthouse snapshot audits, source review, and clean-checkout tests/build. A real screen-reader pass was not available, so screen-reader behavior is inferred only where native semantics and the accessibility tree were directly observed.

## Adversarial learner

**Aina**, a 19-year-old hospitality student revising on a budget Android phone before class. She is comfortable with WhatsApp but impatient with dense menus. Her goal is to read one topic, ask one question, take the topic quiz, and get back to the lesson without wondering where she is.

> “Why do I have to scroll past every climate topic before I can see the topic I already chose? I can take the quiz, but once I am there it feels like I left the course completely. The tutor exists somewhere at the bottom of a long lesson, so I would assume it is not available on mobile.”

## Filtered findings

| Finding | Verdict | Observed evidence | Resolution |
|---|---|---|---|
| Long mobile topic menu delays the selected lesson | RED | At 390 px the CH2 topic nav was 424.5 px tall and the lesson `h1` began 614.5 px from the top; at 320 px the first viewport was dominated by eight topic links. | Long CH1/CH2 menus now start collapsed with the selected topic in the summary; short CH3/CH4 menus remain open. |
| Tutor is difficult to discover on mobile | RED | In the CH2 seven-continents flow the tutor began around 2,530 px down the page, after all lesson content. | Added a mobile **Ask tutor** jump next to Topic quiz and Chapter mini exam, targeting the focusable tutor section. |
| Assessment is a navigation dead end | RED | The topic assessment contained zero links before the change; there was no route back to the source topic and no post-result retry path. | Added a contextual return link before the assessment and Return/Try another set actions on results. |
| Assessment progress uses invalid ARIA | RED | Lighthouse flagged `aria-label` on a generic `<div>`; baseline mobile snapshot scored 95 accessibility and 0 agentic browsing. | Added `role="progressbar"` plus `aria-valuemin`, `aria-valuemax`, and `aria-valuenow`; re-audit scored 100 in both categories. |
| Landing page does not explain the study loop | GREEN | The configured home page moved directly from its introductory sentence to four chapter cards. | Added Start learning / Ask the tutor actions and a compact Read → Ask → Practise orientation. |
| No consistent global wayfinding or guide | GREEN | Chapter and practice pages had no shared site header; `/about` did not exist. | Added a global Course/Guide/Full exam header, keyboard skip link, and a source-trust-focused study guide. |
| Several generated MCQs read awkwardly | GREEN | Examples included “Which course item is described here? is the…” in the live bank. | Resolved in the 2026-08-16 content follow-up: all 208 questions were reviewed, 140 stems and 34 Chapter 2 option sets were rewritten, learner-visible pipeline language was removed, and MCQ options are now shuffled at display time. |

## Accessibility and verification

- Mobile reflow was checked at 390 px and 320 px with no horizontal overflow.
- Primary, chapter, topic, tutor, return, retry, and submit controls now meet a 44 px minimum target through `min-h-11` or larger rendered boxes.
- The local topic-assessment Lighthouse snapshot passed accessibility, best practices, SEO, and agentic browsing at 100.
- The checked local assessment route had no console errors/warnings and all observed document/RSC requests returned 200.
- Clean GitHub checkout validation passed 61 Vitest tests, ESLint, TypeScript, and `next build`.

## Overall verdict

**Usable with the main mobile friction removed.** The learner can now understand the product from the landing page, reach lesson content without scrolling through a long topic roster, jump directly to the tutor, enter an assessment without losing course context, and retry or return afterward. Remaining UI items are feature decisions rather than blockers for the current learner loop.
