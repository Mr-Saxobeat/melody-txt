# Feature Specification: Notation Format Refactor

**Feature Branch**: `011-notation-format-refactor`  
**Created**: 2026-06-30  
**Status**: Draft  
**Input**: User description: "The music notation validation must be refactored. The following notation must be also accepted as valid notes: DO3# RE3b. Note that the octave number comes before the accidental, it must be accepted as valid notation and all the new music must be in this notation. The old ones must be migrated to this format instead of: DO#3 REb3"

## Clarifications

### Session 2026-06-30

- Q: Does "completely replaced" mean only reordering accidental/number, or also eliminating the case-based octave system? → A: Only reorder: accidental moves after octave number (`DO#3` → `DO3#`). Case-based octave system stays.
- Q: Should notes without explicit octave number (e.g., `do#`, `REb`) be rewritten to include an explicit octave, or left as-is? → A: Leave as-is — only migrate tokens that have BOTH accidental AND octave number.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - New Notation Input (Priority: P1)

A musician composing new melodies writes notes using the new notation format where the octave number comes before the accidental (e.g., `DO3#` instead of `DO#3`). The system accepts and stores this notation as valid.

**Why this priority**: This is the core behavioral change — the new canonical format must be recognized and accepted for any new music to be written.

**Independent Test**: Can be fully tested by entering notes like `DO3#`, `RE3b`, `SOL2#`, `MI1b` into the melody composer and verifying they are accepted without validation errors.

**Acceptance Scenarios**:

1. **Given** the melody composer is open, **When** the user types `DO3# RE3b MI2#`, **Then** the system accepts all tokens as valid notes without error.
2. **Given** the melody composer is open, **When** the user types `sol1b FA2#`, **Then** the system recognizes both lowercase and uppercase variants with octave-before-accidental format.
3. **Given** a note with octave but no accidental like `DO3`, **When** validation is run, **Then** it continues to be accepted as valid (no regression).

---

### User Story 2 - Existing Data Migration (Priority: P1)

All existing melodies stored in the old notation format (accidental before octave: `DO#3`, `REb3`) are automatically migrated to the new canonical format (octave before accidental: `DO3#`, `RE3b`).

**Why this priority**: Without migration, existing data becomes inconsistent with the new format rules, creating confusion and potential playback/transposition errors.

**Independent Test**: Can be tested by verifying that after migration, all melodies in the database use the new notation format, and that playback/transposition still produces correct results.

**Acceptance Scenarios**:

1. **Given** a melody containing `DO#3 REb2 FA#1`, **When** the migration runs, **Then** the notation becomes `DO3# RE2b FA1#`.
2. **Given** a melody with mixed notation (notes with and without accidentals/octaves like `do re DO#3 mi`), **When** the migration runs, **Then** only the affected tokens are changed (`do re DO3# mi`) and plain notes remain untouched.
3. **Given** a melody with lyrics lines mixed with note lines, **When** the migration runs, **Then** only note tokens on note lines are migrated; lyrics lines remain unchanged.

---

### User Story 3 - Output Format Consistency (Priority: P2)

When the system generates notation (e.g., transposition results), it outputs notes in the new canonical format (octave before accidental).

**Why this priority**: Ensures the system is internally consistent — all generated output matches the new standard so users never see the old format.

**Independent Test**: Can be tested by transposing a melody and verifying the output tokens use octave-before-accidental format.

**Acceptance Scenarios**:

1. **Given** a melody `do re mi`, **When** transposed up by 1 semitone, **Then** the result uses new format tokens (e.g., `do# re# fa` for octave-4 notes, `DO3#` for higher octaves).
2. **Given** an instrument transposition that shifts notes across octave boundaries, **When** the transposition is performed, **Then** all output tokens with both octave and accidental use the new format.

---

### Edge Cases

- What happens when a note has an accidental but no octave number (e.g., `do#`, `REb`)? These remain valid — the format change only affects notes that have BOTH an octave number and an accidental.
- What happens if a melody has already been partially migrated (some tokens in new format, some in old)? The migration must be idempotent — already-correct tokens are left unchanged.
- Notes with only an octave and no accidental (`DO3`, `re1`) remain unchanged by this refactor.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST accept notes in the format `[syllable][octave][accidental]` (e.g., `DO3#`, `RE3b`, `sol2#`, `mi1b`) as valid notation.
- **FR-002**: System MUST continue to accept notes without accidentals (`DO3`, `re1`) and notes without octave numbers (`do#`, `REb`) — no regression on existing valid formats.
- **FR-003**: System MUST reject the old format `[syllable][accidental][octave]` (e.g., `DO#3`, `REb2`) as invalid when creating or editing new melodies.
- **FR-004**: System MUST migrate all existing stored melodies from old format to new format via a one-time data migration.
- **FR-005**: System MUST produce output in the new canonical format when generating notation (transposition, instrument conversion).
- **FR-006**: Migration MUST be idempotent — running it multiple times produces the same result.
- **FR-007**: Migration MUST preserve lyrics lines, ignored symbols, and plain notes without octave/accidental combinations.

### Key Entities

- **Note Token**: A single solfege note with optional octave and accidental. New canonical format: `[syllable][octave?][accidental?]`. Old format: `[syllable][accidental?][octave?]`.
- **Melody**: A stored composition containing note lines and optionally lyrics lines. The notation field is the target of migration.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of notes entered in the new format (`DO3#`, `RE3b`) are accepted by the validation system without error.
- **SC-002**: 100% of existing melodies are migrated to the new format with zero data loss.
- **SC-003**: All transposition and instrument conversion operations output exclusively the new notation format.
- **SC-004**: The old format (`DO#3`, `REb3`) is rejected by validation for new melody input within the same release.
- **SC-005**: Users experience no difference in playback or audio output after the notation format change — the migration is purely a display/storage format change.

## Assumptions

- The migration applies to the `notation` field of all stored melodies in the database.
- Notes that have no octave number or no accidental (e.g., `do`, `DO`, `do#`, `RE1`) are unaffected by the format reordering — only tokens with BOTH octave and accidental are migrated.
- The frontend and backend both need their regex/parsing logic updated since both contain note parsing.
- Playback/audio is unaffected because the underlying semitone calculation does not depend on character order in the string — only on which syllable, accidental, and octave are present.
- The old format `[syllable][accidental][octave]` will no longer be accepted for new input once this feature ships, enforcing a single canonical format going forward.
- The case-based octave system (uppercase = octave 5+, lowercase = octave 4-) remains unchanged. Only the relative position of accidental and octave number is affected by this refactor.
