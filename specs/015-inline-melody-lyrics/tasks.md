# Tasks: Inline Melody Lyrics

**Input**: Design documents from `/specs/015-inline-melody-lyrics/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Included — constitution mandates test-first development (TDD).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: No new project initialization needed — the project already exists. This phase creates the single new file that all stories depend on.

- [x] T001 Create line tokenizer test file in `frontend/src/utils/lineTokenizer.test.js` with tests for: single notation segment (no quotes), single lyrics segment (entire line quoted), mixed segments (`sol sol "text" DO`), lyrics-first (`"text" DO DO "text2"`), unmatched trailing quote, empty quoted segment (`""`), empty string input, and line with only quotes
- [x] T002 Create line tokenizer `parseLineSegments()` in `frontend/src/utils/lineTokenizer.js` — left-to-right scan toggling at double-quote characters, returning `[{ text, type }]` segments per the contract in `contracts/frontend-api.md`

**Checkpoint**: `parseLineSegments` passes all tests — the foundational building block is ready.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Update `classifyLines()` in validation.js and `parseNotes()`/`countNotes()` — these are consumed by ALL user stories (composer, shared view, PDF, transposer).

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T003 Add tests to `frontend/src/utils/validation.test.js` for: `classifyLines` returning `type: 'mixed'` with `segments` array for a line with quotes and notation, `classifyLines` returning `type: 'lyrics'` for a line with only quoted text and no notation, `classifyLines` preserving existing behavior for pure note lines and pure lyrics lines (regression), `parseNotes` excluding tokens inside quoted segments, `countNotes` excluding quoted lyrics from count, `estimateDuration` reflecting updated count
- [x] T004 Update `classifyLines()` in `frontend/src/utils/validation.js` to use `parseLineSegments` — classify lines with quotes as `'mixed'` (if notation segments contain valid notes per `isNoteLine`) or `'lyrics'` (if no notation tokens outside quotes); attach `segments` array to mixed lines
- [x] T005 Update `parseNotes()` in `frontend/src/utils/validation.js` to skip quoted segments — for note lines use existing logic, for mixed lines extract tokens only from notation segments, for lyrics lines skip entirely
- [x] T006 Update `getInvalidSyllables()` in `frontend/src/utils/validation.js` to skip quoted segments — same approach as `parseNotes`

**Checkpoint**: Foundation ready — `classifyLines`, `parseNotes`, `countNotes` all handle mixed lines correctly. User story implementation can now begin.

---

## Phase 3: User Story 1 — Musician Writes Inline Lyrics with Notations (Priority: P1) 🎯 MVP

**Goal**: A musician types `sol sol la sol DO si "Parabéns pra você"` in the composer and sees notation tokens in green/bold, lyrics in orange/italic, on the same line — with quote characters hidden. Transposition changes only notation tokens. Note count excludes lyrics.

**Independent Test**: Open compose page, type a mixed line, verify color-coded rendering, transpose, save, reload.

### Tests for User Story 1

- [x] T007 [P] [US1] Add tests to `frontend/src/utils/transposer.test.js` for: `transposeNotes` on a mixed line preserves quoted segments verbatim, `transposeNotes` transposes only notation segments, `convertAccidentals` preserves quoted segments, `isNoteLine` returns false for a line that is entirely quoted lyrics
- [x] T008 [P] [US1] Add tests to `frontend/src/components/MelodyComposer.test.js` for: rendering a mixed line produces separate spans for notation (class `highlight-notes`) and lyrics (class `highlight-lyrics`) segments, rendering pure note/lyrics lines is unchanged (regression), hidden notes inside notation segments of a mixed line still render with hidden class
- [x] T009 [P] [US1] Add tests to `backend/tests/test_strip_quoted_segments.py` for: `strip_quoted_segments` removes quoted text and quotes, preserves unquoted text, handles no-quotes input, handles only-quotes input, handles unmatched trailing quote
- [x] T010 [P] [US1] Add tests to `backend/tests/test_melody_model.py` (or existing test file) for: `Melody.save()` sets correct `note_count` when notation contains quoted lyrics, `note_count` is zero when notation is only quoted lyrics (this should fail validation in `clean()`)

### Implementation for User Story 1

- [x] T011 [P] [US1] Update `transposeNotes()` in `frontend/src/utils/transposer.js` — for lines containing double quotes, split into segments via `parseLineSegments`, transpose only notation segments, reassemble with original quote delimiters preserved in the raw text
- [x] T012 [P] [US1] Update `convertAccidentals()` in `frontend/src/utils/transposer.js` — same quote-aware approach as `transposeNotes`
- [x] T013 [P] [US1] Add `strip_quoted_segments()` to `backend/melodies/utils.py` — regex or scan that removes `"..."` segments and the quotes, returning only non-quoted text
- [x] T014 [US1] Update `Melody.save()` in `backend/melodies/models.py` — call `strip_quoted_segments(self.notation)` before splitting and counting syllables
- [x] T015 [US1] Update `renderHighlightedContent()` in `frontend/src/components/MelodyComposer.js` — for `type: 'mixed'` lines, render each segment with its own `<span>`: notation segments get class `highlight-notes`, lyrics segments get class `highlight-lyrics`; apply `renderLineWithHiddenNotes` only to notation segments
- [x] T016 [US1] Add CSS class `highlight-inline-lyrics` (or reuse `highlight-lyrics`) in `frontend/src/components/MelodyComposer.css` if a distinct inline-lyrics style is needed (verify orange/italic matches existing lyrics style)

**Checkpoint**: User Story 1 fully functional — mixed lines render correctly in the composer, transposition preserves lyrics, note count excludes lyrics, backend counts are correct.

---

## Phase 4: User Story 2 — Multi-line Quoted Lyrics (Priority: P2)

**Goal**: A musician opens a quote on one line and closes it on a later line. All content between the quotes is treated and displayed as lyrics.

**Independent Test**: Type `"` on one line, lyrics on next lines, close with `"` — verify all intermediate lines are lyrics-styled.

### Tests for User Story 2

- [x] T017 [P] [US2] Add tests to `frontend/src/utils/validation.test.js` for multi-line quote state: `classifyLines` with an unclosed quote on line 1 classifies subsequent lines as `'lyrics'` until closing quote found, closing quote mid-line resumes notation classification for remaining content, unclosed quote at end of input treats all remaining content as lyrics

### Implementation for User Story 2

- [x] T018 [US2] Update `classifyLines()` in `frontend/src/utils/validation.js` — add `inQuote` state tracking across lines: when a line has an odd number of unescaped quotes (opening without closing), set `inQuote = true`; subsequent lines are classified as `'lyrics'` until a line with a closing quote is found; the closing line resumes normal classification for content after the closing quote
- [x] T019 [US2] Update `parseNotes()` and `getInvalidSyllables()` in `frontend/src/utils/validation.js` to respect multi-line quote state — lines inside an open multi-line quote are skipped entirely

**Checkpoint**: User Story 2 functional — multi-line quoted lyrics render correctly, classification state propagates across lines.

---

## Phase 5: User Story 3 — Inline Lyrics Display in Shared/Read-Only View (Priority: P2)

**Goal**: Shared melody views display inline lyrics with the same color coding as the composer — notation in green, lyrics in orange, on the same line.

**Independent Test**: Create a melody with inline lyrics, share it, open the shared link — verify same rendering.

### Tests for User Story 3

- [x] T020 [P] [US3] Add tests to `frontend/src/services/pdfExportService.test.js` for: `renderNotationPage` applies correct colors per segment type for mixed lines (notation segments get notes color, lyrics segments get lyrics color)

### Implementation for User Story 3

- [x] T021 [P] [US3] Update the notation display loop in `frontend/src/pages/SharedMelodyPage.js` — for `line.type === 'mixed'`, iterate `line.segments` and render each with appropriate color (`#2e7d32` for notation, `#e65100` for lyrics`) and font weight; apply `renderLineForView` (hidden notes) only to notation segments
- [x] T022 [P] [US3] Update `renderNotationPage()` in `frontend/src/services/pdfExportService.js` — for mixed lines, iterate segments and set text color per segment type using the existing `COLOR_MAP` (notation segments use `COLOR_MAP.notes`, lyrics segments use `COLOR_MAP.lyrics`)

**Checkpoint**: All three user stories functional — inline lyrics work in composer, across multi-line spans, and in shared/PDF views.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Edge cases, backward compatibility verification, and cleanup.

- [x] T023 [P] Verify all edge cases from spec.md: line with only quoted text and no notations classified as lyrics, empty quoted segment (`""`) ignored, nested quotes not supported (first close terminates), single unmatched quote at EOL, hidden notes (`*text*`) inside quotes treated as literal text, instrument tab transposition preserves quoted lyrics
- [x] T024 [P] Run full frontend test suite (`cd frontend && npm test -- --watchAll=false`) and verify zero regressions — all existing tests must pass unchanged
- [x] T025 [P] Run full backend test suite (`cd backend && pytest -v`) and verify zero regressions
- [ ] T026 Run quickstart.md manual validation (requires running servers) — start both servers, type mixed lines in composer, verify rendering, transpose, save, open shared link, verify PDF export

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 (T001-T002) — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Phase 2 — core MVP
- **US2 (Phase 4)**: Depends on Phase 2 — can run in parallel with US1 (separate logic in `classifyLines`)
- **US3 (Phase 5)**: Depends on Phase 2 — can run in parallel with US1/US2 (different files: SharedMelodyPage, pdfExportService)
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (P1)**: Can start after Phase 2 — no dependencies on other stories
- **US2 (P2)**: Can start after Phase 2 — extends `classifyLines` with multi-line state; independent of US1 rendering changes
- **US3 (P2)**: Can start after Phase 2 — different files from US1 (SharedMelodyPage.js, pdfExportService.js); independent of US1/US2

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Utility functions before consumers (transposer before composer rendering)
- Backend changes independent of frontend — can be parallelized
- Story complete before moving to next priority

### Parallel Opportunities

- T001 can run immediately; T002 follows
- T003 starts after T002; T004-T006 follow sequentially (same file)
- After Phase 2: T007, T008, T009, T010 all run in parallel (different files)
- T011, T012, T013 all run in parallel (different files)
- T017 can run in parallel with US1 tasks
- T020, T021, T022 can run in parallel with US1/US2 tasks (different files)
- T023, T024, T025 all run in parallel

---

## Parallel Example: User Story 1

```text
# Launch all US1 tests in parallel (different files):
T007: transposer tests in frontend/src/utils/transposer.test.js
T008: composer tests in frontend/src/components/MelodyComposer.test.js
T009: backend strip_quoted_segments tests in backend/tests/test_strip_quoted_segments.py
T010: backend melody model tests in backend/tests/test_melody_model.py

# Launch independent US1 implementations in parallel (different files):
T011: transposer update in frontend/src/utils/transposer.js
T012: convertAccidentals update in frontend/src/utils/transposer.js (SEQUENTIAL with T011 — same file)
T013: backend strip_quoted_segments in backend/melodies/utils.py
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T002) — line tokenizer
2. Complete Phase 2: Foundational (T003-T006) — classifyLines, parseNotes
3. Complete Phase 3: User Story 1 (T007-T016) — composer rendering, transposition, backend counts
4. **STOP and VALIDATE**: Test US1 independently — type mixed lines, verify colors, transpose, check note count
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → tokenizer and classification ready
2. Add US1 → Composer inline lyrics work → Deploy/Demo (MVP!)
3. Add US2 → Multi-line quotes work → Deploy/Demo
4. Add US3 → Shared view and PDF work → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Complete Setup + Foundational together
2. Once Foundational is done:
   - Developer A: US1 (composer, transposer, backend)
   - Developer B: US2 (multi-line classification) + US3 (shared view, PDF)
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- The existing `hiddenNotes.js` is NOT modified — hidden markers inside quotes are treated as literal text by the tokenizer
