# Implementation Plan: Instrument Tab Delete Confirmation

**Branch**: `013-instrument-tab-delete` | **Date**: 2026-09-03 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `specs/013-instrument-tab-delete/spec.md`

## Summary

The instrument tab X button currently removes tabs from the UI without sending a DELETE request to the backend, causing tabs to reappear on page reload. This plan adds a confirmation modal to the delete flow, sends the DELETE request to the backend on confirm, and uses optimistic UI updates (immediate removal, restore on failure). The tab limit is also updated from 10 to 20.

## Technical Context

**Language/Version**: JavaScript (ES2020+), Python 3.x
**Primary Dependencies**: React 18.2, React Router 6, Axios (frontend); Django 4.2, Django REST Framework 3.14 (backend)
**Storage**: PostgreSQL via Django ORM
**Testing**: Jest 29 + React Testing Library 14 (frontend); pytest + pytest-django (backend)
**Target Platform**: Web browser (desktop + mobile)
**Project Type**: Web application (frontend SPA + backend REST API)
**Performance Goals**: Tab deletion completes in under 3 seconds (user-perceived)
**Constraints**: Optimistic UI — modal closes and tab is removed immediately; restored on API failure
**Scale/Scope**: Single-user editing; no concurrent editing collaboration

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Test Coverage Mandate**:
- [x] Plan includes 60%+ test coverage strategy — unit tests for confirmation modal, integration tests for delete flow
- [x] Unit test approach defined for all components — Jest + RTL for InstrumentTabs and ComposerPage
- [x] Integration test scenarios identified — delete saved tab, delete local tab, cancel delete, failed delete restore

**Test-First Development**:
- [x] Testing framework selected and documented — Jest 29 + React Testing Library 14 (frontend), pytest-django (backend)
- [x] Test structure aligned with TDD workflow (Red-Green-Refactor)

**Clean Code Principles**:
- [x] Naming conventions defined and documented — follows existing project conventions (camelCase JS, snake_case Python)
- [x] Code organization follows single responsibility principle — confirmation modal is its own component
- [x] Maximum function length guidelines established — functions under 20 lines per constitution

**OOP Design Principles**:
- [x] Architecture demonstrates SOLID principles — modal component is self-contained with a clear interface
- [x] Interfaces and abstractions properly identified — onConfirm/onCancel callback pattern
- [x] Inheritance vs composition strategy documented — composition via React props

**Human-Readable Code**:
- [x] Naming conventions prioritize clarity over brevity — handleDeleteTab, showDeleteConfirm, pendingDeleteTabId
- [x] Complex algorithms include explanatory documentation — optimistic update + restore flow
- [x] Code review checklist includes readability verification

## Project Structure

### Documentation (this feature)

```text
specs/013-instrument-tab-delete/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── contracts/           # Phase 1 output (N/A — no new API contracts)
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit-tasks command)
```

### Source Code (repository root)

```text
backend/
├── api/
│   └── views.py                    # Existing: MelodyTabView.delete() — no changes needed
└── tests/                          # Backend tests — no new tests needed (endpoint unchanged)

frontend/
├── src/
│   ├── components/
│   │   ├── ConfirmModal.js         # NEW: reusable confirmation modal component
│   │   ├── ConfirmModal.css        # NEW: styles for confirmation modal
│   │   ├── InstrumentTabs.js       # MODIFY: wire X button to show confirmation modal
│   │   └── InstrumentTabs.css      # EXISTING: no changes
│   ├── pages/
│   │   └── ComposerPage.js         # MODIFY: handleDeleteTab → async with API call + optimistic UI
│   ├── services/
│   │   └── melodyService.js        # EXISTING: deleteTab() already exists — no changes
│   └── i18n/
│       └── locales/
│           └── pt-BR.json          # MODIFY: add confirmation modal translation keys
└── src/
    ├── components/
    │   └── ConfirmModal.test.js    # NEW: unit tests for modal
    └── pages/
        └── ComposerPage.test.js    # MODIFY: add delete flow integration tests
```

**Structure Decision**: Web application pattern (frontend + backend). Backend DELETE endpoint already exists and requires no changes. All work is frontend-only.

## Complexity Tracking

No constitution violations. All changes follow existing patterns.
