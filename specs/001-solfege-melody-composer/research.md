# Research: Solfege Melody Composer Implementation

**Date**: 2026-05-07  
**Feature**: Solfege Melody Composer  
**Phase**: Phase 0 - Technical Research

## Architecture Decisions

### Project Structure

**Decision**: Monorepo with separate backend/frontend directories

**Rationale**:
- Simplifies Docker orchestration with single docker-compose.yml
- Shared configuration and deployment pipelines
- Easier dependency management and version control
- Suitable for single team working across full stack

**Structure**:
```
melody-txt/
├── backend/          # Django REST Framework
│   ├── api/          # DRF views, serializers, URLs
│   ├── melodies/     # Melody models and business logic
│   ├── users/        # User authentication
│   └── tests/        # pytest tests
├── frontend/         # React SPA
│   ├── src/
│   │   ├── components/
│   │   ├── services/  # API client
│   │   ├── pages/
│   │   └── utils/
│   └── tests/         # Jest + React Testing Library
└── docker/            # Docker configuration
```

**Alternatives Considered**:
- Separate repositories: Rejected due to added complexity for small team and single deployment unit
- Django templates: Rejected in favor of modern SPA architecture for better UX

---

### Authentication Strategy

**Decision**: JWT authentication using djangorestframework-simplejwt

**Rationale**:
- Stateless architecture allows horizontal scaling
- Supports anonymous composition (no token required for playback)
- Clean separation between public and authenticated endpoints
- Mobile-friendly for future expansion
- Industry standard for REST APIs

**Implementation**:
- Access tokens: 15-minute expiry (short-lived for security)
- Refresh tokens: 7-day expiry (stored in httpOnly cookies)
- Public endpoints: `/api/melodies/{shareId}/` (no auth required)
- Protected endpoints: `/api/melodies/` POST/PUT/DELETE (JWT required)

**Alternatives Considered**:
- Session-based auth: Rejected due to server-side state requirements and scaling limitations
- OAuth2: Overkill for initial version; deferred to future social login feature

---

### API Design

**Decision**: Django REST Framework with ViewSets and ModelSerializers

**Framework**: Django 5.0 + Django REST Framework 3.14+

**Key Components**:
- **drf-spectacular**: OpenAPI 3.0 schema generation (official recommendation)
- **Browsable API**: Built-in documentation for development
- **ViewSets**: Standard CRUD operations for Melody and User resources
- **Custom APIView**: Transposition endpoint (non-CRUD operation)

**Endpoint Design**:
```
POST   /api/auth/register/          # Create account
POST   /api/auth/token/             # Obtain JWT
POST   /api/auth/token/refresh/     # Refresh JWT

GET    /api/melodies/               # List user's melodies (auth required)
POST   /api/melodies/               # Save melody (auth required)
GET    /api/melodies/{id}/          # Get user's melody (auth required)
PUT    /api/melodies/{id}/          # Update melody (auth required)
DELETE /api/melodies/{id}/          # Delete melody (auth required)

GET    /api/melodies/shared/{shareId}/  # Public melody access (no auth)
POST   /api/melodies/{id}/transpose/    # Transpose melody (auth required)
```

**Alternatives Considered**:
- GraphQL: Rejected as overkill for simple CRUD operations
- Plain Django views: Rejected in favor of DRF's built-in serialization and validation

---

### Web Audio Implementation

**Decision**: Tone.js library for audio synthesis and playback

**Rationale**:
- Abstracts Web Audio API complexity
- Built-in musical concepts (scales, notes, timing)
- Handles browser autoplay policies automatically
- Cross-browser compatibility tested
- Active maintenance and documentation

**Technical Approach**:
- Single AudioContext instance per application session
- OscillatorNode synthesis for pure solfege tones
- Timing: Fixed quarter note duration (0.5 seconds in v1)
- Transposition: Map solfege to MIDI notes, apply key offset

**Key Implementation Details**:
```javascript
// Solfege to MIDI mapping (C major, octave 4)
const solfegeToPitch = {
  'do': 'C4',
  're': 'D4',
  'mi': 'E4',
  'fa': 'F4',
  'sol': 'G4',
  'la': 'A4',
  'si': 'B4'
};

// Playback requires user gesture (browser policy)
const handlePlay = async () => {
  await Tone.start(); // Resume AudioContext
  const synth = new Tone.Synth().toDestination();
  notes.forEach((note, index) => {
    synth.triggerAttackRelease(note, "4n", Tone.now() + index * 0.5);
  });
};
```

**Alternatives Considered**:
- Raw Web Audio API: Rejected due to complexity and browser inconsistencies
- Audio file playback: Rejected due to network latency and storage requirements
- MIDI.js: Rejected as outdated (last update 2017)

---

### Docker Configuration

**Decision**: Docker Compose with separate containers for Django, React, and PostgreSQL

**Development Setup**:
```yaml
services:
  db:
    image: postgres:15-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_DB=melody_db
      - POSTGRES_USER=melody_user
      - POSTGRES_PASSWORD=dev_password

  backend:
    build: ./backend
    command: python manage.py runserver 0.0.0.0:8000
    volumes:
      - ./backend:/app  # Hot reload
    ports:
      - "8000:8000"
    depends_on:
      - db

  frontend:
    build: ./frontend
    command: npm start
    volumes:
      - ./frontend:/app
      - /app/node_modules  # Prevent host override
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_API_URL=http://localhost:8000
```

**Production Setup**:
- Remove volume mounts for immutable images
- Add Nginx reverse proxy for static assets
- Use Gunicorn (4 workers) for Django
- Multi-stage Dockerfile to reduce image size
- Non-root user for security

**Alternatives Considered**:
- Kubernetes: Overkill for initial deployment; deferred to scaling phase
- Separate VMs: Rejected in favor of containerization for consistency

---

### CORS Configuration

**Decision**: django-cors-headers with explicit origin allowlist

**Configuration**:
```python
# Development
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
]
CORS_ALLOW_CREDENTIALS = True  # For JWT cookies

# Production
CORS_ALLOWED_ORIGINS = [
    "https://melody-txt.com",
]
CSRF_TRUSTED_ORIGINS = ["https://melody-txt.com"]
```

**Rationale**:
- Explicit allowlist prevents security vulnerabilities
- Credentials support required for httpOnly cookies
- Middleware placement critical (before CommonMiddleware)

---

### Testing Strategy

**Backend Testing (pytest + pytest-django)**:

**Framework**: pytest 7.4+ with pytest-django plugin

**Test Structure**:
```
backend/tests/
├── unit/
│   ├── test_models.py
│   ├── test_serializers.py
│   └── test_utils.py
├── integration/
│   ├── test_api_melodies.py
│   ├── test_api_auth.py
│   └── test_transposition.py
└── fixtures/
    └── melody_fixtures.py
```

**Coverage Target**: 80%+ (constitutional requirement)

**Key Practices**:
- Use `@pytest.mark.django_db` for database tests
- DRF's `APIClient` for endpoint testing
- Fixtures for reusable test data
- Factory Boy for complex model generation

**Frontend Testing (Jest + React Testing Library)**:

**Test Structure**:
```
frontend/tests/
├── components/
├── services/
├── integration/
└── mocks/
```

**Key Practices**:
- Test user behavior, not implementation
- Mock API calls with Mock Service Worker (msw)
- Accessibility-first queries (getByRole, getByLabelText)
- Coverage target: 80%+

**Integration Testing**:
- Playwright for end-to-end critical flows
- Test scenarios: Anonymous compose → Register → Save → Share

**Alternatives Considered**:
- unittest: Rejected in favor of pytest's cleaner syntax and fixtures
- Enzyme: Rejected (deprecated) in favor of React Testing Library

---

## Technical Stack Summary

| Component | Technology | Version | Rationale |
|-----------|-----------|---------|-----------|
| Backend Framework | Django | 5.0+ | Mature, batteries-included, ORM, admin interface |
| API Framework | Django REST Framework | 3.14+ | Industry standard, browsable API, serialization |
| Database | PostgreSQL | 15+ | ACID compliance, JSON support, mature ecosystem |
| Frontend Framework | React | 18+ | Component-based, large ecosystem, modern hooks |
| Audio Library | Tone.js | 14+ | Musical abstractions, browser compatibility |
| Authentication | djangorestframework-simplejwt | 5.3+ | Stateless JWT, refresh token rotation |
| CORS | django-cors-headers | 4.3+ | Security, credential support |
| API Documentation | drf-spectacular | 0.27+ | OpenAPI 3.0, official DRF recommendation |
| Backend Testing | pytest + pytest-django | 7.4+ / 4.8+ | Fixture support, clean syntax |
| Frontend Testing | Jest + RTL | 29+ / 14+ | React-focused, user-centric testing |
| Containerization | Docker + Compose | 24+ / 2.23+ | Development parity, deployment consistency |

---

## Dependencies

### Backend (requirements.txt)
```
Django==5.0.6
djangorestframework==3.14.0
djangorestframework-simplejwt==5.3.1
django-cors-headers==4.3.1
drf-spectacular==0.27.1
psycopg2-binary==2.9.9
gunicorn==21.2.0
pytest==7.4.4
pytest-django==4.8.0
pytest-cov==4.1.0
```

### Frontend (package.json)
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "tone": "^14.8.49",
    "axios": "^1.6.7"
  },
  "devDependencies": {
    "jest": "^29.7.0",
    "@testing-library/react": "^14.2.1",
    "@testing-library/jest-dom": "^6.4.2",
    "msw": "^2.1.5"
  }
}
```

---

## Performance Considerations

### Backend
- Database indexing on `user_id`, `share_id`, `created_at`
- Connection pooling (default 20 connections)
- Query optimization with `select_related` and `prefetch_related`
- Pagination for melody lists (50 items per page)

### Frontend
- Code splitting by route
- Lazy loading for audio components
- Debounce for real-time validation (300ms)
- Memoization for expensive pitch calculations

### Docker
- Multi-stage builds to reduce image size
- Layer caching optimization
- Alpine-based images where possible
- Health checks for service readiness

---

## Security Considerations

- JWT stored in httpOnly cookies (XSS protection)
- CORS strict origin policy
- SQL injection protection (Django ORM parameterization)
- Rate limiting on authentication endpoints (django-ratelimit)
- Content Security Policy headers
- HTTPS required in production
- Environment variable secrets (never commit)
- Non-root Docker user

---

## Next Steps

Phase 1 deliverables:
1. ✅ Research complete
2. → Create data-model.md (entities, relationships, validation)
3. → Create contracts/ (API endpoint specifications)
4. → Create quickstart.md (setup instructions)
5. → Update CLAUDE.md with plan reference
