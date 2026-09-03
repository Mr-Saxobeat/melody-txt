# Quickstart: Instrument Tab Delete Confirmation

## Prerequisites

- Node.js installed
- Backend running at `http://localhost:8000`
- Frontend dev server: `cd frontend && npm start`

## What to change

### 1. Create `ConfirmModal` component

Create `frontend/src/components/ConfirmModal.js` — a reusable modal with title, message, confirm button, and cancel button. Props: `title`, `message`, `onConfirm`, `onCancel`, `confirmLabel`, `cancelLabel`.

Create `frontend/src/components/ConfirmModal.css` — styled to match existing `.instrument-modal-overlay` / `.instrument-modal` pattern.

### 2. Update `ComposerPage.js`

- Add `pendingDeleteTabId` and `deleteError` state
- Replace `handleDeleteTab(tabId)` with: set `pendingDeleteTabId` to show modal
- Add `confirmDeleteTab()`: optimistic remove → API call → restore on error
- Add `cancelDeleteTab()`: clear `pendingDeleteTabId`
- Render `ConfirmModal` when `pendingDeleteTabId` is set
- Display `deleteError` message when present

### 3. Update `InstrumentTabs.js`

- Change `tabs.length < 10` to `tabs.length < 20` (two locations: lines 69 and 117)

### 4. Update `pt-BR.json`

- Add `instrument.deleteConfirm.title`, `.message`, `.confirm`, `.cancel`, `.error` keys

### 5. Add tests

- `ConfirmModal.test.js`: renders, calls onConfirm, calls onCancel
- Update `ComposerPage.test.js`: delete flow with confirmation, cancel flow, error restore flow

## How to verify

1. Start the app and create/edit a melody with 2+ tabs
2. Click X on a tab → confirmation modal appears
3. Click Cancel → modal closes, tab intact
4. Click Confirm on a saved tab → tab disappears, page refresh confirms deletion
5. Verify the add-tab button disappears at 20 tabs
