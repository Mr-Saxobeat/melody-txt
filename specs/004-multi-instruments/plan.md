# Implementation Plan: Multi-Instrument Auto-Creation

**Branch**: `master` | **Date**: 2026-05-13 | **Spec**: `specs/004-multi-instruments/spec.md`
**Input**: Feature specification from `/specs/004-multi-instruments/spec.md`

## Summary

When a user creates a new melody, the system prompts for a source instrument, then automatically creates all 4 instrument tabs (Piano, Saxophone, Trumpet, Trombone) with notation transposed from the source. Tabs are independent after creation — users can edit, delete (min 1), or add more via "+". Existing melodies keep their single Piano tab unchanged.

## Technical Context

**Language/Version**: Python 3.11 (backend), JavaScript ES2020+ (frontend)
**Primary Dependencies**: Django 4.2 + DRF 3.14 (backend), React 18 + react-router-dom 6 (frontend)
**Storage**: PostgreSQL via psycopg2 (backend), localStorage for preferences (frontend)
**Testing**: pytest + pytest-django (backend), Jest + React Testing Library (frontend)
**Target Platform**: Web application (Docker-deployed, browser-based)
**Project Type**: Web application (Django REST API + React SPA)
**Performance Goals**: Tab creation < 2 seconds, tab switching instant
**Constraints**: Max 10 tabs per melody, offline-not-required
**Scale/Scope**: Small-medium user base, ~4 instruments fixed

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Test Coverage Mandate**:
- [x] Plan includes 60%+ test coverage strategy — unit tests for transposition logic, model validation; integration tests for API endpoints; React component tests for UI flows
- [x] Unit test approach defined for all components — pytest for backend models/utils, Jest for frontend utils/components
- [x] Integration test scenarios identified — API create melody + auto-tabs, tab CRUD, shared melody with tabs

**Test-First Development**:
- [x] Testing framework selected and documented — pytest-django (backend), Jest + RTL (frontend)
- [x] Test structure aligned with TDD workflow (Red-Green-Refactor) — write failing tests for auto-creation logic first, then implement

**Clean Code Principles**:
- [x] Naming conventions defined and documented — snake_case (Python), camelCase (JS), descriptive names per existing codebase patterns
- [x] Code organization follows single responsibility principle — transposition logic in utils, model logic in models, API logic in views, UI in components
- [x] Maximum function length guidelines established — under 20 lines preferred, max 50 per constitution

**OOP Design Principles**:
- [x] Architecture demonstrates SOLID principles — MelodyTab model encapsulates tab behavior, transposition as pure functions, serializers handle data boundaries
- [x] Interfaces and abstractions properly identified — instrument data as constants, transposition as stateless functions
- [x] Inheritance vs composition strategy documented — composition via FK (MelodyTab → Melody), no inheritance needed

**Human-Readable Code**:
- [x] Naming conventions prioritize clarity over brevity — `transposeForInstrument`, `INSTRUMENT_OFFSETS`, `handleAddTab`
- [x] Complex algorithms include explanatory documentation — transposition formula documented in research.md
- [x] Code review checklist includes readability verification — per constitution governance

## Project Structure

### Documentation (this feature)

```text
specs/004-multi-instruments/
├── plan.md              # This file
├── research.md          # Phase 0 output (updated)
├── data-model.md        # Phase 1 output (updated)
├── spec.md              # Feature specification
└── tasks.md             # Phase 2 output (/speckit-tasks command)
```

### Source Code (repository root)

```text
backend/
├── api/
│   ├── serializers.py        # MelodyTabSerializer, MelodySerializer (existing, modify)
│   ├── views.py              # MelodyViewSet.perform_create, MelodyTabView (existing, modify)
│   └── urls.py               # (existing, no change needed)
├── melodies/
│   ├── models.py             # Melody, MelodyTab, INSTRUMENT_CHOICES (existing, modify)
│   ├── utils.py              # transpose_between_instruments (existing, no change)
│   └── migrations/           # New migration for any model changes
└── tests/
    ├── unit/
    │   ├── test_models.py    # MelodyTab auto-creation tests (existing, extend)
    │   └── test_utils.py     # Transposition tests (existing, extend)
    └── integration/
        ├── test_api_melodies.py  # API auto-tab creation tests (existing, extend)
        └── test_tabs_crud.py     # Tab delete min-1 constraint (new)

frontend/
├── src/
│   ├── components/
│   │   ├── InstrumentTabs.js          # Tab bar UI (existing, modify for delete constraint)
│   │   └── InstrumentSelectModal.js   # Source instrument selection modal (new)
│   ├── pages/
│   │   ├── ComposerPage.js            # Auto-create flow on new melody (existing, modify)
│   │   └── SharedMelodyPage.js        # Read-only tabs (existing, minor adjustment)
│   ├── services/
│   │   └── melodyService.js           # (existing, no change needed)
│   └── utils/
│       ├── instruments.js             # INSTRUMENTS constant, transposeForInstrument (existing, no change)
│       └── transposer.js              # transposeNotes (existing, no change)
└── src/
    └── (test files colocated with source, extend existing)
```

**Structure Decision**: Web application with separate frontend/ and backend/ directories. Both already exist with established patterns. Changes are additive to existing files with one new component (InstrumentSelectModal) and one new test file (test_tabs_crud.py).

## Complexity Tracking

No constitution violations. All changes follow existing patterns.
