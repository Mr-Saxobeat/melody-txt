# Tasks: Hidden Notes

**Input**: Design documents from `/specs/010-hidden-notes/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Included per constitution (Test-First Development mandate).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `frontend/src/` (React SPA)
- No backend changes required for this feature

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the hidden notes utility module and its test file

- [x] T001 [P] Create hidden notes utility module in frontend/src/utils/hiddenNotes.js with `parseHiddenNotes(line)` function that uses regex `/\*([^*]+)\*/g` to extract hidden note token positions
- [x] T002 [P] Create test file for hidden notes utility in frontend/src/utils/hiddenNotes.test.js with test cases for: matched pairs, unmatched asterisks, multiple hidden notes per line, empty content between asterisks, nested asterisks

**Checkpoint**: Utility module exists with passing tests for `parseHiddenNotes`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Add the CSS class for hidden note styling — required by both editor and view page stories

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 Add `.highlight-hidden` CSS class to frontend/src/components/MelodyComposer.css — use a lighter shade of green (e.g., `color: #81c784; font-weight: 400;`) distinct from the bold `.highlight-notes` style (#2e7d32, font-weight: 600)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Write Hidden Notes in Editor (Priority: P1) 🎯 MVP

**Goal**: Text wrapped in asterisks in the editor appears in a lighter shade of the line's color (asterisks always visible)

**Independent Test**: Type `do re *do re mi* fa` in the melody editor and verify the `*do re mi*` portion renders in a lighter green while `do re` and `fa` remain bold green

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T004 [P] [US1] Write unit tests for `renderLineWithHiddenNotes(line)` in frontend/src/utils/hiddenNotes.test.js — test that it returns HTML with `<span class="highlight-hidden">*content*</span>` wrapping matched pairs, and leaves unmatched asterisks as plain text
- [x] T005 [P] [US1] Write component test in frontend/src/components/MelodyComposer.test.js — verify that when notation contains `*text*`, the backdrop renders with `highlight-hidden` class spans

### Implementation for User Story 1

- [x] T006 [US1] Implement `renderLineWithHiddenNotes(line)` in frontend/src/utils/hiddenNotes.js — returns HTML string with hidden note segments wrapped in `<span class="highlight-hidden">...</span>` (asterisks included), non-hidden text HTML-escaped
- [x] T007 [US1] Update `renderHighlightedContent()` in frontend/src/components/MelodyComposer.js — for each classified line, call `renderLineWithHiddenNotes()` to apply hidden note styling within the existing note/lyric line span
- [x] T008 [US1] Verify unmatched asterisks render as plain text (no special styling) by running tests

**Checkpoint**: At this point, User Story 1 should be fully functional — hidden notes in the editor display with a lighter green color and asterisks are always visible

---

## Phase 4: User Story 2 - View Melody Without Asterisks (Priority: P1)

**Goal**: On the SharedMelodyPage, hidden notes appear in a lighter shade of the line's color with no asterisks visible

**Independent Test**: Navigate to a shared melody containing `do re *do re mi* fa` and verify "do re mi" appears in light green with no asterisks, while "do re" and "fa" appear in bold green

### Tests for User Story 2

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T009 [P] [US2] Write unit tests for `renderLineForView(line, lineType)` in frontend/src/utils/hiddenNotes.test.js — test that it returns React elements with hidden note content (no asterisks) in muted spans, and normal text in plain spans
- [x] T010 [P] [US2] Write rendering test for SharedMelodyPage — verify that notation containing `*text*` renders without asterisks and with appropriate muted styling

### Implementation for User Story 2

- [x] T011 [US2] Implement `renderLineForView(line, lineType)` in frontend/src/utils/hiddenNotes.js — returns array of React elements: normal text as-is, hidden note content (without asterisks) wrapped in a `<span>` with lighter color style based on lineType ('notes' → light green, 'lyrics' → light orange)
- [x] T012 [US2] Update rendering in frontend/src/pages/SharedMelodyPage.js — replace direct `{line.text}` rendering with call to `renderLineForView(line.text, line.type)` so hidden notes are shown without asterisks in muted style
- [x] T013 [US2] Verify unmatched asterisks display as literal characters in view mode by running tests

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently — editor shows asterisks in muted color, view page hides asterisks

---

## Phase 5: User Story 3 - Hidden Notes Coexist with Notes and Lyrics (Priority: P2)

**Goal**: Verify that hidden notes containing valid note tokens are still parsed and transposed normally — no regressions in existing functionality

**Independent Test**: Type `do re *do mi* mi fa`, transpose up one half step, and verify ALL notes (including those inside asterisks) are transposed

### Tests for User Story 3

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T014 [P] [US3] Write integration test in frontend/src/utils/hiddenNotes.test.js — verify that `isNoteLine("do re *do mi* fa")` returns true (asterisks don't break line classification since they fail parseNote and are non-note tokens)
- [x] T015 [P] [US3] Write transposition test in frontend/src/utils/transposer.test.js — verify that `transposeNotes("do re *do mi* fa", 1)` transposes `do`, `re`, `do`, `mi`, `fa` while leaving `*` characters unchanged

### Implementation for User Story 3

- [x] T016 [US3] Run existing test suite to confirm no regressions — `isNoteLine`, `transposeNotes`, and `classifyLines` already handle asterisks correctly (they fail `parseNote()` and are treated as non-note tokens / ignored symbols)
- [x] T017 [US3] If T014/T015 tests fail, investigate and fix — the expectation is that existing parsing already handles this correctly since `*` is not matched by NOTE_REGEX and asterisks are treated as separators in the token split

**Checkpoint**: All user stories should now be independently functional — hidden notes are visual-only and parsing/transposition work as expected

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Lyric line support and edge cases

- [x] T018 [P] Add `.highlight-hidden-lyrics` CSS class to frontend/src/components/MelodyComposer.css — lighter shade of orange for hidden notes on lyric lines (e.g., `color: #ffab91;` vs the bold #e65100)
- [x] T019 Update `renderLineWithHiddenNotes` in frontend/src/utils/hiddenNotes.js to accept a `lineType` parameter and use appropriate CSS class (`highlight-hidden` for notes, `highlight-hidden-lyrics` for lyrics)
- [x] T020 Update `renderHighlightedContent()` in frontend/src/components/MelodyComposer.js to pass line type to `renderLineWithHiddenNotes`
- [x] T021 [P] Add test cases for lyric lines with hidden notes in frontend/src/utils/hiddenNotes.test.js
- [x] T022 Run full test suite and verify 60%+ coverage maintained

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: No dependency on Phase 1 (CSS only) - can run in parallel with Setup
- **User Story 1 (Phase 3)**: Depends on Phase 1 (utility module) + Phase 2 (CSS class)
- **User Story 2 (Phase 4)**: Depends on Phase 1 (utility module) + Phase 2 (CSS class) — independent of US1
- **User Story 3 (Phase 5)**: Depends on Phase 1 (for test file location) — can run in parallel with US1/US2
- **Polish (Phase 6)**: Depends on US1 and US2 being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Setup + Foundational
- **User Story 2 (P1)**: Can start after Setup + Foundational — independent of US1
- **User Story 3 (P2)**: Can start after Setup — primarily verification tests

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Utility functions before component integration
- Component changes after utility is ready

### Parallel Opportunities

- T001 and T002 can run in parallel (Phase 1)
- T003 can run in parallel with Phase 1 (different file)
- T004 and T005 can run in parallel (different test files)
- T009 and T010 can run in parallel (different test files)
- T014 and T015 can run in parallel (different test files)
- US1 and US2 can be worked on in parallel after Setup + Foundational
- US3 can run in parallel with US1 and US2

---

## Parallel Example: User Story 1

```bash
# Launch tests for User Story 1 together:
Task: "Write unit tests for renderLineWithHiddenNotes in frontend/src/utils/hiddenNotes.test.js"
Task: "Write component test in frontend/src/components/MelodyComposer.test.js"

# After tests pass (they should fail initially):
Task: "Implement renderLineWithHiddenNotes in frontend/src/utils/hiddenNotes.js"
Task: "Update renderHighlightedContent in frontend/src/components/MelodyComposer.js"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (utility module + tests)
2. Complete Phase 2: Foundational (CSS class)
3. Complete Phase 3: User Story 1 (editor hidden note styling)
4. **STOP and VALIDATE**: Type `do re *do re mi* fa` in editor — verify muted styling
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test editor styling → Deploy/Demo (MVP!)
3. Add User Story 2 → Test view page → Deploy/Demo
4. Add User Story 3 → Verify parsing still works → Deploy/Demo
5. Add Polish → Lyric line support → Final Deploy

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (5 min)
2. Once Foundational is done:
   - Developer A: User Story 1 (editor)
   - Developer B: User Story 2 (view page)
   - Developer C: User Story 3 (verification tests)
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- This is a purely visual/frontend feature — no backend changes needed
- Existing note parsing already handles asterisks correctly (they fail parseNote and are non-note tokens)
