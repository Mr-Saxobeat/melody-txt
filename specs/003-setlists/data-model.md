# Data Model: Setlists

**Feature**: 003-setlists
**Date**: 2026-05-09

## Entity: Setlist

An ordered collection of melodies belonging to a user.

### Attributes

| Attribute | Type | Constraints |
|-----------|------|-------------|
| id | UUID | Primary key, auto-generated |
| user | FK → User | NOT NULL, CASCADE on user delete |
| title | String | Max 200 chars, NOT NULL |
| share_id | String | 12 chars, unique, auto-generated |
| is_public | Boolean | Default: false |
| created_at | DateTime | Auto-set on creation |
| updated_at | DateTime | Auto-set on update |

### Validation Rules

- Title: required, max 200 characters
- Max 50 setlists per user
- share_id: auto-generated on creation using existing `generate_share_id()`

### Indexes

- `(user, -created_at)` — for listing user's setlists
- `share_id` — unique, for public sharing lookup

---

## Entity: SetlistEntry

A join entity linking a setlist to a melody with position ordering.

### Attributes

| Attribute | Type | Constraints |
|-----------|------|-------------|
| id | UUID | Primary key, auto-generated |
| setlist | FK → Setlist | NOT NULL, CASCADE on setlist delete |
| melody | FK → Melody | NOT NULL, CASCADE on melody delete |
| position | Integer | NOT NULL, >= 0 |
| added_at | DateTime | Auto-set on creation |

### Validation Rules

- Position: non-negative integer
- Max 100 entries per setlist
- Same melody CAN appear multiple times (no unique constraint on setlist+melody)

### Indexes

- `(setlist, position)` — for ordered retrieval
- `(melody)` — for cascade cleanup when melody deleted

---

## Relationships

```
User 1 ──── * Setlist
Setlist 1 ──── * SetlistEntry
Melody 1 ──── * SetlistEntry
```

- A user owns many setlists
- A setlist contains many entries (ordered)
- A melody can appear in many setlist entries (across multiple setlists, or multiple times in the same setlist)
- Deleting a melody cascades to remove all SetlistEntry rows referencing it
- Deleting a setlist cascades to remove all its SetlistEntry rows
