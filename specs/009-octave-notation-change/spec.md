# Feature Specification: Octave Notation Change

**Feature Branch**: `009-octave-notation-change`  
**Created**: 2026-06-07  
**Status**: Draft  
**Input**: User description: "Change the octave notation. Base stays lowercase, first octave uppercase, second octave uses number 3 (not 1), lower octaves unchanged."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Compose with New Upper Octave Numbering (Priority: P1)

A user composing a melody needs to write notes in octaves above the first upper octave. Previously they typed `DO1` for the second upper octave; now they must type `DO3` instead. This aligns the notation so that the number directly represents the absolute octave (octave 3, 4, 5, 6, etc.) rather than being a relative offset.

**Why this priority**: This is the core behavioral change — the new numbering convention for upper octaves is the entire feature.

**Independent Test**: A user types `DO3` into the composer and hears/sees the note at what was previously `DO1` (one octave above uppercase). Similarly, `DO4` produces what was previously `DO2`.

**Acceptance Scenarios**:

1. **Given** a user is composing, **When** they type `do`, **Then** the system interprets it as octave 4 (C4) — unchanged.
2. **Given** a user is composing, **When** they type `DO`, **Then** the system interprets it as octave 5 (C5) — unchanged.
3. **Given** a user is composing, **When** they type `DO3`, **Then** the system interprets it as octave 6 (C6) — previously this was `DO1`.
4. **Given** a user is composing, **When** they type `DO4`, **Then** the system interprets it as octave 7 (C7) — previously this was `DO2`.
5. **Given** a user is composing, **When** they type `do1`, **Then** the system interprets it as octave 3 (C3) — unchanged.
6. **Given** a user is composing, **When** they type `do2`, **Then** the system interprets it as octave 2 (C2) — unchanged.

---

### User Story 2 - Transposition Output Uses New Notation (Priority: P1)

When the system transposes notes and outputs notation (e.g., displaying tabs for different instruments), it must render upper octave numbers using the new convention. A note at octave 6 must be displayed as `DO3` (not `DO1`).

**Why this priority**: If parsing accepts new input but output still uses old notation, the system is inconsistent and confusing.

**Independent Test**: Transpose a melody that contains notes above octave 5. The displayed output shows `DO3`, `RE3`, etc. for octave 6 notes.

**Acceptance Scenarios**:

1. **Given** a note at octave 6, **When** the system renders it as text, **Then** it displays `DO3` (not `DO1`).
2. **Given** a note at octave 7, **When** the system renders it as text, **Then** it displays `DO4` (not `DO2`).
3. **Given** a note at octave 5, **When** the system renders it as text, **Then** it displays `DO` (no number) — unchanged.
4. **Given** a note at octave 3, **When** the system renders it as text, **Then** it displays `do1` — unchanged.

---

### User Story 3 - Existing Melodies with Old Notation (Priority: P2)

Users who previously saved melodies using the old notation (e.g., `DO1` for octave 6) need those melodies to still play correctly or be migrated to the new notation.

**Why this priority**: Data integrity for existing content matters, but can be handled after the core parsing change.

**Independent Test**: Load a melody stored with `DO1` notation and verify it still plays at octave 6, or is displayed with the updated `DO3` notation.

**Acceptance Scenarios**:

1. **Given** an existing melody stored with `DO1` in the database, **When** it is loaded and played, **Then** it sounds at octave 6 (same pitch as before).
2. **Given** an existing melody stored with `DO2` in the database, **When** it is loaded and played, **Then** it sounds at octave 7 (same pitch as before).

---

### Edge Cases

- What happens when a user types `DO1` or `DO2` under the new system? These should be treated as invalid or interpreted using a backward-compatible rule (see Assumptions).
- What about `DO0`? Zero is not a valid octave number for upper notes (uppercase without a number already represents octave 5).
- Accidentals with octave numbers: `DO#3` should be C#6, `REb3` should be Db6.
- What is the maximum octave supported? Reasonable limit is octave 8 (MIDI note 108 = C8).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Lowercase notes without a number MUST be interpreted as octave 4 (unchanged).
- **FR-002**: Uppercase notes without a number MUST be interpreted as octave 5 (unchanged).
- **FR-003**: Uppercase notes with a number N (where N >= 3) MUST be interpreted as octave N+3. Specifically: `DO3` = octave 6, `DO4` = octave 7, `DO5` = octave 8.
- **FR-004**: Lowercase notes with a number N (where N >= 1) MUST be interpreted as octave 4-N (unchanged). Specifically: `do1` = octave 3, `do2` = octave 2.
- **FR-005**: When the system outputs/renders a note at octave 6 or above, it MUST use the new notation: octave 6 = uppercase + "3", octave 7 = uppercase + "4", etc.
- **FR-006**: When the system outputs/renders a note at octave 5, it MUST use uppercase without a number (unchanged).
- **FR-007**: When the system outputs/renders a note at octave 4 or below, it MUST use lowercase notation (unchanged).
- **FR-008**: The system MUST handle accidentals combined with the new octave notation (e.g., `DO#3`, `REb4`).
- **FR-009**: Existing melodies stored with old notation (`DO1`, `DO2`) MUST continue to play at the correct pitch (backward compatibility during a transition period).
- **FR-010**: The formula for upper octave interpretation is: for uppercase note with number N, octave = N + 3. This means `DO3` = 3+3 = octave 6, `DO5` = 5+3 = octave 8.

### Key Entities

- **Note**: A solfege syllable with optional accidental and optional octave indicator. The octave encoding changes for upper register notes.
- **Melody notation string**: A space-separated sequence of notes stored in the database. May contain old-format notes that need backward-compatible parsing.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of notes typed using the new notation are interpreted at the correct pitch on first attempt.
- **SC-002**: 100% of existing melodies stored with old notation continue to produce the same audio output after the change.
- **SC-003**: All transposition and instrument tab outputs use the new notation convention consistently.
- **SC-004**: Users can compose across the full supported octave range (C2 to C8) without encountering notation errors.

## Assumptions

- The old notation `DO1` and `DO2` will be treated as backward-compatible input during a transition period: `DO1` still maps to octave 6, `DO2` to octave 7. However, any new output from the system will use the new format (`DO3`, `DO4`).
- The number in the new upper octave notation represents "octave = number + 3" (so the number essentially IS the octave number minus 3, aligning with the idea that 3 is the "third register").
- Maximum supported octave is 8 (C8), which is `DO5` in the new notation.
- No database migration is required — stored notation strings with old format are handled via backward-compatible parsing.
- The playback system and audio engine do not need changes since they work with computed pitches/semitones, not raw notation strings.
