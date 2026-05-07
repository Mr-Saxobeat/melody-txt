# Feature Specification: Solfege Melody Composer

**Feature Branch**: `001-solfege-melody-composer`  
**Created**: 2026-05-07  
**Status**: Draft  
**Input**: User description: "I am building a website where amateur musicians (that can't read sheet music) can write music melody using simple solfege notation in text: do re mi fa sol la si. They can post their melodies, perform key changes and play it to check the song."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Compose Melody with Solfege Notation (Priority: P1)

A user visits the website, types a melody using simple solfege notation (do re mi fa sol la si), and immediately hears their composition played back to verify it sounds correct.

**Why this priority**: This is the core value proposition - enabling non-musicians to compose melodies without learning traditional sheet music. Without this, the entire platform has no purpose.

**Independent Test**: Can be fully tested by entering "do mi sol mi do" in the composer interface and hearing the melody play back. Delivers immediate value by allowing melody creation and verification.

**Acceptance Scenarios**:

1. **Given** a user is on the melody composer page, **When** they type "do re mi fa sol la si do" in the text input, **Then** the melody is parsed and displayed as valid notation
2. **Given** a user has entered a valid melody, **When** they click the "Play" button, **Then** the melody plays back audibly with correct pitch and timing
3. **Given** a user types invalid notation (e.g., "da de di"), **When** the system validates the input, **Then** an error message highlights the invalid notes and suggests corrections
4. **Given** a user is composing a melody, **When** they include octave indicators or timing symbols, **Then** the system correctly interprets and plays back the notation

---

### User Story 2 - Save and Share Melodies (Priority: P2)

A user completes a melody they're proud of and wants to save it for later or share it with other amateur musicians in the community.

**Why this priority**: After creation (P1), persistence and sharing enable community building and return visits. Users need to save their work before they'll invest time in composition.

**Independent Test**: Can be tested by creating a melody, saving it with a title, then retrieving it from a "My Melodies" list or sharing a public link that others can view and play.

**Acceptance Scenarios**:

1. **Given** a user has composed a melody, **When** they click "Save Melody" and provide a title, **Then** the melody is stored and appears in their personal collection
2. **Given** a user has saved melodies, **When** they navigate to "My Melodies", **Then** they see a list of their saved compositions with titles and creation dates
3. **Given** a user views their saved melody, **When** they click "Share", **Then** they receive a public link that others can access to view and play the melody
4. **Given** a visitor receives a shared melody link, **When** they open the link, **Then** they can view the solfege notation and play the melody without needing an account

---

### User Story 3 - Transpose Melodies to Different Keys (Priority: P3)

A user has composed a melody in one key but wants to hear how it sounds in a different key, or needs to match the key of another instrument or singer's range.

**Why this priority**: Key transposition is a valuable enhancement but not essential for initial composition. Users can create and enjoy melodies without this feature, making it a nice-to-have after core functionality.

**Independent Test**: Can be tested by creating a melody (e.g., "do mi sol"), selecting a different key from a dropdown (e.g., change from C major to G major), and hearing the melody transposed while maintaining the same interval relationships.

**Acceptance Scenarios**:

1. **Given** a user has composed a melody in the default key, **When** they select a different key from the key selector, **Then** the melody is transposed and plays back in the new key with the same melodic intervals
2. **Given** a user transposes a melody, **When** the key change is applied, **Then** the solfege notation remains unchanged but the actual pitches adjust accordingly
3. **Given** a user has transposed a melody multiple times, **When** they save the melody, **Then** the current key selection is saved with the composition

---

### Edge Cases

- What happens when a user enters an extremely long melody (1000+ notes)?
- How does the system handle rapid repeated clicks on the "Play" button?
- What happens when a user tries to play a melody while another is already playing?
- How does the system handle melodies with no notes or only whitespace?
- What happens when a user shares a melody that is later deleted by the author?
- How does the system behave on devices without audio capability or with audio muted?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST parse text input containing solfege syllables (do, re, mi, fa, sol, la, si) separated by spaces or commas
- **FR-002**: System MUST validate solfege notation in real-time and highlight invalid entries
- **FR-003**: System MUST provide audio playback of entered melodies using synthesized tones or instrument sounds
- **FR-004**: System MUST allow users to save melodies with a user-provided title
- **FR-005**: System MUST provide a personal collection view where users can browse their saved melodies
- **FR-006**: System MUST generate shareable links for melodies that allow public viewing and playback
- **FR-007**: System MUST support key transposition, allowing melodies to be played in any of the 12 musical keys
- **FR-008**: System MUST maintain the melodic interval relationships when transposing between keys
- **FR-009**: System MUST provide playback controls (play, pause, stop) for melody preview
- **FR-010**: System MUST persist user melodies and associated metadata (title, creation date, key)
- **FR-011**: System MUST support both uppercase and lowercase solfege notation (e.g., "Do" and "do")
- **FR-012**: System MUST play all notes with equal duration (quarter note default) in version 1, with rhythm notation support planned for future versions
- **FR-013**: System MUST allow anonymous users to compose and play melodies without authentication, but require account creation to save melodies permanently
- **FR-014**: System MUST display melody length and estimated playback duration

### Key Entities

- **Melody**: Represents a musical composition created by a user
  - Attributes: unique identifier, title, solfege notation text, musical key, creation timestamp, author reference, public/private status, share link identifier
  
- **User**: Represents a musician using the platform
  - Attributes: unique identifier, username/display name, email (if authentication required), collection of saved melodies, account creation date

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can compose and play back a simple melody (8-16 notes) in under 2 minutes from landing on the page
- **SC-002**: 90% of valid solfege notation entries are correctly parsed and played back without errors
- **SC-003**: Playback begins within 1 second of clicking the play button
- **SC-004**: Users can successfully share a melody and have another user access and play it within 10 seconds
- **SC-005**: Key transposition maintains accurate pitch relationships 100% of the time (verified through automated testing)
- **SC-006**: 80% of users who compose a melody save it to their collection
- **SC-007**: Shared melodies receive an average of 3+ plays from other users within the first 24 hours

## Assumptions

- Users have devices with audio output capability (speakers or headphones)
- Users have stable internet connectivity for web-based composition and playback
- Desktop and mobile browsers with modern JavaScript support are the primary platforms
- Users are familiar with basic solfege syllables (do re mi) even if they can't read sheet music
- Initial version uses equal timing for all notes (quarter note default); rhythm notation support is deferred to future versions
- Melodies are monophonic (single melodic line) rather than harmonic (chords/multiple voices)
- Default key is C major unless user explicitly selects a different key
- Audio playback uses Web Audio API or similar browser-based synthesis (no external plugins required)
- Anonymous users can compose and play melodies without restrictions, but saving requires account creation
- Community features (browsing other users' melodies, commenting, liking) are out of scope for initial version
- Export to MIDI or sheet music formats is out of scope for initial version
