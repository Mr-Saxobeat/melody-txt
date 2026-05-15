# Quickstart: Melody Search

## Prerequisites

- Docker (for PostgreSQL database)
- Python 3.9+ with `venv`
- Node.js 16+

## Setup

```bash
# Start backend
cd backend
source venv/bin/activate
python manage.py migrate
python manage.py runserver 0.0.0.0:8000

# Start frontend (separate terminal)
cd frontend
npm start
```

## Key Files to Modify

### Backend

| File | Change |
|------|--------|
| `backend/api/views.py` | Modify `RecentMelodiesView` for pagination + search; add new `MelodySearchView` |
| `backend/api/urls.py` | Add route for `/melodies/search/` |
| `backend/api/serializers.py` | No changes needed (reuse `SharedMelodySerializer`) |
| `backend/config/settings.py` | No changes needed (global pagination already configured) |

### Frontend

| File | Change |
|------|--------|
| `frontend/src/pages/HomePage.js` | Add search input, infinite scroll, debounced API calls |
| `frontend/src/pages/SetlistDetailPage.js` | Add search input to add-melody modal, API-based search |
| `frontend/src/services/melodyService.js` | Add `searchMelodies()` and `getRecentMelodies()` with pagination params |
| `frontend/src/i18n/locales/pt-BR.json` | Add translation keys for search placeholder, no results message |

### Tests

| File | Change |
|------|--------|
| `backend/tests/integration/test_api_melodies.py` | Add tests for search param and pagination on `/recent/` |
| `backend/tests/integration/test_melody_search.py` | New: tests for `/melodies/search/` endpoint |
| `frontend/src/pages/HomePage.test.js` | New: tests for search + infinite scroll behavior |
| `frontend/src/pages/MyMelodiesPage.test.js` | Verify no regressions |

## Verification

1. Navigate to home page — should show melodies with infinite scroll
2. Type in search bar — results should filter after debounce delay
3. Clear search — should restore full listing
4. Open a setlist, click "Add Melody" — modal should have search input
5. Search in modal — should show matching melodies from own + public
