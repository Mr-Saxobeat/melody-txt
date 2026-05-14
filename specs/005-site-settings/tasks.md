# Tasks: Site Settings

**Input**: Design documents from `specs/005-site-settings/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md

**Organization**: Tasks grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2)
- Include exact file paths in descriptions

## Path Conventions

This is a **web application** with:
- Backend: `backend/` (Django REST Framework)
- Frontend: `frontend/` (React SPA)

---

## Phase 1: Setup

**Purpose**: Create the SiteSettings model and migration

- [x] T001 Create SiteSettings singleton model in backend/config/models.py with fields: site_title (CharField max 200, default "Melody Txt"), primary_color (CharField max 7, default "#1976d2"), header_background_color (CharField max 7, default "#282c34"), logo_text_color (CharField max 7, default "#61dafb"). Override save() to enforce pk=1. Add load() class method that returns the singleton or creates one with defaults. Add clean() method to validate hex color format (#RRGGBB regex).
- [x] T002 Create migration for SiteSettings model by running makemigrations from backend/config/

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Register model in admin and create the API endpoint

- [x] T003 [P] Register SiteSettings in Django admin in backend/config/admin.py — override has_add_permission to return False if a record exists, override has_delete_permission to always return False. Customize admin form to show color picker widgets if possible (or plain text inputs with hex validation).
- [x] T004 [P] Create SiteSettingsSerializer in backend/api/serializers.py with fields: site_title, primary_color, header_background_color, logo_text_color (read-only serializer, no write endpoint)
- [x] T005 Create SiteSettingsView (GET only, AllowAny permission) in backend/api/views.py — calls SiteSettings.load() and serializes the result. Returns JSON with all 4 fields.
- [x] T006 Add URL route for /api/site-settings/ in backend/api/urls.py pointing to SiteSettingsView

**Checkpoint**: Backend complete — Django admin editable, API returns settings JSON

---

## Phase 3: User Story 1 — Admin Customizes Site Appearance (Priority: P1) MVP

**Goal**: Admin edits settings in Django admin, values are persisted and served via API.

**Independent Test**: Log into Django admin, change site title and colors, call GET /api/site-settings/ and verify the returned values match what was saved.

### Implementation for User Story 1

- [ ] T007 (BLOCKED: requires Docker DB for admin verification) [US1] Verify the full admin flow works end-to-end: create initial SiteSettings record via admin, edit fields, save, and confirm GET /api/site-settings/ returns updated values. Fix any issues found. (Manual verification task — requires Docker DB)

**Checkpoint**: User Story 1 complete — admin can edit and API serves the settings

---

## Phase 4: User Story 2 — Frontend Loads Settings Dynamically (Priority: P2)

**Goal**: Frontend fetches site settings from API on load, applies title and CSS custom properties.

**Independent Test**: Start frontend, verify it calls /api/site-settings/ on load, check that CSS variables --primary-color, --header-bg, --logo-color are set on :root, and Header displays the site title from settings.

### Implementation for User Story 2

- [x] T008 [P] [US2] Create useSiteSettings hook in frontend/src/hooks/useSiteSettings.js — on mount, fetch GET /api/site-settings/. Return { siteTitle, primaryColor, headerBg, logoColor, loading }. On error or empty response, return defaults: { siteTitle: "Melody Txt", primaryColor: "#1976d2", headerBg: "#282c34", logoColor: "#61dafb" }.
- [x] T009 [US2] Integrate useSiteSettings in frontend/src/App.js — call the hook at the top of App component. When settings load, set CSS custom properties on document.documentElement: --primary-color, --header-bg, --logo-color. Pass siteTitle to Header via prop or context.
- [x] T010 [US2] Update frontend/src/components/Header.js to accept and display siteTitle prop instead of hardcoded "Melody Txt" text in the header-logo Link.
- [x] T011 [US2] Replace hardcoded color values in frontend/src/App.css with CSS variables: replace #282c34 in .app-header background with var(--header-bg, #282c34), replace #61dafb in .header-logo color with var(--logo-color, #61dafb), replace #1976d2 in .btn-primary/.auth-submit/active states with var(--primary-color, #1976d2). Keep fallback values in var() for graceful degradation.

**Checkpoint**: User Story 2 complete — frontend dynamically applies settings from API

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Verification and regression testing

- [ ] T012 (BLOCKED: requires Docker DB) [P] Add integration test for SiteSettings API in backend/tests/unit/test_site_settings.py — test GET returns defaults when no record exists, test GET returns saved values after admin edit, test singleton enforcement (cannot create second record)
- [x] T013 Run all frontend tests: cd frontend && npx react-app-rewired test --watchAll=false
- [x] T014 Verify frontend compiles and dev server starts without errors

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — model creation first
- **Foundational (Phase 2)**: Depends on Phase 1 (needs model)
- **User Story 1 (Phase 3)**: Depends on Phase 2 (needs admin + API)
- **User Story 2 (Phase 4)**: Depends on Phase 2 (needs API endpoint available)
- **Polish (Phase 5)**: Depends on US1 and US2

### User Story Dependencies

- **User Story 1 (P1)**: Depends on Phase 2. Backend only — no frontend dependency.
- **User Story 2 (P2)**: Depends on Phase 2. Frontend only — can start in parallel with US1.

### Parallel Opportunities

- T003 and T004 (Phase 2) — different files
- T008 can start as soon as Phase 2 is done (parallel with T007)
- T012 can run in parallel with T013/T014

---

## Parallel Example: User Story 2

```text
# These can run in parallel (different files):
Task T008: "Create useSiteSettings hook in frontend/src/hooks/useSiteSettings.js"

# Then sequential (same files):
Task T009: "Integrate in App.js"
Task T010: "Update Header.js"
Task T011: "Replace CSS hardcoded colors"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Create model + migration (T001-T002)
2. Complete Phase 2: Admin + API (T003-T006)
3. Complete Phase 3: Verify admin flow (T007)
4. **STOP and VALIDATE**: Admin can edit settings, API serves them
5. Deploy backend if ready

### Incremental Delivery

1. Phases 1-3 → Backend complete, admin usable
2. Phase 4 → Frontend picks up settings dynamically
3. Phase 5 → Tests and verification
4. Each phase adds value independently

---

## Task Count Summary

- **Phase 1 (Setup)**: 2 tasks
- **Phase 2 (Foundational)**: 4 tasks
- **Phase 3 (US1 Admin)**: 1 task
- **Phase 4 (US2 Frontend)**: 4 tasks
- **Phase 5 (Polish)**: 3 tasks

**Total**: 14 tasks
**Parallel Opportunities**: 4 tasks marked [P]
**Suggested MVP Scope**: Phases 1-3 (T001-T007) = 7 tasks
