# Course Brain Content Model

## Hierarchy

```text
Chapter
  └── Topic
       └── Content unit
            └── Source reference
```

A **content unit** is the smallest learner-facing item that can be cited independently: a definition, explanation, example, key takeaway, case study, or learning note.

## Required publication evidence

| Field | Purpose |
|---|---|
| `topic_id` | Places content in the course hierarchy |
| `title` and `body` | Supplies learner-facing content |
| `content_type` | Identifies how the material is used |
| `source_file` | Names the originating approved material |
| `chapter_label` | Makes the answer readable to students |
| `page_or_slide` | Makes the material traceable |

A content unit is created as `draft`. It can become `published` only when a source reference exists.

## Quiz lifecycle

```text
human / DeepSeek draft
  → draft
  → lecturer or admin review
  → approved
  → student-visible
```

Approved questions require an associated source content unit. This is how the system prevents uncited quiz generation from becoming course material.
