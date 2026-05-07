# Feature Specification: Solfege Transposition, Octaves & Accidentals

**Feature Branch**: `002-solfege-transposition-octaves`
**Created**: 2026-05-08
**Status**: Draft
**Input**: User description: "Remove key change feature, replace with transposition arrows, add multi-octave notation, add accidentals"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Transpose Melody via Arrows (Priority: P1)

A user has composed a melody in the text input and wants to shift all notes up or down by a half step or whole step without manually rewriting each note. The composer interface provides arrow buttons next to the notation input that transpose all notes at once when clicked, updating the text in real time.

**Why this priority**: Transposition is the core replacement for the old key-change feature and provides immediate musical utility — moving a melody to a comfortable range is the most common operation after composing.

**Independent Test**: Enter "do re mi" in the composer, click the "up half step" arrow, verify the notation updates to "do# re# fa" (each note shifted up one semitone).

**Acceptance Scenarios**:

1. **Given** a melody "do re mi" in the input, **When** the user clicks "up half step", **Then** the notation becomes "do# re# fa"
2. **Given** a melody "do re mi" in the input, **When** the user clicks "up whole step", **Then** the notation becomes "re mi fa#"
3. **Given** a melody "do re mi" in the input, **When** the user clicks "up whole step" two times consecutively, **Then** the notation becomes "mi fa# sol#" (each click transposes the current state)
4. **Given** a melody "do re mi" in the input, **When** the user clicks "down half step", **Then** the notation becomes "si1 do# re#" (wrapping to lower octave for notes below do)
5. **Given** a melody "DO RE MI" in the input (octave 5), **When** the user clicks "up half step", **Then** the notation becomes "DO# RE# FA"
6. **Given** the notation contains accidentals like "do# mi sol#", **When** the user clicks "up half step", **Then** it becomes "re fa la"
7. **Given** the user clicks "up half step" 12 times starting from "do re mi", **Then** the notation becomes "DO RE MI" (one full octave up)

---

### User Story 2 - Multi-Octave Notation (Priority: P2)

A user wants to compose melodies spanning multiple octaves using a case and number notation system:
- Lowercase = octave 4 (do = C4)
- Lowercase + number = lower octaves (do1 = C3, do2 = C2)
- Uppercase = octave 5 (DO = C5)
- Uppercase + number = higher octaves (DO1 = C6, DO2 = C7)

The system validates these notations and plays them at the correct pitch.

**Why this priority**: Multi-octave support dramatically expands the musical expressiveness of the tool, enabling real melodies that span more than 7 notes.

**Independent Test**: Enter "do1 do DO DO1" in the input and play — hear C3, C4, C5, C6 in sequence at the correct frequencies.

**Acceptance Scenarios**:

1. **Given** the user types "do", **When** played back, **Then** the audio plays at C4 (261.63 Hz)
2. **Given** the user types "do1", **When** played back, **Then** the audio plays at C3 (130.81 Hz)
3. **Given** the user types "DO", **When** played back, **Then** the audio plays at C5 (523.25 Hz)
4. **Given** the user types "DO1", **When** played back, **Then** the audio plays at C6 (1046.50 Hz)
5. **Given** the user types "sol2", **When** played back, **Then** the audio plays at G2

---

### User Story 3 - Accidentals (Sharps and Flats) (Priority: P3)

A user wants to include sharps (#) and flats (b) in their melodies to access all 12 chromatic notes. The system supports both sharp notation (do#, re#) and flat notation (reb, mib), treating enharmonic equivalents as the same pitch.

**Why this priority**: Accidentals complete the chromatic scale, allowing users to compose in any tonality rather than being limited to the C major scale.

**Independent Test**: Enter "do do# re reb" and play — hear C4, C#4, D4, C#4 (reb = do# enharmonically).

**Acceptance Scenarios**:

1. **Given** the user types "do#", **When** played back, **Then** the audio plays at C#4/Db4
2. **Given** the user types "reb", **When** played back, **Then** the audio plays at C#4/Db4 (same as do#)
3. **Given** the user types "mi#", **When** played back, **Then** the audio plays at F4 (enharmonic equivalent)
4. **Given** the user types "fab", **When** played back, **Then** the audio plays at E4 (enharmonic equivalent)
5. **Given** the user types "DO#1", **When** played back, **Then** the audio plays at C#6 (accidental + octave combined)
6. **Given** the user types an invalid accidental like "dox", **When** validated, **Then** the system shows a validation error

---

### Edge Cases

- What happens when transposing "si" (B4) up a half step? It wraps to "DO" (C5, next octave)
- What happens when transposing "do" (C4) down a half step? It wraps to "si1" (B3, lower octave)
- What happens when transposing "DO2" (C7) up? It should continue to "DO#2" or warn if maximum range exceeded
- What happens when the input is empty and user clicks transpose? Nothing happens (buttons disabled)
- What happens with mixed octave/accidental notation during transposition? All notes transpose correctly regardless of octave or accidental markers
- How does the system handle "sib" vs "la#"? Both are valid, transposition may normalize to one form (prefer sharps for upward transposition, flats for downward)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide three transposition groups, each with a minus (-) and plus (+) button: half step (-1/+1 semitone), whole step (-2/+2 semitones), octave (-12/+12 semitones). All three groups MUST be equally spaced with equal width, displayed in a single row above the text input.
- **FR-002**: When a transposition arrow is clicked, the system MUST update the notation text input by transposing every note by the specified interval, operating on the current state of the notation (cumulative — clicking multiple times stacks the transpositions)
- **FR-003**: Transposition MUST preserve octave markers and adjust them when notes cross octave boundaries
- **FR-003a**: Transposition MUST preserve the text formatting of the input (whitespace between notes, newlines, multiple spaces, indentation) — only the note tokens themselves change
- **FR-004**: System MUST support lowercase notation for octave 4 (do = C4 through si = B4)
- **FR-005**: System MUST support lowercase + number notation for lower octaves (do1 = C3, do2 = C2, etc.)
- **FR-006**: System MUST support uppercase notation for octave 5 (DO = C5 through SI = B5)
- **FR-007**: System MUST support uppercase + number notation for higher octaves (DO1 = C6, DO2 = C7, etc.)
- **FR-008**: System MUST support sharp notation using # suffix (do# = C#4, re# = D#4)
- **FR-009**: System MUST support flat notation using b suffix (reb = Db4, mib = Eb4)
- **FR-010**: System MUST treat enharmonic equivalents as the same pitch during playback (do# = reb)
- **FR-011**: Validation MUST accept any combination of syllable + accidental + octave (e.g., "DO#1", "reb2")
- **FR-012**: Transposition arrows MUST be disabled when the notation input is empty or contains only invalid notes
- **FR-013**: The existing key selector dropdown MUST be removed and replaced by the transposition arrow controls
- **FR-014**: Playback MUST use the correct frequency for each note based on its octave and accidental
- **FR-015**: System MUST support a minimum range of C2 to C7 (5 octaves)
- **FR-016**: The text input MUST support mixed content: music notes and lyrics text on separate lines
- **FR-017**: Line detection rule: if ANY token on a line is not a valid note, the ENTIRE line is treated as lyrics (no validation errors for that line)
- **FR-018**: Lines containing ONLY valid notes MUST be validated and played as music
- **FR-019**: The text input MUST visually highlight note lines differently from lyrics lines using an overlay technique (transparent textarea on top of a styled backdrop div that renders colored text inline)
- **FR-020**: Transposition MUST only affect note lines — lyrics lines remain unchanged
- **FR-021**: The "notes count", "duration estimate", and helper tip sections MUST be removed from the composer interface
- **FR-022**: The transpose controls MUST be positioned above the text input box
- **FR-023**: Tokens composed entirely of the characters |, :, -, ., /, (, ) or digits (0-9) MUST be ignored when determining if a line is a note line — they do not invalidate the line and are not played
- **FR-023a**: When ignored symbols are attached to a note token (e.g., "(do", "mi)", "-do"), the symbols MUST be stripped and the remaining text validated as a note. The token "(do" validates as "do", "mi)" validates as "mi".
- **FR-024**: Playback MUST skip pure symbol tokens and play the note portion of tokens with attached symbols
- **FR-025**: The Play and Stop buttons MUST be inside the same card/section as the text input (not in a separate "Playback" section)
- **FR-026**: When Stop is clicked, playback MUST fully reset — all scheduled notes cancelled so the next Play starts from the beginning with no overlapping audio
- **FR-027**: On the "My Melodies" page, each melody card MUST display sections vertically aligned in this order: header (title), meta (note count, duration, date), player (play/stop), actions (share, edit, delete). Notation is NOT shown on cards to ensure uniform card height across the grid.
- **FR-028**: The shared melody page MUST show transpose controls and play button so non-authors can transpose and play without saving
- **FR-029**: On the shared melody page, the text input MUST be read-only (non-authors cannot type) but transpose buttons MUST still modify the displayed notation client-side
- **FR-030**: The Save button MUST only appear when the viewer is the melody's author (on the edit page)
- **FR-031**: On the edit page (author view), the text input MUST be editable and the Save button MUST persist changes to the database

### Key Entities

- **Note**: A solfege syllable (do, re, mi, fa, sol, la, si) with optional accidental (#/b) and optional octave indicator (case + number)
- **Transposition**: An operation that shifts all notes in the input by a fixed number of semitones (1 or 2, up or down)
- **Octave**: Determined by case (lowercase=4, uppercase=5) and number suffix (adds/subtracts from base)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can transpose a melody in under 1 second (click arrow, see updated text immediately)
- **SC-002**: All 12 chromatic pitches within each supported octave can be notated and played correctly
- **SC-003**: Transposition correctly handles 100% of octave boundary crossings (e.g., si → DO when going up)
- **SC-004**: Users can compose and play melodies spanning at least 5 octaves (C2 to C7)
- **SC-005**: 100% of enharmonic equivalents produce the same audio frequency (do# and reb sound identical)
- **SC-006**: The notation system is learnable — a user can compose a multi-octave melody within 5 minutes of first use

## Clarifications

### Session 2026-05-08

- Q: How should the text input highlight notes vs lyrics inline? → A: Overlay technique — transparent textarea on top of a styled backdrop div that renders colored text

### Session 2026-05-09

- Q: How should non-note symbols on a note line be handled? → A: Characters |, :, -, ., /, (, ) and standalone numbers are ignored when determining if a line is notes. They don't invalidate the line and are not played — only valid note tokens are played. These symbols serve as musical annotations (to be defined later).

## Assumptions

- The existing melody composer app (from feature 001) is the baseline; this feature modifies and extends it
- The key selector dropdown (from User Story 3 of feature 001) is removed entirely and replaced with transposition arrows
- The transposition operates on the text content directly — it modifies the notation string in the input
- When transposing upward, sharps are preferred for accidentals; when transposing downward, flats are preferred
- The playback engine already supports frequency-based note synthesis and can be extended to handle precise pitches
- No server-side changes are needed — transposition and octave/accidental parsing are client-side operations
- The existing save/share melody functionality continues to work with the new notation format
- Backend validation for melodies MUST be updated to accept the new notation syntax
