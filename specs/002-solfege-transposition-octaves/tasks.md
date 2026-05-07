# Tasks: Solfege Transposition, Octaves & Accidentals

**Input**: Design documents from `specs/002-solfege-transposition-octaves/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md

**Organization**: Tasks grouped by user story to enable independent implementation and testing

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

This is a **web application** with:
- Backend: `backend/` (Django REST Framework)
- Frontend: `frontend/` (React SPA)

---

## Phase 1: Setup (New Utilities)

**Purpose**: Create the core parsing and transposition modules that all user stories depend on

- [x] T001 [P] Create note parser module in frontend/src/utils/noteParser.js: parseNote(token) returns { syllable, accidental, octave, semitone } object from any valid notation string
- [x] T002 [P] Create transposer module in frontend/src/utils/transposer.js: transposeNotes(notationString, semitones) returns new notation string with all notes shifted
- [x] T003 [P] Create note parser tests in frontend/src/utils/noteParser.test.js: test parsing of plain notes, accidentals, octave markers, and combined notations
- [x] T004 [P] Create transposer tests in frontend/src/utils/transposer.test.js: test half/whole step up/down, octave wrapping, accidental preference (sharp up, flat down)

---

## Phase 2: User Story 1 - Transpose Melody via Arrows (Priority: P1)

**Goal**: Replace key selector with transposition arrow buttons that modify notation text cumulatively

**Independent Test**: Enter "do re mi", click "up half step", verify text becomes "do# re# fa"

- [x] T005 [US1] Create TransposeControls component in frontend/src/components/TransposeControls.js: four buttons (up half, up whole, down half, down whole) with arrow icons and labels
- [x] T006 [US1] Create TransposeControls test in frontend/src/components/TransposeControls.test.js: test button rendering, click callbacks, disabled state when no notation
- [x] T007 [US1] Integrate TransposeControls into ComposerPage in frontend/src/pages/ComposerPage.js: replace KeySelector import with TransposeControls, wire onClick to call transposeNotes and update notation state
- [x] T008 [US1] Remove KeySelector component from frontend/src/components/KeySelector.js and its test file frontend/src/components/KeySelector.test.js
- [x] T009 [US1] Remove key-related state and props from frontend/src/pages/ComposerPage.js: remove selectedKey state, remove key prop from MelodyPlayer
- [x] T010 [US1] Update MelodyPlayer in frontend/src/components/MelodyPlayer.js: remove musicalKey prop, always play notes as-is (pitch determined by notation)
- [x] T011 [US1] Update frontend/src/utils/audioEngine.js: modify solfegeToPitch to accept parsed note object with octave and accidental, compute correct frequency
- [x] T012 [US1] Update frontend/src/utils/validation.js: extend isValidSolfege to accept accidentals (#/b) and octave markers (case + number)
- [x] T013 [US1] Style TransposeControls: arrow button styling with clear directional indicators, disabled state appearance

**Checkpoint**: User can enter "do re mi", click transposition arrows, and see notation update in the input box

---

## Phase 3: User Story 2 - Multi-Octave Notation (Priority: P2)

**Goal**: Support multiple octaves via case and number notation with correct playback

**Independent Test**: Enter "do1 do DO DO1" and play — hear C3, C4, C5, C6

- [x] T014 [US2] Extend noteParser.js to handle octave encoding: lowercase=4, lowercase+N=4-N, UPPERCASE=5, UPPERCASE+N=5+N
- [x] T015 [US2] Extend audioEngine.js solfegeToPitch to compute frequency from absolute octave: use formula freq = 440 * 2^((semitone-69)/12) with correct MIDI mapping
- [x] T016 [US2] Add octave parsing tests in frontend/src/utils/noteParser.test.js: test do1→C3, do→C4, DO→C5, DO1→C6, sol2→G2
- [x] T017 [US2] Update frontend/src/utils/validation.js: accept uppercase syllables and numeric suffixes as valid notation
- [x] T018 [US2] Update transposer.js to handle octave boundary wrapping: si+1 half step → DO (octave 4→5 transition), do-1 half step → si1 (octave 4→3 transition)
- [x] T019 [US2] Add octave wrapping tests in frontend/src/utils/transposer.test.js: test si→DO wrapping, do→si1 wrapping, 12 half steps = one octave

**Checkpoint**: User can enter multi-octave melodies and hear correct pitches across the full C2-C7 range

---

## Phase 4: User Story 3 - Accidentals (Priority: P3)

**Goal**: Support sharps (#) and flats (b) for full chromatic access

**Independent Test**: Enter "do do# re reb" and play — hear C4, C#4, D4, C#4

- [x] T020 [US3] Extend noteParser.js to parse accidentals: detect # and b suffixes, compute semitone offset (+1 for sharp, -1 for flat)
- [x] T021 [US3] Handle enharmonic edge cases in noteParser.js: mi# → same as fa, fab → same as mi, si# → same as DO (next octave)
- [x] T022 [US3] Add accidental tests in frontend/src/utils/noteParser.test.js: test do#, reb, mi#, fab, combined DO#1
- [x] T023 [US3] Update transposer.js accidental output: prefer sharps when transposing up, flats when transposing down
- [x] T024 [US3] Add accidental transposition tests in frontend/src/utils/transposer.test.js: test "do# mi sol#" up half → "re fa la", test accidental normalization

**Checkpoint**: User can write and play chromatic melodies with sharps and flats, transposition handles accidentals correctly

---

## Phase 5: Backend Validation Update

**Purpose**: Update backend to accept the new notation format for saving melodies

- [x] T025 [P] Update backend/melodies/utils.py: extend is_valid_solfege_notation and parse_solfege_notation to accept accidentals (#/b), octave markers (case+number)
- [x] T026 [P] Add backend tests in backend/tests/unit/test_utils.py: test validation of "DO#1", "reb2", "sol#", mixed notation, invalid "dox"
- [x] T027 Run backend test suite: verify all existing tests still pass with extended validation (backward compatible)

---

## Phase 6: Polish & Integration

**Purpose**: End-to-end verification and cleanup

- [x] T028 [P] Update frontend/src/components/MelodyPlayer.test.js: fix any broken tests from removed musicalKey prop
- [x] T029 [P] Update frontend/src/pages/MyMelodiesPage.js: remove any KeySelector references from melody cards
- [x] T030 Run full frontend test suite and verify all tests pass
- [x] T031 Run full backend test suite and verify all tests pass
- [ ] T032 End-to-end manual test: compose multi-octave melody with accidentals, transpose up/down, save, share, verify playback on shared link

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — core utilities first
- **Phase 2 (US1 Transpose)**: Depends on Phase 1 (needs noteParser + transposer)
- **Phase 3 (US2 Octaves)**: Depends on Phase 1 (extends noteParser)
- **Phase 4 (US3 Accidentals)**: Depends on Phase 1 (extends noteParser)
- **Phase 5 (Backend)**: Independent of frontend phases — can run in parallel with Phase 2-4
- **Phase 6 (Polish)**: Depends on all other phases

### Parallel Opportunities

**Within Phase 1**: T001-T004 all parallel (different files)

**Between Phases**: Phase 5 (backend) can run in parallel with Phases 2-4 (frontend)

**Within Phase 2**: T005 and T006 parallel; T008 and T009 parallel

---

## Implementation Strategy

### MVP (User Story 1 Only)

1. Complete Phase 1 (T001-T004) — ~2 hours
2. Complete Phase 2 (T005-T013) — ~4 hours
3. **STOP and VALIDATE**: Can user transpose "do re mi" with arrow clicks?

### Full Feature

4. Complete Phase 3 (T014-T019) — ~3 hours
5. Complete Phase 4 (T020-T024) — ~2 hours
6. Complete Phase 5 (T025-T027) — ~1 hour
7. Complete Phase 6 (T028-T032) — ~1 hour

**Total**: ~13 hours (32 tasks)

---

## Task Count Summary

- **Phase 1 (Setup)**: 4 tasks
- **Phase 2 (US1 Transpose)**: 9 tasks
- **Phase 3 (US2 Octaves)**: 6 tasks
- **Phase 4 (US3 Accidentals)**: 5 tasks
- **Phase 5 (Backend)**: 3 tasks
- **Phase 6 (Polish)**: 5 tasks

**Total**: 32 tasks
**Parallel Opportunities**: ~12 tasks marked [P]
**Suggested MVP Scope**: Phases 1-2 only (T001-T013) = 13 tasks for functional transposition
