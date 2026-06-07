# Feature Specification: Universal Edit Permissions

**Feature Branch**: `008-universal-edit-permissions`  
**Created**: 2026-06-07  
**Status**: Draft  
**Input**: User description: "All users must have the permissions to edit any music and any playlist"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Edit Any Melody (Priority: P1)

Any authenticated user can edit any melody in the system, regardless of who originally created it. When a user opens a melody (whether found via search, shared link, or browsing), they can modify its title, notation, key, tabs, and public/private status.

**Why this priority**: This is the core of the feature — removing ownership restrictions on melodies enables the collaborative editing model requested.

**Independent Test**: An authenticated user who did not create a melody can open it, change its title and notation, save, and see the changes persisted.

**Acceptance Scenarios**:

1. **Given** User A created a melody titled "Morning Song", **When** User B (authenticated) opens that melody and changes the title to "Evening Song" and saves, **Then** the melody title is updated to "Evening Song" for all users.
2. **Given** User A created a melody with notation "Do Re Mi", **When** User B edits the notation to "Do Re Mi Fa Sol" and saves, **Then** the updated notation is persisted and visible to all users.
3. **Given** User A created a melody with a Piano tab, **When** User B adds a Saxophone tab to that melody, **Then** the new tab is created and visible on the melody.
4. **Given** User A created a melody, **When** User B deletes one of its instrument tabs (provided it's not the last tab), **Then** the tab is removed.

---

### User Story 2 - Edit Any Setlist (Priority: P1)

Any authenticated user can edit any setlist in the system, regardless of who originally created it. This includes modifying the setlist title, adding/removing melody entries, and reordering entries.

**Why this priority**: Equal in importance to melody editing — together these two stories fulfill the full feature request.

**Independent Test**: An authenticated user who did not create a setlist can open it, add a melody entry, reorder entries, remove an entry, and rename the setlist.

**Acceptance Scenarios**:

1. **Given** User A created a setlist titled "Sunday Worship", **When** User B (authenticated) renames it to "Sunday Morning Set", **Then** the updated title is persisted.
2. **Given** User A created a setlist with 3 entries, **When** User B adds a new melody entry, **Then** the setlist now has 4 entries visible to all users.
3. **Given** User A created a setlist with entries, **When** User B removes an entry, **Then** the entry is deleted from the setlist.
4. **Given** User A created a setlist with entries, **When** User B reorders the entries, **Then** the new order is persisted.

---

### User Story 3 - Browse and Discover Editable Content (Priority: P2)

Authenticated users can browse all melodies and setlists in the system (not just their own) and edit any of them directly.

**Why this priority**: Users need to discover content before they can edit it. This extends the existing search/browse experience to show all content as editable.

**Independent Test**: An authenticated user can search for melodies and setlists created by others and access the edit view for any result.

**Acceptance Scenarios**:

1. **Given** User B is authenticated, **When** they search for melodies, **Then** results include melodies from all users and each result is editable.
2. **Given** User B is authenticated, **When** they browse setlists, **Then** they see setlists from all users and can open any for editing.

---

### Edge Cases

- What happens when two users edit the same melody simultaneously? Last-write-wins is acceptable for this version.
- What happens when a user deletes a melody that is referenced in another user's setlist? Existing cascade-delete behavior applies (setlist entries referencing that melody are removed).
- Can unauthenticated users edit content? No — authentication is still required. Only the ownership constraint is removed.
- Can users delete melodies or setlists they don't own? Yes — the same universal permission applies to all CRUD operations for authenticated users.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Any authenticated user MUST be able to update (edit) any melody's title, notation, key, and public/private status, regardless of who created it.
- **FR-002**: Any authenticated user MUST be able to create, update, and delete instrument tabs on any melody.
- **FR-003**: Any authenticated user MUST be able to update (edit) any setlist's title and public/private status, regardless of who created it.
- **FR-004**: Any authenticated user MUST be able to add, reorder, and remove entries from any setlist.
- **FR-005**: Any authenticated user MUST be able to delete any melody or setlist.
- **FR-006**: Unauthenticated users MUST NOT be able to edit or delete any content (existing public read-only access remains unchanged).
- **FR-007**: The system MUST continue to track which user originally created each melody and setlist (the `user` field is preserved for attribution).
- **FR-008**: The existing melody search and browse views MUST show all melodies/setlists as editable for authenticated users.

### Key Entities

- **Melody**: Retains `user` field for original creator attribution but is now editable by all authenticated users. No new fields required.
- **Setlist**: Retains `user` field for original creator attribution but is now editable by all authenticated users. No new fields required.
- **User**: Authenticated users gain universal edit permissions. No role or permission model changes needed.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Any authenticated user can successfully edit any melody within the same number of steps as editing their own melody (no additional permission prompts or barriers).
- **SC-002**: Any authenticated user can successfully edit any setlist within the same number of steps as editing their own setlist.
- **SC-003**: 100% of existing melody and setlist CRUD operations remain functional after the change.
- **SC-004**: Unauthenticated users continue to have read-only access to public content with zero ability to modify it.
- **SC-005**: Original creator attribution is preserved on all content after edits by other users.

## Assumptions

- This is a collaborative/community tool where all authenticated users are trusted editors (no abuse prevention needed for this version).
- The existing authentication system (JWT via SimpleJWT) remains unchanged — only authorization/ownership checks are affected.
- No audit trail or edit history is required for this version (last-write-wins model is acceptable).
- The `user` field on Melody and Setlist continues to represent the original creator, not the last editor.
- No new user roles or permission groups are needed — all authenticated users share the same universal edit capability.
- Existing public sharing (via share_id and is_public) remains unchanged for unauthenticated read-only access.

## Clarifications

### Session 2026-06-07

- Q: Should the edit melody button be visible on the shared melody page for all authenticated users? → A: Yes, the edit button must be visible to all authenticated users on the shared melody page, not just the original author.
