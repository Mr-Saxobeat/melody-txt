# Tasks: Solfege Melody Composer

**Input**: Design documents from `specs/001-solfege-melody-composer/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api-endpoints.md

**Organization**: Tasks grouped by user story to enable independent implementation and testing

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

This is a **web application** with:
- Backend: `backend/` (Django REST Framework)
- Frontend: `frontend/` (React SPA)
- Docker: `docker/` (Docker Compose configuration)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure per plan.md

- [x] T001 Create backend directory structure: backend/{config,api,melodies,users,tests}
- [x] T002 Create frontend directory structure: frontend/{public,src/{components,pages,services,utils,hooks}}
- [x] T003 Create Docker configuration directory: docker/ with docker-compose.yml
- [x] T004 [P] Initialize Django project in backend/ with requirements.txt (Django 5.0, DRF 3.14, simplejwt 5.3, cors-headers 4.3, drf-spectacular 0.27, psycopg2-binary 2.9, pytest 7.4, pytest-django 4.8, pytest-cov 4.1)
- [x] T005 [P] Initialize React project in frontend/ with package.json (react 18, tone 14, axios 1.6, jest 29, @testing-library/react 14, msw 2.1)
- [x] T006 [P] Create backend/pytest.ini with Django settings module and test configuration
- [x] T007 [P] Create frontend/jest.config.js with React Testing Library configuration
- [x] T008 [P] Create .gitignore for Python (venv, __pycache__, .pytest_cache, *.pyc, db.sqlite3) and Node.js (node_modules, build, .env.local)
- [x] T009 [P] Create docker/docker-compose.yml with services: db (postgres:15-alpine), backend (python:3.11), frontend (node:20)
- [x] T010 [P] Create backend/Dockerfile with Python 3.11 base, requirements installation, development server command
- [x] T011 [P] Create frontend/Dockerfile with Node 20 base, npm install, development server command

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure required before ANY user story implementation

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T012 Create PostgreSQL database schema: backend/config/settings.py with DATABASE_URL configuration
- [x] T013 Create custom User model extending AbstractBaseUser in backend/users/models.py (id:UUID, username:str, email:str, password:str, created_at:datetime, is_active:bool)
- [x] T014 Create initial Django migration for User model: python manage.py makemigrations users
- [x] T015 Register User model in backend/users/admin.py for Django admin interface
- [x] T016 Configure JWT authentication in backend/config/settings.py: REST_FRAMEWORK settings with JWTAuthentication, SIMPLE_JWT settings (15min access, 7day refresh)
- [x] T017 [P] Configure CORS in backend/config/settings.py: CORS_ALLOWED_ORIGINS for http://localhost:3000, CORS_ALLOW_CREDENTIALS=True
- [x] T018 [P] Configure drf-spectacular in backend/config/settings.py: SPECTACULAR_SETTINGS with API title, version, description
- [x] T019 Create authentication endpoints in backend/api/views.py: RegisterView (POST), TokenObtainPairView (POST), TokenRefreshView (POST)
- [x] T020 Create user registration serializer in backend/api/serializers.py: UserRegistrationSerializer with validation (username 3-150 chars, email RFC5322, password 8+ chars with uppercase/lowercase/number)
- [x] T021 Create authentication URL routes in backend/config/urls.py: /api/auth/register/, /api/auth/token/, /api/auth/token/refresh/
- [x] T022 [P] Create frontend Axios API client in frontend/src/services/api.js with baseURL http://localhost:8000, JWT interceptors for Authorization header
- [x] T023 [P] Create frontend authentication service in frontend/src/services/authService.js: register(username, email, password), login(username, password), refreshToken(refreshToken), logout()
- [x] T024 [P] Create frontend useAuth hook in frontend/src/hooks/useAuth.js: manages user state, token storage (localStorage), auto-refresh logic
- [x] T025 [P] Create backend test fixtures in backend/tests/fixtures/melody_fixtures.py: user_factory, melody_factory using pytest fixtures
- [x] T026 Run initial migrations: docker-compose exec backend python manage.py migrate
- [x] T027 Create Django superuser for testing: docker-compose exec backend python manage.py createsuperuser

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Compose Melody with Solfege Notation (Priority: P1) 🎯 MVP

**Goal**: Enable users to compose melodies using solfege notation and play them back using Web Audio API synthesis

**Independent Test**: Enter "do mi sol mi do" in composer interface, click Play button, hear melody with correct pitches

### Tests for User Story 1

> **NOTE: Write these tests FIRST (TDD), ensure they FAIL before implementation**

- [x] T028 [P] [US1] Unit test for solfege validation in backend/tests/unit/test_utils.py: test_is_valid_solfege_notation (valid: "do re mi", invalid: "da de di", case-insensitive, whitespace trimming)
- [x] T029 [P] [US1] Unit test for solfege parsing in backend/tests/unit/test_utils.py: test_parse_solfege_notation (splits by spaces/commas, normalizes to lowercase, rejects empty)
- [x] T030 [P] [US1] Unit test for Melody model in backend/tests/unit/test_models.py: test_melody_note_count_calculation, test_melody_duration_calculation (note_count * 0.5)
- [x] T031 [P] [US1] Frontend unit test for solfege validation in frontend/src/utils/validation.test.js: test isValidSolfege function (valid/invalid syllables, case handling)
- [x] T032 [P] [US1] Frontend unit test for audioEngine in frontend/src/utils/audioEngine.test.js: test playMelody function (mocked Tone.js, verify notes scheduled correctly)
- [x] T033 [P] [US1] Frontend component test for MelodyComposer in frontend/src/components/MelodyComposer.test.js: test rendering, user input, real-time validation feedback
- [x] T034 [P] [US1] Frontend component test for MelodyPlayer in frontend/src/components/MelodyPlayer.test.js: test play/pause/stop buttons, playback state management

### Implementation for User Story 1

- [x] T035 [P] [US1] Implement solfege validation utility in backend/melodies/utils.py: is_valid_solfege_notation(text) returns bool, validates against [do, re, mi, fa, sol, la, si]
- [x] T036 [P] [US1] Implement solfege parsing utility in backend/melodies/utils.py: parse_solfege_notation(text) returns list of syllables, handles whitespace/commas
- [x] T037 [P] [US1] Implement frontend solfege validation in frontend/src/utils/validation.js: isValidSolfege(text), parseNotes(text), highlightInvalidNotes(text)
- [x] T038 [P] [US1] Implement frontend audioEngine in frontend/src/utils/audioEngine.js: initialize Tone.js Synth, playMelody(notes, key) maps solfege to pitches, handles AudioContext resume for browser autoplay policy
- [x] T039 [US1] Create MelodyComposer component in frontend/src/components/MelodyComposer.js: textarea for notation input, real-time validation with error messages, note count display, duration estimate
- [x] T040 [US1] Create MelodyPlayer component in frontend/src/components/MelodyPlayer.js: Play/Pause/Stop buttons, playback progress indicator, integrates audioEngine.playMelody()
- [x] T041 [US1] Create ComposerPage in frontend/src/pages/ComposerPage.js: combines MelodyComposer + MelodyPlayer, manages composition state (notation, isPlaying), anonymous composition (no save yet)
- [x] T042 [US1] Add routing for ComposerPage in frontend/src/App.js: / route renders ComposerPage
- [x] T043 [US1] Style MelodyComposer component: textarea styling, error message display (red text below textarea), character count, duration display
- [x] T044 [US1] Style MelodyPlayer component: button styling (Play: green, Pause: yellow, Stop: red), disable buttons during playback

**Checkpoint**: User Story 1 complete - Users can compose and play melodies anonymously

---

## Phase 4: User Story 2 - Save and Share Melodies (Priority: P2)

**Goal**: Enable authenticated users to save melodies permanently and share them via public links

**Independent Test**: Create melody, register account, save with title "My Song", verify appears in "My Melodies" list, copy share link, open in incognito window, verify melody plays

### Tests for User Story 2

- [x] T045 [P] [US2] Unit test for Melody model in backend/tests/unit/test_models.py: test_share_id_generation (unique 12-char URL-safe string), test_melody_creation_with_user
- [x] T046 [P] [US2] Unit test for share ID generation in backend/melodies/utils.py: test_generate_share_id (12 chars, URL-safe [A-Za-z0-9_-], uniqueness check)
- [x] T047 [P] [US2] Integration test for melody CRUD API in backend/tests/integration/test_api_melodies.py: test_create_melody_authenticated (201 with valid JWT), test_create_melody_anonymous (401), test_list_user_melodies (pagination, ordering)
- [x] T048 [P] [US2] Integration test for shared melody endpoint in backend/tests/integration/test_api_melodies.py: test_get_shared_melody_public (200 without auth), test_get_shared_melody_private (403)
- [x] T049 [P] [US2] Frontend service test for melodyService in frontend/src/services/melodyService.test.js: test createMelody, getUserMelodies, getSharedMelody (mocked with MSW)
- [x] T050 [P] [US2] Frontend component test for MyMelodiesPage in frontend/src/pages/MyMelodiesPage.test.js: test melody list rendering, pagination, delete confirmation

### Implementation for User Story 2

- [x] T051 [US2] Create Melody model in backend/melodies/models.py: (id:UUID, user_id:UUID FK, title:str max 200, notation:text, key:str default 'C', share_id:str unique 12, is_public:bool default True, created_at:datetime, updated_at:datetime, note_count:int, duration_seconds:float)
- [x] T052 [US2] Add model validation in backend/melodies/models.py: clean() method validates notation via is_valid_solfege_notation, computes note_count and duration_seconds in save()
- [x] T053 [US2] Create Django migration for Melody model: python manage.py makemigrations melodies
- [x] T054 [US2] Implement share_id generation in backend/melodies/utils.py: generate_share_id() returns 12-char URL-safe string, checks uniqueness against Melody.objects.filter(share_id=...)
- [x] T055 [US2] Register Melody model in backend/melodies/admin.py: list_display=[title, user, created_at, is_public], search_fields=[title, notation]
- [x] T056 [US2] Create Melody serializers in backend/api/serializers.py: MelodySerializer (full fields), MelodyListSerializer (summary), SharedMelodySerializer (public fields only, excludes is_public/updated_at)
- [x] T057 [US2] Create MelodyViewSet in backend/api/views.py: list (GET /api/melodies/), create (POST /api/melodies/), retrieve (GET /api/melodies/{id}/), update (PUT /api/melodies/{id}/), destroy (DELETE /api/melodies/{id}/) with JWT authentication, ownership checks
- [x] T058 [US2] Create SharedMelodyView in backend/api/views.py: retrieve (GET /api/melodies/shared/{share_id}/) no authentication, filters is_public=True
- [x] T059 [US2] Create melody URL routes in backend/api/urls.py: DRF router for MelodyViewSet, custom route for /api/melodies/shared/{share_id}/
- [x] T060 [US2] Create frontend melody service in frontend/src/services/melodyService.js: createMelody(title, notation, key, isPublic), getUserMelodies(page, pageSize), getMelody(id), updateMelody(id, data), deleteMelody(id), getSharedMelody(shareId)
- [x] T061 [US2] Add Save button to ComposerPage in frontend/src/pages/ComposerPage.js: prompts for title if not authenticated (redirect to AuthPage), calls melodyService.createMelody on save
- [x] T062 [US2] Create AuthPage component in frontend/src/pages/AuthPage.js: tabs for Login/Register forms, calls authService.login or authService.register, stores JWT in localStorage, redirects to ComposerPage on success
- [x] T063 [US2] Create MyMelodiesPage component in frontend/src/pages/MyMelodiesPage.js: fetches melodyService.getUserMelodies, displays list with title/created_at/note_count, Edit/Delete/Share buttons per melody
- [x] T064 [US2] Create SharedMelodyPage component in frontend/src/pages/SharedMelodyPage.js: extracts shareId from URL params, fetches melodyService.getSharedMelody, displays melody with MelodyPlayer (read-only, no save/edit)
- [x] T065 [US2] Add routing in frontend/src/App.js: /auth for AuthPage, /my-melodies for MyMelodiesPage (protected route), /shared/:shareId for SharedMelodyPage
- [x] T066 [US2] Implement protected route component in frontend/src/components/ProtectedRoute.js: checks useAuth isAuthenticated, redirects to /auth if not logged in
- [x] T067 [US2] Add Share button functionality in MyMelodiesPage: copies `${window.location.origin}/shared/${melody.share_id}` to clipboard, shows "Link copied!" toast notification
- [x] T068 [US2] Style AuthPage: centered form with input fields (username, email, password), validation errors display, tab switching between Login/Register
- [x] T069 [US2] Style MyMelodiesPage: card grid layout for melodies, pagination controls, delete confirmation modal
- [x] T070 [US2] Style SharedMelodyPage: display author username, "Play this melody" call-to-action, disable save functionality

**Checkpoint**: User Story 2 complete - Users can save melodies after authentication and share via public links

---

## Phase 5: User Story 3 - Transpose Melodies to Different Keys (Priority: P3)

**Goal**: Enable users to transpose saved melodies to different musical keys while preserving melodic intervals

**Independent Test**: Open saved melody in C major with notation "do mi sol", select G major from key dropdown, click Play, hear melody transposed (G-B-D pitches) with same intervals

### Tests for User Story 3

- [x] T071 [P] [US3] Unit test for transposition logic in backend/tests/unit/test_utils.py: test_transpose_solfege_to_key (maps solfege to MIDI notes, applies semitone offset, returns frequency list)
- [x] T072 [P] [US3] Unit test for semitone calculation in backend/tests/unit/test_utils.py: test_get_semitone_offset (C→G = +7, C→Eb = +3, validates all 12 keys)
- [x] T073 [P] [US3] Integration test for transpose endpoint in backend/tests/integration/test_transposition.py: test_transpose_melody (POST /api/melodies/{id}/transpose/ with target_key, returns transposed_pitches array)
- [x] T074 [P] [US3] Frontend unit test for transposition in frontend/src/utils/audioEngine.test.js: test playMelodyInKey(notes, targetKey) applies correct pitch mapping
- [x] T075 [P] [US3] Frontend component test for KeySelector in frontend/src/components/KeySelector.test.js: test dropdown rendering (12 keys), onChange callback

### Implementation for User Story 3

- [x] T076 [P] [US3] Implement transposition utility in backend/melodies/utils.py: get_semitone_offset(from_key, to_key) returns int, maps key names to semitone values
- [x] T077 [P] [US3] Implement pitch calculation in backend/melodies/utils.py: transpose_solfege_to_key(notation, original_key, target_key) returns list of {solfege, pitch, frequency} dicts, uses solfege→MIDI mapping + semitone offset
- [x] T078 [US3] Create TransposeMelodyView in backend/api/views.py: POST /api/melodies/{id}/transpose/ accepts target_key in request body, validates ownership, calls transpose_solfege_to_key, returns transposed pitch data (does NOT modify stored melody)
- [x] T079 [US3] Add transpose URL route in backend/api/urls.py: /api/melodies/{id}/transpose/ → TransposeMelodyView
- [x] T080 [US3] Implement frontend key transposition in frontend/src/utils/audioEngine.js: playMelodyInKey(notes, key) maps solfege syllables to pitches based on key, applies semitone offsets (C=0, C#=1, D=2... B=11)
- [x] T081 [US3] Create KeySelector component in frontend/src/components/KeySelector.js: dropdown with 12 keys (C, C#, D, Eb, E, F, F#, G, Ab, A, Bb, B), onChange(selectedKey) callback, current key highlighted
- [x] T082 [US3] Add KeySelector to ComposerPage in frontend/src/pages/ComposerPage.js: displays current key (default C major), updates playback key when changed, does NOT modify notation text
- [x] T083 [US3] Add KeySelector to MyMelodiesPage melody cards: shows saved key, allows temporary transposition for preview (does not save)
- [x] T084 [US3] Update MelodyPlayer to accept key prop in frontend/src/components/MelodyPlayer.js: passes key to audioEngine.playMelodyInKey(notes, key)
- [x] T085 [US3] Add "Save Transposition" button in ComposerPage: updates melody.key field via melodyService.updateMelody if user wants to persist key change
- [x] T086 [US3] Style KeySelector component: dropdown styling, key names displayed as "C Major", "G Major", etc., tooltips explaining transposition

**Checkpoint**: User Story 3 complete - Users can transpose melodies to any of 12 keys with accurate pitch relationships

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories, achieve 80% test coverage

- [x] T087 [P] Add backend unit tests for serializers in backend/tests/unit/test_serializers.py: test UserRegistrationSerializer validation, test MelodySerializer validation, test SharedMelodySerializer field exclusions
- [x] T088 [P] Add backend integration test for authentication flow in backend/tests/integration/test_api_auth.py: test_register_user (201), test_login_user (200 with tokens), test_refresh_token (200), test_invalid_credentials (401)
- [x] T089 [P] Add backend integration test for edge cases in backend/tests/integration/test_api_melodies.py: test_create_melody_max_length (10k notes), test_create_melody_invalid_notation (400), test_delete_melody_unauthorized (403)
- [ ] T090 [P] Add frontend integration test for compose flow in frontend/src/tests/integration/composeFlow.test.js: enter notation → validate → play → register → save → verify in My Melodies (uses MSW)
- [ ] T091 [P] Add frontend integration test for share flow in frontend/src/tests/integration/shareFlow.test.js: create melody → share → open shared link → verify playback (uses MSW)
- [x] T092 Run backend coverage report: docker-compose exec backend pytest --cov=. --cov-report=html --cov-report=term (verify ≥80%)
- [x] T093 Run frontend coverage report: docker-compose exec frontend npm test -- --coverage (verify ≥80%)
- [x] T094 [P] Add error handling for edge cases in backend/api/views.py: 400 for invalid notation, 404 for nonexistent melodies, 403 for unauthorized access, 429 for rate limiting
- [x] T095 [P] Add error handling in frontend components: network errors display toast notifications, validation errors inline with fields, loading states for async operations
- [ ] T096 [P] Create Home page in frontend/src/pages/Home.js: hero section explaining solfege composition, "Try it now" CTA button → ComposerPage, "How it works" section with examples
- [x] T097 [P] Add navigation header in frontend/src/components/Header.js: links to Home, Composer, My Melodies (if authenticated), Login/Logout button, displays username when logged in
- [ ] T098 [P] Add rate limiting to authentication endpoints in backend/config/settings.py: django-ratelimit 5 requests/minute for /api/auth/*, 100 requests/minute for other endpoints
- [ ] T099 [P] Create README.md in repository root: project description, tech stack, quickstart instructions (link to specs/001-solfege-melody-composer/quickstart.md), contribution guidelines
- [x] T100 [P] Add environment variable validation in backend/config/settings.py: check DATABASE_URL, SECRET_KEY, DEBUG, ALLOWED_HOSTS are set, raise error if missing in production
- [x] T101 [P] Add environment variable validation in frontend/src/services/api.js: check REACT_APP_API_URL is set, default to http://localhost:8000 in development
- [ ] T102 Run quickstart validation: follow specs/001-solfege-melody-composer/quickstart.md from clean environment, verify all services start, verify user can compose/save/share melody
- [x] T103 [P] Code cleanup: remove console.log statements, remove commented code, ensure all functions <50 lines, verify naming conventions followed
- [x] T104 [P] Security hardening: verify JWT secrets use environment variables, HTTPS required in production (SECURE_SSL_REDIRECT=True), SQL injection prevented by ORM, XSS prevented by React escaping
- [ ] T105 Performance optimization: add database indexes (user_id, share_id, created_at), enable gzip compression in Django, lazy load Tone.js library, code splitting for React routes

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational completion - Core MVP functionality
- **User Story 2 (Phase 4)**: Depends on Foundational completion + US1 for UI integration (but independently testable)
- **User Story 3 (Phase 5)**: Depends on Foundational completion + US2 (needs saved melodies to transpose)
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (Compose & Play)**: Independent - No dependencies on other stories after Foundation
- **US2 (Save & Share)**: Integrates with US1 UI but independently testable (has own endpoints/components)
- **US3 (Transpose)**: Requires US2 (melodies must be saved to transpose), extends US1 playback logic

### Within Each User Story

1. **Tests FIRST** (TDD): Write failing tests before implementation
2. **Models**: Create data models (if needed for story)
3. **Utils/Services**: Business logic and utilities
4. **API Views**: Endpoints (backend) or service clients (frontend)
5. **Components**: UI components (frontend)
6. **Integration**: Wire components together in pages
7. **Styling**: Visual polish after functionality works

### Parallel Opportunities

**Within Setup (Phase 1)**:
- T004 (backend init), T005 (frontend init) - different projects
- T006 (pytest config), T007 (jest config) - different files
- T009 (docker-compose), T010 (backend Dockerfile), T011 (frontend Dockerfile) - different files

**Within Foundational (Phase 2)**:
- T017 (CORS config), T018 (spectacular config) - different settings sections
- T022 (api client), T023 (authService), T024 (useAuth hook) - different files
- T025 (test fixtures) - independent

**Within User Story 1 Tests**:
- T028-T034 all parallel (different test files)

**Within User Story 1 Implementation**:
- T035, T036, T037, T038 all parallel (different files: backend utils, frontend validation, audioEngine)

**Within User Story 2 Tests**:
- T045-T050 all parallel (different test files)

**Within User Story 3 Tests**:
- T071-T075 all parallel (different test files)

**Within Polish Phase**:
- T087-T091 (tests), T094-T095 (error handling), T096-T098 (UI/config), T099-T101 (docs/config), T103-T105 (cleanup/optimization) - most can run in parallel

**Between User Stories** (after Foundational complete):
- US1, US2, US3 can be worked on by different developers in parallel if staffed
- Each story has independent tests and implementations

---

## Parallel Example: User Story 1

```bash
# Step 1: Launch all US1 tests together (write failing tests first):
Task: "Unit test for solfege validation in backend/tests/unit/test_utils.py"
Task: "Unit test for solfege parsing in backend/tests/unit/test_utils.py"
Task: "Frontend unit test for validation in frontend/src/utils/validation.test.js"
Task: "Frontend unit test for audioEngine in frontend/src/utils/audioEngine.test.js"
Task: "Frontend component test for MelodyComposer"
Task: "Frontend component test for MelodyPlayer"

# Step 2: Launch foundational implementations in parallel:
Task: "Implement solfege validation utility in backend/melodies/utils.py"
Task: "Implement solfege parsing utility in backend/melodies/utils.py"
Task: "Implement frontend solfege validation in frontend/src/utils/validation.js"
Task: "Implement frontend audioEngine in frontend/src/utils/audioEngine.js"

# Step 3: Build UI components (sequential dependencies within):
Task: "Create MelodyComposer component" (depends on validation.js)
Task: "Create MelodyPlayer component" (depends on audioEngine.js)
Task: "Create ComposerPage" (depends on MelodyComposer + MelodyPlayer)
Task: "Add routing for ComposerPage"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only) - Fastest Path to Demo

1. ✅ Complete **Phase 1: Setup** (T001-T011) - ~2 hours
2. ✅ Complete **Phase 2: Foundational** (T012-T027) - ~8 hours
   - **CRITICAL CHECKPOINT**: Foundation must be solid before proceeding
3. ✅ Complete **Phase 3: User Story 1** (T028-T044) - ~12 hours
   - Tests first (T028-T034)
   - Implementation (T035-T044)
4. **STOP and VALIDATE**: Test US1 independently
   - Can user compose "do re mi fa sol" and hear it play?
   - Does validation catch "da de di" as invalid?
   - Does playback work in Chrome, Firefox, Safari?
5. **Demo/Deploy MVP**: Working melody composer with playback

**Total MVP Time**: ~22 hours (3 days for 1 developer)

### Incremental Delivery (Add Value Iteratively)

1. **Sprint 1**: Setup + Foundation + US1 → Demo anonymous composition ✅
2. **Sprint 2**: Add US2 → Demo user accounts, saved melodies, sharing ✅
3. **Sprint 3**: Add US3 → Demo key transposition ✅
4. **Sprint 4**: Polish → Achieve 80% coverage, production readiness ✅

Each sprint delivers working, testable increments.

### Parallel Team Strategy (3 Developers)

**Week 1: Foundation Together**
- All devs: Complete Setup + Foundational phases together
- Pair on critical pieces (authentication, database setup)
- **Checkpoint**: Foundation solid

**Week 2-3: Parallel User Stories**
- **Developer A**: User Story 1 (Compose & Play) - T028-T044
- **Developer B**: User Story 2 (Save & Share) - T045-T070
- **Developer C**: User Story 3 (Transpose) - T071-T086
- Daily standups to coordinate integrations
- Each dev tests their story independently

**Week 4: Integration & Polish**
- All devs: Phase 6 tasks (T087-T105)
- Integration testing across all stories
- Coverage verification (≥80%)
- Production deployment

**Total Team Time**: 4 weeks (with 3 developers working in parallel)

---

## Coverage Checkpoints

**After User Story 1** (T044):
- Run: `docker-compose exec backend pytest --cov=melodies/utils --cov-report=term`
- Run: `docker-compose exec frontend npm test -- --coverage --testPathPattern=validation|audioEngine|MelodyComposer|MelodyPlayer`
- Target: ≥70% (baseline)

**After User Story 2** (T070):
- Run: `docker-compose exec backend pytest --cov=. --cov-report=html`
- Run: `docker-compose exec frontend npm test -- --coverage`
- Target: ≥75% (growing coverage)

**After User Story 3** (T086):
- Full coverage run on both backend and frontend
- Target: ≥78% (approaching goal)

**After Polish Phase** (T105):
- Final coverage verification
- **Constitutional Requirement**: ≥80% on both backend and frontend
- Generate HTML coverage reports for review

---

## Notes

- **[P] tasks**: Different files, no dependencies - can run in parallel
- **[Story] labels**: Map tasks to user stories for traceability (US1, US2, US3)
- **Test-First (TDD)**: Write failing tests before implementation (Red → Green → Refactor)
- **Independent Stories**: Each user story should be completable and testable without others
- **80% Coverage**: Constitutional requirement - must be met before merge to main
- **Commit Frequently**: After each task or logical group of related tasks
- **Validate at Checkpoints**: Stop after each user story phase to test independently
- **MVP = User Story 1**: Delivers core value, demonstrates feasibility, validates assumptions
- **Avoid**: Vague tasks, file conflicts, breaking story independence with tight coupling

---

## Task Count Summary

- **Phase 1 (Setup)**: 11 tasks
- **Phase 2 (Foundational)**: 16 tasks (BLOCKING)
- **Phase 3 (User Story 1)**: 17 tasks (7 tests + 10 implementation)
- **Phase 4 (User Story 2)**: 26 tasks (6 tests + 20 implementation)
- **Phase 5 (User Story 3)**: 16 tasks (5 tests + 11 implementation)
- **Phase 6 (Polish)**: 19 tasks

**Total**: 105 tasks

**Parallel Opportunities**: ~40 tasks marked [P] can run in parallel within their phase

**Test Tasks**: 18 test-related tasks (T028-T034, T045-T050, T071-T075) to achieve 80% coverage

**Suggested MVP Scope**: Phases 1-3 only (T001-T044) = 44 tasks for functional melody composer
