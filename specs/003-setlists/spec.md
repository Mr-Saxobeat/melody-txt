# Feature Specification: Setlists

**Feature Branch**: `003-setlists`
**Created**: 2026-05-09
**Status**: Draft
**Input**: User description: "Create setlists with multiple melodies in specified order"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create and Manage Setlists (Priority: P1)

An authenticated user wants to organize their saved melodies into ordered setlists for rehearsal or performance. They can create a setlist, give it a name, and add melodies from their library in a specific order.

**Why this priority**: Core value — without setlist creation, the feature doesn't exist.

**Independent Test**: Create a setlist named "Sunday Gig", add 3 melodies in a specific order, verify the list displays them in that order.

**Acceptance Scenarios**:

1. **Given** an authenticated user on the setlists page, **When** they click "New Setlist" and enter a name, **Then** an empty setlist is created and displayed
2. **Given** a setlist exists, **When** the user adds melodies from their library, **Then** each melody appears in the setlist in the order added
3. **Given** a setlist with 5 melodies, **When** the user reorders a melody (drag or move buttons), **Then** the new order is saved
4. **Given** a setlist, **When** the user removes a melody from it, **Then** the melody is removed from the setlist but remains in their library
5. **Given** a setlist, **When** the user renames or deletes the setlist, **Then** the change is persisted (melodies are not deleted from the library)

---

### User Story 2 - View and Play Setlist (Priority: P2)

A user opens a setlist and can see all melodies in order. They can play individual melodies or navigate through the setlist sequentially.

**Why this priority**: Viewing and playing is the primary use case after creation — musicians need to follow the setlist during performance.

**Independent Test**: Open a setlist with 3 melodies, see them listed in order with title and note count, click play on the first melody and hear it.

**Acceptance Scenarios**:

1. **Given** a setlist with melodies, **When** the user opens it, **Then** all melodies are displayed in their specified order with title and metadata
2. **Given** a setlist view, **When** the user clicks play on a melody, **Then** that melody plays back using the existing player
3. **Given** a setlist view, **When** the user clicks on a melody title, **Then** they navigate to the melody's edit/view page

---

### User Story 3 - Share Setlist (Priority: P3)

A user wants to share their setlist with other musicians via a public link, so others can view the ordered list of melodies and play each one.

**Why this priority**: Sharing extends the collaborative value but depends on the core setlist existing first.

**Independent Test**: Create a setlist, share it via link, open in incognito — see the setlist with all melodies playable (read-only).

**Acceptance Scenarios**:

1. **Given** a setlist, **When** the user clicks "Share", **Then** a shareable link is copied to clipboard
2. **Given** a shared setlist link, **When** a non-authenticated user opens it, **Then** they see the setlist with melody titles and can play each one
3. **Given** a shared setlist, **When** viewing as non-owner, **Then** no edit/delete/reorder controls are visible

---

### Edge Cases

- What happens when a melody in a setlist is deleted from the library? The setlist entry is removed automatically.
- What happens when a setlist is empty? Display a message prompting the user to add melodies.
- Can the same melody appear multiple times in a setlist? Yes (e.g., repeated songs in a performance).
- What is the maximum number of melodies in a setlist? 100 melodies per setlist.
- What is the maximum number of setlists per user? 50 setlists.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Authenticated users MUST be able to create a new setlist with a title (max 200 characters)
- **FR-002**: Users MUST be able to add melodies from their library to a setlist in a specified order
- **FR-003**: Users MUST be able to reorder melodies within a setlist
- **FR-004**: Users MUST be able to remove melodies from a setlist without deleting them from their library
- **FR-005**: Users MUST be able to rename a setlist
- **FR-006**: Users MUST be able to delete a setlist (melodies remain in library)
- **FR-007**: The setlist page MUST display melodies in their specified order with title and note count
- **FR-008**: Users MUST be able to play any melody directly from the setlist view
- **FR-009**: Clicking a melody title in the setlist MUST navigate to the melody view/edit page
- **FR-010**: Users MUST be able to share a setlist via a public link
- **FR-011**: Non-owners viewing a shared setlist MUST see melodies in order and be able to play them (read-only)
- **FR-012**: If a melody is deleted from the library, it MUST be automatically removed from all setlists containing it
- **FR-013**: The same melody MAY appear multiple times in a setlist
- **FR-014**: A setlist MUST support up to 100 melodies
- **FR-015**: A user MUST be able to have up to 50 setlists

### Key Entities

- **Setlist**: An ordered collection of melodies belonging to a user. Has title, share_id, created_at, updated_at.
- **SetlistEntry**: A join entity linking a setlist to a melody with a position (order) field. Allows duplicates.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can create a setlist and add melodies in under 1 minute
- **SC-002**: Setlist displays melodies in the correct user-specified order 100% of the time
- **SC-003**: Reordering a melody in a setlist takes under 2 seconds (UI response)
- **SC-004**: Shared setlist links work for non-authenticated users without login prompts
- **SC-005**: Deleting a melody from the library removes it from all setlists within the same operation

## Assumptions

- The existing melody library and authentication system are prerequisites
- Setlists are private by default, public only when explicitly shared
- The setlist ordering uses a position field (integer) for explicit ordering
- Navigation to "My Setlists" will be added to the main header navigation
- The setlist feature requires the user to be authenticated (no anonymous setlists)
