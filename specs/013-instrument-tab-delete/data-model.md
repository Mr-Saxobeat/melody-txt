# Data Model: Instrument Tab Delete Confirmation

**Date**: 2026-09-03

## Entities

### Instrument Tab (existing — no schema changes)

| Attribute | Description |
|-----------|-------------|
| id | Numeric (backend-persisted) or string prefixed `local-` (unsaved) |
| instrument | Instrument type identifier (e.g., `piano`, `saxophone`) |
| notation | Musical notation content string |
| position | Integer ordering position within the melody |
| suffix | Optional display suffix string |

**Constraints**:
- Minimum 1 tab per melody
- Maximum 20 tabs per melody (updated from 10)
- A tab is "local-only" if its ID is a string starting with `local-`
- A tab is "persisted" if its ID is a numeric value from the backend

### Melody (existing — no schema changes)

| Attribute | Description |
|-----------|-------------|
| id | Numeric backend ID |
| title | Melody title string |
| tabs | Collection of 1-20 Instrument Tabs |

## State Transitions

### Tab Deletion Flow

```
[Tab Exists] 
    → User clicks X 
    → [Pending Delete] (confirmation modal shown, pendingDeleteTabId set)
        → User confirms:
            → If local tab: [Removed from UI] (no API call)
            → If saved tab: [Optimistically Removed] → API DELETE sent
                → Success: [Permanently Deleted]
                → Failure: [Restored to UI] + error message shown
        → User cancels:
            → [Tab Exists] (modal closed, no changes)
```

### Frontend State Shape

No new entities. Existing `tabs` array state in ComposerPage gains two new companion state variables:

- `pendingDeleteTabId: string | null` — the tab ID awaiting confirmation (drives modal visibility)
- `deleteError: string | null` — error message from a failed delete API call
