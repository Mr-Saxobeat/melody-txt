# Quickstart: Inline Melody Lyrics

## Prerequisites

- Node.js 18+
- Python 3.11+
- PostgreSQL running locally (or via Docker)

## Setup

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

# Frontend (new terminal)
cd frontend
npm install
npm start
```

## Development Workflow

### Run Tests

```bash
# Frontend (all tests)
cd frontend && npm test -- --watchAll=false

# Frontend (specific file)
cd frontend && npm test -- --watchAll=false --testPathPattern=lineTokenizer

# Backend
cd backend && pytest -v

# Backend with coverage
cd backend && pytest --cov=melodies --cov-report=term-missing
```

### Key Files to Edit

| What | File |
|------|------|
| Line tokenizer (new) | `frontend/src/utils/lineTokenizer.js` |
| Line classification | `frontend/src/utils/validation.js` |
| Transposition | `frontend/src/utils/transposer.js` |
| Composer rendering | `frontend/src/components/MelodyComposer.js` |
| Shared view rendering | `frontend/src/pages/SharedMelodyPage.js` |
| PDF export | `frontend/src/services/pdfExportService.js` |
| Backend note count | `backend/melodies/models.py` |
| Backend quote stripping | `backend/melodies/utils.py` |

### Manual Testing

1. Start both servers
2. Open http://localhost:3000/compose
3. Type: `sol sol la sol DO si "Parabéns pra você"`
4. Verify: notation tokens appear green/bold, quoted lyrics appear orange/italic, no quote characters visible
5. Test transposition: transpose up a half step — lyrics should remain unchanged
6. Save and open shared link — verify same rendering in read-only view
