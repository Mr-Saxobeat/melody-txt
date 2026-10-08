# Melody TXT

A web application for composing, transposing, and sharing melodies using solfege notation. Musicians can write melodies with inline lyrics, organize them into setlists, and export to PDF.

## Features

- **Solfege notation editor** with syntax highlighting (notation in green/bold, lyrics in orange/italic)
- **Inline lyrics** — write double-quote-delimited lyrics alongside notation on the same line (e.g., `sol sol "Parabéns pra você" DO si`)
- **Transposition** — shift melodies up or down while preserving lyrics
- **Setlists** — group melodies into ordered collections
- **PDF export** — generate printable PDFs of melodies and setlists (with JSZip for bulk export)
- **Shareable links** — public read-only view for any melody
- **Playback** — audio preview powered by Tone.js
- **Instrument tabs** — database-driven instrument management per melody
- **Configurable site settings** — customizable title, colors, logo, and header

## Tech Stack

| Layer    | Technology                                       |
|----------|--------------------------------------------------|
| Frontend | React 18, React Router 6, axios, jsPDF, Tone.js |
| Backend  | Django 4.2, Django REST Framework, SimpleJWT     |
| Database | PostgreSQL 15                                    |
| Testing  | Jest + React Testing Library + MSW (frontend), pytest (backend) |

## Project Structure

```
backend/
  melodies/       # Melody CRUD, notation parsing, note count
  setlists/       # Setlist management
  users/          # Authentication and user profiles
  config/         # Django settings and URL routing

frontend/src/
  components/     # MelodyComposer, Header, ProtectedRoute, etc.
  pages/          # ComposerPage, SharedMelodyPage, SetlistsPage, etc.
  services/       # API client, PDF export
  utils/          # Notation parser, transposer, line tokenizer, validation
  hooks/          # useAuth, useSiteSettings
  i18n/           # Internationalization
```

## Getting Started

### Prerequisites

- Docker and Docker Compose

### Running with Docker Compose

```bash
cp .env.example .env   # configure database credentials and secrets
docker-compose up
```

This starts PostgreSQL, the Django backend (port 8000), and the React frontend (port 3000).

### Running Locally

**Backend:**

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

**Frontend:**

```bash
cd frontend
npm install
npm start
```

## Testing

```bash
# Frontend
cd frontend
npm test

# Backend
cd backend
pytest
```

## License

Private — all rights reserved.
