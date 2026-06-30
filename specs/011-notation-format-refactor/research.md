# Research: Notation Format Refactor

## Decision 1: Regex Pattern Change

**Decision**: Change regex capture group order from `(syllable)(accidental?)(octave?)` to `(syllable)(octave?)(accidental?)`.

**Rationale**: The regex directly controls parsing behavior. Swapping the capture group order is the minimal change that achieves the new format acceptance while rejecting the old format.

**New regex (backend)**: `^(sol|la|si|do|re|mi|fa)(\d)?(#|b)?$` (case-insensitive)  
**New regex (frontend)**: `/^(sol|la|si|do|re|mi|fa|SOL|LA|SI|DO|RE|MI|FA|Sol|La|Si|Do|Re|Mi|Fa)(\d)?(#|b)?$/`

**Alternatives considered**:
- Accept both old and new format simultaneously → Rejected: user requirement states old format must be rejected for new input.
- Two-pass parsing (try new, fallback to old) → Rejected: creates ambiguity, contradicts spec FR-003.

## Decision 2: Output Format in `noteToString`

**Decision**: Change `noteToString()` functions (both frontend and backend) to emit `[syllable][octave][accidental]` instead of `[syllable][accidental][octave]`.

**Rationale**: Both `noteToString` (frontend) and `_transpose_notation_text` (backend) currently build output strings as `syllable + accidental + number`. They must be changed to `syllable + number + accidental` for new canonical output.

**Alternatives considered**:
- Post-process output with a reformat function → Rejected: adds unnecessary complexity when the source can be fixed directly.

## Decision 3: Data Migration Strategy

**Decision**: A single Django data migration that iterates all `Melody` and `MelodyTab` records, applies a token-level regex substitution on the `notation` field to reorder `[accidental][octave]` to `[octave][accidental]`.

**Rationale**: The migration regex can precisely target `(syllable)(#|b)(\d)` patterns and swap groups 2 and 3. This is idempotent — tokens already in new format won't match the old-format regex.

**Migration regex**: `(sol|la|si|do|re|mi|fa)(#|b)(\d)` → replace with `\1\3\2` (case-insensitive, applied per-token on note lines only)

**Alternatives considered**:
- Application-level migration (iterate via management command) → Rejected: Django migration is atomic, reversible, and tracked in version control.
- Accept both formats indefinitely → Rejected: contradicts spec requirement for single canonical format.

## Decision 4: Migration Scope

**Decision**: Migrate both `Melody.notation` and `MelodyTab.notation` fields.

**Rationale**: `MelodyTab` stores instrument-transposed notation which may also contain old-format tokens (produced by the current `_transpose_notation_text`/`noteToString`).

**Alternatives considered**:
- Migrate only `Melody.notation` → Rejected: leaves `MelodyTab` data inconsistent.

## Decision 5: Backward Compatibility Period

**Decision**: No backward compatibility period. Old format is rejected immediately upon deployment.

**Rationale**: The data migration converts all existing data before the new validation takes effect (migration runs before new code is active). There is no external API consumer that sends raw notation strings — input only comes from the application's own UI.

**Alternatives considered**:
- Deprecation period accepting both → Rejected: unnecessary complexity for a single-user-facing app with no external API consumers of raw notation.
