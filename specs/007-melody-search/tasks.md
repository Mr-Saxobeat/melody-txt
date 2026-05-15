# Tasks: Melody Search

**Input**: Design documents from `specs/007-melody-search/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Included per constitution (Test-First Development mandate).

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create shared utilities and configuration needed by all user stories

- [x] T001 [P] Create `useDebounce` custom hook in `frontend/src/hooks/useDebounce.js` — accepts a value and delay (default 300ms), returns debounced value using `useState` and `useEffect` with cleanup
- [x] T002 [P] Add search-related i18n translation keys to `frontend/src/i18n/locales/pt-BR.json` — add keys: `search.placeholder` ("Buscar melodias..."), `search.noResults` ("Nenhuma melodia encontrada para \"{term}\"."), `search.loading` ("Buscando...")
- [x] T003 [P] Add `searchMelodies` and `getRecentMelodiesPaginated` methods to `frontend/src/services/melodyService.js` — `getRecentMelodiesPaginated(cursor, search)` calls `GET /melodies/recent/` with `cursor` and `search` params; `searchMelodies(search, cursor)` calls `GET /melodies/search/` with `search` and `cursor` params; both return the full response (with `next`, `previous`, `results`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Backend API changes that MUST be complete before any frontend user story can be implemented

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Write integration tests for paginated `RecentMelodiesView` with search in `backend/tests/integration/test_api_melodies.py` — test: (1) GET `/api/melodies/recent/` returns cursor-paginated results (has `next`, `previous`, `results` fields), (2) `?search=term` filters by title case-insensitively, (3) partial substring matching works, (4) empty search returns all public melodies, (5) whitespace-only search returns all public melodies, (6) pagination cursor returns next page, (7) only `is_public=True` melodies are returned. Create test melodies with known titles for assertions.
- [x] T005 Write integration tests for new `MelodySearchView` in `backend/tests/integration/test_melody_search.py` — test: (1) requires authentication (401 without token), (2) returns user's own melodies + public melodies, (3) `?search=term` filters by title, (4) de-duplicates melodies the user owns that are also public, (5) empty search returns all accessible melodies, (6) results are cursor-paginated and ordered by `-created_at`
- [x] T006 Modify `RecentMelodiesView` in `backend/api/views.py` — remove `[:50]` queryset slice, add custom `CursorPagination` subclass with `page_size=20` and `ordering='-created_at'`, add `search` query parameter support that filters `title__icontains` when provided (strip whitespace, skip if blank), set the pagination class on the view
- [x] T007 Create `MelodySearchView` in `backend/api/views.py` — new `ListAPIView` with `IsAuthenticated` permission, uses `SharedMelodySerializer`, queryset filters `Q(user=request.user) | Q(is_public=True)` with `.distinct()`, supports `search` query param for `title__icontains`, uses same cursor pagination class as `RecentMelodiesView`, ordered by `-created_at`
- [x] T008 Register the new search endpoint in `backend/api/urls.py` — add `path('melodies/search/', MelodySearchView.as_view(), name='melody-search')` before the router include (so it takes precedence over the router's `/melodies/` routes)

**Checkpoint**: Run `python manage.py test backend/tests/integration/test_api_melodies.py backend/tests/integration/test_melody_search.py` — all tests should pass

---

## Phase 3: User Story 1 — Search Melodies on Home Page (Priority: P1) MVP

**Goal**: Convert the home page from a static list to an infinite-scroll paginated view with a search input that queries the server.

**Independent Test**: Navigate to home page, verify infinite scroll loads more melodies, type a search term and verify filtered results appear from server, clear search and verify default listing returns.

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T009 [US1] Write component tests for `HomePage` search and infinite scroll in `frontend/src/pages/HomePage.test.js` — test: (1) renders a search input field above the melody grid, (2) typing in search input triggers API call after debounce, (3) displays search results from API, (4) shows empty state message with search term when no results, (5) clearing search restores default listing, (6) infinite scroll: renders a sentinel element, (7) mock `IntersectionObserver` to verify next page is fetched when sentinel is visible, (8) does not fetch next page when `next` cursor is null

### Implementation for User Story 1

- [x] T010 [US1] Rewrite `HomePage` in `frontend/src/pages/HomePage.js` to use paginated API with infinite scroll — replace `useEffect` fetch with state for `melodies` (array), `nextCursor` (string|null), `loading`, `loadingMore`, `searchTerm`; on mount and when debounced search term changes, call `melodyService.getRecentMelodiesPaginated(null, debouncedSearch)` and reset the list; use `IntersectionObserver` on a sentinel `<div>` at the bottom of the melody grid to trigger loading the next page via `getRecentMelodiesPaginated(nextCursor, debouncedSearch)` and append results; show loading spinner during initial load and a smaller indicator during page loads
- [x] T011 [US1] Add search input UI to `HomePage` in `frontend/src/pages/HomePage.js` — add a text input between the page header and the melody grid with `placeholder={t('search.placeholder')}`, controlled by `searchTerm` state; use `useDebounce(searchTerm, 300)` to get debounced value; when debounced value changes, reset `melodies` to `[]`, set `nextCursor` to `null`, and trigger a fresh API call; show `t('search.noResults', { term: searchTerm })` when results are empty and a search term is active

**Checkpoint**: Home page shows paginated melodies with infinite scroll and functional search. Run `npm test -- --testPathPattern=HomePage` — all tests should pass.

---

## Phase 4: User Story 2 — Search Melodies in Add-to-Setlist Modal (Priority: P1)

**Goal**: Add a search input to the add-melody-to-setlist modal that queries the server to find melodies.

**Independent Test**: Open a setlist detail page, click "Add Melody", verify the modal has a search input, type a search term and verify filtered results appear from server, click a result and verify it's added to the setlist.

### Tests for User Story 2

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T012 [US2] Write component tests for setlist add-melody modal search in `frontend/src/pages/SetlistDetailPage.test.js` — test: (1) "Add Melody" button opens modal with a search input, (2) typing in modal search triggers `melodyService.searchMelodies` after debounce, (3) displays search results in the modal, (4) clicking a melody calls `handleAddMelody`, (5) shows empty state when no results match, (6) clearing search shows all melodies

### Implementation for User Story 2

- [x] T013 [US2] Rewrite `loadMelodies` and modal in `SetlistDetailPage` in `frontend/src/pages/SetlistDetailPage.js` — replace `loadMelodies` with server-side search: when modal opens, call `melodyService.searchMelodies('')` to get initial list; add `modalSearchTerm` state and `useDebounce(modalSearchTerm, 300)`; when debounced value changes, call `melodyService.searchMelodies(debouncedModalSearch)` and update the modal melody list; add a text input at the top of the modal with `placeholder={t('search.placeholder')}`; show `t('search.noResults', { term: modalSearchTerm })` when empty; keep existing `handleAddMelody` click behavior unchanged

**Checkpoint**: Setlist modal shows server-searched melodies with filtering. Manual test: open setlist, add melody via search.

---

## Phase 5: User Story 3 — Instant Feedback While Typing (Priority: P2)

**Goal**: Ensure both search inputs provide visual feedback during the debounce delay and while results are loading.

**Independent Test**: Type in either search input and observe a loading indicator appears during the API call, results update smoothly without flicker.

### Implementation for User Story 3

- [x] T014 [US3] Add loading states to `HomePage` search in `frontend/src/pages/HomePage.js` — when debounced search triggers a new API call, set a `searching` state to `true` and show a loading indicator (e.g., "Buscando..." text or spinner) in the melody grid area; set `searching` to `false` when results arrive; ensure no layout flicker between clearing old results and showing new ones (keep old results visible until new results arrive, or show the loading indicator)
- [x] T015 [US3] Add loading states to `SetlistDetailPage` modal search in `frontend/src/pages/SetlistDetailPage.js` — when debounced modal search triggers a new API call, show `t('search.loading')` or a spinner in the modal list area; set loading to `false` when results arrive

**Checkpoint**: Both search locations show responsive loading feedback. No flicker or blank states during search transitions.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T016 [P] Add database index on `(is_public, -created_at)` for `Melody` model — create a new migration in `backend/melodies/migrations/` by adding `models.Index(fields=['is_public', '-created_at'])` to the `Melody.Meta.indexes` list in `backend/melodies/models.py`, then run `python manage.py makemigrations`
- [x] T017 [P] Verify edge cases work across both search locations — test: accented characters (ã, ç, é) match correctly with `icontains`, whitespace-only input is treated as empty search, searching while still loading a previous page doesn't cause race conditions (latest request wins)
- [x] T018 Run `quickstart.md` validation — follow all 5 verification steps in `specs/007-melody-search/quickstart.md` against a running dev environment

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: No dependency on Phase 1 (backend work). BLOCKS all frontend user stories (Phase 3, 4, 5)
- **User Story 1 (Phase 3)**: Depends on Phase 1 (useDebounce, i18n, service methods) + Phase 2 (backend API)
- **User Story 2 (Phase 4)**: Depends on Phase 1 (useDebounce, i18n, service methods) + Phase 2 (backend API). Independent of US1.
- **User Story 3 (Phase 5)**: Depends on Phase 3 and Phase 4 (adds loading states to existing search implementations)
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Phase 1 + Phase 2 — no dependencies on other stories
- **User Story 2 (P1)**: Can start after Phase 1 + Phase 2 — no dependencies on other stories. **Can run in parallel with US1.**
- **User Story 3 (P2)**: Depends on US1 and US2 being complete (adds to their implementations)

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Implementation follows test specifications
- Story complete before moving to next priority

### Parallel Opportunities

- Phase 1: All 3 tasks (T001, T002, T003) can run in parallel
- Phase 2: T004 and T005 (tests) can run in parallel; T006, T007, T008 (implementation) can run after tests fail
- Phase 3 and Phase 4 can run in parallel after Phase 1 + Phase 2
- Phase 6: T016 and T017 can run in parallel

---

## Parallel Example: User Story 1 + User Story 2

```bash
# After Phase 1 + Phase 2 are complete, launch both stories in parallel:

# Developer A: User Story 1
Task: "T009 Write component tests for HomePage search and infinite scroll"
Task: "T010 Rewrite HomePage to use paginated API with infinite scroll"
Task: "T011 Add search input UI to HomePage"

# Developer B: User Story 2 (simultaneously)
Task: "T012 Write component tests for setlist add-melody modal search"
Task: "T013 Rewrite loadMelodies and modal in SetlistDetailPage"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 2: Foundational backend (T004-T008)
3. Complete Phase 3: User Story 1 — Home page search + infinite scroll (T009-T011)
4. **STOP and VALIDATE**: Home page works with pagination and search
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Backend API ready
2. Add User Story 1 → Home page search + infinite scroll → Deploy (MVP!)
3. Add User Story 2 → Modal search → Deploy
4. Add User Story 3 → Loading states polish → Deploy
5. Polish → Index + edge cases → Deploy

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- US1 and US2 are both P1 priority but can be implemented in parallel
- US3 is a polish story that enhances US1 and US2
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
