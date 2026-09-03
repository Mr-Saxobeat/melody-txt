# Research: Instrument Tab Delete Confirmation

**Date**: 2026-09-03

## Findings

### 1. Backend DELETE Endpoint

- **Decision**: Use the existing `MelodyTabView.delete()` endpoint at `DELETE /api/melodies/{melodyId}/tabs/{tabId}/`
- **Rationale**: The endpoint already exists (`backend/api/views.py:216`), handles the "last tab" guard (returns 400), and returns 204 on success. No backend changes needed.
- **Alternatives considered**: None — the endpoint is already correctly implemented.

### 2. Frontend Delete Service Method

- **Decision**: Use the existing `melodyService.deleteTab(melodyId, tabId)` method
- **Rationale**: Already exists in `frontend/src/services/melodyService.js:62`. Makes a DELETE request via the axios instance. No changes needed.
- **Alternatives considered**: None — method exists and is correct.

### 3. Optimistic UI Pattern

- **Decision**: Remove the tab from state immediately on confirm, send API request in background, restore on failure.
- **Rationale**: User clarification specified optimistic behavior. The pattern is: (1) snapshot current tabs, (2) remove tab from state, (3) send DELETE, (4) on failure: restore from snapshot + show error.
- **Alternatives considered**: Pessimistic (keep modal open with spinner) — rejected per user decision.

### 4. Confirmation Modal Component

- **Decision**: Create a new reusable `ConfirmModal` component rather than inline confirmation in InstrumentTabs.
- **Rationale**: The existing `InstrumentSelectModal` and save dialog patterns use overlay + centered card. A reusable ConfirmModal follows the same pattern and can be used elsewhere. The save dialog in ComposerPage uses a similar overlay pattern (`.save-dialog-overlay` + `.save-dialog`).
- **Alternatives considered**: (a) Browser `window.confirm()` — rejected for lack of styling and i18n control. (b) Inline confirm in InstrumentTabs — rejected for mixing concerns.

### 5. Tab Limit Change (10 → 20)

- **Decision**: Update the frontend-only guard from `tabs.length < 10` to `tabs.length < 20` in InstrumentTabs.js.
- **Rationale**: The limit is enforced only on the frontend (lines 69 and 117 of InstrumentTabs.js). No backend validation exists for tab count, so only the frontend constant needs updating.
- **Alternatives considered**: Adding backend validation — deferred as it's not in scope for this feature.

### 6. Identifying Saved vs Local Tabs

- **Decision**: Tabs with an ID prefixed `local-` are unsaved; tabs with a numeric ID are backend-persisted.
- **Rationale**: `ComposerPage.js` creates local tabs with IDs like `local-0`, `local-${Date.now()}`. Backend-saved tabs have numeric IDs from the database. The delete handler checks `typeof tabId === 'string' && tabId.startsWith('local-')` to skip the API call.
- **Alternatives considered**: Checking for a `saved` boolean flag — unnecessary complexity since the ID convention is already established.

### 7. i18n Keys

- **Decision**: Add new translation keys under an `instrument.deleteConfirm` namespace.
- **Rationale**: Existing pattern uses dotted key paths. Keys needed: `instrument.deleteConfirm.title`, `instrument.deleteConfirm.message`, `instrument.deleteConfirm.confirm`, `instrument.deleteConfirm.cancel`, `instrument.deleteConfirm.error`.
- **Alternatives considered**: Reusing existing `melody.deleteConfirm` — different context, so separate keys are cleaner.
