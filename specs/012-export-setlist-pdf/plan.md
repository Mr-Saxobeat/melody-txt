# Implementation Plan: Export Setlist to PDF

**Branch**: `012-export-setlist-pdf` | **Date**: 2026-07-17 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `specs/012-export-setlist-pdf/spec.md`

## Summary

Enable users to export a setlist as a collection of PDFs (one per instrument) bundled in a ZIP file. Each PDF renders one melody per page with the same font styling, color coding, and hidden note treatment as the shared melody view. Client-side generation using `jsPDF` for PDF rendering and `JSZip` for archive bundling.

## Technical Context

**Language/Version**: JavaScript (ES2020+), React 18.2  
**Primary Dependencies**: jsPDF (PDF generation), JSZip (ZIP bundling), existing utils (classifyLines, renderLineForView)  
**Storage**: N/A (no new persistence — purely client-side generation)  
**Testing**: Jest 29 + React Testing Library (existing), MSW for API mocking  
**Target Platform**: Modern browsers (Chrome, Firefox, Safari, Edge)  
**Project Type**: Web application (React SPA + Django REST backend)  
**Performance Goals**: Export completes in under 5 seconds for 30 melodies  
**Constraints**: Client-side only, no server-side PDF rendering, single ZIP download  
**Scale/Scope**: Setlists with up to 30 melodies, 4 instruments max

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Test Coverage Mandate**:
- [x] Plan includes 60%+ test coverage strategy — unit tests for pdfExportService, integration test for export flow
- [x] Unit test approach defined for all components — each public function tested with mocked jsPDF
- [x] Integration test scenarios identified — full export flow with mocked API responses

**Test-First Development**:
- [x] Testing framework selected and documented — Jest 29 + MSW (existing)
- [x] Test structure aligned with TDD workflow (Red-Green-Refactor) — write tests for renderNotationPage, generatePdfForInstrument, exportSetlistToPdf before implementation

**Clean Code Principles**:
- [x] Naming conventions defined and documented — camelCase, descriptive function names matching contract
- [x] Code organization follows single responsibility principle — separate service file, each function has one job
- [x] Maximum function length guidelines established — under 50 lines per function

**OOP Design Principles**:
- [x] Architecture demonstrates SOLID principles — service module with clear interfaces, dependency injection of jsPDF instance for testability
- [x] Interfaces and abstractions properly identified — contract defines 3 clear public functions
- [x] Inheritance vs composition strategy documented — composition (service functions calling utility functions)

**Human-Readable Code**:
- [x] Naming conventions prioritize clarity over brevity — e.g., `generatePdfForInstrument`, `renderNotationPage`
- [x] Complex algorithms include explanatory documentation — font scaling algorithm documented
- [x] Code review checklist includes readability verification — constitution's review requirements apply

## Project Structure

### Documentation (this feature)

```text
specs/012-export-setlist-pdf/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Technology decisions
├── data-model.md        # Entity definitions and color mapping
├── quickstart.md        # Developer quickstart guide
├── contracts/
│   └── export-service.md  # Service interface contract
└── checklists/
    └── requirements.md  # Spec quality checklist
```

### Source Code (repository root)

```text
frontend/
├── src/
│   ├── services/
│   │   ├── pdfExportService.js       # NEW: Core PDF/ZIP generation
│   │   └── pdfExportService.test.js  # NEW: Unit tests
│   ├── pages/
│   │   ├── SetlistDetailPage.js      # MODIFY: Add export button
│   │   └── SetlistDetailPage.test.js # MODIFY: Test export integration
│   └── utils/
│       ├── validation.js             # EXISTING: classifyLines()
│       └── hiddenNotes.js            # EXISTING: renderLineForView()
└── package.json                       # MODIFY: Add jspdf, jszip deps
```

**Structure Decision**: Feature lives entirely in the frontend as a new service module. No backend changes needed. Existing utility functions (`classifyLines`, `renderLineForView`) are reused for notation parsing — same logic used by SharedMelodyPage.

## Complexity Tracking

No constitution violations. No complexity justifications needed.
