# Tasks: Instruments Management

**Input**: Design documents from `specs/014-instruments-management/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api-instruments.md

**Tests**: Included per project constitution (TDD mandate). Write tests before implementation for each task.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup

**Purpose**: No additional project setup needed — existing Django + React project. This phase is empty.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Create the Instrument model and infrastructure that ALL user stories depend on

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T001 Create Instrument model with PITCH_CHOICES, pitch field, and computed offset in backend/melodies/models.py
- [x] T002 Create Django migration to add instruments table and seed Piano (C/0), Saxophone (Eb/9), Trumpet (Bb/2), Trombone (C/0) in backend/melodies/migrations/
- [x] T003 Register Instrument in Django Admin with list_display (name, pitch, offset) and pitch as read-only on edit in backend/melodies/admin.py
- [x] T004 [P] Add InstrumentSerializer (id, name, pitch, offset) in backend/api/serializers.py
- [x] T005 [P] Add InstrumentListView (public, ordered by name) in backend/api/views.py
- [x] T006 Add GET /api/instruments/ route in backend/api/urls.py
- [x] T007 [P] Add unit tests for Instrument model: pitch-to-offset mapping for all 12 pitches, unique name validation, pitch immutability on save in backend/tests/unit/test_instrument_model.py
- [x] T008 [P] Add integration test for GET /api/instruments/ endpoint in backend/tests/integration/test_instruments_api.py

**Checkpoint**: Instrument model exists, admin can manage instruments, API serves instrument list. All user stories can now proceed.

---

## Phase 3: User Story 1 - Admin Adds a New Instrument (Priority: P1)

**Goal**: Admin can create instruments via Django Admin by selecting a name and pitch, with the offset auto-computed.

**Independent Test**: Log into Django Admin, add "Tenor Saxophone" with pitch "Bb", verify it appears with offset 2 in both admin and GET /api/instruments/.

### Implementation for User Story 1

- [x] T009 [US1] Enforce pitch immutability in Instrument model save() — reject pitch changes on existing records in backend/melodies/models.py
- [x] T010 [US1] Configure Django Admin add form to show name + pitch dropdown, and edit form with pitch as read-only in backend/melodies/admin.py
- [x] T011 [US1] Add unit test for pitch immutability enforcement (creating works, editing pitch raises error) in backend/tests/unit/test_instrument_model.py
- [x] T012 [US1] Add integration test for admin instrument creation: create instrument, verify offset auto-computed, verify appears in API in backend/tests/integration/test_instruments_api.py

**Checkpoint**: Admin can create and edit instruments. Pitch is locked after creation. Offset is auto-computed.

---

## Phase 4: User Story 2 - Existing Instruments Preserved After Migration (Priority: P1)

**Goal**: Migrate MelodyTab.instrument from CharField to ForeignKey without breaking any existing melody data.

**Independent Test**: Run migrations, verify all four original instruments exist with correct offsets, verify all existing MelodyTab records reference valid Instrument FKs.

### Implementation for User Story 2

- [x] T013 [US2] Create migration to add nullable FK field instrument_ref to MelodyTab in backend/melodies/migrations/
- [x] T014 [US2] Create data migration to map existing instrument string values (piano, saxophone, trumpet, trombone) to Instrument FK references in backend/melodies/migrations/
- [x] T015 [US2] Create migration to drop old instrument CharField and rename instrument_ref to instrument (non-nullable) in backend/melodies/migrations/
- [x] T016 [US2] Update MelodyTab model to use ForeignKey(Instrument, on_delete=CASCADE) and update __str__ method in backend/melodies/models.py
- [x] T017 [US2] Remove INSTRUMENT_CHOICES and INSTRUMENT_OFFSETS constants from backend/melodies/models.py
- [x] T018 [US2] Update transpose_between_instruments to query Instrument model for offsets instead of using constants in backend/melodies/utils.py
- [x] T019 [US2] Update MelodyTabSerializer to nest InstrumentSerializer for the instrument field in backend/api/serializers.py
- [x] T020 [US2] Update MelodyTabView.post() to accept instrument UUID and validate against Instrument table in backend/api/views.py
- [x] T021 [US2] Update existing tab CRUD integration tests to create Instrument fixtures and use FK references in backend/tests/integration/test_tabs_crud.py
- [x] T022 [P] [US2] Update existing transposition integration tests to use Instrument model in backend/tests/integration/test_transposition.py
- [x] T023 [P] [US2] Update existing permissions tests to use Instrument fixtures in backend/tests/integration/test_universal_permissions.py
- [x] T024 [US2] Add integration test for full migration path: verify seed data, verify FK references, verify transposition still works in backend/tests/integration/test_instrument_migration.py

**Checkpoint**: All existing melody data preserved. MelodyTab uses FK to Instrument. Transposition works as before. All existing tests pass.

---

## Phase 5: User Story 3 - Instrument Deletion Cascades to Tabs (Priority: P2)

**Goal**: Deleting an instrument removes all associated tabs, with a Piano fallback for melodies that would lose their last tab.

**Independent Test**: Create instrument with tabs across multiple melodies, delete it, verify tabs removed and last-tab melodies got a Piano fallback tab.

### Implementation for User Story 3

- [x] T025 [US3] Implement pre_delete signal or override Instrument.delete() to create Piano fallback tabs for melodies that would lose their last tab in backend/melodies/models.py
- [x] T026 [US3] Add integration test for cascade delete: instrument with tabs across multiple melodies in backend/tests/integration/test_instrument_cascade.py
- [x] T027 [US3] Add integration test for last-tab fallback: melody with only one tab for the deleted instrument gets Piano tab in backend/tests/integration/test_instrument_cascade.py
- [x] T028 [US3] Add integration test for multi-tab melody: deleting instrument removes only that instrument's tab, others remain in backend/tests/integration/test_instrument_cascade.py

**Checkpoint**: Cascade delete works. Last-tab invariant preserved via Piano fallback. No orphaned data.

---

## Phase 6: User Story 4 - Musicians See Dynamic Instrument List (Priority: P2)

**Goal**: Frontend fetches instruments from API. New melody creation starts with one selected instrument tab. Deleted instrument shows error.

**Independent Test**: Add a new instrument via admin, refresh frontend, verify it appears in instrument selection. Create melody with that instrument. Delete instrument, verify error on tab creation attempt.

### Implementation for User Story 4

- [x] T029 [P] [US4] Add getInstruments() service method to fetch GET /api/instruments/ in frontend/src/services/melodyService.js
- [x] T030 [US4] Replace hardcoded INSTRUMENTS array with async API-fetched data and update getInstrumentById/transposeForInstrument in frontend/src/utils/instruments.js
- [x] T031 [US4] Update InstrumentSelectModal to use dynamic instrument list (alphabetically ordered) from props or context in frontend/src/components/InstrumentSelectModal.js
- [x] T032 [US4] Update InstrumentTabs to consume dynamic instruments from props instead of static import in frontend/src/components/InstrumentTabs.js
- [x] T033 [US4] Change ComposerPage new melody flow: require instrument selection, create single tab for selected instrument only in frontend/src/pages/ComposerPage.js
- [x] T034 [US4] Update SharedMelodyPage to use instrument data from nested tab object in frontend/src/pages/SharedMelodyPage.js
- [x] T035 [US4] Update pdfExportService to use instrument name from tab's nested instrument object in frontend/src/services/pdfExportService.js
- [x] T036 [US4] Implement deleted instrument error handling: show "Error: the instrument {name} was deleted" and remove from selection list in frontend/src/components/InstrumentSelectModal.js
- [x] T037 [US4] Remove hardcoded instrument translation keys and update i18n to use dynamic instrument names in frontend/src/i18n/locales/pt-BR.json

**Checkpoint**: Frontend uses dynamic instrument list. New melodies start with one selected instrument. Deleted instruments show error. PDF export uses correct names.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final cleanup and validation across all stories

- [x] T038 [P] Update clear_data management command help text to reflect database-driven instruments in backend/melodies/management/commands/clear_data.py
- [x] T039 [P] Run full backend test suite and verify 60%+ coverage per constitution in backend/
- [x] T040 [P] Run full frontend test suite in frontend/
- [x] T041 Run quickstart.md validation steps end-to-end
- [x] T042 Verify no hardcoded instrument definitions remain anywhere in the codebase (SC-005)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Empty — no work needed
- **Foundational (Phase 2)**: No dependencies — can start immediately. BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Foundational (Phase 2) completion
- **US2 (Phase 4)**: Depends on Foundational (Phase 2) completion. Can run in parallel with US1 but recommended after US1 (US1 validates admin flow before migration work)
- **US3 (Phase 5)**: Depends on US2 completion (needs FK relationship in place)
- **US4 (Phase 6)**: Depends on US2 completion (needs API to return nested instrument data). Can run in parallel with US3
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (P1)**: Foundational only — no dependency on other stories
- **US2 (P1)**: Foundational only — modifies MelodyTab schema, independent of US1 admin work
- **US3 (P2)**: Requires US2 (FK must be in place for cascade delete to work)
- **US4 (P2)**: Requires US2 (API must return instrument objects, not strings)

### Within Each User Story

- Tests MUST be written and FAIL before implementation (constitution mandate)
- Models before services
- Backend before frontend
- Core implementation before integration

### Parallel Opportunities

- T004, T005 can run in parallel (different files: serializers.py vs views.py)
- T007, T008 can run in parallel (different test files)
- T022, T023 can run in parallel (different test files)
- T029 can run in parallel with other US4 frontend tasks (service layer is independent)
- T038, T039, T040 can all run in parallel in the Polish phase
- US3 and US4 can run in parallel after US2 completes (different codebases: backend vs frontend)

---

## Parallel Example: Foundational Phase

```bash
# After T001-T003 complete (model + migration + admin), launch in parallel:
Task: "T004 Add InstrumentSerializer in backend/api/serializers.py"
Task: "T005 Add InstrumentListView in backend/api/views.py"
Task: "T007 Unit tests for Instrument model in backend/tests/unit/test_instrument_model.py"
Task: "T008 Integration test for instruments API in backend/tests/integration/test_instruments_api.py"
```

## Parallel Example: US3 + US4

```bash
# After US2 completes, launch both stories in parallel:
# Developer A: US3 (backend cascade delete)
Task: "T025 Implement pre_delete signal for Piano fallback"
Task: "T026-T028 Cascade delete integration tests"

# Developer B: US4 (frontend dynamic instruments)
Task: "T029 Add getInstruments() service"
Task: "T030-T037 Frontend component updates"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 Only)

1. Complete Phase 2: Foundational (Instrument model + admin + API)
2. Complete Phase 3: US1 (admin creates instruments)
3. Complete Phase 4: US2 (migration preserves data)
4. **STOP and VALIDATE**: Admin can manage instruments, all existing data intact, API serves instruments
5. Deploy/demo if ready — backend is fully functional

### Incremental Delivery

1. Foundational → Instrument model exists, admin works, API serves list
2. US1 → Admin can create instruments with pitch immutability (MVP backend)
3. US2 → Full migration, FK in place, existing data preserved (MVP complete)
4. US3 → Cascade delete with safety net (data integrity)
5. US4 → Frontend dynamic instruments (full feature)
6. Polish → Cleanup, coverage, validation

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- TDD is mandatory per constitution — write failing tests before implementation for each task
- The migration in US2 (T013-T015) is a multi-step process — each migration must be a separate file
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
