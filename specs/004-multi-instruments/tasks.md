# Tasks: Multi-Instrument Notation

**Input**: Design documents from `specs/004-multi-instruments/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md

**Organization**: Tasks grouped by user story to enable independent implementation and testing

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2)
- Include exact file paths in descriptions

## Path Conventions

This is a **web application** with:
- Backend: `backend/` (Django REST Framework)
- Frontend: `frontend/` (React SPA)

---

## Phase 1: Setup (Instrument Constants & Model)

**Purpose**: Create the MelodyTab model and instrument definitions

- [x] T001 [P] Create instrument constants in frontend/src/utils/instruments.js: define INSTRUMENTS array with { id, name, key, offset } for Piano (0), Saxophone Eb (+9), Trumpet Bb (+2), Trombone C (0); export transposeForInstrument(notation, fromInstrument, toInstrument) helper
- [x] T002 [P] Create MelodyTab model in backend/melodies/models.py: id:UUID, melody:FK CASCADE, instrument:str (choices), notation:text, position:int, suffix:str(50) nullable, created_at
- [x] T003 Create migration for MelodyTab: python manage.py makemigrations melodies
- [x] T004 Add INSTRUMENT_CHOICES constant in backend/melodies/models.py: list of (key, label) tuples for piano, saxophone, trumpet, trombone with their offsets

---

## Phase 2: User Story 1 - Create Multiple Instrument Tabs (Priority: P1)

**Goal**: Tab UI with instrument selection, auto-transposition on creation, editable notation per tab

**Independent Test**: Create melody with "do re mi" on piano, add saxophone tab, verify shows "la si do#"

- [x] T005 [P] [US1] Create MelodyTabSerializer in backend/api/serializers.py: fields (id, instrument, notation, position, suffix, created_at), nested in MelodySerializer as tabs list
- [x] T006 [P] [US1] Create MelodyTabViewSet in backend/api/views.py: POST to create tab (with auto-transposition from source tab), PUT to update notation/instrument/suffix, DELETE to remove tab; max 10 tabs validation
- [x] T007 [US1] Add tab routes in backend/api/urls.py: /api/melodies/{melody_id}/tabs/ (list/create), /api/melodies/{melody_id}/tabs/{tab_id}/ (update/delete)
- [x] T008 [US1] Update MelodySerializer in backend/api/serializers.py: include nested tabs in melody detail and shared melody responses
- [x] T009 [US1] Add instrument transposition helper in backend/melodies/utils.py: transpose_between_instruments(notation, from_instrument, to_instrument) using offset arithmetic
- [x] T010 [P] [US1] Create InstrumentTabs component in frontend/src/components/InstrumentTabs.js: tab bar showing instrument names, "+" button to add tab, active tab highlighting, click tab to switch
- [x] T011 [US1] Create InstrumentModal component in frontend/src/components/InstrumentModal.js: modal listing available instruments, onClick selects instrument and closes modal
- [x] T012 [US1] Integrate InstrumentTabs into ComposerPage in frontend/src/pages/ComposerPage.js: manage tabs state, active tab switches notation in editor, new tab auto-transposes from current tab's instrument
- [x] T013 [US1] Add tab suffix editing in InstrumentTabs: clicking tab name opens inline editor for suffix (instrument prefix not editable)
- [x] T014 [US1] Add tab deletion in InstrumentTabs: X button or swipe to delete a tab (with confirmation)
- [x] T015 [US1] Create frontend tab service in frontend/src/services/melodyService.js: addTab(melodyId, instrument, notation, position), updateTab(melodyId, tabId, data), deleteTab(melodyId, tabId)

**Checkpoint**: User can create melody, add instrument tabs, see transposed notation, edit each tab independently

---

## Phase 3: User Story 2 - Transposition Affects All Tabs (Priority: P2)

**Goal**: Transpose controls shift all tabs simultaneously

**Independent Test**: With piano "do re mi" and saxophone "la si do#", click up half step — both shift by 1 semitone

- [x] T016 [US2] Update ComposerPage transpose handler in frontend/src/pages/ComposerPage.js: when transpose button clicked, apply transposeNotes to ALL tabs' notations (not just active tab)
- [x] T017 [US2] Update SharedMelodyPage in frontend/src/pages/SharedMelodyPage.js: display tabs as read-only switchable views, transpose affects all tabs, remember selected tab via ?instrument= query param
- [x] T018 [US2] Implement setlist instrument memory in SharedMelodyPage: when navigating between setlist melodies, match tab by full label (instrument + suffix), fallback to same instrument, then first tab

**Checkpoint**: Transposition works across all tabs; setlist navigation remembers instrument selection

---

## Phase 4: Backend Migration & Compatibility

**Purpose**: Handle existing melodies and ensure backward compatibility

- [x] T019 Create data migration to add default "Piano in C" tab for all existing melodies that have notation but no tabs in backend/melodies/migrations/
- [x] T020 Update SharedMelodySerializer in backend/api/serializers.py: include tabs in shared melody response
- [x] T021 Ensure melody CRUD still works without tabs (backward compatible): notation field remains as fallback

---

## Phase 5: Polish & Integration

**Purpose**: Final verification

- [x] T022 Run full backend test suite and verify all tests pass
- [x] T023 Run full frontend test suite and verify all tests pass
- [x] T024 Verify frontend compiles without errors

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — model and constants first
- **Phase 2 (US1)**: Depends on Phase 1 (needs model + instrument definitions)
- **Phase 3 (US2)**: Depends on Phase 2 (needs tab UI working)
- **Phase 4 (Migration)**: Depends on Phase 1 (needs model)
- **Phase 5 (Polish)**: Depends on all other phases

### Parallel Opportunities

**Phase 1**: T001, T002 parallel (frontend/backend)
**Phase 2**: T005, T006, T010 parallel (different files)
**Phase 4**: Can run in parallel with Phase 3

---

## Implementation Strategy

### MVP (User Story 1 Only)

1. Complete Phase 1 (T001-T004) — ~1 hour
2. Complete Phase 2 (T005-T015) — ~6 hours
3. **VALIDATE**: Can user create tabs, see transposition, edit independently?

### Full Feature

4. Phase 3 (T016-T018) — ~2 hours
5. Phase 4 (T019-T021) — ~1 hour
6. Phase 5 (T022-T024) — ~30 min

**Total**: ~10.5 hours (24 tasks)

---

## Task Count Summary

- **Phase 1 (Setup)**: 4 tasks
- **Phase 2 (US1 Multi-Tab)**: 11 tasks
- **Phase 3 (US2 Global Transpose)**: 3 tasks
- **Phase 4 (Migration)**: 3 tasks
- **Phase 5 (Polish)**: 3 tasks

**Total**: 24 tasks
**Parallel Opportunities**: ~6 tasks marked [P]
**Suggested MVP Scope**: Phases 1-2 (T001-T015) = 15 tasks
