# Quickstart: Instruments Management

**Branch**: `014-instruments-management`

## Prerequisites

- Python 3.9+ with Django 4.2
- PostgreSQL running (see `backend/config/settings.py` for connection details)
- Node.js with React 18 frontend
- Backend virtual environment activated

## Development Setup

```bash
# Backend
cd backend
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

# Frontend (separate terminal)
cd frontend
npm install
npm start
```

## Key Files to Modify

### Backend

| File | Change |
|------|--------|
| `backend/melodies/models.py` | Add `Instrument` model; remove `INSTRUMENT_CHOICES`, `INSTRUMENT_OFFSETS`; change `MelodyTab.instrument` to FK |
| `backend/melodies/admin.py` | Register `Instrument` with custom ModelAdmin (pitch read-only on edit) |
| `backend/melodies/utils.py` | Update `transpose_between_instruments` to query Instrument model |
| `backend/api/serializers.py` | Add `InstrumentSerializer`; update `MelodyTabSerializer` to nest instrument |
| `backend/api/views.py` | Add `InstrumentListView`; update tab creation to validate instrument FK |
| `backend/api/urls.py` | Add `GET /api/instruments/` route |
| `backend/melodies/migrations/` | New migration: create Instrument table, seed data, migrate MelodyTab FK |

### Frontend

| File | Change |
|------|--------|
| `frontend/src/utils/instruments.js` | Replace hardcoded array with API-fetched data |
| `frontend/src/services/melodyService.js` | Add `getInstruments()` service method |
| `frontend/src/components/InstrumentTabs.js` | Consume instruments from props/context instead of static import |
| `frontend/src/components/InstrumentSelectModal.js` | Use dynamic instrument list, handle deleted instrument error |
| `frontend/src/pages/ComposerPage.js` | Change new composition flow: select one instrument, create single tab |
| `frontend/src/pages/SharedMelodyPage.js` | Use dynamic instrument data from tab's nested instrument object |
| `frontend/src/services/pdfExportService.js` | Use instrument name from tab data instead of capitalizing slug |

### Tests

| File | Change |
|------|--------|
| `backend/tests/integration/test_tabs_crud.py` | Create Instrument fixtures; update instrument references |
| `backend/tests/integration/test_transposition.py` | Update to use Instrument model |
| `backend/tests/unit/` | Add unit tests for Instrument model, pitch-to-offset mapping |
| `frontend/src/` | Update any tests referencing hardcoded instruments |

## Running Tests

```bash
# Backend
cd backend
pytest --cov=. --cov-report=term-missing

# Frontend
cd frontend
npm test
```

## Verifying the Feature

1. Run migrations: `python manage.py migrate`
2. Verify seed data: `python manage.py shell -c "from melodies.models import Instrument; print(list(Instrument.objects.values('name','pitch','offset')))"`
3. Access Django admin: `http://localhost:8000/admin/` → Instruments section
4. Add a new instrument (e.g., "Tenor Saxophone", pitch "Bb")
5. In the frontend, verify the new instrument appears in the instrument selection modal
6. Create a melody tab with the new instrument and verify transposition works
