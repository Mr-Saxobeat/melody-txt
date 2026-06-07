# Research: Octave Notation Change

## Decision 1: New Octave Formula for Upper Register

**Decision**: For uppercase notes with number N, octave = N + 3.

**Rationale**: The user specified that `DO3` should represent the second octave above base (octave 6). Since `DO` (no number) = octave 5, and `DO3` = octave 6, the formula is `octave = number + 3`. This means:
- `DO` (no number) = 5 (unchanged, treated as implicit)
- `DO3` = 3 + 3 = 6
- `DO4` = 4 + 3 = 7
- `DO5` = 5 + 3 = 8

The previous formula was `octave = 5 + N`, meaning `DO1` = 6. The new formula uses absolute-style numbering where the number correlates more directly to the target octave.

**Alternatives considered**:
- Keep relative offset (`5 + N`) but start from 3: Would make `DO3` = 8, which doesn't match the requirement.
- Use the number as the literal octave: `DO6` = octave 6. Rejected because user explicitly stated "second octave must be represented with number 3."

## Decision 2: Backward Compatibility Strategy

**Decision**: Support both old and new notation in parsing. Old notation (`DO1`, `DO2`) maps to octaves 6, 7 via the same `N + 3` formula: `DO1` = 1 + 3 = 4... wait, that doesn't work. We need special handling.

Actually, re-reading the requirement:
- `DO` = octave 5 (no number)
- `DO3` = octave 6 (new: number 3 = second upper octave)
- Lower: `do1` = octave 3 (unchanged: 4 - 1)

The formula `octave = N + 3` gives: `DO3`=6, `DO4`=7, `DO5`=8. But what about `DO1` and `DO2`?

Under the new system, `DO1` = 1+3 = octave 4, and `DO2` = 2+3 = octave 5. But `DO2` as uppercase at octave 5 is the same as plain `DO`. This creates ambiguity with old stored data where `DO1` meant octave 6.

**Resolution**: For backward compatibility of existing data, we will NOT treat `DO1`/`DO2` as valid under the new system. The parsing will use the new formula (`N + 3`) for all uppercase+number inputs. This means:
- Old stored `DO1` (meant octave 6) now parses as `1 + 3 = 4` — this is WRONG for old data.

**Revised approach**: The rendering (output) will never produce `DO1` or `DO2` since they'd be redundant with `do` and `DO`. But for parsing input (including stored data), we need backward compatibility. The safest approach:
- If number < 3 and uppercase: use old formula `5 + N` (backward compat for stored data)
- If number >= 3 and uppercase: use new formula `N + 3`

Let's verify:
- `DO1` → 5 + 1 = 6 ✓ (backward compat)
- `DO2` → 5 + 2 = 7 ✓ (backward compat)
- `DO3` → 3 + 3 = 6 ✓ (new notation)
- `DO4` → 4 + 3 = 7 ✓ (new notation)
- `DO5` → 5 + 3 = 8 ✓ (new notation)

Wait — `DO1` = 6 and `DO3` = 6? They're equivalent! This is the transition: old `DO1` and new `DO3` both mean octave 6. Similarly old `DO2` and new `DO4` both mean octave 7. This is correct — it maintains backward compatibility while the new output format only uses the `N >= 3` convention.

**Decision finalized**:
- **Parsing (input)**: 
  - Uppercase + number N where N is 1 or 2: `octave = 5 + N` (backward compat, maps to 6, 7)
  - Uppercase + number N where N >= 3: `octave = N + 3` (new format, maps to 6, 7, 8...)
- **Rendering (output)**:
  - Octave 6: output `DO3` (not `DO1`)
  - Octave 7: output `DO4` (not `DO2`)
  - Octave 8: output `DO5`

**Alternatives considered**:
- Data migration of all existing notations: Too risky and unnecessary given the parsing can handle both.
- Breaking change (no backward compat): Would break all existing melodies.

## Decision 3: Lower Octave Unchanged

**Decision**: Lower octaves remain `octave = 4 - N`. No changes needed for lowercase + number.

**Rationale**: User explicitly confirmed "The lower octaves still the same starting from 1: do1 re1 mi1..."

## Decision 4: Rendering Output Numbering

**Decision**: For output rendering, octave 6+ uses the formula `number = octave - 3`.

**Rationale**: This is the inverse of the parsing formula. Octave 6 → 6-3 = 3 → `DO3`. Octave 7 → 7-3 = 4 → `DO4`.

Previous formula was `number = octave - 5`, producing `DO1` for octave 6. New formula produces `DO3`.
