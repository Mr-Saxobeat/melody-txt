# Feature Specification: Multi-Instrument Notation

**Feature Branch**: `004-multi-instruments`
**Created**: 2026-05-11
**Status**: Draft
**Input**: User description: "Multi instrument notation tabs for melodies"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create Multiple Instrument Tabs (Priority: P1)

An authenticated user wants to create multiple notation tabs for the same melody, each transposed for a different instrument. This allows musicians to play the same song together on saxophone, trumpet, trombone, etc.

**Why this priority**: Core value — without multi-tab support, the feature doesn't exist.

**Independent Test**: Create a melody with "do re mi" on piano, add a saxophone tab, verify the notation shows "la si do#" (transposed down 9 semitones for Eb instrument).

**Acceptance Scenarios**:

1. **Given** an authenticated user on the compose page, **When** they create a new melody, **Then** an instrument selection prompt/modal appears asking for the source instrument
2. **Given** the instrument selection modal is visible, **When** the user selects a source instrument and enters notation, **Then** all 4 instrument tabs are automatically created in fixed order (Piano, Saxophone, Trumpet, Trombone) with notation transposed from the source instrument
3. **Given** all 4 tabs exist, **When** the user clicks a "+" button above the melody input, **Then** a new instrument tab opens after the last one (for adding duplicate instrument tabs with different suffixes)
4. **Given** a tab exists, **When** the user clicks on the tab name, **Then** a modal displays the available instruments (Piano in C, Saxophone in Eb, Trumpet in Bb, Trombone in C) to change the instrument
5. **Given** the user clicks on a tab's name, **When** the name editor opens, **Then** the instrument name prefix is not editable but the user can add a suffix (e.g., "Saxophone - João")
6. **Given** a melody "do re mi" for "Piano in C", **When** the user adds a "Saxophone in Eb" tab, **Then** the new tab shows "la si do#" (transposed for Eb)
7. **Given** a melody "do re mi" for "Piano in C", **When** the user adds a "Trumpet in Bb" tab, **Then** the new tab shows "re mi fa#" (transposed for Bb)

---

### User Story 2 - Transposition Affects All Tabs (Priority: P2)

When a user uses the transpose controls on the compose or shared melody page, all instrument tabs are transposed simultaneously by the same interval.

**Why this priority**: Ensures consistent key changes across all parts when the whole band needs to shift.

**Independent Test**: With piano showing "do re mi" and saxophone showing "la si do#", click "up half step" — piano becomes "do# re# fa" and saxophone becomes "la# si# re".

**Acceptance Scenarios**:

1. **Given** multiple instrument tabs exist, **When** the user clicks a transpose button, **Then** all tabs' notations are transposed by the same interval
2. **Given** the user is viewing a shared melody with multiple tabs, **When** they transpose, **Then** all tabs update simultaneously

---

### Edge Cases

- What happens when the first tab (reference) notation is empty? New tabs start empty too.
- What happens when a user deletes the first tab? The next tab becomes the reference.
- Can tabs be reordered? Not in v1 — tabs maintain creation order.
- Maximum number of tabs per melody? 10 tabs.
- What happens on the shared/view melody page? Tabs are displayed as read-only — user can switch between them to view each instrument's part.
- What happens if the user tries to delete the last remaining tab? The delete action is disabled or hidden when only 1 tab remains.
- What happens if the user dismisses the source instrument modal (clicks outside)? Modal closes, composer loads with no tabs and an empty input, "+" button is available for adding an instrument tab later.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Each melody MUST support multiple notation tabs, one per instrument
- **FR-002**: When creating a new melody, the user MUST first select the source instrument via a prompt/modal; the system then auto-creates all 4 instrument tabs in fixed order (Piano, Saxophone, Trumpet, Trombone) with the notation transposed from the selected source instrument. The user can change any tab's instrument at any time (including the first tab)
- **FR-003**: A "+" button above the melody input MUST allow adding new instrument tabs
- **FR-004**: Clicking a tab name MUST open an instrument selection modal
- **FR-005**: Available instruments: Piano in C (0 semitones), Saxophone in Eb (-9 semitones), Trumpet in Bb (-2 semitones), Trombone in C (0 semitones)
- **FR-006**: When a new tab is created, its notation MUST be automatically transposed from the source tab's instrument to the selected instrument (any-to-any transposition, not just from Piano)
- **FR-006a**: Transposition between any two instruments is computed via concert pitch: convert source notation to concert pitch using source instrument's offset, then convert from concert pitch to target instrument's written pitch
- **FR-007**: On the compose page, tab names MUST show only the instrument name without its pitch (e.g., "Saxophone", not "Saxophone in Eb"); users can add a suffix but not edit the instrument prefix. On the shared melody page, tab names MUST show the instrument name plus any custom suffix (e.g., "Saxophone - 1")
- **FR-008**: Transpose controls MUST affect ALL tabs simultaneously
- **FR-009**: Maximum 10 instrument tabs per melody
- **FR-010**: On the shared/view melody page, tabs are displayed read-only — users can switch between them
- **FR-010a**: When navigating between melodies in a setlist, the system MUST remember the user's selected tab by full label (instrument + suffix, e.g., "Trombone - 1") and auto-select the tab with the exact same full label on the next melody. If no exact match exists, fall back to first tab matching the same instrument. If no instrument match, fall back to the first available tab.
- **FR-011**: Instruments are a fixed list (no CRUD) with name and semitone offset from Piano in C
- **FR-012**: When validating or transposing a melody line, unrecognized symbols MUST be silently ignored (passed through unchanged); only valid solfege tokens are transposed. A line is never invalidated due to containing unrecognized symbols alongside valid notes.
- **FR-013**: When a user creates a new melody for any instrument, the system MUST automatically create one tab for each of the 4 fixed instruments (Piano in C, Saxophone in Eb, Trumpet in Bb, Trombone in C), with each tab's notation auto-transposed from the source instrument
- **FR-014**: Users MUST be able to delete any instrument tab, with the constraint that at least 1 tab must remain per melody
- **FR-015**: When saving a new melody without a title, the system MUST pre-fill the title field with the first non-empty line of the source tab's notation, but MUST NOT remove that line from the notation

### Key Entities

- **Instrument**: A fixed entity with name and semitone offset relative to Piano in C (e.g., Saxophone in Eb = -9, Trumpet in Bb = -2, Trombone in C = 0)
- **MelodyTab**: A notation associated with a melody and an instrument, with position order and optional suffix label

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can add an instrument tab and see the transposed notation in under 2 seconds
- **SC-002**: Transposition between instruments is musically correct 100% of the time (verified against known interval tables)
- **SC-003**: All instrument tabs transpose simultaneously when using transpose controls
- **SC-004**: Users can view all instrument tabs on the shared melody page without authentication
- **SC-005**: Tab switching is instant (no loading delay)

## Clarifications

### Session 2026-05-11

- Q: Can the user change any tab's instrument at any time? → A: Yes, any tab (including the first) can have its instrument changed at any time
- Q: Can transposition work between any pair of instruments? → A: Yes, any-to-any transposition via concert pitch intermediate (source offset → concert → target offset)
- Q: What happens to instrument tab selection when navigating setlist? → A: Matches by full label (instrument + suffix, e.g. "Trombone - 1"); falls back to same instrument without suffix match; then first tab
- Q: How should invalid symbols on a melody line be handled? → A: Ignore invalid symbols and validate only the valid notes; never invalidate an entire line due to unrecognized symbols

### Session 2026-05-13

- Q: What does "auto-create tabs for each existing instrument" mean? → A: All 4 fixed instruments (Piano, Saxophone, Trumpet, Trombone) — always create a tab for each when a new melody is added
- Q: Can users delete unwanted auto-created instrument tabs? → A: Yes, any tab can be deleted as long as at least 1 tab remains
- Q: Do edits on one tab propagate to other tabs after auto-creation? → A: No, tabs are independent after initial creation — edits to one tab do not affect others
- Q: How does the user specify the source instrument when creating a melody? → A: User picks the source instrument first via a prompt/modal, then all 4 tabs are created in fixed order
- Q: Should existing melodies retroactively get all 4 instrument tabs? → A: No, keep existing melodies as-is with a single Piano tab; auto-creation only applies to newly created melodies
- Q: Should the auto-title rule (extract first line as title) continue with the new multi-tab flow? → A: Keep auto-title as a pre-filled suggestion but do NOT remove the first line from the notation
- Q: What happens when the user dismisses the source instrument modal? → A: Modal closes, composer loads normally with no tabs, the "+" button is available so the user can choose an instrument later
- Q: How should tab names display on compose vs shared page? → A: Compose page shows instrument name only (e.g., "Saxophone"); shared page shows instrument name + suffix (e.g., "Saxophone - 1")

## Assumptions

- The transposition offset for each instrument is fixed and hardcoded (no user-configurable offsets in v1)
- Saxophone in Eb: written C sounds as Eb → to convert piano to sax part, transpose UP 9 semitones (or equivalently, the sax reads 9 semitones higher to sound the same pitch) — CORRECTION: for the sax player to play the same sounding pitch, they read notation that is 9 semitones HIGHER than concert pitch. So piano "do" = sax "la" (concert pitch stays the same, written notation shifts)
- Trumpet in Bb: written C sounds as Bb → player reads 2 semitones HIGHER than concert. Piano "do" = trumpet "re"
- Trombone in C: concert pitch instrument, same as piano (0 offset)
- Any tab can serve as the source for transposition — the system uses the source tab's instrument offset to compute the interval to the target instrument
- Users can change the first tab's instrument (it is NOT locked to Piano)
- Each tab stores its own notation text independently (transposition is computed once on creation, then the tab is editable independently)
- Existing melodies (created before this feature) will have a single "Piano in C" tab containing their current notation — no retroactive auto-creation of additional tabs; users can manually add tabs via the "+" button
