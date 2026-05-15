# Implementation Plan: Melody Search

**Branch**: `007-melody-search` | **Date**: 2026-05-15 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `specs/007-melody-search/spec.md`

## Summary

Add melody search capability to two locations: the home page (paginated with infinite scroll) and the add-melody-to-setlist modal. Both use server-side search via API, with debounced input. The home page is converted from a static list to an infinite-scroll paginated view with optional title search. A new authenticated search endpoint serves the modal's needs (user's own + public melodies).

## Technical Context

**Language/Version**: Python 3.9 (Django 4.2 backend), JavaScript ES6+ (React frontend)
**Primary Dependencies**: Django REST Framework 3.x, React 18, Axios, react-router-dom
**Storage**: PostgreSQL (via Django ORM)
**Testing**: Django TestCase + DRF APITestCase (backend), Jest + React Testing Library (frontend)
**Target Platform**: Web application (browser)
**Project Type**: Web application (Django backend + React SPA frontend)
**Performance Goals**: Search results within 300ms of debounce trigger; infinite scroll loads next page seamlessly
**Constraints**: No additional npm/pip dependencies; cursor-based pagination for stable infinite scroll
**Scale/Scope**: Small-to-medium dataset; current melody count is manageable with `icontains` queries

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Test Coverage Mandate**:
- [x] Plan includes 60%+ test coverage strategy — all new backend views have integration tests; frontend pages have component tests
- [x] Unit test approach defined for all components — backend: test search filtering, pagination, edge cases; frontend: test debounce hook, component rendering
- [x] Integration test scenarios identified — API endpoint tests with search params, pagination cursors; frontend: full search flow with mocked API

**Test-First Development**:
- [x] Testing framework selected and documented — Django TestCase/APITestCase (backend), Jest/RTL (frontend)
- [x] Test structure aligned with TDD workflow (Red-Green-Refactor) — write tests for search endpoint and pagination before implementation

**Clean Code Principles**:
- [x] Naming conventions defined and documented — follow existing codebase patterns (snake_case backend, camelCase frontend)
- [x] Code organization follows single responsibility principle — search logic in views, pagination config separate, debounce in custom hook
- [x] Maximum function length guidelines established — under 20 lines per function, consistent with constitution

**OOP Design Principles**:
- [x] Architecture demonstrates SOLID principles — new views extend DRF generics; search filter logic is composable
- [x] Interfaces and abstractions properly identified — reuse SharedMelodySerializer; new pagination class for cursor-based
- [x] Inheritance vs composition strategy documented — views inherit from DRF ListAPIView; pagination is composed via class attribute

**Human-Readable Code**:
- [x] Naming conventions prioritize clarity over brevity — `MelodySearchView`, `searchMelodies()`, `useDebounce`
- [x] Complex algorithms include explanatory documentation — cursor pagination and debounce are well-understood patterns, no complex algorithms
- [x] Code review checklist includes readability verification — follows existing code review practices per constitution

## Project Structure

### Documentation (this feature)

```text
specs/007-melody-search/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0: Research decisions
├── data-model.md        # Phase 1: Data model analysis
├── quickstart.md        # Phase 1: Development quickstart
├── contracts/           # Phase 1: API contracts
│   └── api-endpoints.md # Endpoint specifications
└── tasks.md             # Phase 2 output (created by /speckit-tasks)
```

### Source Code (repository root)

```text
backend/
├── api/
│   ├── views.py         # Modified: RecentMelodiesView + new MelodySearchView
│   └── urls.py          # Modified: add /melodies/search/ route
├── config/
│   └── settings.py      # No changes needed
└── tests/
    └── integration/
        ├── test_api_melodies.py    # Modified: add search + pagination tests
        └── test_melody_search.py   # New: modal search endpoint tests

frontend/
├── src/
│   ├── pages/
│   │   ├── HomePage.js             # Modified: search input + infinite scroll
│   │   └── SetlistDetailPage.js    # Modified: search in add-melody modal
│   ├── services/
│   │   └── melodyService.js        # Modified: add search/pagination methods
│   ├── hooks/
│   │   └── useDebounce.js          # New: debounce hook
│   └── i18n/
│       └── locales/
│           └── pt-BR.json          # Modified: add search translation keys
└── src/
    └── pages/
        └── HomePage.test.js        # New: search + infinite scroll tests
```

**Structure Decision**: Follows existing web application structure with `backend/` and `frontend/` separation. No new directories beyond `hooks/useDebounce.js` (the `hooks/` directory already exists with `useAuth.js` and `useSiteSettings.js`).

## Complexity Tracking

No constitution violations identified. The feature adds straightforward search and pagination without introducing unnecessary abstractions.
