# Tasks: Octave Notation Change

**Input**: Design documents from `/specs/009-octave-notation-change/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/notation-grammar.md

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: No project setup needed — this is a modification to existing code.

(No tasks in this phase)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: No foundational work needed — changes are self-contained in existing utility functions.

(No tasks in this phase)

---

## Phase 3: User Story 1 - New Upper Octave Parsing (Priority: P1) 🎯 MVP

**Goal**: Users typing `DO3` get octave 6, `DO4` gets octave 7. Old `DO1`/`DO2` still work for backward compatibility.

**Independent Test**: Type `DO3` in the composer → hear C6. Type `DO4` → hear C7. Type `DO1` → still hear C6 (backward compat).

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T001 [P] [US1] Update test expectations for uppercase+number parsing in frontend/src/utils/noteParser.test.js — change `DO1`→octave 6 via backward compat, add `DO3`→octave 6 (new), `DO4`→octave 7 (new), `DO5`→octave 8 (new)
- [x] T002 [P] [US1] Add backward compatibility tests in frontend/src/utils/noteParser.test.js — verify `DO1` still parses to semitone 72 (octave 6) and `DO2` still parses to semitone 84 (octave 7)

### Implementation for User Story 1

- [x] T003 [US1] Update `parseNote()` in frontend/src/utils/noteParser.js — change line 55 from `octave = 5 + number` to `octave = number >= 3 ? number + 3 : 5 + number`
- [x] T004 [P] [US1] Update `_transpose_notation_text()` parsing in backend/melodies/utils.py — change line 278 from `octave = 5 + (int(number_str) if number_str else 0)` to use conditional: `n >= 3 → n + 3`, else `5 + n`

**Checkpoint**: Parsing accepts both old and new notation correctly. Tests pass for input.

---

## Phase 4: User Story 2 - Transposition Output Uses New Notation (Priority: P1)

**Goal**: System always renders octave 6 as `DO3`, octave 7 as `DO4`, never `DO1`/`DO2`.

**Independent Test**: Transpose a melody containing notes at octave 6+ → output shows `DO3`, `DO4` notation.

### Tests for User Story 2

- [x] T005 [P] [US2] Update `noteToString` test expectations in frontend/src/utils/noteParser.test.js — change `noteToString(72)` expected from `'DO1'` to `'DO3'`, `noteToString(84)` from `'DO2'` to `'DO4'`
- [x] T006 [P] [US2] Add round-trip test in frontend/src/utils/noteParser.test.js — verify `parseNote(noteToString(semitone)).semitone === semitone` for semitones 72, 84, 96

### Implementation for User Story 2

- [x] T007 [US2] Update `noteToString()` in frontend/src/utils/noteParser.js — change rendering for octave > 5: `const num = octave - 3` (was `octave - 5`) and always output the number (remove `num > 0 ?` conditional)
- [x] T008 [P] [US2] Update `_transpose_notation_text()` rendering in backend/melodies/utils.py — change line 303 from `num = new_octave - 5` to `num = new_octave - 3`, and change line 304 to always include number: `str(num)` (remove `if num > 0` conditional)

**Checkpoint**: Both parsing and rendering work with new notation. Round-trip identity holds.

---

## Phase 5: User Story 3 - Existing Melodies Backward Compatibility (Priority: P2)

**Goal**: Melodies stored with old notation (`DO1`, `DO2`) continue to sound correct.

**Independent Test**: A melody with `DO1` in the database plays at C6, same as before the change.

### Tests for User Story 3

- [x] T009 [US3] Add integration test verifying old notation `DO1 DO2` parses to same semitones as new notation `DO3 DO4` in frontend/src/utils/noteParser.test.js

### Implementation for User Story 3

- [x] T010 [US3] Verify no additional changes needed — backward compat is built into T003 and T004 parsing logic. Confirm by running all tests.

**Checkpoint**: Old and new notation produce identical audio output.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [x] T011 [P] Update i18n hint text in frontend/src/i18n/locales/pt-BR.json — change octave instruction from referencing `DO1` to `DO3` for octave notation help
- [x] T012 Run full frontend test suite (`cd frontend && npm test`) and verify all 123+ tests pass
- [x] T013 [P] Run backend tests if database available (`cd backend && ./venv/bin/python -m pytest tests/unit/ -v`)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1/2**: Skipped (no setup needed)
- **Phase 3 (US1 - Parsing)**: Can start immediately
- **Phase 4 (US2 - Rendering)**: Can start in parallel with Phase 3 (different code locations)
- **Phase 5 (US3 - Backward Compat)**: Depends on Phase 3 completion (compat is in parsing logic)
- **Phase 6 (Polish)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (Parsing)** and **US2 (Rendering)** are independent — they modify different functions
- **US3 (Backward Compat)** depends on US1 (the compat logic lives inside the parsing formula)

### Parallel Opportunities

- T001 and T002 can run in parallel (same file, different test blocks)
- T003 (frontend parse) and T004 (backend parse) can run in parallel
- T005 and T006 can run in parallel
- T007 (frontend render) and T008 (backend render) can run in parallel
- T011 and T013 can run in parallel

---

## Parallel Example: User Stories 1 & 2

```bash
# These can run simultaneously since they touch different functions:
Task T003: "Update parseNote() in frontend/src/utils/noteParser.js"
Task T007: "Update noteToString() in frontend/src/utils/noteParser.js"

# These backend tasks also touch different code blocks:
Task T004: "Update _transpose_notation_text() parsing in backend/melodies/utils.py"
Task T008: "Update _transpose_notation_text() rendering in backend/melodies/utils.py"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete T001-T002 (tests)
2. Complete T003-T004 (implementation)
3. **STOP and VALIDATE**: Verify new notation parses correctly, old still works
4. This alone makes the system accept `DO3` as input

### Full Delivery

1. US1 (parsing) + US2 (rendering) in parallel → system fully uses new notation
2. US3 (verify backward compat) → confirm no regressions
3. Polish → update help text, run full suite

---

## Notes

- Total changes: 4 code locations (2 frontend, 2 backend)
- The key formula: parsing = `number >= 3 ? N+3 : 5+N`; rendering = `octave - 3`
- Round-trip identity MUST hold: `parseNote(noteToString(s)).semitone === s`
- Old notation `DO1`/`DO2` will still parse correctly but will never be output
