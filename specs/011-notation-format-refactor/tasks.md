# Tasks: Notation Format Refactor

**Input**: Design documents from `specs/011-notation-format-refactor/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: No new project setup needed — this is a refactor of existing code. Phase skipped.

---

## Phase 2: Foundational (Regex & Parser Updates)

**Purpose**: Update the core note regex and parser logic in both backend and frontend. These changes MUST be complete before user story tasks can work correctly.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T001 [P] Update EXTENDED_NOTE_REGEX in backend/melodies/utils.py to new pattern `^(sol|la|si|do|re|mi|fa)(\d)?(#|b)?$` (swap capture groups 2 and 3)
- [x] T002 [P] Update NOTE_REGEX in frontend/src/utils/noteParser.js to new pattern `/^(sol|la|si|do|re|mi|fa|SOL|LA|SI|DO|RE|MI|FA|Sol|La|Si|Do|Re|Mi|Fa)(\d)?(#|b)?$/`
- [x] T003 Update parseNote() in frontend/src/utils/noteParser.js to swap destructuring of match groups (group 2 = octave number, group 3 = accidental) and add octave number validation (uppercase rejects 1 or 2)
- [x] T004 Update is_valid_note_token() and related parsing in backend/melodies/utils.py to use new group order and add octave number validation (uppercase rejects 1 or 2)

**Checkpoint**: Both frontend and backend now accept `DO3#` and reject `DO#3` and `FA2#`. Existing notes without octave+accidental combo still validate.

---

## Phase 3: User Story 1 - New Notation Input (Priority: P1) 🎯 MVP

**Goal**: The system accepts the new `[syllable][octave][accidental]` format and rejects the old format for new input.

**Independent Test**: Enter `DO3#`, `RE3b`, `sol1b` in the melody composer — they are accepted. Enter `DO#3`, `FA2#` — they are rejected.

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation (TDD)**

- [x] T005 [P] [US1] Write test cases for new format acceptance in backend/tests/unit/test_utils.py: `DO3#`, `RE3b`, `sol1b`, `mi1#` must pass validation
- [x] T006 [P] [US1] Write test cases for old format rejection in backend/tests/unit/test_utils.py: `DO#3`, `REb2`, `FA#1` must fail validation
- [x] T007 [P] [US1] Write test cases for octave number validation in backend/tests/unit/test_utils.py: `FA2#`, `DO1b` must fail; `DO3#`, `do1b` must pass
- [x] T008 [P] [US1] Write test cases for new format acceptance in frontend/src/utils/noteParser.test.js: `DO3#`, `RE3b`, `sol1b` must return valid parse result
- [x] T009 [P] [US1] Write test cases for old format rejection in frontend/src/utils/noteParser.test.js: `DO#3`, `REb2`, `FA2#` must return null
- [x] T010 [P] [US1] Write test cases for no-regression in frontend/src/utils/noteParser.test.js: `do#`, `REb`, `DO3`, `re1`, `do`, `DO` must still parse correctly

### Implementation for User Story 1

- [x] T011 [US1] Verify T001-T004 (foundational changes) make tests T005-T010 pass; fix any remaining issues in backend/melodies/utils.py and frontend/src/utils/noteParser.js
- [x] T012 [US1] Update frontend/src/utils/validation.test.js to reflect new format acceptance and old format rejection

**Checkpoint**: New format input works end-to-end. Old format rejected. All parser tests green.

---

## Phase 4: User Story 2 - Existing Data Migration (Priority: P1)

**Goal**: All existing melodies and instrument tabs in the database are migrated from old format to new format.

**Independent Test**: Run migration, then verify no melody contains `[syllable][accidental][octave]` patterns in its notation field.

### Tests for User Story 2

- [x] T013 [P] [US2] Write unit test for migrate_notation_format() utility function in backend/tests/unit/test_utils.py: verify `DO#3 REb2` → `DO3# RE2b`, mixed content preserved, lyrics untouched, idempotent
- [x] T014 [P] [US2] Write test for migration on MelodyTab notation in backend/tests/unit/test_utils.py

### Implementation for User Story 2

- [x] T015 [US2] Implement migrate_notation_format(text) utility function in backend/melodies/utils.py — regex-based token reordering on note lines only
- [x] T016 [US2] Create Django data migration in backend/melodies/migrations/ that iterates all Melody and MelodyTab records, applying migrate_notation_format() to each notation field
- [x] T017 [US2] Add reverse migration function in the same migration file to allow rollback (swap `(\d)(#|b)` back to `(#|b)(\d)`)

**Checkpoint**: Migration runs successfully. All stored melodies use new format. Migration is reversible and idempotent.

---

## Phase 5: User Story 3 - Output Format Consistency (Priority: P2)

**Goal**: All system-generated notation (transposition, octave shift, instrument conversion) outputs the new canonical format.

**Independent Test**: Transpose a melody and verify output tokens use `[syllable][octave][accidental]` format. Shift octaves and verify format.

### Tests for User Story 3

- [x] T018 [P] [US3] Write test for noteToString() output format in frontend/src/utils/noteParser.test.js: verify output is `DO3#` not `DO#3` for semitone values requiring both octave and accidental
- [x] T019 [P] [US3] Write test for transposeNotes() output in frontend/src/utils/transposer.test.js: verify transposed output uses new format
- [x] T020 [P] [US3] Write test for _transpose_notation_text() output in backend/tests/unit/test_utils.py: verify backend transposition uses new format
- [x] T021 [P] [US3] Write test for octave shift output in frontend/src/utils/noteParser.test.js: verify `SOL3#` shifted down → `SOL#`, `do1b` shifted up → `dob`

### Implementation for User Story 3

- [x] T022 [US3] Update noteToString() in frontend/src/utils/noteParser.js to assemble output as `syllable + number + accidental` instead of `syllable + accidental + number`
- [x] T023 [US3] Update _transpose_notation_text() result_token construction in backend/melodies/utils.py to use `syllable + number + accidental` order
- [x] T024 [US3] Update frontend/src/utils/transposer.test.js expected values to match new output format (e.g., `DO# RE# FA` → adjust any that cross octave boundaries)
- [x] T025 [US3] Verify octave shift behavior in frontend/src/utils/noteParser.js noteToString(): when octave is default (4/5), number is omitted — accidental preserved after empty number position

**Checkpoint**: All generated output uses new format. Transposition, instrument conversion, and octave shifts produce correct new-format tokens.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and consistency checks across all pages.

- [x] T026 [P] Verify view music page renders new format correctly (manual check on SharedMelodyPage and SetlistDetailPage)
- [x] T027 [P] Run full test suite: `cd backend && pytest` and `cd frontend && npm test` — all tests pass
- [x] T028 Verify migration is idempotent: run migration twice, confirm no changes on second run
- [x] T029 Run quickstart.md validation: enter new-format notes, transpose, verify output format

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 2)**: No dependencies - start immediately
- **User Story 1 (Phase 3)**: Depends on Phase 2 completion
- **User Story 2 (Phase 4)**: Depends on Phase 2 completion (regex must be updated before migration logic can use it)
- **User Story 3 (Phase 5)**: Depends on Phase 2 completion
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Depends on Foundational only. No cross-story dependencies.
- **User Story 2 (P1)**: Depends on Foundational only. Can run in parallel with US1.
- **User Story 3 (P2)**: Depends on Foundational only. Can run in parallel with US1 and US2.

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Implementation follows test expectations
- Checkpoint validates story independence

### Parallel Opportunities

- T001 and T002 (backend + frontend regex) can run in parallel
- T005-T010 (all US1 tests) can run in parallel
- T013-T014 (US2 tests) can run in parallel
- T018-T021 (US3 tests) can run in parallel
- After Phase 2, all three user stories can start in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all tests for US1 together (TDD Red phase):
Task: "Write test cases for new format acceptance in backend/tests/unit/test_utils.py"
Task: "Write test cases for old format rejection in backend/tests/unit/test_utils.py"
Task: "Write test cases for octave number validation in backend/tests/unit/test_utils.py"
Task: "Write test cases for new format acceptance in frontend/src/utils/noteParser.test.js"
Task: "Write test cases for old format rejection in frontend/src/utils/noteParser.test.js"
Task: "Write test cases for no-regression in frontend/src/utils/noteParser.test.js"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 2: Foundational (regex updates)
2. Complete Phase 3: User Story 1 (validation tests + verify)
3. **STOP and VALIDATE**: New format accepted, old format rejected
4. Deploy if ready — existing data still in old format but displays fine (just can't be re-saved until migrated)

### Incremental Delivery

1. Phase 2: Foundational regex changes → parsers updated
2. Phase 3: US1 → New input validated ✓ (MVP!)
3. Phase 4: US2 → Existing data migrated ✓
4. Phase 5: US3 → Output format consistent ✓
5. Phase 6: Polish → Full validation ✓

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
