# Implementation Plan: Notation Format Refactor

**Branch**: `011-notation-format-refactor` | **Date**: 2026-06-30 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/011-notation-format-refactor/spec.md`

## Summary

Refactor the note parsing and output logic in both frontend and backend to use `[syllable][octave][accidental]` format (e.g., `DO3#`) instead of the current `[syllable][accidental][octave]` (e.g., `DO#3`). Includes a one-time Django data migration to convert all existing melodies and instrument tabs to the new canonical format.

## Technical Context

**Language/Version**: Python 3.9 (Django 4.2 backend), JavaScript ES6+ (React 18 frontend)  
**Primary Dependencies**: Django REST Framework, pytest, Jest, React Testing Library  
**Storage**: SQLite/PostgreSQL via Django ORM — `Melody.notation` and `MelodyTab.notation` text fields  
**Testing**: pytest + pytest-django (backend), Jest + React Testing Library (frontend)  
**Target Platform**: Web application (browser + server)  
**Project Type**: Web application (frontend + backend)  
**Performance Goals**: No user-perceived latency change; migration handles all melodies in a single pass  
**Constraints**: Migration must be reversible; zero data loss  
**Scale/Scope**: All existing melodies in database; two codebases (frontend + backend) with parallel parsing logic

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

## Project Structure

### Documentation (this feature)

```text
specs/011-notation-format-refactor/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2 output (via /speckit-tasks)
```

### Source Code (repository root)

```text
backend/
├── melodies/
│   ├── utils.py              # EXTENDED_NOTE_REGEX, noteToString logic, _transpose_notation_text
│   └── migrations/           # New migration for data conversion
└── tests/
    └── unit/
        └── test_utils.py     # Note parsing + migration tests

frontend/
└── src/
    └── utils/
        ├── noteParser.js     # NOTE_REGEX, parseNote(), noteToString()
        ├── noteParser.test.js
        ├── transposer.js     # transposeNotes() output format
        ├── transposer.test.js
        ├── validation.js
        └── validation.test.js
```

**Structure Decision**: Existing web application structure with `backend/` and `frontend/` directories. Changes are localized to the note parsing utilities in both layers plus a new Django data migration.

## Complexity Tracking

No constitutional violations. The changes are focused regex/string-manipulation updates with a data migration — no new abstractions, patterns, or architectural complexity introduced.
