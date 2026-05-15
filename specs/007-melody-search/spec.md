# Feature Specification: Melody Search

**Feature Branch**: `007-melody-search`  
**Created**: 2026-05-15  
**Status**: Draft  
**Input**: User description: "Add melody search on home page and in the add melody to setlist modal"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Search Melodies on Home Page (Priority: P1)

A user visits the home page which displays a paginated list of public melodies. They type a search term into a search input field, which triggers a server-side search. The paginated melody list is replaced with paginated search results showing only melodies whose title matches the search term.

**Why this priority**: The home page is the primary landing experience and shows all recent public melodies. As the melody library grows, users need a way to quickly locate specific melodies without scrolling through the entire list.

**Independent Test**: Can be fully tested by navigating to the home page, typing a melody title (or partial title) in the search field, and verifying that only matching melodies are displayed. Delivers immediate value by reducing time to find content.

**Acceptance Scenarios**:

1. **Given** the home page is loaded with the first page of melodies, **When** the user scrolls near the bottom, **Then** the next page of melodies is automatically loaded and appended to the list.
2. **Given** the home page is loaded, **When** the user types a search term in the search input, **Then** the system queries the server and displays only melodies whose title matches (case-insensitive), with infinite scroll for results.
3. **Given** the user has entered a search term with no matching results, **When** the filtered list is empty, **Then** an appropriate empty state message is displayed indicating no melodies match the search.
4. **Given** the user has entered a search term, **When** they clear the search input, **Then** the default paginated melody listing is restored.

---

### User Story 2 - Search Melodies in Add-to-Setlist Modal (Priority: P1)

A user is viewing a setlist detail page and clicks "Add Melody" to open the melody picker modal. They want to quickly find a specific melody from their library (own + recent melodies) to add to the setlist. They type a search term and the melody list in the modal filters to show only matching results.

**Why this priority**: Equal priority with home page search because the add-to-setlist modal currently shows an unsorted flat list of melodies with no filtering. As users create more melodies, finding the right one becomes increasingly difficult and directly impacts the usability of the setlist feature.

**Independent Test**: Can be tested by opening a setlist, clicking "Add Melody", typing a search term in the modal's search input, and verifying that only matching melodies appear. Delivers value by making setlist curation faster.

**Acceptance Scenarios**:

1. **Given** the add melody modal is open with melodies listed, **When** the user types a search term in the modal's search input, **Then** only melodies whose title matches the term (case-insensitive) are displayed.
2. **Given** the user searches in the modal and finds the desired melody, **When** they click on the melody, **Then** it is added to the setlist and the modal behaves as expected (same as current behavior).
3. **Given** the user has entered a search term with no matching results in the modal, **When** the filtered list is empty, **Then** a message indicates no melodies match the search.

---

### User Story 3 - Instant Feedback While Typing (Priority: P2)

The search filtering happens as the user types (real-time/debounced), providing immediate visual feedback without requiring the user to press Enter or click a search button.

**Why this priority**: Enhances the user experience by making search feel responsive and modern, but the core functionality (filtering) is the higher priority.

**Independent Test**: Can be tested by typing slowly and observing that results filter character-by-character without needing to submit the search.

**Acceptance Scenarios**:

1. **Given** the user is on the home page or the add-melody modal is open, **When** they type each character in the search input, **Then** the displayed list updates immediately (or within a short delay) to reflect the current search term.

---

### Edge Cases

- What happens when the user searches with special characters or accented characters (e.g., Portuguese accents like ã, ç)?
- How does the system handle a search term that is only whitespace?
- What happens when the melody list is still loading and the user starts typing in the search field?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a search input field on the home page above the melody grid.
- **FR-002**: System MUST display a search input field inside the add-melody-to-setlist modal above the melody list.
- **FR-003**: System MUST query the server for matching melodies after a debounce delay once the user pauses typing, matching against melody titles (case-insensitive). No minimum character count is required.
- **FR-004**: System MUST show all melodies when the search input is empty.
- **FR-005**: System MUST display an appropriate empty state message when no melodies match the search term.
- **FR-006**: System MUST treat leading/trailing whitespace in search input as insignificant (trim before matching).
- **FR-007**: System MUST support partial matching (substring match, not just prefix).
- **FR-008**: Search MUST be performed server-side via API requests in both the home page and the add-to-setlist modal, since the home page is paginated and not all melodies are loaded at once.
- **FR-009**: Home page MUST support infinite scroll pagination, automatically loading the next page of melodies when the user scrolls near the bottom.
- **FR-010**: When a search term is active, the system MUST query the server and display results with infinite scroll, resetting the scroll position and loaded pages.
- **FR-011**: When the user clears the search term, the system MUST return to the default paginated melody listing.

### Key Entities

- **Melody**: The primary entity being searched. The searchable attribute is `title` (string, max 200 characters).
- **Search Input**: A text field where users enter their search query. Present in two locations: home page and add-to-setlist modal.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can locate a specific melody by title in under 5 seconds from the moment they start typing.
- **SC-002**: Search results update within 300ms of the user stopping typing.
- **SC-003**: 100% of melodies with matching titles appear in filtered results (no false negatives for substring matches).
- **SC-004**: Both search locations (home page and modal) behave consistently — same matching logic, same empty state messaging.

## Clarifications

### Session 2026-05-15

- Q: Should the add-to-setlist modal also use server-side API search, or is client-side filtering acceptable? → A: Server-side API search in modal too (consistent with home page).
- Q: What pagination style should the home page use? → A: Infinite scroll (automatically loads next page when user scrolls to bottom).
- Q: Should search use debounce or minimum character count before querying the server? → A: Debounce only (query fires after user pauses typing, any length).

## Assumptions

- The home page melody list is paginated and fetched from the server; search queries are sent to the server and results are also paginated.
- The add-to-setlist modal also uses server-side search for consistency, even though it currently loads melodies in a single batch.
- Search is limited to melody titles only; searching by notation, key, or author is out of scope for this feature.
- A server-side search endpoint (or search parameter on existing endpoints) is required to support this feature.
- The search input follows the existing application's visual styling and i18n patterns (placeholder text is translatable).
