# Tasks: Multi-Instrument Auto-Creation

**Input**: Design documents from `specs/004-multi-instruments/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md

**Organization**: Tasks grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2)
- Include exact file paths in descriptions

## Path Conventions

This is a **web application** with:
- Backend: `backend/` (Django REST Framework)
- Frontend: `frontend/` (React SPA)

**Note**: Most infrastructure (MelodyTab model, API endpoints, InstrumentTabs component, transposition utils) already exists. These tasks focus on the new auto-creation flow and clarification-driven changes.

---

## Phase 1: Setup (Verification)

**Purpose**: Verify existing infrastructure is complete and consistent

- [x] T001 [P] Verify instrument constants are consistent between backend/melodies/models.py (INSTRUMENT_CHOICES, INSTRUMENT_OFFSETS) and frontend/src/utils/instruments.js (INSTRUMENTS) — all 4 instruments with correct offsets
- [x] T002 [P] Verify MelodyTab model exists with all required fields (id, melody FK, instrument, notation, position, suffix, created_at) in backend/melodies/models.py
- [x] T003 [P] Verify transposition logic works for all instrument pairs in backend/melodies/utils.py (transpose_between_instruments) and frontend/src/utils/instruments.js (transposeForInstrument)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Backend constraint that must be in place before user story work

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Add min-1 tab delete constraint in MelodyTabView.delete in backend/api/views.py — before deleting, check melody.tabs.count() > 1; if only 1 tab remains, return HTTP 400 with message "Cannot delete the last tab"
- [x] T005 [P] Add integration test for min-1 tab delete constraint in backend/tests/integration/test_tabs_crud.py — test DELETE returns 400 when only 1 tab remains, test DELETE succeeds with 204 when 2+ tabs exist

**Checkpoint**: Foundation ready — backend enforces min-1 tab constraint

---

## Phase 3: User Story 1 — Auto-Create All 4 Instrument Tabs on New Melody (Priority: P1) MVP

**Goal**: When a user creates a new melody, show a source instrument selection modal, then automatically create all 4 instrument tabs (Piano, Saxophone, Trumpet, Trombone) with notation transposed from the selected source instrument.

**Independent Test**: Open compose page, verify source instrument modal appears, select "Saxophone in Eb", type "do re mi" in Saxophone tab, trigger auto-transpose to other tabs, verify Piano shows "mib fa sol", Trumpet shows "fa sol la", Trombone shows "mib fa sol".

### Implementation for User Story 1

- [x] T006 [P] [US1] Create InstrumentSelectModal component in frontend/src/components/InstrumentSelectModal.js — modal with title "Select Your Instrument", displays all 4 instruments from INSTRUMENTS constant as buttons showing "{name} in {key}" format (e.g., "Piano in C"), calls onSelect(instrumentId) callback when clicked. Add CSS in frontend/src/components/InstrumentSelectModal.css. Modal should have overlay backdrop consistent with existing instrument-modal-overlay styling.
- [x] T007 [P] [US1] Update getTabLabel in frontend/src/components/InstrumentTabs.js to display full instrument label with key: "{name} in {key}" format (e.g., "Piano in C", "Saxophone in Eb") instead of just the instrument name, by using the key field from getInstrumentById
- [x] T008 [US1] Modify ComposerPage new melody initialization in frontend/src/pages/ComposerPage.js — add state: showSourceModal (default true for new melodies, false for edits), sourceInstrument (null until selected). When creating a new melody (no edit param), show InstrumentSelectModal instead of creating a single Piano tab. When user selects source instrument: create all 4 local tabs in fixed order (Piano position 0, Saxophone position 1, Trumpet position 2, Trombone position 3) with empty notation, set activeTabId to the source instrument's tab, set sourceInstrument, hide modal.
- [x] T009 [US1] Implement auto-transpose trigger in ComposerPage in frontend/src/pages/ComposerPage.js — when the user has typed notation in the source tab and switches to another tab for the first time (or explicitly triggers), auto-transpose the source tab's current notation into all other tabs using transposeForInstrument(sourceNotation, sourceInstrument, targetInstrument, !preferFlat). Only auto-transpose tabs that still have empty notation (don't overwrite user edits).
- [x] T010 [US1] Ensure handleSaveConfirm in frontend/src/pages/ComposerPage.js correctly saves all 4 tabs to backend — verify the existing loop that calls melodyService.addTab for each tab passes the correct instrument, notation, position, and sourceInstrument. Confirm the save flow handles the case where all 4 tabs are new (not previously saved to backend).
- [x] T011 [US1] Verify existing melody edit flow is unchanged in frontend/src/pages/ComposerPage.js — when loading with edit query param, skip InstrumentSelectModal, load tabs from API as before. Test that editing an old single-Piano-tab melody still works.

**Checkpoint**: User Story 1 complete — new melodies auto-create all 4 instrument tabs from a user-selected source instrument

---

## Phase 4: User Story 2 — Transposition Affects All Tabs Simultaneously (Priority: P2)

**Goal**: When the user uses transpose controls, all instrument tabs are transposed simultaneously by the same interval.

**Independent Test**: Create a melody with 4 tabs, type "do re mi" on Piano tab, auto-transpose to other tabs, click "up half step" — verify all 4 tabs shift by the same interval.

### Implementation for User Story 2

- [x] T012 [US2] Verify handleTranspose in frontend/src/pages/ComposerPage.js already transposes all tabs — the existing implementation maps over all tabs and applies transposeNotes. Confirm this works correctly with 4 auto-created tabs. No code change expected.
- [x] T013 [US2] Verify SharedMelodyPage transpose behavior with multiple tabs in frontend/src/pages/SharedMelodyPage.js — current implementation applies transposeSemitones to the active tab only at render time. Confirm this is correct per spec (transpose controls on shared page affect whichever tab is being viewed).

**Checkpoint**: User Story 2 complete — transpose controls affect all tabs simultaneously on compose page

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Edge cases, consistency, and regression verification

- [x] T014 [P] Verify setlist instrument memory matches spec FR-010a in frontend/src/pages/SharedMelodyPage.js — update findMatch to match by full label (instrument name + suffix, e.g., "Trombone - 1") first, then fall back to instrument id match, then first tab. Current implementation uses instrument id; add full label matching.
- [x] T015 [P] Verify data migration 0003_add_default_piano_tabs.py handles existing melodies correctly — confirm pre-existing melodies have a single "Piano in C" tab and no retroactive auto-creation occurs for old melodies
- [x] T016 [P] Verify max 10 tabs constraint works with auto-creation — 4 auto-created + up to 6 manual via "+". Confirm InstrumentTabs shows "+" only when tabs.length < 10 in frontend/src/components/InstrumentTabs.js and backend MelodyTabView.post enforces the limit in backend/api/views.py
- [ ] T017 Run all backend tests: cd backend && python -m pytest tests/ -v (BLOCKED: requires Docker DB)
- [x] T018 Run all frontend tests: cd frontend && npx react-app-rewired test --watchAll=false (9 suites, 109 tests PASSED)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — verification only, already complete
- **Foundational (Phase 2)**: No hard dependency on Setup. BLOCKS user stories.
- **User Story 1 (Phase 3)**: Depends on Phase 2 completion
- **User Story 2 (Phase 4)**: Depends on Phase 2 completion. Can run in parallel with US1 (mostly verification).
- **Polish (Phase 5)**: Depends on US1 and US2 being complete

### User Story Dependencies

- **User Story 1 (P1)**: Depends on Foundational (Phase 2). No dependency on US2.
- **User Story 2 (P2)**: Depends on Foundational (Phase 2). Independent of US1.

### Within Each User Story

- Component creation (T006, T007) before page integration (T008)
- Core flow (T008) before edge cases (T009, T010)
- Edge cases before edit flow verification (T011)

### Parallel Opportunities

- T001, T002, T003 (Phase 1) — all parallel (verification only, already done)
- T004 and T005 (Phase 2) — T005 is the test for T004; write test first per TDD
- T006 and T007 (Phase 3) — parallel, different files
- T012 and T013 (Phase 4) — parallel, different pages
- T014, T015, T016 (Phase 5) — all parallel, different files/concerns

---

## Parallel Example: User Story 1

```text
# Parallel (different files):
Task T006: "Create InstrumentSelectModal in frontend/src/components/InstrumentSelectModal.js"
Task T007: "Update tab labels in frontend/src/components/InstrumentTabs.js"

# Sequential (same file: ComposerPage.js):
Task T008: "Modify ComposerPage initialization flow"
Task T009: "Implement auto-transpose trigger"
Task T010: "Verify save flow with 4 tabs"
Task T011: "Verify edit flow unchanged"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 2: Add backend min-1 delete constraint (T004, T005)
2. Complete Phase 3: User Story 1 — source modal + auto-create 4 tabs (T006-T011)
3. **STOP and VALIDATE**: New melody → source modal → 4 tabs → type notation → auto-transpose → save
4. Deploy/demo if ready

### Incremental Delivery

1. Phase 2 → Backend constraint in place
2. Add User Story 1 → Test independently → Deploy (MVP!)
3. Add User Story 2 → Verify transpose behavior → Deploy
4. Polish → Edge cases, setlist matching, regressions
5. Each phase adds value without breaking previous work

---

## Task Count Summary

- **Phase 1 (Setup/Verification)**: 3 tasks (already complete)
- **Phase 2 (Foundational)**: 2 tasks
- **Phase 3 (US1 Auto-Create Tabs)**: 6 tasks
- **Phase 4 (US2 Global Transpose)**: 2 tasks
- **Phase 5 (Polish)**: 5 tasks

**Total**: 18 tasks (15 remaining, 3 already complete)
**Parallel Opportunities**: 8 tasks marked [P]
**Suggested MVP Scope**: Phase 2 + Phase 3 (T004-T011) = 8 tasks
