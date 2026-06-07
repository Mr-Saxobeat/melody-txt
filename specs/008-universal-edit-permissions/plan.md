# Implementation Plan: Universal Edit Permissions

**Branch**: `008-universal-edit-permissions` | **Date**: 2026-06-07 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/008-universal-edit-permissions/spec.md`

## Summary

Remove ownership-based authorization restrictions so that any authenticated user can perform full CRUD operations on any melody or setlist. The backend API views currently filter querysets by `user=request.user`; this filter will be replaced with `Melody.objects.all()` / `Setlist.objects.all()` for authenticated endpoints. The frontend service layer already passes melody/setlist IDs directly, so no frontend changes are needed beyond ensuring the "My Melodies" page shows all melodies (or is relabeled).

## Technical Context

**Language/Version**: Python 3.9 (Django 4.x), JavaScript (React via CRA)  
**Primary Dependencies**: Django REST Framework, SimpleJWT, React, Axios  
**Storage**: SQLite (dev), PostgreSQL-compatible schema  
**Testing**: pytest (backend), Jest + React Testing Library (frontend)  
**Target Platform**: Web application (browser + server)  
**Project Type**: Web application (Django backend + React frontend)  
**Performance Goals**: N/A (authorization change only, no new queries)  
**Constraints**: Must maintain authentication requirement; must preserve `user` FK for attribution  
**Scale/Scope**: Small community tool; all authenticated users are trusted

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Test Coverage Mandate**:
- [x] Plan includes 60%+ test coverage strategy
- [x] Unit test approach defined for all components
- [x] Integration test scenarios identified

**Test-First Development**:
- [x] Testing framework selected and documented
- [x] Test structure aligned with TDD workflow (Red-Green-Refactor)

**Clean Code Principles**:
- [x] Naming conventions defined and documented
- [x] Code organization follows single responsibility principle
- [x] Maximum function length guidelines established

**OOP Design Principles**:
- [x] Architecture demonstrates SOLID principles
- [x] Interfaces and abstractions properly identified
- [x] Inheritance vs composition strategy documented

**Human-Readable Code**:
- [x] Naming conventions prioritize clarity over brevity
- [x] Complex algorithms include explanatory documentation
- [x] Code review checklist includes readability verification

**Strategy Notes**:
- Tests: Integration tests will verify that User B can CRUD melodies/setlists created by User A. Existing tests for owner-scoped access will be updated.
- Clean Code: The change simplifies code by removing conditional ownership filters — fewer lines, clearer intent.
- SOLID: No new classes/abstractions needed; the change is subtractive (removing restrictions).

## Project Structure

### Documentation (this feature)

```text
specs/008-universal-edit-permissions/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit-tasks command)
```

### Source Code (repository root)

```text
backend/
├── api/
│   ├── views.py         # PRIMARY CHANGE: Remove user-scoped queryset filters
│   └── serializers.py   # No changes expected
├── melodies/
│   └── models.py        # No changes (user FK preserved)
├── setlists/
│   └── models.py        # No changes (user FK preserved)
└── tests/
    ├── integration/
    │   ├── test_api_melodies.py    # Update: test cross-user edit
    │   ├── test_tabs_crud.py       # Update: test cross-user tab edit
    │   └── test_universal_permissions.py  # NEW: dedicated permission tests
    └── unit/
        └── test_models.py          # No changes

frontend/
├── src/
│   ├── pages/
│   │   ├── MyMelodiesPage.js       # Rename/relabel to "All Melodies" or show all
│   │   └── SetlistsPage.js         # Show all setlists (already may do this)
│   └── services/
│       ├── melodyService.js        # No changes needed
│       └── setlistService.js       # No changes needed
└── src/
    └── pages/
        └── MyMelodiesPage.test.js  # Update test expectations
```

**Structure Decision**: Existing web application structure (Django + React). Changes are confined to backend authorization logic in `api/views.py` and corresponding integration tests. Frontend service layer already uses ID-based API calls.

## Complexity Tracking

No constitution violations — the change is subtractive (removing ownership filters) rather than additive.
