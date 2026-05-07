# Implementation Plan: Solfege Transposition, Octaves & Accidentals

**Branch**: `002-solfege-transposition-octaves` | **Date**: 2026-05-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/002-solfege-transposition-octaves/spec.md`

## Summary

Replace the existing key selector dropdown with transposition arrow controls that shift all notes in the notation input by half or whole steps cumulatively. Extend the notation system to support multiple octaves via case+number convention and accidentals (sharps/flats) for full chromatic coverage. This is a frontend-focused change that also requires backend validation updates.

## Technical Context

**Language/Version**:
- Backend: Python 3.11+ (Django 4.2)
- Frontend: JavaScript ES2022+ (React 18)

**Primary Dependencies**:
- Backend: Django REST Framework (existing validation in `melodies/utils.py`)
- Frontend: React 18, Tone.js 14 (audio synthesis)

**Storage**: PostgreSQL 15 (existing — notation column stores the new format)

**Testing**:
- Backend: pytest + pytest-django (existing)
- Frontend: Jest + React Testing Library (existing)

**Target Platform**: Modern web browsers (Chrome 90+, Firefox 88+, Safari 14+)

**Project Type**: Web application (full-stack SPA with REST API)

**Performance Goals**: Transposition must be instantaneous (<50ms UI update per click)

**Constraints**:
- Backward compatible: existing melodies (plain "do re mi") must still validate and play
- No new dependencies required
- Client-side only for transposition logic (no API call needed)

**Scale/Scope**: Modifies ~8 existing files, adds ~3 new utility modules

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Test Coverage Mandate**:
- [x] Plan includes 60%+ test coverage strategy
  - Unit tests for transposition logic, note parsing, octave/accidental handling
  - Integration tests for UI transposition flow
- [x] Unit test approach defined for all components
  - Backend: test new validation rules for extended notation
  - Frontend: test transposition function, note parser, KeySelector replacement
- [x] Integration test scenarios identified
  - Full transposition flow: input → click → verify updated text
  - Playback with multi-octave notes and accidentals

**Test-First Development**:
- [x] Testing framework selected and documented
  - Backend: pytest (existing), Frontend: Jest (existing)
- [x] Test structure aligned with TDD workflow (Red-Green-Refactor)
  - Write failing tests for new notation parser first, then implement

**Clean Code Principles**:
- [x] Naming conventions defined and documented
  - Python: snake_case; JS: camelCase; Components: PascalCase
- [x] Code organization follows single responsibility principle
  - Separate modules: noteParser (parsing), transposer (shifting), validation (checking)
- [x] Maximum function length guidelines established
  - Target <20 lines, max 50 lines per function

**OOP Design Principles**:
- [x] Architecture demonstrates SOLID principles
  - Single Responsibility: parser, transposer, validator as separate utilities
  - Open/Closed: new notation extends existing validation without modifying core
- [x] Interfaces and abstractions properly identified
  - NoteParser: string → structured note objects
  - Transposer: note objects + interval → transposed note objects
- [x] Inheritance vs composition strategy documented
  - Composition: utility functions composed together, no class hierarchies

**Human-Readable Code**:
- [x] Naming conventions prioritize clarity over brevity
  - `transposeNoteByHalfSteps()` not `trans()`; `parseNoteWithOctave()` not `parse()`
- [x] Complex algorithms include explanatory documentation
  - Transposition wrapping logic, octave boundary handling documented
- [x] Code review checklist includes readability verification

## Project Structure

### Documentation (this feature)

```text
specs/002-solfege-transposition-octaves/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Technical decisions
├── data-model.md        # Note structure definition
└── checklists/
    └── requirements.md  # Spec quality checklist
```

### Source Code (modified files)

```text
melody-txt/
├── backend/
│   └── melodies/
│       └── utils.py             # Extended: new notation validation + transposition
├── frontend/
│   └── src/
│       ├── utils/
│       │   ├── noteParser.js    # NEW: parse extended notation (octave, accidentals)
│       │   ├── transposer.js   # NEW: transpose note arrays by semitone intervals
│       │   ├── validation.js    # MODIFIED: support extended notation
│       │   └── audioEngine.js   # MODIFIED: play notes with octave/accidental support
│       ├── components/
│       │   ├── TransposeControls.js  # NEW: replaces KeySelector
│       │   ├── MelodyComposer.js     # MODIFIED: integrate transpose controls
│       │   └── KeySelector.js        # REMOVED
│       └── pages/
│           └── ComposerPage.js       # MODIFIED: remove key state, add transpose
└── tests (colocated with source)
```

## Complexity Tracking

| Decision | Complexity Added | Justification |
|----------|------------------|---------------|
| Separate noteParser module | New file | Single Responsibility — parsing is complex enough to isolate |
| Separate transposer module | New file | Testable in isolation, reusable across frontend and potential future backend use |
| Backward compatibility | Additional validation paths | Existing melodies with plain notation must continue to work |
