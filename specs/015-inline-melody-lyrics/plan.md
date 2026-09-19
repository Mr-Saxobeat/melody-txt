# Implementation Plan: Inline Melody Lyrics

**Branch**: `015-inline-melody-lyrics` | **Date**: 2026-09-19 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/015-inline-melody-lyrics/spec.md`

## Summary

Enable musicians to write double-quote-delimited lyrics inline with solfege notation on the same line (e.g., `sol sol "Parabéns pra você" DO si`). The notation tokens render in green/bold and the lyrics segments render in orange/italic — with the quote characters hidden from the rendered output. The feature adds a new `'mixed'` line classification, a segment-level tokenizer, and updates the composer, shared view, transposer, PDF exporter, and backend note-count logic while preserving 100% backward compatibility for existing melodies.

## Technical Context

**Language/Version**: JavaScript (React 18 frontend, CRA via react-app-rewired), Python 3 (Django 4.2 backend)
**Primary Dependencies**: React 18, React Router 6, axios, jsPDF, JSZip, Tone.js (frontend); Django REST Framework, SimpleJWT (backend)
**Storage**: PostgreSQL via Django ORM — existing `Melody.notation` and `MelodyTab.notation` text fields store raw text with quotes (no schema changes)
**Testing**: Jest + React Testing Library + MSW (frontend); pytest + pytest-django + pytest-cov (backend)
**Target Platform**: Web browser (mobile-responsive)
**Project Type**: Web application (SPA frontend + REST API backend)
**Performance Goals**: Rendering feedback within 1 second of typing (SC-001). Typical melodies < 200 lines.
**Constraints**: Zero regressions on existing melodies (SC-002). Backend stores raw text including quote delimiters (FR-009).
**Scale/Scope**: Frontend-heavy feature — parsing, classification, rendering. Backend changes limited to note-count calculation in `Melody.save()`.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Test Coverage Mandate**:
- [x] Plan includes 60%+ test coverage strategy — all new utility functions and updated functions have corresponding test suites
- [x] Unit test approach defined for all components — tokenizer, classifier, transposer, validator, note-count, PDF segments
- [x] Integration test scenarios identified — MelodyComposer rendering mixed lines, SharedMelodyPage display

**Test-First Development**:
- [x] Testing framework selected and documented — Jest + RTL (frontend), pytest (backend)
- [x] Test structure aligned with TDD workflow (Red-Green-Refactor) — tests written before implementation in each unit

**Clean Code Principles**:
- [x] Naming conventions defined — `parseLineSegments`, `classifyLine`, `LineSegment`, `'mixed'` type
- [x] Code organization follows single responsibility — tokenizer is a pure function; classification delegates to tokenizer; rendering delegates to classification
- [x] Maximum function length guidelines established — tokenizer and classifier each under 30 lines

**OOP Design Principles**:
- [x] Architecture demonstrates SOLID principles — tokenizer/classifier/renderer are composable pure functions; existing consumers are extended, not modified (Open/Closed)
- [x] Interfaces and abstractions properly identified — `LineSegment` type, `ClassifiedLine` with optional `segments` field
- [x] Inheritance vs composition strategy documented — composition via function composition; no class hierarchy needed

**Human-Readable Code**:
- [x] Naming conventions prioritize clarity — `parseLineSegments`, `classifyLines` (updated), `renderMixedLine`
- [x] Complex algorithms include explanatory documentation — tokenizer's quote-state-machine approach documented in research.md
- [x] Code review checklist includes readability verification — per constitution quality checklist

## Project Structure

### Documentation (this feature)

```text
specs/015-inline-melody-lyrics/
├── plan.md              # This file
├── research.md          # Phase 0 output — parsing, classification, transposition decisions
├── data-model.md        # Phase 1 output — no schema changes; frontend-only entities
├── quickstart.md        # Phase 1 output — developer quickstart
├── contracts/           # Phase 1 output — updated function signatures
└── tasks.md             # Phase 2 output (via /speckit-tasks)
```

### Source Code (repository root)

```text
backend/
├── melodies/
│   ├── models.py         # Update Melody.save() to skip quoted segments in note_count
│   ├── utils.py          # Add strip_quoted_segments() utility
│   └── tests/            # Add tests for note_count with quoted segments

frontend/
├── src/
│   ├── utils/
│   │   ├── lineTokenizer.js       # NEW — parseLineSegments() pure function
│   │   ├── lineTokenizer.test.js  # NEW — tokenizer tests
│   │   ├── validation.js          # UPDATE — classifyLines() to handle mixed/multi-line quotes
│   │   ├── validation.test.js     # UPDATE — add mixed-line and multi-line quote tests
│   │   ├── transposer.js          # UPDATE — transposeNotes() to preserve quoted segments
│   │   ├── transposer.test.js     # UPDATE — add mixed-line transposition tests
│   │   ├── hiddenNotes.js         # No changes — hidden markers inside quotes are literal text
│   │   └── noteParser.js          # No changes
│   ├── components/
│   │   ├── MelodyComposer.js      # UPDATE — renderHighlightedContent() for mixed lines
│   │   ├── MelodyComposer.css     # UPDATE — add highlight-inline-lyrics class
│   │   └── MelodyComposer.test.js # UPDATE — add rendering tests for mixed lines
│   ├── pages/
│   │   ├── SharedMelodyPage.js    # UPDATE — render mixed-line segments in view mode
│   │   └── ComposerPage.js        # No changes — delegates to MelodyComposer
│   └── services/
│       ├── pdfExportService.js      # UPDATE — render mixed-line segments in PDF
│       └── pdfExportService.test.js # UPDATE — add PDF mixed-line tests
```

**Structure Decision**: Web application with separate `backend/` and `frontend/` directories. This feature is primarily frontend with a minor backend update to `Melody.save()`.

## Complexity Tracking

No constitution violations. All changes follow existing patterns — the new tokenizer is a single pure function, the classification logic extends an existing function, and rendering updates follow the established segment-based pattern from `hiddenNotes.js`.

## Implementation Components

### Component 1: Line Tokenizer (`frontend/src/utils/lineTokenizer.js`)

**Purpose**: Parse a single line of text into an array of `{ text, type }` segments where type is `'notation'` or `'lyrics'`.

**Logic**: Left-to-right scan toggling at double-quote characters. Quote characters are consumed but not included in segment text. Unmatched trailing quote treats remainder as lyrics.

**Dependencies**: None (pure function)

### Component 2: Line Classification Update (`frontend/src/utils/validation.js`)

**Purpose**: Extend `classifyLines()` to:
1. Track multi-line quote state across lines
2. Classify lines containing quotes as `'mixed'` (if notation tokens exist outside quotes) or `'lyrics'` (if no notation tokens outside quotes)
3. Return `segments` array on mixed lines

**Dependencies**: `lineTokenizer.parseLineSegments`, `transposer.isNoteLine`

### Component 3: Transposer Update (`frontend/src/utils/transposer.js`)

**Purpose**: Update `transposeNotes()` and `convertAccidentals()` to skip quoted segments when transposing. Lines with quotes are split into segments; only notation segments are transposed.

**Dependencies**: `lineTokenizer.parseLineSegments`

### Component 4: Note Count Update (`frontend/src/utils/validation.js` + `backend/melodies/models.py`)

**Purpose**: Both `parseNotes()`/`countNotes()` (frontend) and `Melody.save()` (backend) must exclude quoted segments from counts.

**Dependencies**: `lineTokenizer.parseLineSegments` (frontend), new `strip_quoted_segments()` utility (backend)

### Component 5: Composer Rendering Update (`frontend/src/components/MelodyComposer.js`)

**Purpose**: Update `renderHighlightedContent()` to render mixed lines with per-segment spans instead of a single span per line.

**Dependencies**: Updated `classifyLines()` with segments

### Component 6: Shared View Rendering Update (`frontend/src/pages/SharedMelodyPage.js`)

**Purpose**: Update the notation display loop to handle `'mixed'` lines by rendering segments with appropriate colors.

**Dependencies**: Updated `classifyLines()` with segments

### Component 7: PDF Export Update (`frontend/src/services/pdfExportService.js`)

**Purpose**: Update `renderNotationPage()` to render mixed-line segments with the correct color per segment type.

**Dependencies**: Updated `classifyLines()` with segments

### Component 8: Backend Note Count Fix (`backend/melodies/models.py` + `backend/melodies/utils.py`)

**Purpose**: Update `Melody.save()` to strip quoted segments before counting syllables. Add `strip_quoted_segments()` utility.

**Dependencies**: None (simple regex or scan)
