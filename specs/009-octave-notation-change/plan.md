# Implementation Plan: Octave Notation Change

**Branch**: `009-octave-notation-change` | **Date**: 2026-06-07 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/009-octave-notation-change/spec.md`

## Summary

Change the upper-octave numbering convention so that the number in uppercase notes represents `octave = number + 3` instead of `octave = 5 + number`. This means `DO3` = octave 6 (was `DO1`), `DO4` = octave 7 (was `DO2`). Lower octaves and the base octaves (4 and 5) remain unchanged. Both the parsing (input) and rendering (output) logic must be updated, with backward compatibility for old stored notation.

## Technical Context

**Language/Version**: Python 3.9 (Django backend), JavaScript ES6 (React frontend via CRA)  
**Primary Dependencies**: Django REST Framework, React, Tone.js (audio engine)  
**Storage**: PostgreSQL (notation stored as text in `Melody.notation` and `MelodyTab.notation`)  
**Testing**: pytest (backend), Jest (frontend)  
**Target Platform**: Web application (browser + server)  
**Project Type**: Web application  
**Performance Goals**: N/A (notation parsing is fast; no performance-sensitive path)  
**Constraints**: Must maintain backward compatibility with existing stored notation  
**Scale/Scope**: ~50 lines of code changed across 2 main files + test updates

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
- Tests: Update existing unit tests in `noteParser.test.js` to use new expected values. Add backward-compatibility tests for old notation.
- Clean Code: The parsing formula changes from `5 + N` to `N + 3` — a single-line change in each parser. The rendering logic changes from `octave - 5` to `octave - 3`.
- SOLID: No new classes or abstractions needed — purely formula changes within existing functions.

## Project Structure

### Documentation (this feature)

```text
specs/009-octave-notation-change/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit-tasks command)
```

### Source Code (repository root)

```text
frontend/
├── src/
│   └── utils/
│       ├── noteParser.js          # PRIMARY: update parseNote() and noteToString()
│       └── noteParser.test.js     # Update test expectations for new notation
└── ...

backend/
├── melodies/
│   └── utils.py                   # PRIMARY: update _transpose_notation_text() octave logic
└── tests/
    └── unit/
        └── test_utils.py          # Update test expectations for new notation
```

**Structure Decision**: Existing web application structure unchanged. Changes are confined to notation parsing/rendering utilities in both frontend and backend.

## Complexity Tracking

No constitution violations. The change is minimal formula adjustments in existing utility functions.
