# Deterministic ordering for the 18 tied units — APPLIED

**Status: APPLIED and verified, 2026-08-25.** All 18 rows were written in the order below and
verified twice — once by re-reading each topic through PostgREST in the exact order the app
uses, and once against the deployed site.

Verification results:
- 18 rows patched, each write guarded on the old timestamp and asserted to affect exactly one row.
- Every topic re-read in `order=created_at` matches the intended sequence.
- **Zero units anywhere in the course still share a `created_at` with a topic-mate** (was 18).
- Production spot-check: CH4's chapter-opening topic now leads with *Nature-based tourism and
  natural resources*, ahead of *Recognition makes a natural feature a tourism resource*. It
  renders in the large-type intro slot with no `<h3>`, which is `group-units.ts` behaving as
  designed — `takeU0` promotes it because its title is five words long.

One implementation note for anyone repeating this: the `+00:00` in a PostgREST
`created_at=eq.` filter must be percent-encoded. Left raw it arrives as a space and Postgres
rejects it with `22007 invalid input syntax for type timestamp with time zone`.

The original plan follows, unchanged.

Source: Finding 4 of `docs/pedagogy-review-content-units-2026-08-25.md`.

## The problem

`content_units` has no `display_order`. The learner-facing query in
`web/src/lib/course-brain/repository.ts` is:

```ts
.eq("topic_id", topicId).eq("status", "published").order("created_at")
```

No secondary sort key. `scripts/import_reviewed_content.py` inserts every unit and commits
once, and Postgres `now()` is `transaction_timestamp()` — constant across a transaction —
so every unit from one import run carries the **identical** `created_at`
`2026-08-05T08:07:21.055166+00:00`. `ORDER BY created_at` then degenerates to no ordering
at all: ties return in heap- and plan-dependent order, which can change after any `UPDATE`,
`VACUUM` or plan switch.

That would be cosmetic if display were order-independent. It is not.
`web/src/lib/course-brain/group-units.ts` promotes `units[0]` to the large-type page lead
and builds section runs from adjacent positions, so a reshuffle changes which sentence
opens a topic and how the page is divided. **In four of the five affected topics every unit
is tied**, including CH4's opening topic — so which sentence introduces that chapter is
currently arbitrary.

18 units across 5 topics are affected. Verified live 2026-08-25.

## The order, and why

Source page sequence first; where one page hosts several units, this project's own
convention from `.claude/skills/course-content/SKILL.md` — general concept → taxonomy →
instances → examples → synthesis last.

### CH1 · Leisure, recreation, and tourism — `09f03c3a-b0e5-448f-ba42-9bb1b26160fb`

Each term narrows the one before it, and the pages already say so.

| # | Unit id | Page | Type | Title |
|---|---|---|---|---|
| 1 | `cb85a578-3658-43ce-a7a4-686c75d8b5a2` | p7 | definition | Leisure |
| 2 | `95b44f13-a11f-472f-bbcb-d40ed359d0ed` | p8 | definition | Recreation |
| 3 | `eef870d4-aa62-4385-ba4e-ca86e292b9c3` | p9 | definition | Tourism |

### CH1 · Geography and the tourism system — `a9ec4d1f-f638-4029-8c2d-de020ed6e57c`

Frame, then origin, then destination, then the link between them.

| # | Unit id | Page | Type | Title |
|---|---|---|---|---|
| 1 | `002cac2b-4daf-4cc5-8d26-be052e104b92` | p11 | definition | Spatial study of tourism |
| 2 | `3868dc9c-a755-441c-9920-c385a6b86634` | p13 | definition | Tourist-generating areas |
| 3 | `25f51ac3-0193-4428-a2a7-a1031cfdef6e` | p14 | definition | Tourist destinations |
| 4 | `a92b84df-02e5-4635-872c-507863427545` | p15 | explanation | Travel routes |

### CH2 · Dry climate — `aa696007-8761-4226-9322-0a5d3a41d0c5`

The category before its two sub-types. Both p16 units tie; "Dry climates" is the
superordinate one and must lead.

| # | Unit id | Page | Type | Title |
|---|---|---|---|---|
| 1 | `a48bde3a-9dbe-4ea1-af69-fdb944d7ff31` | p16 | definition | Dry climates |
| 2 | `27a0eeb9-953f-4ac7-9e86-55d9e8789006` | p16 | definition | Arid climate features |
| 3 | `3351e87e-e9ef-44f4-bb9e-25d1b334cdde` | p17 | definition | Semiarid climate features |

### CH4 · Tourism natural resources — `ee46d675-17e2-413b-9a3f-70c0ae786199`

**The highest-stakes group** — this is CH4's opening topic, so unit 1 is the chapter's
first sentence. Definition, then the explanation of it, then an instance, then the two
takeaways. Page order and the convention agree here.

| # | Unit id | Page | Type | Title |
|---|---|---|---|---|
| 1 | `15c93c2f-a904-4d1b-bec5-6275c231cf68` | p2 | definition | Nature-based tourism and natural resources |
| 2 | `7afef38e-4629-4106-8089-dc8d0115f830` | p3 | explanation | Recognition makes a natural feature a tourism resource |
| 3 | `0da062ff-1e92-42bb-bfd1-e5617f5764bf` | p3 | example | Natural features can gain tourism value through changing perceptions |
| 4 | `44e6b7e6-b983-45ce-acf1-580634901352` | p4 | key_takeaway | Tourism resources are often shared with other users |
| 5 | `c8dd3427-ed51-4d02-8d0b-f3e84f3e71ba` | p5 | key_takeaway | Tourism resources can be perishable |

### CH4 · Tourist attractions and classification — `57682698-9d12-499a-a76f-063216c35b7f`

Definition, then the taxonomy, then instances of it. A fourth unit
(`23711d5a`, p8, *Physical tourist attraction categories*) is **not** tied — it was
inserted later at `12:46:49.612` and already sorts last. The three below must all stay
before it.

| # | Unit id | Page | Type | Title |
|---|---|---|---|---|
| 1 | `f650e118-9ca1-4b79-8b7d-99bfcf10f876` | p6 | definition | Tourist attraction |
| 2 | `8df9799d-bc47-4f75-ba4c-c94f752f94c2` | p7 | definition | Four attraction categories attributed to Swarbrooke |
| 3 | `2fe03acb-3cd8-49ea-a3c7-3f967c8651a9` | p7 | example | Examples across attraction categories |

## How to apply

Give each row its own `created_at` at `08:07:21.055166 + n milliseconds`, where `n` is its
position number above. **Every row in a tied group gets a new value** — do not nudge just
one, or a future pass can re-collide them. All offsets stay inside the original second, so
no unit crosses a neighbour: the only untied neighbour is at `12:46:49` and keeps its place.

Preconditions to check before writing:

1. Every id above still resolves to a live `published` row.
2. Each still carries exactly `2026-08-05T08:07:21.055166+00:00`. If any has moved, the
   plan is stale — re-derive it rather than applying this one.

Afterwards, verify by re-reading each topic with
`?topic_id=eq.<id>&status=eq.published&order=created_at` and asserting the returned ids
match the tables above. Do not trust the write; re-read it. Content is served from Supabase
at runtime, so the change is live to learners the moment it lands, with no deploy.

## The durable fix, separately

A real `display_order` column on `content_units` would remove this class of bug for good,
rather than encoding sequence in a timestamp that the next bulk import will re-tie. That is
a schema change plus an importer change plus a `repository.ts` change, and it deserves its
own decision. The timestamp fix above is worth doing either way — it repairs the 18 units
that are wrong right now.
