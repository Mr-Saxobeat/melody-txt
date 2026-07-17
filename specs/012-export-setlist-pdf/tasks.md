# Tasks: Export Setlist to PDF

**Input**: Design documents from `specs/012-export-setlist-pdf/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Tests are included as the project constitution mandates test-first development with 60%+ coverage.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install dependencies and create base service file structure

- [x] T001 Install jspdf and jszip dependencies in frontend/package.json
- [x] T002 Create empty service module at frontend/src/services/pdfExportService.js with exported function stubs (exportSetlistToPdf, generatePdfForInstrument, renderNotationPage)
- [x] T003 [P] Create test file at frontend/src/services/pdfExportService.test.js with describe blocks for each function

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core rendering logic that ALL user stories depend on — the per-page notation renderer

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 [P] Write failing tests for renderNotationPage: verifies it calls jsPDF setTextColor with correct colors for notes (#2e7d32), lyrics (#e65100), other (#333), and hidden muted variants in frontend/src/services/pdfExportService.test.js
- [x] T005 [P] Write failing tests for renderNotationPage: verifies font weight 600 for visible segments, 400 for hidden segments in frontend/src/services/pdfExportService.test.js
- [x] T006 [P] Write failing test for renderNotationPage: verifies auto font scaling when content exceeds page height (reduces font size until content fits, minimum 8pt) in frontend/src/services/pdfExportService.test.js
- [x] T007 Implement renderNotationPage in frontend/src/services/pdfExportService.js — classifies lines via classifyLines(), splits into segments via renderLineForView(), renders each segment with correct color/weight using jsPDF API, scales font down if content overflows available height

**Checkpoint**: Foundation ready — notation rendering works correctly for any single page

---

## Phase 3: User Story 1 - Export a setlist as PDF for a single instrument (Priority: P1) 🎯 MVP

**Goal**: Generate a single PDF with one melody per page for one instrument, with correct styling

**Independent Test**: Export a setlist with 3+ melodies for one instrument → verify PDF has correct page count and styled notation

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T008 [P] [US1] Write failing test for generatePdfForInstrument: given 3 melodies with piano tabs, generates a PDF blob with 3 pages in frontend/src/services/pdfExportService.test.js
- [x] T009 [P] [US1] Write failing test for generatePdfForInstrument: verifies it finds the correct instrument tab from melody.tabs array in frontend/src/services/pdfExportService.test.js
- [x] T010 [P] [US1] Write failing test for generatePdfForInstrument: when a melody has no matching instrument tab, renders a placeholder page with "No notation available" message in frontend/src/services/pdfExportService.test.js

### Implementation for User Story 1

- [x] T011 [US1] Implement generatePdfForInstrument in frontend/src/services/pdfExportService.js — creates jsPDF instance (A4), iterates melodies in order, finds matching tab by instrument ID, calls renderNotationPage for each, adds new page between melodies, returns PDF as Blob
- [x] T012 [US1] Handle missing instrument tab case in generatePdfForInstrument — render page with melody title and "No notation available for [Instrument Name]" centered text in frontend/src/services/pdfExportService.js

**Checkpoint**: At this point, a single PDF for one instrument can be generated with correct styling

---

## Phase 4: User Story 2 - Export produces one file per instrument in ZIP (Priority: P1)

**Goal**: Generate one PDF per instrument, bundle into a ZIP, and trigger browser download

**Independent Test**: Export a setlist with 3 instruments → verify ZIP contains 3 correctly-named PDFs

### Tests for User Story 2

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T013 [P] [US2] Write failing test for exportSetlistToPdf: given melodies with 3 instrument tabs, calls generatePdfForInstrument 3 times (once per unique instrument) in frontend/src/services/pdfExportService.test.js
- [x] T014 [P] [US2] Write failing test for exportSetlistToPdf: verifies ZIP contains files named "[Setlist Title] - [Instrument Name].pdf" in frontend/src/services/pdfExportService.test.js
- [x] T015 [P] [US2] Write failing test for exportSetlistToPdf: verifies the ZIP file is named "[Setlist Title].zip" in frontend/src/services/pdfExportService.test.js

### Implementation for User Story 2

- [x] T016 [US2] Implement exportSetlistToPdf in frontend/src/services/pdfExportService.js — collects all unique instruments across all melody tabs, calls generatePdfForInstrument for each, adds each PDF blob to JSZip instance with correct filename pattern
- [x] T017 [US2] Implement ZIP download trigger in exportSetlistToPdf — generates ZIP blob via jszip.generateAsync(), creates object URL, programmatically clicks hidden anchor element with download attribute set to "[Setlist Title].zip" in frontend/src/services/pdfExportService.js

**Checkpoint**: Full export pipeline works end-to-end — multiple PDFs bundled and downloaded as ZIP

---

## Phase 5: User Story 3 - PDF preserves content layout per page (Priority: P2)

**Goal**: Ensure PDF renders content exactly as displayed in shared melody view (no extra header, correct margins, order preserved)

**Independent Test**: Compare PDF page content side-by-side with shared melody view and verify identical layout

### Tests for User Story 3

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T018 [P] [US3] Write failing test: renderNotationPage does NOT prepend a separate title — content is rendered as-is starting from the first line in frontend/src/services/pdfExportService.test.js
- [x] T019 [P] [US3] Write failing test: verifies pages are generated in same order as setlist entries in frontend/src/services/pdfExportService.test.js

### Implementation for User Story 3

- [x] T020 [US3] Verify and adjust renderNotationPage in frontend/src/services/pdfExportService.js — ensure no additional title header is prepended, content starts at top margin, uses same default font size (equivalent to 1.1rem from shared view)
- [x] T021 [US3] Set PDF page margins (top: 15mm, bottom: 15mm, left: 15mm, right: 15mm) to provide readable spacing matching the shared melody view container padding in frontend/src/services/pdfExportService.js

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: UI Integration

**Purpose**: Wire the export service into the SetlistDetailPage UI

### Tests

- [x] T022 [P] Write failing test: SetlistDetailPage renders "Export PDF" button when setlist has entries and user is authenticated in frontend/src/pages/SetlistDetailPage.test.js
- [x] T023 [P] Write failing test: SetlistDetailPage does NOT render "Export PDF" button when setlist has no entries in frontend/src/pages/SetlistDetailPage.test.js
- [x] T024 [P] Write failing test: SetlistDetailPage does NOT render "Export PDF" button in readOnly mode in frontend/src/pages/SetlistDetailPage.test.js
- [x] T025 [P] Write failing test: clicking "Export PDF" button fetches all melody data and calls exportSetlistToPdf in frontend/src/pages/SetlistDetailPage.test.js

### Implementation

- [x] T026 Add "Export PDF" button to SetlistDetailPage header actions (alongside Share, Add Melody) — only visible when not readOnly and setlist has entries in frontend/src/pages/SetlistDetailPage.js
- [x] T027 Implement export click handler in SetlistDetailPage — fetches full melody data for each entry via melodyService.getSharedMelody(entry.melody_share_id) in parallel, then calls exportSetlistToPdf(setlist, melodies) in frontend/src/pages/SetlistDetailPage.js
- [x] T028 Add loading/disabled state to export button — shows "Exporting..." while PDF generation is in progress, re-enables on completion or error in frontend/src/pages/SetlistDetailPage.js
- [x] T029 Add i18n translation keys for export button labels (exportPdf, exporting, exportError) in frontend/src/i18n/useTranslation.js or locale files

**Checkpoint**: Feature is fully integrated and usable from the UI

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Edge cases, error handling, and final validation

- [x] T030 [P] Handle export error gracefully — if melody fetch fails, show inline error message with retry option in frontend/src/pages/SetlistDetailPage.js
- [x] T031 [P] Sanitize setlist title for filename (remove characters invalid in filenames: / \ : * ? " < > |) in frontend/src/services/pdfExportService.js
- [x] T032 Run full test suite and verify 60%+ coverage on new code via npm test -- --watchAll=false --coverage
- [ ] T033 Manual verification: export a setlist with 5+ melodies, 3 instruments, some hidden notes — verify ZIP contents, page count, colors, scaling, and print quality (requires running dev server)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 (T001–T003)
- **User Story 1 (Phase 3)**: Depends on Phase 2 (renderNotationPage must work)
- **User Story 2 (Phase 4)**: Depends on Phase 3 (generatePdfForInstrument must work)
- **User Story 3 (Phase 5)**: Depends on Phase 2 (renderNotationPage adjustments)
- **UI Integration (Phase 6)**: Depends on Phase 4 (exportSetlistToPdf must exist)
- **Polish (Phase 7)**: Depends on Phase 6

### User Story Dependencies

- **User Story 1 (P1)**: Depends on Foundational — no dependencies on other stories
- **User Story 2 (P1)**: Depends on User Story 1 (needs generatePdfForInstrument)
- **User Story 3 (P2)**: Depends on Foundational only — can run in parallel with US1/US2

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Implementation builds on foundation (renderNotationPage)
- Story complete when checkpoint criteria met

### Parallel Opportunities

- T004, T005, T006 can run in parallel (different test cases)
- T008, T009, T010 can run in parallel (different test cases for US1)
- T013, T014, T015 can run in parallel (different test cases for US2)
- T018, T019 can run in parallel (different test cases for US3)
- T022, T023, T024, T025 can run in parallel (different UI test cases)
- User Story 3 can run in parallel with User Story 1 (both depend on Foundational only)

---

## Parallel Example: Phase 2 (Foundational Tests)

```bash
# Launch all foundational tests together:
Task: "Write failing test for renderNotationPage color rendering" (T004)
Task: "Write failing test for renderNotationPage font weight" (T005)
Task: "Write failing test for renderNotationPage auto scaling" (T006)
```

## Parallel Example: Phase 6 (UI Tests)

```bash
# Launch all UI integration tests together:
Task: "Test export button renders when entries exist" (T022)
Task: "Test export button hidden when no entries" (T023)
Task: "Test export button hidden in readOnly mode" (T024)
Task: "Test export click handler flow" (T025)
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2)

1. Complete Phase 1: Setup (install deps, create stubs)
2. Complete Phase 2: Foundational (renderNotationPage with colors + scaling)
3. Complete Phase 3: User Story 1 (single PDF per instrument)
4. Complete Phase 4: User Story 2 (ZIP bundling + download)
5. **STOP and VALIDATE**: Test export end-to-end with a real setlist
6. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Core rendering works
2. Add User Story 1 → Single instrument PDF works (MVP!)
3. Add User Story 2 → Full multi-instrument ZIP export
4. Add User Story 3 → Layout polish and margin refinement
5. Add UI Integration → Feature accessible from app
6. Polish → Error handling, filename sanitization, coverage

---

## Notes

- [P] tasks = different files or different test cases, no dependencies
- [Story] label maps task to specific user story for traceability
- All rendering uses existing classifyLines() and renderLineForView() utilities (no duplication)
- jsPDF measurements are in millimeters (A4 = 210mm x 297mm)
- Hidden notes use same muted color as SharedMelodyPage: notes → hsla(120,7%,77%,1), lyrics → #ffab91, other → #999
- Commit after each task or logical group
