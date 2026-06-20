# Feature Specification: Hidden Notes

**Feature Branch**: `010-hidden-notes`  
**Created**: 2026-06-20  
**Status**: Draft  
**Input**: User description: "Create a system like WhatsApp where notes between asterisks are a lighter color. Asterisks are invisible when cursor moves away from the word. In view melody page, asterisks must never be visible."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Write Hidden Notes in Editor (Priority: P1)

A user composing a melody wants to add personal annotations or reminders within the notation text. They wrap text in asterisks (e.g., `*breath here*`) and it appears in a lighter/muted color, visually distinguishing it from the actual melody content.

**Why this priority**: This is the core interaction — writing and visually identifying hidden notes within the editor.

**Independent Test**: Type `*reminder text*` in the melody editor and verify it renders in a lighter color than surrounding text.

**Acceptance Scenarios**:

1. **Given** a user is editing a melody, **When** they type text wrapped in asterisks (e.g., `*do re mi*`), **Then** the text (including asterisks) appears in a lighter shade of the line's color (e.g., light green on a note line).
2. **Given** a user is editing a melody with hidden notes, **Then** the asterisks are always visible in the editor regardless of cursor position.
3. **Given** a user is editing, **When** they type a single asterisk without a closing one, **Then** no special formatting is applied until the closing asterisk is typed.

---

### User Story 2 - View Melody Without Asterisks (Priority: P1)

When viewing a shared melody (read-only view), hidden notes appear in a lighter color without any asterisks visible, providing a clean reading experience while still showing the annotations subtly.

**Why this priority**: The view page is where most users consume melodies — hidden notes must be seamlessly integrated without asterisk clutter.

**Independent Test**: Navigate to a shared melody that contains `*text*` and verify the text appears lighter with no asterisks visible.

**Acceptance Scenarios**:

1. **Given** a melody contains `*do re mi*` on a note line, **When** a user views it on the shared melody page, **Then** "do re mi" appears in a lighter green and no asterisks are visible.
2. **Given** a melody contains multiple hidden notes, **When** viewed on the shared page, **Then** all hidden notes are displayed without asterisks and in the lighter shade.
3. **Given** a melody contains `*multi word note*`, **When** viewed, **Then** all words between the asterisks appear in the lighter shade without asterisks.

---

### User Story 3 - Hidden Notes Coexist with Notes and Lyrics (Priority: P2)

Hidden notes can appear on the same line as notes or lyrics. The hidden note styling is purely visual — note parsing and transposition still operate on the full text content (including tokens inside hidden notes).

**Why this priority**: Hidden notes must integrate cleanly with the existing classification system without breaking any functionality.

**Independent Test**: Write a line like `do re *do mi* mi fa` and verify that all notes (including those inside asterisks) are parsed and transposed, while the hidden-note portion is visually muted.

**Acceptance Scenarios**:

1. **Given** a line contains `do re *do mi* mi fa`, **When** the line is classified, **Then** it is still recognized as a notes line and all tokens (including those inside asterisks) are parsed normally.
2. **Given** a melody with hidden notes containing note tokens is transposed, **When** transposition is applied, **Then** note tokens inside hidden notes are transposed like any other note.
3. **Given** a line contains `do re *annotation* mi fa` where "annotation" is not a valid note, **When** the line is classified, **Then** "annotation" is treated as any non-note token (same as today — no special handling).

---

### Edge Cases

- What happens when asterisks are nested (e.g., `*bold *nested* text*`)? Only the innermost matching pair is treated as a hidden note.
- What happens with unmatched asterisks? They are displayed as literal characters with no special formatting.
- What if a hidden note spans multiple lines? Hidden notes are single-line only — asterisks must open and close on the same line.
- What about asterisks in note names (e.g., hypothetical future notation)? Currently no note names use asterisks, so no conflict exists.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Text wrapped in matching asterisks (`*text*`) on the same line MUST be treated as a hidden note.
- **FR-002**: In the editor, hidden notes MUST be displayed in a lighter shade of the line's color (e.g., light green on note lines, light orange on lyric lines).
- **FR-003**: In the editor, asterisks MUST always be visible (no cursor-dependent hiding).
- **FR-005**: In the view/shared melody page, asterisks MUST never be visible — only the inner text is shown in muted style.
- **FR-006**: Hidden note text is NOT excluded from note parsing or transposition — the feature is purely visual styling. Tokens within hidden notes are parsed and transposed normally like any other text.
- **FR-007**: Unmatched asterisks (no closing pair on the same line) MUST be displayed as literal characters with no special formatting.
- **FR-008**: Hidden notes MUST work on both note lines and lyric lines.
- **FR-009**: Multiple hidden notes MAY appear on the same line and each MUST be independently styled.
- **FR-010**: Hidden notes MUST be stored in the database with their asterisks (the raw notation is preserved).

### Key Entities

- **Hidden Note**: Text wrapped in asterisks within a melody notation string. Stored with asterisks in the database, rendered with special styling in the UI.
- **Melody notation string**: Extended to support inline hidden notes alongside solfege notation and lyrics.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can type hidden notes and immediately see the muted visual distinction within the editor.
- **SC-002**: 100% of hidden notes on the view page display without any visible asterisks.
- **SC-003**: Note parsing and transposition work identically with or without asterisks — tokens inside hidden notes are parsed/transposed normally.
- **SC-004**: Line classification is not affected by hidden note markers — asterisks do not change whether a line is classified as notes or lyrics.

## Clarifications

### Session 2026-06-20

- Q: Should asterisks be hidden in the editor when cursor moves away? → A: No. Asterisks are always visible in the editor. Only the view page hides asterisks.
- Q: Should hidden notes be visible in view mode or completely hidden? → A: Visible in muted/lighter color (no asterisks shown).
- Q: Are hidden notes excluded from note parsing and transposition? → A: No. Hidden notes are purely visual styling. Tokens inside asterisks are parsed and transposed normally.
- Q: What color for hidden notes? → A: Lighter shade of the line's color (light green on note lines, light orange on lyric lines), not a separate gray.

## Assumptions

- The muted color for hidden notes is a lighter version of the line's existing color: light green on note lines (lighter than the bold #2e7d32), light orange on lyric lines (lighter than #e65100).
- In the editor, asterisks are always visible — no cursor proximity detection needed. This simplifies the editor implementation.
- Hidden notes are single-line only — no multi-line hidden note blocks.
- The existing `classifyLines` system does not need modification for parsing — hidden notes are purely visual. Asterisks are simply ignored during note parsing (they already fail `parseNote()` and are treated as non-note tokens).
- No new database schema changes are needed — hidden notes are simply part of the notation text string.
