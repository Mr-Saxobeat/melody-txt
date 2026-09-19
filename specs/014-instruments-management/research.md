# Research: Instruments Management

**Date**: 2026-09-18
**Branch**: `014-instruments-management`

## R-001: Pitch-to-Offset Mapping Formula

**Decision**: Use the formula `offset = (12 - semitone_position) % 12` where semitone_position is the pitch's chromatic index (C=0, Db=1, D=2, ... B=11).

**Rationale**: This is the standard transposing instrument formula. When an instrument is "in key X", its written C sounds as concert X. The offset represents how many semitones to shift concert pitch upward to get the written note. Verified against existing hardcoded values:
- C: (12-0)%12 = 0 (Piano, Trombone) ✓
- Eb: (12-3)%12 = 9 (Saxophone) ✓
- Bb: (12-10)%12 = 2 (Trumpet) ✓

**Complete mapping**:

| Pitch | Semitone | Offset |
|-------|----------|--------|
| C     | 0        | 0      |
| Db    | 1        | 11     |
| D     | 2        | 10     |
| Eb    | 3        | 9      |
| E     | 4        | 8      |
| F     | 5        | 7      |
| F#    | 6        | 6      |
| G     | 7        | 5      |
| Ab    | 8        | 4      |
| A     | 9        | 3      |
| Bb    | 10       | 2      |
| B     | 11       | 1      |

**Alternatives considered**: Storing offset directly (rejected — error-prone for admins, pitch is the natural domain concept).

## R-002: MelodyTab Instrument Field Migration Strategy

**Decision**: Change `MelodyTab.instrument` from `CharField(choices=...)` to a `ForeignKey` to the new `Instrument` model.

**Rationale**: A ForeignKey provides:
- Referential integrity (no orphaned instrument references)
- Cascade delete support (Django `on_delete=CASCADE` for tabs, with custom logic for the last-tab fallback)
- Proper relational modeling for queries (joins, reverse relations)

The migration path is:
1. Create `Instrument` model and table
2. Seed four original instruments
3. Add a new FK field `instrument_ref` to MelodyTab (nullable initially)
4. Data migration: map existing string values to FK references
5. Remove old `instrument` CharField
6. Rename `instrument_ref` to `instrument`

**Alternatives considered**: Keep CharField and validate against DB rows (simpler migration but loses referential integrity and cascade support).

## R-003: Django Admin for Instrument Management

**Decision**: Use Django's built-in admin interface with a custom `ModelAdmin` that:
- Shows `name` and `pitch` fields on the add form
- Displays `name`, `pitch`, and computed `offset` in the list view (offset as read-only)
- Makes `pitch` read-only on the edit form (immutable after creation)

**Rationale**: Django admin provides CRUD, permissions (staff-only), and audit logging out of the box. No custom admin UI needed.

**Alternatives considered**: Custom admin API endpoints (rejected — unnecessary complexity for an admin-only feature).

## R-004: Frontend Instrument Loading Strategy

**Decision**: Replace the hardcoded `INSTRUMENTS` array with an API call to `GET /api/instruments/`. Cache the result in memory for the session.

**Rationale**: The instrument list changes infrequently (only when admin adds/removes instruments). A single API call on app load or first use is sufficient. No need for real-time updates — the deleted-instrument error handling (FR-013) covers the race condition.

**Alternatives considered**: WebSocket for real-time updates (rejected — overkill for a rarely-changing list).

## R-005: Last-Tab Fallback Implementation

**Decision**: Override `Instrument.delete()` (or use a `pre_delete` signal) to check all melodies that would lose their last tab. For those melodies, create a new Piano tab before the cascade delete runs.

**Rationale**: The Piano instrument (C, offset 0) is the natural fallback — it represents concert pitch. The existing migration 0003 already established this pattern (creating default Piano tabs for melodies without tabs).

**Alternatives considered**: `post_delete` signal (rejected — by then the cascade has already run and we'd need to reconstruct the notation from the original melody).

## R-006: New Melody Creation Flow

**Decision**: Change the composition flow from auto-creating one tab per instrument to requiring the musician to select an instrument during creation. Only that instrument's tab is created.

**Rationale**: With a dynamic, potentially large instrument list, auto-creating tabs for every instrument would clutter the composition. Musicians know which instrument they play.

**Impact on existing code**: `ComposerPage.handleSourceSelect` currently loops through all `INSTRUMENTS`. This must be changed to create a single tab for the selected instrument.
