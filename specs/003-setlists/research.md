# Research: Setlists

**Feature**: 003-setlists
**Date**: 2026-05-09

## Decision 1: Ordering Strategy

**Decision**: Use an integer `position` field on SetlistEntry for explicit ordering.

**Rationale**: Simple, deterministic, works with DRF pagination. Reordering is an update to position values.

**Alternatives considered**:
- Linked list (next_id) — complex queries for full list retrieval
- Fractional ordering (1.5 between 1 and 2) — precision issues over time

## Decision 2: Share ID Generation

**Decision**: Reuse the existing `generate_share_id()` function from melodies (12-char URL-safe string).

**Rationale**: Same pattern as melody sharing — consistent UX and proven implementation.

## Decision 3: Cascade Behavior

**Decision**: When a melody is deleted, `SetlistEntry` rows referencing it are deleted (CASCADE). The setlist itself remains.

**Rationale**: Matches FR-012. The setlist is still valid with fewer entries.

## Decision 4: New Django App vs Extending Melodies

**Decision**: Create a new `setlists` Django app.

**Rationale**: Single Responsibility — setlists are a distinct domain concept with their own models, views, and business rules. Keeps the melodies app focused.

## Decision 5: API Design

**Decision**: Nested REST endpoints:
- `GET/POST /api/setlists/` — list/create setlists
- `GET/PUT/DELETE /api/setlists/{id}/` — single setlist CRUD
- `POST /api/setlists/{id}/entries/` — add melody to setlist
- `PUT /api/setlists/{id}/entries/{entry_id}/` — update position
- `DELETE /api/setlists/{id}/entries/{entry_id}/` — remove entry
- `GET /api/setlists/shared/{share_id}/` — public view

**Rationale**: RESTful, clear resource hierarchy, consistent with existing melody API patterns.
