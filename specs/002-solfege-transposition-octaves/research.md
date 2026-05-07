# Research: Solfege Transposition, Octaves & Accidentals

**Feature**: 002-solfege-transposition-octaves
**Date**: 2026-05-08

## Decision 1: Note Representation Format

**Decision**: Use a structured internal representation with `{ syllable, accidental, octave, semitone }` for each parsed note.

**Rationale**: The notation string "DO#1" encodes three pieces of information (syllable=do, accidental=#, octave=6). A structured object makes transposition arithmetic clean — shift the semitone value, then re-encode to string.

**Alternatives considered**:
- Pure string manipulation (regex replace) — brittle for edge cases like octave wrapping
- MIDI number only — loses the solfege identity needed to render back to notation

## Decision 2: Octave Encoding Convention

**Decision**: Map the case+number notation to absolute octaves as follows:
- `do` (lowercase, no number) = octave 4
- `do1` (lowercase + 1) = octave 3 (number subtracts from base 4)
- `do2` (lowercase + 2) = octave 2
- `DO` (uppercase, no number) = octave 5
- `DO1` (uppercase + 1) = octave 6 (number adds to base 5)
- `DO2` (uppercase + 2) = octave 7

**Rationale**: Matches the user's specification exactly. Lowercase base is 4, uppercase base is 5. Numbers extend outward from those bases.

**Alternatives considered**:
- Using numbers for all octaves (do4, do5) — loses the elegant case-based convention the user specified
- Suffix-only approach (do_3, do_5) — harder to type quickly

## Decision 3: Transposition Algorithm

**Decision**: Convert each note to a semitone value (0-11) + absolute octave, add the transposition interval, then convert back to notation string.

**Steps**:
1. Parse note → `{ syllable, accidental, octave }`
2. Convert to absolute semitone: `(octave * 12) + solfegeSemitone + accidentalOffset`
3. Add interval (1 for half step, 2 for whole step, negative for down)
4. Convert back: `absoluteSemitone → { syllable, accidental, octave }`
5. Encode to string using octave rules

**Rationale**: Working in absolute semitone space makes transposition a simple addition, and octave wrapping is automatic via integer division.

**Alternatives considered**:
- Scale-degree arithmetic — doesn't work cleanly with accidentals
- Lookup tables for each transposition — combinatorial explosion with octaves

## Decision 4: Accidental Preference During Transposition

**Decision**: Use sharps (#) when transposing upward, flats (b) when transposing downward.

**Rationale**: Follows musical convention — ascending passages use sharps, descending use flats. This produces the most readable output for musicians.

**Alternatives considered**:
- Always use sharps — confusing for downward transpositions
- Always use flats — confusing for upward transpositions
- Preserve original accidental type — not possible when transposing natural notes into chromatic positions

## Decision 5: Chromatic Semitone Mapping

**Decision**: Map solfege syllables to semitones (within an octave) as:

| Syllable | Semitone |
|----------|----------|
| do       | 0        |
| do#/reb  | 1        |
| re       | 2        |
| re#/mib  | 3        |
| mi       | 4        |
| fa       | 5        |
| fa#/solb | 6        |
| sol      | 7        |
| sol#/lab | 8        |
| la       | 9        |
| la#/sib  | 10       |
| si       | 11       |

**Rationale**: Standard chromatic scale mapping. Enables direct MIDI-style arithmetic.

## Decision 6: Backward Compatibility

**Decision**: The existing plain notation ("do re mi") continues to work unchanged. The parser treats notes without accidentals or octave markers as octave 4, natural.

**Rationale**: Existing saved melodies must remain playable. The new notation is a superset of the old.

## Decision 7: Component Replacement Strategy

**Decision**: Remove KeySelector component entirely. Replace with TransposeControls component containing 4 directional buttons.

**Rationale**: The key selector was a dropdown for selecting a musical key — it shifted playback frequency without modifying notation. The new transposition arrows directly modify the notation text, which is a fundamentally different interaction model. They cannot coexist meaningfully.

## Decision 8: Backend Validation Update

**Decision**: Extend `is_valid_solfege_notation()` in `backend/melodies/utils.py` to accept the new notation format (accidentals and octave markers) while keeping the existing simple format valid.

**Rationale**: Saved melodies go through backend validation. The regex/parser must accept "DO#1" and "reb2" as valid in addition to plain "do re mi".
