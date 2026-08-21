# Chapter 1 — PDF vs database discrepancy report (2026-08-21)

**Method.** Two independent scanners, two passes each. One read all 33 slides of
`data/course-materials/chapter-1.pdf` as rendered images plus the PDF text layer; the other
read the live Supabase CH1 rows (read-only). Their inventories were then compared, and every
finding below was **re-verified by the main thread directly against the raw PDF text layer** —
not accepted on the scanners' word.

Pages 1, 20, 30 and 31 have no usable text layer and were recovered by reading the page images
(the OCR path). Page 20's diagram, page 30's Battour & Ismail abstract and page 31's Tourism
Queensland insert are three of the richest pages in the deck and exist *only* as images.

**Confirmed identical source.** The DB cites `chapter-1-candidate-a.pdf`; the local file is
`chapter-1.pdf`. `docs/course-material-inventory.md` records the three Chapter 1 candidates as
**byte-identical by SHA-256**, with matching page-level extracted-text hash sequences. That —
not the shared 33-page / 31-extracted / 2-`needs_ocr` signature, which all three candidates
share and which therefore proves nothing on its own — is what makes them the same document. The
differences below are not a wrong-PDF artefact.

**Headline.** The database holds 40 published units over 9 topics, all published, all cited,
no orphans. Coverage is broad. But **three units contain statements that are not on their slide
at all**, and all three were introduced by the 2026-08-11 body-enrichment pass, which
implemented `docs/content-depth-photo-audit-2026-08-09.md`'s transcription rather than the slide
itself.

**Treat that audit document as an untrusted source of quotations, chapter-wide.** Its
`Source:` strings are the demonstrable origin of all three fabrications, four of the five Tier-3
drift items, and the p31 Queensland generalisation. Patching individual entries is not
sufficient — the document reads as authoritative and is not.

**Verification.** Every claim in this report was independently re-checked against the primary
sources by a separate Opus pass (`scratchpad/ch1_verification.md`). All nine original claims
were CONFIRMED; the verifier found one additional fabrication (p30) and six places where this
report under-reached, all now folded in. No claim made here about slide content was found to be
false.

---

## Tier 1 — Source-fidelity violations (content in the DB that is not in the deck)

These break the project's hardest rule. Both are live to learners now.

### 1. p6 — `90510d10` "Why geography matters to tourism"

The slide's five lettered reasons, verbatim from the text layer:

- **A** "To understand the world better – climate, currencies etc"
- **B** "People travels to experience the difference ambience"
- **C** "Improve our knowledge of recognizing the main attraction/destination of the world"
- **D** "To expand the function of the world"
- **E** "Provide a lot of job opportunities"

Current body: *"Geography helps learners: recognize places on the world map; understand that
people travel to experience different ambiences; understand world conditions such as climate,
currency, and transportation; expand the function of the world; and recognize career
opportunities in tourism."*

| Problem | Detail |
|---|---|
| Invented term | **"transportation"** appears nowhere on p6. Reason A stops at "climate, currencies etc". |
| Invented narrowing | **"career opportunities in tourism"** — E says only "job opportunities", with no tourism qualifier. |
| Wrong content | "recognize places on the world map" is not A; C is about recognizing "the main attraction/destination of the world". |
| Wrong order | The body leads with C's content presented as the first reason. |

The 2026-08-09 audit transcribed A as "To make us realize about places on the world map", C as
"To have knowledge about the world conditions such as climate, currency, transportation" and E
as "To realize about the career opportunity in tourism". None of those strings are on the
slide. The enrichment pass then faithfully encoded the mis-transcription.

### 2. p29 — `10f721f6` "Business and professional tourism"

Slide, verbatim:

- "includes all those who are attending the trade fairs and conferences or participating in incentive travel schemes."
- "The business travellers use the same facilities as those travelling for pleasure and **they are not permanent employees or residents of the host destination**"
- "**Therefore they must be included in any definition of tourist. They are constrained in terms of where and when to travel.**"

Current body: *"Business and professional tourism includes trade fairs, conferences, and
incentive travel. It is characterized by the decision to travel and the choice of destination
often not being made by the traveller. Business travellers use the same facilities as leisure
travellers, but their preferences may differ — they are less affected by price and generate
more revenue."*

Only the first sentence is source-grounded. **"the decision to travel and the choice of
destination are often not made by the traveller"** and **"less affected by price and generate
more revenue"** are on no CH1 slide. Meanwhile the slide's actual analytical payload — that
business travellers are not permanent residents and *therefore must be counted as tourists*,
and that they are constrained in where and when they travel — is absent.

Note the irony: the audit called this "the single worst omission in Chapter 1", and the fix
replaced a thin-but-true body with a fuller but partly fabricated one.

### 3. p30 — `571f3d66` "Halal tourism"

Slide 30 has a zero-length text layer; it reproduces the Battour & Ismail (2015) abstract as an
embedded screenshot. Verified four independent ways — the page image, a 6× clipped re-render, the
extracted embedded raster at native resolution (614×347 JPEG), and a direct read by the main
thread. All agree the abstract reads:

> "Halal tourism can be summarized by any object or action which is permissible to use or engage
> in tourism industry, according to Islamic teachings."

Current body: *"Halal tourism (Battour & Ismail, 2015) refers to any object or activity that is
permissible to use or engage in **by Muslims** within the tourism industry, according to Islamic
teachings."*

**"by Muslims" is not on the slide.** The published journal paper does carry that phrase, but the
deck reproduces an abridged abstract, and the project rule is that the slide governs. The 2026-08-09
audit asserted the slide said "by Muslims" and explicitly instructed that it be added; the
2026-08-11 pass complied.

The rest of the unit is sound — the "Therefore…" success condition is on the slide, and the
attribution is supportable from the author line, journal header and copyright line. **The fix is a
two-word deletion.**

**Escalate this one to the client rather than batching it silently:** it narrows a definition along
a religious-participation axis, which is a more sensitive edit than the other two.

---

## Tier 2 — Real content genuinely missing

### 3. p21 — `23d2636a` "Distance, connectivity, and attractiveness in tourist flows"

The audit marked this page **"Verified, nothing to do."** It is not. The slide gives:

> Williams and Zelinsky (1970)
> - Selected **14 countries** that had relatively stable tourist flows over a few years, which accounted for the bulk of the world's tourist traffic.
> - a) Distances between countries **(the greater the distance, the smaller the volume of flow)**.
> - b) International connectivity **(shared business or cultural ties between countries)**.
> - c) The general attractiveness of one country for another.

The body names the three factors and the citation but drops the study design (14 countries,
stable flows, bulk of world traffic) and **both parentheticals — which carry the only actual
analytical claims on the page**: the inverse distance/volume relationship, and the definition
of connectivity. This is the largest genuine content gap in the chapter.

### 4. p31 — `7e0adbdc` "Grey tourism (seniors)"

**Tiering note:** the Queensland half of this finding is arguably Tier 1, not Tier 2. Dropping a
geographic scope does not merely omit information — it converts an attributed, Queensland-specific
research finding into an unqualified general claim, which is the DB asserting something the slide
does not. It is also internally inconsistent with `d88c8e92` on the same page, which *does* retain
"in Queensland", so the contradiction is visible to learners. Fix it in the Tier 1 chunk.

Slide: *"the seniors market presents a golden opportunity for expanding **Queensland's**
domestic market"*, and *"They have more leisure time than younger people and **choose to spend
more of this time travelling**. Seniors also have high levels of discretionary income, and
**choose to spend a greater percentage of this on travel** than younger people."*

Body generalises Queensland's domestic market to *"the domestic tourism industry"* — turning a
Queensland-specific research finding into an unqualified global claim — and compresses the two
behavioural findings into *"have more discretionary income and free time available for
travel"*, losing the point that seniors **choose to spend more of both on travel**.

### 5. p22 — `57aa58f3` "Volume statistics"

Missing the slide's second line, *"Provide basic count of the volume of tourist traffic."* Low
severity; arguably redundant with the first.

---

## Tier 3 — Minor drift (wording added or softened, no invented facts)

| Page | Unit | Drift |
|---|---|---|
| p3 | `8b79a0ba` | Body reads "a science of nature **and** circulation"; slide reads "a science of nature circulation". |
| p15 | `a92b84df` | Drops "**key element in the system**" and "and **characteristics**" from bullet 2. |
| p17 | `68fb52c1` | Slide: pull factors "match **push factors** that potential tourist have". Body: match "potential tourists' **motivations**". |
| p18 | `b64ba9e3` | Adds "in the generating area" to the climate bullet (not on slide) and softens "provide a **strong impetus** to travel" to "influence tourists to travel". |
| p28 | `6f990b48` | Drops the slide's in-line abbreviation "**[VFR]**". |
| p4 | `312f4696` | Slide gives two senses of "topography" — "the surface shapes and features themselves, **or** a description (especially their depiction in maps)". Body keeps only the second. |
| p27 | `00b45e0c` | Slide: "Forms of tourism based on **its market**, in terms of the purpose of visit". Body drops "based on its market" — the organising principle of the whole p24 "THE MARKET" section, carried by no other unit. |
| p5 | `8b013727` | DB **silently corrects three flagged source defects** and re-parses the sentence: slide's three comma-separated items ("understanding internation, concerns of multi-cultural and educations of environmental") become "international concerns, multicultural awareness, and environmental education" — welding two items into one and inventing the head noun "awareness". |
| p23 | `c6e926f2` | DB silently normalises the slide's "**spends** in another" to "spent". Defensible as paraphrase, but decide it consistently with p3 and p5. |
| p31 | `d88c8e92` | Objective 2 "what seniors are looking for in a **tourism** experience" → "**holiday** experience". Objective 4's subject shifts from "tourism businesses targeting the seniors market" to "the seniors market". |
| p33 | `1feb7dff` | Adds "**discussed in this chapter**", not on the slide. Lowest severity; note only. |

**Note the pattern in p3, p5 and p23:** the database has already silently corrected source defects
that this report's own "flag, don't fix" list says must be preserved. That is a policy
inconsistency, not just wording drift — the same class of decision is being made both ways in
different units. It needs one ruling from the client, applied uniformly.

---

## Tier 4 — Structural observations (no fix without a decision)

- **p24 has zero content units.** It is the section index for the rest of the chapter, six
  tiles: "TYPES OF DESTINITION", "TYPES OF TOURISM", "THE MARKET", "COMMON INTEREST TOURISM",
  "BUSINESS AND PROFESSIONAL TOURISM", "DISTANCE OF TRAVEL". Defensible as a contents slide
  with no teachable content of its own. Worth noting only that the DB's topic names do not use
  the deck's own six-section vocabulary.
- **p26's five named tourism types sit in one merged unit** (`0d3cb1ed`): Rural, Urban,
  Heritage, Cultural, Eco-Tourism. This is the same one-entity-one-unit pattern the client
  originally flagged for continents/oceans. **Correctly left merged** — the deck names all five
  and defines none, so splitting would require inventing definitions. Flag to the client, do
  not fix.
- **Chapter summary and all 9 topic summaries are NULL.** No topic in CH1 has any summary text.
- **Pages 1, 2, 10, 12, 16 carry no teachable content** — title and section-divider slides.
  Confirmed by image, not assumed. Their zero-coverage is correct.
- **"Youth tourism" / "Gay tourism"** (`e1b66746`, `1ed16972`) are 202-character near-duplicate
  stubs. **This is correct source fidelity** — p32 names youth, grey and gay tourism and
  elaborates none of them. Not a defect.

---

## Source defects — transcribe faithfully, flag, do not silently correct

Per the standing rule these stay as-is in the deck and are reported to the client:

- p5 "internation", "concerns of multi-cultural", "educations of environmental"
- p6 heading "INRELATED TO TOURISM INDUSTRIES"; "People travels"
- p7 "Leisure is free time for individuals spend as they please"
- p8 "Recreation is variety of activities" (missing article)
- p11 opens mid-sentence — "the human activities, focusing on…" with no subject (previously flagged; p10 is a pure divider and does not carry the missing lead-in)
- p13 "where journey begin and end"
- p17 "which is confined to a destination that 'Push'…"; "potential tourist have"
- p18 "Economic development may cause the pressure of life will provide the 'push'"
- p23 "earned in one place and **spends** in another"
- p24/p25 "DESTINITION" / "Destinition" (twice)
- p26 "The tourism product **determine** the nature of the tourism system"
- p33 heading "TheTravel Distance"; "§" bullet glyph; "each particular form of tourism **involve** all"
- **pp27–29 carry unfilled PowerPoint template scaffolding** — browser-mockup tabs reading
  "Title Page / Proprietors / Introduction / Review of Literature" and an address bar reading
  "Insert your topic here", on three consecutive slides. Deck-authoring residue, not content.

---

## Recommended order of work

See `docs/content-fidelity-remediation-plan-2026-08-21.md` for the full plan. In short:

1. **Mark `content-depth-photo-audit-2026-08-09.md` untrusted** at the top of the file, before any
   fix work — it is an input to every remaining step and to CH2–CH4.
2. **p6, p29, p30, p31-Queensland + the one contaminated question** — the fabrications, as one
   chunk. Live to learners now.
3. **p21** — restore the 14-country study design and both parentheticals.
4. **Tier 3 drift + the silent-correction policy ruling**, as one batch after the client rules.
5. **Re-scan CH2–CH4 against their PDFs.** Raised from last to near-first: the 2026-08-11 pass
   rewrote 41 bodies across all four chapters from the same contaminated document, and three of
   the ~17 CH1 pages it touched carry fabrications. Nothing about that failure mode is
   chapter-specific, and CH3/CH4 are far more OCR-dependent than CH1 was.

## Downstream contamination — confirmed, one case

Four questions in the draft bank cite **three** of the affected units (`90510d10` ×2, `10f721f6`
×1, `7e0adbdc` ×1); `23d2636a` has none. Three of the four are safe — both MCQs test "trade fairs"
and "climate", which are source-grounded. **One is not:**

> *"State one world condition relevant to tourism geography and one career benefit of studying it."*

Its marking criteria are:

| Criterion | Marks | Accepted concepts | Accepted synonyms |
|---|---|---|---|
| States climate as a relevant world condition | 1 | `climate` | `climatic conditions` |
| **States career opportunities in tourism** | 1 | `career opportunities in tourism` | `tourism careers` |

The second criterion encodes the fabricated narrowing. The slide says only *"Provide a lot of
job opportunities"* — a learner who answers exactly what the deck teaches, "job opportunities",
does not match `career opportunities in tourism` or `tourism careers` and **can be marked wrong
for giving the source-correct answer.** These questions are `draft` and unapproved, but the
owner enabled the draft bank for learner practice on 2026-08-12, so this is live to students.

The narrowing sits in **three fields of that one question row**, not just the two criteria:

1. the **question stem** — "one **career** benefit of studying it";
2. `subjective_answer_scheme` — "…1 mark for recognising career opportunities in tourism";
3. the `quiz_marking_criteria` row above.

Fix all three in the same chunk as `90510d10`, not after.
