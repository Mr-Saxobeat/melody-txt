# Tasks: Internationalization (i18n)

**Input**: Design documents from `specs/006-i18n-pt-br/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md

**Organization**: Tasks grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2)
- Include exact file paths in descriptions

## Path Conventions

Frontend-only feature: `frontend/src/`

---

## Phase 1: Setup

**Purpose**: Create the i18n infrastructure (hook + locale file)

- [x] T001 Create the pt-BR locale JSON file at frontend/src/i18n/locales/pt-BR.json with all translatable strings organized by section (nav, home, compose, auth, shared, melodies, setlists, instruments, transpose, errors, common). Include every hardcoded English string from all pages and components.
- [x] T002 Create the useTranslation hook at frontend/src/i18n/useTranslation.js — import pt-BR.json, return a `t(key, params?)` function that looks up dot-notation keys, supports `{variable}` interpolation, and falls back to the key name if missing.

---

## Phase 2: Foundational

**Purpose**: No foundational blocking tasks — setup provides everything needed.

(No tasks — Phase 1 directly enables user story work)

---

## Phase 3: User Story 1 — View Interface in Brazilian Portuguese (Priority: P1) MVP

**Goal**: Replace all hardcoded English strings in components and pages with `t()` calls.

**Independent Test**: Visit each page and verify all static text displays in Portuguese.

### Implementation for User Story 1

- [x] T003 [P] [US1] Translate Header component in frontend/src/components/Header.js — import useTranslation, replace "Setlists", "Compose", "My Melodies", "My Setlists", "Logout", "Login" with t() calls
- [x] T004 [P] [US1] Translate ComposerPage in frontend/src/pages/ComposerPage.js — import useTranslation, replace "Compose Your Melody", all instruction list items, "Enter your melody", "Save Melody", "Save (Login Required)", "Save Melody" dialog title, "Title" label, placeholder, "Saving...", "Save", "Cancel", "Melody saved successfully!", "Reset", error messages with t() calls
- [x] T005 [P] [US1] Translate AuthPage in frontend/src/pages/AuthPage.js — import useTranslation, replace "Login", "Register", form labels (Username, Email, Password, Confirm Password), button text, error messages with t() calls
- [x] T006 [P] [US1] Translate HomePage in frontend/src/pages/HomePage.js — import useTranslation, replace heading, subtitle, "Start Composing" button, "Recent Melodies", "by {name}" with t() calls
- [x] T007 [P] [US1] Translate MyMelodiesPage in frontend/src/pages/MyMelodiesPage.js — import useTranslation, replace "My Melodies", empty state text, "Share", "Edit", "Delete", "Confirm?", "Copied!" with t() calls
- [x] T008 [P] [US1] Translate SharedMelodyPage in frontend/src/pages/SharedMelodyPage.js — import useTranslation, replace "Loading shared melody...", "Melody Not Found", error messages, "Edit Melody", "Reset" with t() calls
- [x] T009 [P] [US1] Translate SetlistsPage in frontend/src/pages/SetlistsPage.js — import useTranslation, replace headings, empty state, button labels with t() calls
- [x] T010 [P] [US1] Translate SetlistDetailPage in frontend/src/pages/SetlistDetailPage.js — import useTranslation, replace button labels, headings, empty state text with t() calls
- [x] T011 [P] [US1] Translate InstrumentSelectModal in frontend/src/components/InstrumentSelectModal.js — import useTranslation, replace "Select Your Instrument", "Choose the instrument you'll compose in" with t() calls
- [x] T012 [P] [US1] Translate InstrumentTabs in frontend/src/components/InstrumentTabs.js — import useTranslation, replace "Select Instrument", "Cancel" in the instrument modal with t() calls
- [x] T013 [P] [US1] Translate TransposeControls in frontend/src/components/TransposeControls.js — import useTranslation, replace "half step", "whole step", "octave" labels with t() calls
- [x] T014 [P] [US1] Translate MelodyComposer in frontend/src/components/MelodyComposer.js — import useTranslation, replace the placeholder text with t() call
- [x] T015 [P] [US1] Translate FlatToggle in frontend/src/components/FlatToggle.js — import useTranslation, replace any label text with t() call

**Checkpoint**: User Story 1 complete — all UI text displays in Portuguese

---

## Phase 4: User Story 2 — Language Switcher Infrastructure (Priority: P2)

**Goal**: Verify the architecture supports adding new languages by file only.

**Independent Test**: Confirm all strings are externalized — grep for remaining hardcoded English in component files.

### Implementation for User Story 2

- [x] T016 [US2] Audit all component and page files for remaining hardcoded English strings — run grep to find any untranslated text. Fix any found by adding keys to pt-BR.json and replacing with t() calls. Files: frontend/src/components/*.js, frontend/src/pages/*.js
- [x] T017 [US2] Verify useTranslation hook supports future locale switching — ensure the hook reads from a configurable locale constant in frontend/src/i18n/useTranslation.js and document how to add a new language (create new JSON file, change the import)

**Checkpoint**: All strings externalized, architecture ready for future languages

---

## Phase 5: Polish & Cross-Cutting Concerns

- [x] T018 Run all frontend tests: cd frontend && npx react-app-rewired test --watchAll=false
- [x] T019 Verify frontend compiles and dev server starts without errors

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — create i18n files first
- **User Story 1 (Phase 3)**: Depends on Phase 1 (needs hook + locale file)
- **User Story 2 (Phase 4)**: Depends on Phase 3 (audit after all translations done)
- **Polish (Phase 5)**: Depends on all phases

### User Story Dependencies

- **US1**: Depends on Phase 1 only. All T003-T015 can run in parallel (different files).
- **US2**: Depends on US1 completion.

### Parallel Opportunities

- **T003-T015 (13 tasks!)** can ALL run in parallel — each modifies a different file
- This is the most parallelizable feature so far

---

## Parallel Example: User Story 1

```text
# All of these can run simultaneously (different files):
Task T003: "Translate Header.js"
Task T004: "Translate ComposerPage.js"
Task T005: "Translate AuthPage.js"
Task T006: "Translate HomePage.js"
Task T007: "Translate MyMelodiesPage.js"
Task T008: "Translate SharedMelodyPage.js"
Task T009: "Translate SetlistsPage.js"
Task T010: "Translate SetlistDetailPage.js"
Task T011: "Translate InstrumentSelectModal.js"
Task T012: "Translate InstrumentTabs.js"
Task T013: "Translate TransposeControls.js"
Task T014: "Translate MelodyComposer.js"
Task T015: "Translate FlatToggle.js"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Create hook + locale file (T001-T002)
2. Complete Phase 3: Translate all 13 component/page files (T003-T015) — parallel
3. **STOP and VALIDATE**: Visit every page, verify Portuguese text
4. Deploy if ready

### Incremental Delivery

1. Phase 1 → i18n infrastructure ready
2. Phase 3 → All UI in Portuguese (MVP!)
3. Phase 4 → Audit + architecture verification
4. Phase 5 → Test + build verification

---

## Task Count Summary

- **Phase 1 (Setup)**: 2 tasks
- **Phase 3 (US1 Translate All)**: 13 tasks (all parallel!)
- **Phase 4 (US2 Audit)**: 2 tasks
- **Phase 5 (Polish)**: 2 tasks

**Total**: 19 tasks
**Parallel Opportunities**: 13 tasks marked [P]
**Suggested MVP Scope**: Phase 1 + Phase 3 (T001-T015) = 15 tasks
