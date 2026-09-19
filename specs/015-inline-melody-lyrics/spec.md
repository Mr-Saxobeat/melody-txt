# Feature Specification: Inline Melody Lyrics

**Feature Branch**: `015-inline-melody-lyrics`
**Created**: 2026-09-19
**Status**: Draft
**Input**: User description: "Allow musicians to write lyrics in the same row as melody notations using quotes"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Musician Writes Inline Lyrics with Notations (Priority: P1)

As a musician, I want to write lyrics enclosed in double quotes on the same line as melody notations so that I can clarify the timing and phrasing of the melody.

**Why this priority**: This is the core of the feature — enabling mixed notation and lyrics on a single line to align melody timing with words.

**Independent Test**: Can be fully tested by opening the compose page, typing a line like `sol sol la sol DO si "Parabéns pra você"`, saving, and verifying that the notations appear in green and the quoted lyrics appear in orange on the same line, without the surrounding quotes shown.

**Acceptance Scenarios**:

1. **Given** the musician is composing, **When** they type `sol sol la sol DO si "Parabéns pra você"`, **Then** the notations (sol sol la sol DO si) display in the notation color (green) and style, and the lyrics (Parabéns pra você) display in the lyrics color (orange) and style, all on the same row without the surrounding quote characters.
2. **Given** the musician is composing, **When** they type `"Então me ajude a" DO DO DO "segurar"`, **Then** the lyrics "Então me ajude a" and "segurar" display in orange and the notations DO DO DO display in green, in the order typed, all on the same row.
3. **Given** the musician is composing, **When** they type a line with only valid notations (no quotes), **Then** the line behaves exactly as it does today — classified as a note line with all content in green.
4. **Given** the musician is composing, **When** they type a line with mixed tokens that aren't valid notations and aren't enclosed in quotes, **Then** the entire line is classified as lyrics (orange), preserving existing behavior.

---

### User Story 2 - Multi-line Quoted Lyrics (Priority: P2)

As a musician, I want to open a quote on one line and close it on a subsequent line so that I can write longer lyric passages that span multiple lines alongside my notations.

**Why this priority**: Supports more complex compositions but is less common than single-line inline lyrics.

**Independent Test**: Can be fully tested by typing a quote character, pressing Enter, typing lyrics content, and closing the quote on a later line — verifying all content between the quotes is treated as lyrics.

**Acceptance Scenarios**:

1. **Given** the musician is composing, **When** they type `"` on one line, followed by lyrics text on subsequent lines, and close with `"` on a later line, **Then** all content between the opening and closing quotes is treated and displayed as lyrics (orange).
2. **Given** an unclosed opening quote exists, **When** the musician views the composition, **Then** all content from the opening quote to the end of the input is treated as lyrics until a closing quote is found.

---

### User Story 3 - Inline Lyrics Display in Shared/Read-Only View (Priority: P2)

As a viewer of a shared melody, I want to see inline lyrics displayed with proper color coding alongside notations so that I can follow the melody timing and lyrics together.

**Why this priority**: Ensures the feature works end-to-end — not just in the composer but also when viewing shared melodies.

**Independent Test**: Can be fully tested by creating a melody with inline lyrics, sharing it, and verifying the shared view displays notations in green and lyrics in orange on the same line.

**Acceptance Scenarios**:

1. **Given** a shared melody contains a line `sol sol "Happy birthday" DO si`, **When** a viewer opens the shared link, **Then** the notation segments display in green and the lyrics segment displays in orange on the same line.

---

### Edge Cases

- A line with only quoted text and no notations is classified as lyrics.
- An empty quoted segment (`""`) is ignored and does not affect classification.
- Nested quotes are not supported — the first closing quote terminates the lyrics segment.
- A single unmatched quote at the end of a line treats everything after it as lyrics until end of line.
- Quoted lyrics within a note line do not affect transposition — only the notation tokens are transposed.
- The hidden notes feature (`*text*`) continues to work independently of inline lyrics. Hidden markers inside a quoted lyrics segment are treated as literal text, not hidden markers.
- Instrument tab transposition only applies to notation tokens — quoted lyrics are preserved as-is when transposing between instruments.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST support double-quote (`"`) delimited lyrics segments within a notation line.
- **FR-002**: Quoted lyrics segments MUST be displayed in the lyrics color and style (orange, italic) while notation tokens on the same line MUST be displayed in the notation color and style (green, bold).
- **FR-003**: The surrounding double-quote characters MUST NOT be displayed in the rendered output — only the lyrics text content is shown.
- **FR-004**: A line containing both valid notation tokens and quoted lyrics segments MUST be classified as a mixed line, with each segment rendered in its appropriate style.
- **FR-005**: Existing classification behavior MUST be preserved: a line with only notation tokens (no quotes) is classified as notes; a line with unquoted tokens that fail majority-vote classification is classified as lyrics.
- **FR-006**: When transposing a mixed line between instruments or keys, only the notation tokens MUST be transposed — quoted lyrics segments MUST remain unchanged.
- **FR-007**: Multi-line quoted lyrics MUST be supported: an opening quote on one line and a closing quote on a subsequent line treats all content between them as lyrics.
- **FR-008**: The inline lyrics display MUST work in both the compose editor view and the shared/read-only view.
- **FR-009**: The notation stored in the database MUST preserve the original text including quote delimiters so that the mixed-line structure can be reconstructed when viewing.
- **FR-010**: Quoted lyrics segments within a note line MUST be excluded from note count and duration calculations.

### Key Entities

- **Mixed Line**: A line of notation text that contains both solfege notation tokens and double-quote-delimited lyrics segments. This is a new line classification type alongside the existing 'notes', 'lyrics', and 'empty' types.
- **Lyrics Segment**: A substring enclosed in double quotes within a line. Displayed in lyrics style (orange, italic). Quote delimiters are not rendered.
- **Notation Segment**: One or more valid solfege tokens outside of quotes on a mixed line. Displayed in notation style (green, bold). Subject to transposition.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Musicians can compose lines mixing notations and lyrics and see correct color-coded rendering within 1 second of typing.
- **SC-002**: 100% of existing melodies (pure note lines, pure lyrics lines) render identically before and after the feature — zero regressions.
- **SC-003**: Transposition of mixed lines preserves lyrics verbatim while correctly shifting notation tokens.
- **SC-004**: Shared melody views display inline lyrics with the same color coding as the composer view.
- **SC-005**: Note count and duration calculations exclude quoted lyrics segments, matching the count of actual notation tokens only.

## Assumptions

- Double quotes (`"`) are the only delimiter for inline lyrics — no other quote types (single quotes, backticks, guillemets) are supported.
- Quoted lyrics segments can contain any characters except unescaped double quotes.
- The feature applies to the frontend rendering and classification only — the backend stores the raw text with quotes and does not need to parse the mixed-line format.
- Performance of the new parsing is not a concern — typical melodies have fewer than 200 lines.
- The PDF export service renders mixed lines with the same color segmentation as the web views.
