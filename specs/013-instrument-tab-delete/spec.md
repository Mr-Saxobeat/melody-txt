# Feature Specification: Instrument Tab Delete Confirmation

**Feature Branch**: `013-instrument-tab-delete`
**Created**: 2026-09-03
**Status**: Draft
**Input**: User description: "When a user clicks X on an instrument tab in the compose/edit melody page, a confirmation modal must appear. If confirmed, a delete request is sent to the backend. If cancelled, nothing happens."

## Clarifications

### Session 2026-09-03

- Q: What is the maximum number of instrument tabs per melody? → A: 20 tabs per melody.
- Q: How should the system behave while waiting for the backend delete response? → A: Optimistic — close modal immediately, remove tab from UI. If the request fails, restore the tab and show an error message.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Delete an instrument tab with confirmation (Priority: P1)

A user is on the compose/edit melody page and has multiple instrument tabs open. They decide to remove one instrument tab by clicking the X button on it. A confirmation modal appears asking if they are sure they want to delete the tab. The user confirms, the tab is deleted from the backend via an API request, and the tab is removed from the UI.

**Why this priority**: This is the core bug fix. Currently, clicking X removes the tab from the UI but never sends a delete request to the backend, causing data inconsistency where deleted tabs reappear on page reload.

**Independent Test**: Can be fully tested by opening a melody with multiple instrument tabs, clicking X on one, confirming deletion, and verifying the tab no longer appears after a page refresh.

**Acceptance Scenarios**:

1. **Given** a user is editing a melody with 3 instrument tabs, **When** they click the X button on the second tab and confirm deletion, **Then** a delete request is sent to the backend, the tab is removed from the UI, and another tab becomes active.
2. **Given** a user is editing a melody with 2 instrument tabs, **When** they click X on one tab and confirm deletion, **Then** the tab is deleted and the remaining tab becomes active.
3. **Given** a user deletes a tab and refreshes the page, **When** the melody reloads, **Then** the deleted tab no longer appears.

---

### User Story 2 - Cancel instrument tab deletion (Priority: P1)

A user accidentally clicks the X button on an instrument tab. A confirmation modal appears. The user clicks "No" or cancels, and the modal closes without any changes. The tab remains intact.

**Why this priority**: Equally critical as the delete flow. Users must be protected from accidental deletions, especially since tab deletion will now be a permanent backend operation.

**Independent Test**: Can be tested by clicking X on a tab, dismissing the confirmation modal, and verifying the tab and its notation remain unchanged.

**Acceptance Scenarios**:

1. **Given** a user is editing a melody with multiple tabs, **When** they click X on a tab and choose "No" in the confirmation modal, **Then** the modal closes and the tab remains with all its content intact.
2. **Given** a user dismisses the confirmation modal, **When** they continue editing, **Then** all tabs and their notation are exactly as they were before.

---

### User Story 3 - Delete tab on a new unsaved melody (Priority: P2)

A user is composing a new melody (not yet saved) and has added multiple instrument tabs locally. They click X on a tab. Since the tab only exists locally and has no backend record, it should be removed from the UI without sending a backend request.

**Why this priority**: Important for a smooth compose experience, but less critical since no data inconsistency can occur with unsaved melodies.

**Independent Test**: Can be tested by starting a new composition, adding multiple instrument tabs, clicking X on one, confirming, and verifying it is removed from the UI without any backend errors.

**Acceptance Scenarios**:

1. **Given** a user is composing a new melody with locally-created tabs, **When** they click X on a tab and confirm, **Then** the tab is removed from the UI without any backend API call.
2. **Given** a user has only one tab on a new melody, **When** they attempt to delete it, **Then** the X button is not available (minimum one tab required).

---

### Edge Cases

- What happens when the backend delete request fails (e.g., network error)? The tab is restored to its previous position in the UI and an error message is displayed.
- What happens when a user adds a 21st tab? The add-tab button is not available when 20 tabs already exist.
- What happens when the user tries to delete the only remaining tab? The delete button should not be available when only one tab exists.
- What happens if two browser tabs have the same melody open and one deletes a tab? The other tab will reflect the deletion on next reload.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a confirmation modal when the user clicks the X button on an instrument tab.
- **FR-002**: The confirmation modal MUST clearly ask the user whether they want to delete the instrument tab, identifying which instrument is being deleted.
- **FR-003**: The confirmation modal MUST provide a "Yes/Confirm" action and a "No/Cancel" action.
- **FR-004**: When the user confirms deletion and the tab has been saved to the backend (has a server-assigned ID), the system MUST send a DELETE request to the backend API to remove the tab.
- **FR-005**: When the user confirms deletion, the system MUST immediately close the modal and remove the tab from the UI (optimistic update), then send the backend delete request.
- **FR-006**: When the user cancels deletion, the system MUST close the modal and leave all tabs unchanged.
- **FR-007**: When the tab is local-only (not yet saved to backend), the system MUST remove it from the UI without making a backend request.
- **FR-008**: The system MUST NOT allow deletion of the last remaining tab (minimum one tab required).
- **FR-009**: If the backend delete request fails, the system MUST restore the tab to its previous position in the UI and display an error message to the user.
- **FR-011**: The system MUST enforce a maximum of 20 instrument tabs per melody. The add-tab button MUST be hidden or disabled when 20 tabs exist.
- **FR-010**: The confirmation modal MUST work on both desktop (tabs bar) and mobile (dropdown with delete button) layouts.

### Key Entities

- **Instrument Tab**: Represents a single instrument notation within a melody. Key attributes: instrument type, notation content, position, suffix. Can be local-only (unsaved) or persisted (has a backend ID). A melody supports a minimum of 1 and a maximum of 20 tabs.
- **Melody**: The parent entity containing one or more instrument tabs (up to 20).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Deleting an instrument tab and refreshing the page confirms the tab no longer exists (0% ghost tab reappearance rate, down from 100% currently).
- **SC-002**: Users can complete a tab deletion (click X, confirm, see result) in under 3 seconds.
- **SC-003**: Cancelling a deletion leaves the tab and its content completely intact 100% of the time.
- **SC-004**: Failed backend deletions are communicated to the user with a visible error message within 2 seconds.

## Assumptions

- Users are authenticated when editing melodies (the compose/edit page is behind a protected route).
- The backend DELETE endpoint for instrument tabs already exists and functions correctly.
- A melody must always have at least one instrument tab; the existing prevention of deleting the last tab is correct behavior.
- The confirmation modal follows the same visual style as existing modals in the application (e.g., the save dialog).
- Both the desktop tabs bar and mobile dropdown delete button trigger the same confirmation flow.
