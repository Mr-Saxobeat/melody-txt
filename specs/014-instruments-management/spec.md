# Feature Specification: Instruments Management

**Feature Branch**: `014-instruments-management`
**Created**: 2026-09-18
**Status**: Draft
**Input**: User description: "Enable system admin to manage instruments via the admin portal instead of hardcoding them"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Admin Adds a New Instrument (Priority: P1)

As a system administrator, I want to add a new instrument through the admin portal so that musicians using that instrument can see melodies transposed for them.

**Why this priority**: This is the core value of the feature — enabling dynamic instrument creation without code changes.

**Independent Test**: Can be fully tested by logging into the admin portal, adding a new instrument (e.g., Tenor Saxophone with pitch Bb), and verifying it appears as an available instrument when creating or editing melody tabs.

**Acceptance Scenarios**:

1. **Given** the admin is on the instrument management page, **When** they add a new instrument with name "Tenor Saxophone" and pitch "Bb", **Then** the instrument is created with the correct transposition offset (2) and becomes available for melody tabs.
2. **Given** an instrument with name "Tenor Saxophone" already exists, **When** the admin tries to add another instrument with the same name, **Then** the system prevents the duplicate and displays an error message.
3. **Given** the admin is adding a new instrument, **When** they select a pitch, **Then** the transposition offset is automatically determined from the pitch — the admin does not manually enter the offset.

---

### User Story 2 - Existing Instruments Preserved After Migration (Priority: P1)

As a system administrator, I want the existing hardcoded instruments (Piano, Saxophone, Trumpet, Trombone) to be automatically available in the database after the update so that no existing melody is affected.

**Why this priority**: Data integrity is critical — existing melodies and their instrument tabs must continue to work without any manual intervention.

**Independent Test**: Can be fully tested by running the migration and verifying all four original instruments exist in the database with correct pitches and offsets, and that all existing melody tabs still reference valid instruments.

**Acceptance Scenarios**:

1. **Given** the system has existing melodies with tabs for Piano, Saxophone, Trumpet, and Trombone, **When** the migration runs, **Then** all four instruments exist in the database with their correct pitches and offsets (Piano: C/0, Saxophone: Eb/9, Trumpet: Bb/2, Trombone: C/0).
2. **Given** existing melody tabs reference hardcoded instrument identifiers, **When** the migration completes, **Then** all tabs correctly reference the corresponding database instrument records.

---

### User Story 3 - Instrument Deletion Cascades to Tabs (Priority: P2)

As a system administrator, I want that when I delete an instrument, all melody tabs associated with that instrument are automatically removed so that no orphaned data remains.

**Why this priority**: Ensures data consistency when instruments are removed, but is less frequent than adding instruments.

**Independent Test**: Can be fully tested by deleting an instrument and verifying that all melody tabs pointing to that instrument are removed, while tabs for other instruments remain intact.

**Acceptance Scenarios**:

1. **Given** an instrument "Tenor Saxophone" has associated melody tabs across multiple melodies, **When** the admin deletes "Tenor Saxophone", **Then** all melody tabs for that instrument are removed from every melody.
2. **Given** a melody has tabs for Piano and Tenor Saxophone, **When** the admin deletes "Tenor Saxophone", **Then** the melody retains its Piano tab and only the Tenor Saxophone tab is removed.
3. **Given** a melody has only one tab and it belongs to the deleted instrument, **When** the admin deletes that instrument, **Then** the system automatically creates a default Piano tab for that melody so it retains at least one tab.

---

### User Story 4 - Musicians See Dynamic Instrument List (Priority: P2)

As a musician using the application, I want to see all available instruments (including newly added ones) when composing or viewing melodies so that I can use the correct transposition for my instrument.

**Why this priority**: Completes the end-to-end experience — admin-added instruments must be visible and usable by end users.

**Independent Test**: Can be fully tested by having an admin add a new instrument and then verifying that a musician can select it when adding a tab to a melody.

**Acceptance Scenarios**:

1. **Given** the admin has added "Tenor Saxophone" as a new instrument, **When** a musician opens the instrument selection for a melody, **Then** "Tenor Saxophone" appears in the available instruments list.
2. **Given** the admin has added a new instrument, **When** a musician adds a tab for that instrument to a melody, **Then** the melody notation is correctly transposed according to the instrument's pitch offset.

---

### Edge Cases

- When deleting an instrument would leave a melody with zero tabs, the system automatically creates a default Piano tab for that melody to preserve the minimum-one-tab invariant.
- An instrument's pitch cannot be changed after creation — only the name is editable. To change pitch, the admin creates a new instrument and deletes the old one.
- If a musician tries to create a melody tab with an instrument that was deleted concurrently, the UI shows an error message "Error: the instrument {instrument_name} was deleted" and removes the instrument from the selection list.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow administrators to create new instruments by specifying a name and selecting a pitch.
- **FR-002**: System MUST automatically determine the transposition offset from the selected pitch — administrators do not enter the offset manually.
- **FR-003**: The available pitches MUST include all 12 chromatic pitches: C, Db, D, Eb, E, F, F#, G, Ab, A, Bb, B.
- **FR-004**: System MUST enforce unique instrument names — no two instruments can share the same name.
- **FR-005**: System MUST include a data migration that seeds the four original instruments (Piano in C, Saxophone in Eb, Trumpet in Bb, Trombone in C) so existing melody tabs remain valid.
- **FR-006**: When an instrument is deleted, the system MUST automatically remove all melody tabs associated with that instrument.
- **FR-007**: The instrument list presented to end users (musicians) MUST be dynamically loaded from the database, not hardcoded.
- **FR-008**: Transposition between instruments MUST continue to work correctly using the pitch-derived offset for both original and newly added instruments.
- **FR-009**: System MUST allow administrators to edit an existing instrument's name. The pitch MUST NOT be editable after creation — to change an instrument's pitch, the admin must create a new instrument and delete the old one.
- **FR-010**: Instrument management MUST be restricted to system administrators only — regular users cannot add, edit, or delete instruments.
- **FR-011**: When deleting an instrument would leave any melody with zero tabs, the system MUST automatically create a default Piano tab for that melody to maintain the minimum-one-tab invariant.
- **FR-012**: When a musician creates a new melody, the system MUST NOT create tabs automatically. Only the instrument selected by the musician during creation is shown as the initial tab. Additional instrument tabs are added manually by the musician.
- **FR-013**: If a musician attempts to add a tab for an instrument that has been deleted, the system MUST display an error message "Error: the instrument {instrument_name} was deleted" and remove that instrument from the selection list.
- **FR-014**: The instrument list in the user-facing interface MUST be displayed in alphabetical order by instrument name.

### Key Entities

- **Instrument**: Represents a musical instrument with a name, pitch (key), and derived transposition offset. Each instrument has a unique name. The pitch determines the semitone offset used for transposition calculations.
- **Pitch**: One of the 12 chromatic pitch classes (C, Db, D, Eb, E, F, F#, G, Ab, A, Bb, B), each mapping to a fixed transposition offset.
- **Melody Tab**: An existing entity representing a transposed version of a melody for a specific instrument. Tabs reference an instrument and are removed if that instrument is deleted.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Administrators can add a new instrument and have it available to musicians within 1 minute of creation.
- **SC-002**: All four original instruments are preserved with correct transposition behavior after migration — zero existing melodies are affected.
- **SC-003**: Deleting an instrument removes 100% of its associated melody tabs with no orphaned data.
- **SC-004**: Musicians can select any database-managed instrument when adding tabs, with the same transposition accuracy as the previous hardcoded system.
- **SC-005**: No hardcoded instrument definitions remain in the system after the feature is complete.

## Clarifications

### Session 2026-09-18

- Q: What should happen when deleting an instrument would leave a melody with zero tabs? → A: Auto-create a default Piano tab as replacement.
- Q: When an admin changes an existing instrument's pitch, what should happen to existing melody tabs? → A: Prevent pitch changes — only the name can be edited after creation.
- Q: When a musician creates a new composition, how many default tabs should be created? → A: No automatic tabs — only the instrument selected by the musician during creation is shown initially. Others added manually.
- Q: How does the system handle concurrent instrument deletion while a user is composing? → A: Show error "Error: the instrument {instrument_name} was deleted" and remove the instrument from the selection list.
- Q: What is the instrument display order in the user-facing interface? → A: Alphabetical by instrument name.

## Assumptions

- The admin portal refers to Django's built-in admin interface — no custom admin UI is required.
- The 12-pitch chromatic scale (C through B) covers all realistic transposing instrument keys.
- Instrument display order in the user-facing interface is alphabetical by instrument name.
- The existing transposition formula (`to_offset - from_offset`) remains valid and does not need to change.
- Internationalization of instrument names is out of scope for this feature — names are stored as entered by the admin.
