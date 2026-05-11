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

1. **Given** an authenticated user on the compose page, **When** they click a "+" button above the melody input, **Then** a new instrument tab opens after the last one
2. **Given** a new tab is open, **When** the user clicks on the tab name, **Then** a modal displays the available instruments (Piano in C, Saxophone in Eb, Trumpet in Bb, Trombone in C)
3. **Given** the instrument modal is visible, **When** the user selects an instrument, **Then** the modal closes and the tab's notation is automatically transposed from the first tab's key to the selected instrument's key
4. **Given** the instrument modal is visible, **When** the user selects an instrument, **Then** the tab is renamed with the instrument name
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

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Each melody MUST support multiple notation tabs, one per instrument
- **FR-002**: The first tab defaults to "Piano in C" but the user can change any tab's instrument at any time (including the first tab)
- **FR-003**: A "+" button above the melody input MUST allow adding new instrument tabs
- **FR-004**: Clicking a tab name MUST open an instrument selection modal
- **FR-005**: Available instruments: Piano in C (0 semitones), Saxophone in Eb (-9 semitones), Trumpet in Bb (-2 semitones), Trombone in C (0 semitones)
- **FR-006**: When a new tab is created, its notation MUST be automatically transposed from the source tab's instrument to the selected instrument (any-to-any transposition, not just from Piano)
- **FR-006a**: Transposition between any two instruments is computed via concert pitch: convert source notation to concert pitch using source instrument's offset, then convert from concert pitch to target instrument's written pitch
- **FR-007**: Tab names MUST show the instrument name; users can add a suffix but not edit the instrument prefix
- **FR-008**: Transpose controls MUST affect ALL tabs simultaneously
- **FR-009**: Maximum 10 instrument tabs per melody
- **FR-010**: On the shared/view melody page, tabs are displayed read-only — users can switch between them
- **FR-010a**: When navigating between melodies in a setlist, the system MUST remember the user's selected tab by full label (instrument + suffix, e.g., "Trombone - 1") and auto-select the tab with the exact same full label on the next melody. If no exact match exists, fall back to first tab matching the same instrument. If no instrument match, fall back to the first available tab.
- **FR-011**: Instruments are a fixed list (no CRUD) with name and semitone offset from Piano in C

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

## Assumptions

- The transposition offset for each instrument is fixed and hardcoded (no user-configurable offsets in v1)
- Saxophone in Eb: written C sounds as Eb → to convert piano to sax part, transpose UP 9 semitones (or equivalently, the sax reads 9 semitones higher to sound the same pitch) — CORRECTION: for the sax player to play the same sounding pitch, they read notation that is 9 semitones HIGHER than concert pitch. So piano "do" = sax "la" (concert pitch stays the same, written notation shifts)
- Trumpet in Bb: written C sounds as Bb → player reads 2 semitones HIGHER than concert. Piano "do" = trumpet "re"
- Trombone in C: concert pitch instrument, same as piano (0 offset)
- Any tab can serve as the source for transposition — the system uses the source tab's instrument offset to compute the interval to the target instrument
- Users can change the first tab's instrument (it is NOT locked to Piano)
- Each tab stores its own notation text independently (transposition is computed once on creation, then the tab is editable independently)
- Existing melodies (created before this feature) will have a single "Piano in C" tab containing their current notation
