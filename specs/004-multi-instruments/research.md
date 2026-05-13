# Research: Multi-Instrument Notation

**Feature**: 004-multi-instruments
**Date**: 2026-05-11

## Decision 1: Instrument Transposition Offsets

**Decision**: Store semitone offset as "written-to-concert" direction. To transpose FROM concert pitch TO the instrument's written notation, ADD the offset.

| Instrument | Key | Offset (concert → written) |
|-----------|-----|---------------------------|
| Piano     | C   | 0                         |
| Saxophone | Eb  | +9 (concert C = written A, so add 9 to get written note) |
| Trumpet   | Bb  | +2 (concert C = written D, so add 2 to get written note) |
| Trombone  | C   | 0                         |

**Rationale**: This is the standard "transposing instrument" convention. A saxophone player reading "la" (A) produces concert Eb. To give them the right written note for concert "do" (C), we shift up 9 semitones → they read "la" which sounds as C.

**Alternatives considered**:
- Negative offsets (concert → sounding) — confusing direction for this use case
- MIDI-based approach — overcomplicated for simple semitone arithmetic

## Decision 2: Any-to-Any Transposition Formula

**Decision**: To transpose from instrument A to instrument B:
1. Convert A's notation to concert pitch: subtract A's offset
2. Convert concert pitch to B's written notation: add B's offset
3. Net: shift by (B.offset - A.offset) semitones

**Example**: Saxophone (offset +9) to Trumpet (offset +2):
- Net shift = 2 - 9 = -7 semitones
- Sax "la" (A) → concert C → trumpet "re" (D)... wait, let's verify:
  - Sax written "do" = concert Eb = concert pitch semitone 3
  - Trumpet written "do" = concert Bb = concert pitch semitone 10
  - Sax "la si do#" → subtract 9 → concert "do re mi" → add 2 → trumpet "re mi fa#"

**Rationale**: Simple arithmetic, works for any pair without needing a lookup table per pair.

## Decision 3: Storage Model

**Decision**: New `MelodyTab` model linked to Melody via FK. Each tab stores: instrument name, notation text, position, optional suffix label.

**Rationale**: Tabs are independent after creation — each stores its own notation that can be edited freely. This avoids recomputing transpositions on every view.

**Alternatives considered**:
- Store only the reference notation and compute others on-the-fly — fragile if user edits a transposed tab independently
- Store offsets only — doesn't support independent editing per tab

## Decision 4: Backward Compatibility

**Decision**: Existing melodies (no tabs) continue to work. The API returns the melody's `notation` field as the default tab. When multi-tab is needed, a migration creates a "Piano in C" tab for existing melodies with their current notation.

**Rationale**: No breaking change for existing data or API consumers.

## Decision 5: Setlist Instrument Memory

**Decision**: Pass the selected instrument name via URL query param (e.g., `?instrument=saxophone`). When navigating to the next melody in a setlist, the SharedMelodyPage reads this param and auto-selects the matching tab. Falls back to first tab if no match.

**Rationale**: Stateless (no server storage needed), works with browser back/forward, survives page refresh.

## Decision 6: Auto-Creation of All 4 Instrument Tabs

**Decision**: When a user creates a new melody, the system shows an instrument selection modal to pick the source instrument, then automatically creates one tab for each of the 4 fixed instruments (Piano, Saxophone, Trumpet, Trombone) in that fixed order, with notation transposed from the source.

**Rationale**: Reduces friction — musicians typically need all parts ready for their ensemble. Creating all tabs upfront saves repeated manual "+" clicks.

**Alternatives considered**:
- Only create tabs for instruments already used in the setlist — requires tracking per-setlist instrument usage, adds complexity
- User-configurable default instruments — over-engineering for v1 with only 4 instruments
- No auto-creation (manual only via "+") — more friction, less useful for the target use case

## Decision 7: Tab Deletion and Minimum Constraint

**Decision**: Users can delete any instrument tab. The system enforces a minimum of 1 tab per melody — the delete button is hidden/disabled when only 1 tab remains.

**Rationale**: Users who don't need all 4 instruments can clean up unwanted tabs. The 1-tab minimum prevents orphaned melodies with no viewable notation.

**Alternatives considered**:
- All 4 tabs always present, no deletion — too rigid, clutters UI for simpler use cases
- Allow 0 tabs (melody with no tabs) — confusing UX, breaks the shared melody view

## Decision 8: Tabs Independent After Creation

**Decision**: Tabs are fully independent after auto-creation. Editing notation on one tab does not affect any other tab.

**Rationale**: Already established in Decision 3. Confirmed during clarification — musicians need to customize individual parts independently (e.g., adding ornaments, adjusting for instrument range).

## Decision 9: Source Instrument Selection Flow

**Decision**: On new melody creation, the user first selects the source instrument via a modal/prompt before entering notation. The system then creates all 4 tabs in fixed order (Piano, Saxophone, Trumpet, Trombone).

**Rationale**: The source instrument determines the transposition baseline. Asking upfront avoids having to retranspose after the fact. Default was Piano, but musicians often compose directly in their own instrument's key.

**Alternatives considered**:
- Default to Piano with no prompt — forces non-Piano players to mentally transpose or retranspose later
- Ask after notation entry — wasteful, requires retransposing work already done

## Decision 10: Existing Melodies Unchanged

**Decision**: Existing melodies (pre-feature) keep their single "Piano in C" tab. Auto-creation only applies to newly created melodies. Users can manually add tabs to existing melodies via the "+" button.

**Rationale**: Avoids disruptive migration. Users may not want all 4 tabs for every old melody. The "+" button provides an opt-in path for legacy content.

**Alternatives considered**:
- Retroactive migration to create all 4 tabs — could create thousands of unwanted tabs across all users' melodies
