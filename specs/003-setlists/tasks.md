# Tasks: Setlists

**Input**: Design documents from `specs/003-setlists/`
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

## Phase 1: Setup (New Django App)

**Purpose**: Create the setlists Django app and database models

- [x] T001 Create setlists Django app directory: backend/setlists/ with __init__.py, apps.py, models.py, admin.py
- [x] T002 Add 'setlists' to INSTALLED_APPS in backend/config/settings.py
- [x] T003 Create Setlist and SetlistEntry models in backend/setlists/models.py: Setlist (id:UUID, user:FK, title:str, share_id:str, is_public:bool, created_at, updated_at), SetlistEntry (id:UUID, setlist:FK, melody:FK CASCADE, position:int, added_at)
- [x] T004 Create migration for setlists app: python manage.py makemigrations setlists
- [x] T005 Register Setlist and SetlistEntry in backend/setlists/admin.py

---

## Phase 2: User Story 1 - Create and Manage Setlists (Priority: P1)

**Goal**: Full CRUD for setlists with melody ordering

**Independent Test**: Create setlist "Sunday Gig", add 3 melodies in order, verify order persists

- [x] T006 [P] [US1] Create SetlistSerializer and SetlistEntrySerializer in backend/api/serializers.py: include nested entries with position, validate max 50 setlists per user and max 100 entries per setlist
- [x] T007 [P] [US1] Create SetlistViewSet in backend/api/views.py: list, create, retrieve, update, destroy with JWT auth and ownership checks
- [x] T008 [US1] Create SetlistEntryView in backend/api/views.py: POST to add melody, PUT to update position, DELETE to remove entry
- [x] T009 [US1] Add setlist URL routes in backend/api/urls.py: router for SetlistViewSet, nested routes for entries, shared setlist endpoint
- [x] T010 [P] [US1] Create setlistService in frontend/src/services/setlistService.js: createSetlist, getSetlists, getSetlist, updateSetlist, deleteSetlist, addEntry, updateEntry, removeEntry
- [x] T011 [US1] Create SetlistsPage in frontend/src/pages/SetlistsPage.js: list all user setlists with title, melody count, created date, create/delete actions
- [x] T012 [US1] Create SetlistDetailPage in frontend/src/pages/SetlistDetailPage.js: show setlist with ordered melodies, add melody picker, reorder (move up/down buttons), remove entry
- [x] T013 [US1] Add routing in frontend/src/App.js: /setlists for SetlistsPage, /setlists/:id for SetlistDetailPage (protected routes)
- [x] T014 [US1] Update Header in frontend/src/components/Header.js: add "Setlists" nav link (visible when authenticated)
- [ ] T015 [P] [US1] Add backend tests in backend/tests/integration/test_api_setlists.py: test CRUD, ordering, max limits, ownership checks
- [ ] T016 [P] [US1] Add backend unit tests in backend/tests/unit/test_setlists.py: test model validation, share_id generation, cascade delete

**Checkpoint**: User can create setlists, add/remove/reorder melodies, and see them persisted

---

## Phase 3: User Story 2 - View and Play Setlist (Priority: P2)

**Goal**: Inline playback of melodies from the setlist view

**Independent Test**: Open setlist, see melodies in order, click play on one and hear it

- [x] T017 [US2] Add MelodyPlayer to each entry in SetlistDetailPage in frontend/src/pages/SetlistDetailPage.js: play button per melody row
- [x] T018 [US2] Add melody title link in SetlistDetailPage: clicking title navigates to /?edit={melody.id}

**Checkpoint**: User can play any melody inline from the setlist and navigate to edit

---

## Phase 4: User Story 3 - Share Setlist (Priority: P3)

**Goal**: Share setlist via public link for read-only access

**Independent Test**: Share setlist, open link in incognito, see melodies and play them

- [x] T019 [US3] Create SharedSetlistView in backend/api/views.py: GET /api/setlists/shared/{share_id}/ — returns setlist with entries and melody details, no auth required, filters is_public=True
- [x] T020 [US3] Add share route in backend/api/urls.py: /api/setlists/shared/{share_id}/
- [x] T021 [US3] Create SharedSetlistPage in frontend/src/pages/SharedSetlistPage.js: display setlist title, author, ordered melodies with play buttons (no edit controls)
- [x] T022 [US3] Add routing for /shared-setlist/:shareId in frontend/src/App.js
- [x] T023 [US3] Add share button to SetlistDetailPage: copies share link to clipboard, shows "Link copied!" feedback
- [ ] T024 [P] [US3] Add backend integration test for shared setlist endpoint in backend/tests/integration/test_api_setlists.py: test public access, private rejection

**Checkpoint**: Non-authenticated users can view and play shared setlists

---

## Phase 5: Polish & Integration

**Purpose**: Final verification and cleanup

- [x] T025 Run full backend test suite and verify all tests pass
- [x] T026 Run full frontend test suite and verify all tests pass
- [x] T027 Verify frontend compiles without errors

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — create app and models
- **Phase 2 (US1)**: Depends on Phase 1 (needs models)
- **Phase 3 (US2)**: Depends on Phase 2 (needs setlist detail page)
- **Phase 4 (US3)**: Depends on Phase 2 (needs setlist model + API)
- **Phase 5 (Polish)**: Depends on all other phases

### Parallel Opportunities

**Phase 2**: T006, T010, T015, T016 are parallel (different files)
**Between US2 and US3**: Can be developed in parallel after Phase 2

---

## Implementation Strategy

### MVP (User Story 1 Only)

1. Complete Phase 1 (T001-T005) — ~1 hour
2. Complete Phase 2 (T006-T016) — ~4 hours
3. **VALIDATE**: Can user create setlist, add melodies, reorder?

### Full Feature

4. Phase 3 (T017-T018) — ~1 hour
5. Phase 4 (T019-T024) — ~2 hours
6. Phase 5 (T025-T027) — ~30 min

**Total**: ~8.5 hours (27 tasks)

---

## Task Count Summary

- **Phase 1 (Setup)**: 5 tasks
- **Phase 2 (US1 Create & Manage)**: 11 tasks
- **Phase 3 (US2 View & Play)**: 2 tasks
- **Phase 4 (US3 Share)**: 6 tasks
- **Phase 5 (Polish)**: 3 tasks

**Total**: 27 tasks
**Parallel Opportunities**: ~8 tasks marked [P]
**Suggested MVP Scope**: Phases 1-2 (T001-T016) = 16 tasks
