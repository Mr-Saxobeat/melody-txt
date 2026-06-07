# Tasks: Universal Edit Permissions

**Feature**: 008-universal-edit-permissions  
**Generated**: 2026-06-07  
**Source**: plan.md, data-model.md, contracts/api-authorization.md

## Phase 1: Tests (TDD Red Phase)

- [x] **T1.1** Write integration test `test_universal_permissions.py` verifying cross-user melody CRUD (User B edits/deletes User A's melody)
  - File: `backend/tests/integration/test_universal_permissions.py`
- [x] **T1.2** Write integration test for cross-user setlist CRUD (User B edits/deletes User A's setlist) [P]
  - File: `backend/tests/integration/test_universal_permissions.py`
- [x] **T1.3** Write integration test for cross-user tab CRUD (User B adds/edits/deletes tabs on User A's melody) [P]
  - File: `backend/tests/integration/test_universal_permissions.py`
- [x] **T1.4** Write integration test for cross-user setlist entry management [P]
  - File: `backend/tests/integration/test_universal_permissions.py`
- [x] **T1.5** Write test verifying unauthenticated users still cannot edit/delete
  - File: `backend/tests/integration/test_universal_permissions.py`

## Phase 2: Core Implementation

- [x] **T2.1** Update `MelodyViewSet.get_queryset` to return all melodies for authenticated users
  - File: `backend/api/views.py`
- [x] **T2.2** Update `MelodyTabView.get_melody` to remove user filter
  - File: `backend/api/views.py`
- [x] **T2.3** Update `TransposeMelodyView.get_queryset` to return all melodies
  - File: `backend/api/views.py`
- [x] **T2.4** Update `SetlistViewSet.get_queryset` to return all setlists for authenticated users
  - File: `backend/api/views.py`
- [x] **T2.5** Update `SetlistEntryView.get_setlist` to remove user filter
  - File: `backend/api/views.py`

## Phase 3: Existing Test Updates

- [x] **T3.1** Update `test_api_melodies.py` to reflect new universal access behavior
  - File: `backend/tests/integration/test_api_melodies.py`
- [x] **T3.2** Update `test_tabs_crud.py` to reflect new universal access behavior
  - File: `backend/tests/integration/test_tabs_crud.py`

## Phase 4: Frontend Updates

- [x] **T4.1** Update MyMelodiesPage label/title to reflect showing all melodies
  - File: `frontend/src/pages/MyMelodiesPage.js`

## Phase 5: Validation

- [x] **T5.1** Run full backend test suite and verify all tests pass
- [x] **T5.2** Run frontend test suite and verify no regressions
