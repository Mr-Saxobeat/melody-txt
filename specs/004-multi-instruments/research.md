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
