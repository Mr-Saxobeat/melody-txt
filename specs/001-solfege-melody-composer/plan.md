# Implementation Plan: Solfege Melody Composer

**Branch**: `001-solfege-melody-composer` | **Date**: 2026-05-07 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/001-solfege-melody-composer/spec.md`

## Summary

Build a web application enabling amateur musicians to compose melodies using simple solfege notation (do re mi fa sol la si) without needing to read sheet music. Users can compose anonymously, play melodies using Web Audio API synthesis, save compositions after creating an account, transpose melodies to different keys, and share compositions via public links.

**Technical Stack**: React 18 (frontend SPA), Django 5.0 + Django REST Framework (backend API), PostgreSQL 15 (database), Tone.js (audio synthesis), Docker Compose (development environment), JWT authentication (djangorestframework-simplejwt)

## Technical Context

**Language/Version**:
- Backend: Python 3.11+
- Frontend: JavaScript ES2022+ (React 18)
- Database: PostgreSQL 15+

**Primary Dependencies**:
- Backend: Django 5.0, Django REST Framework 3.14, djangorestframework-simplejwt 5.3, django-cors-headers 4.3, drf-spectacular 0.27
- Frontend: React 18, Tone.js 14 (audio synthesis), axios 1.6 (HTTP client)
- Testing: pytest 7.4 + pytest-django 4.8 (backend), Jest 29 + React Testing Library 14 (frontend)

**Storage**: PostgreSQL 15 (relational database with ACID compliance, JSON support for future extensibility)

**Testing**:
- Backend: pytest with pytest-django, pytest-cov for coverage reporting, DRF's APIClient for endpoint tests
- Frontend: Jest + React Testing Library, Mock Service Worker (msw) for API mocking
- Integration: Playwright for end-to-end critical flows (stretch goal)
- Coverage Target: 80% minimum (constitutional requirement)

**Target Platform**: 
- Deployment: Linux server (Docker containers)
- Client: Modern web browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- Web Audio API support required (no plugin fallback)

**Project Type**: Web application (full-stack SPA with REST API backend)

**Performance Goals**:
- API response time: <200ms p95 for melody CRUD operations
- Playback latency: <1 second from button click to audio start
- Frontend initial load: <3 seconds on 3G connection
- Support 100 concurrent users (v1 scale)

**Constraints**:
- Browser-based audio synthesis only (no server-side audio processing)
- Monophonic melodies only (single melodic line, no chords)
- Equal note duration in v1 (rhythm notation deferred to v2)
- Anonymous composition client-side only (no server persistence without auth)

**Scale/Scope**:
- Initial deployment: 100-1000 users
- Database: ~10k melodies in first year
- Codebase: ~15k-20k lines (backend + frontend combined)
- UI screens: 5-7 primary pages (home, composer, my melodies, shared melody view, auth)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Test Coverage Mandate**:
- [x] Plan includes 80%+ test coverage strategy
  - Backend: pytest + pytest-django with pytest-cov for coverage reporting
  - Frontend: Jest + React Testing Library with built-in coverage
  - Both codebases require 80% minimum coverage before merge
- [x] Unit test approach defined for all components
  - Backend: Isolated tests for models, serializers, utilities with mocking for external dependencies
  - Frontend: Component tests using React Testing Library's user-centric queries
- [x] Integration test scenarios identified
  - Backend: Full API endpoint tests using DRF's APIClient with test database
  - Frontend: Integration tests for critical flows (compose → save → share)
  - End-to-end: Playwright tests for complete user journeys (stretch goal)

**Test-First Development**:
- [x] Testing framework selected and documented
  - Backend: pytest 7.4+ with pytest-django plugin, fixtures for test data
  - Frontend: Jest 29+ with React Testing Library, MSW for API mocking
- [x] Test structure aligned with TDD workflow (Red-Green-Refactor)
  - Write failing tests first (Red)
  - Implement minimum code to pass (Green)
  - Refactor while keeping tests green
  - Test files colocated with source: `tests/unit/`, `tests/integration/`

**Clean Code Principles**:
- [x] Naming conventions defined and documented
  - Python: snake_case for functions/variables, PascalCase for classes, UPPER_CASE for constants
  - JavaScript: camelCase for functions/variables, PascalCase for components, UPPER_SNAKE_CASE for constants
  - Descriptive names: `create_melody()` not `create()`, `MelodyComposer` not `Comp`
- [x] Code organization follows single responsibility principle
  - Backend: Separate apps for melodies, users; models, serializers, views in dedicated files
  - Frontend: Separate concerns: components (UI), services (API), utils (helpers)
- [x] Maximum function length guidelines established
  - Target: <20 lines per function
  - Maximum: 50 lines (requires justification in code review)
  - Complex logic broken into smaller helper functions

**OOP Design Principles**:
- [x] Architecture demonstrates SOLID principles
  - Single Responsibility: Each Django app handles one domain (melodies, users)
  - Open/Closed: Serializers extend base classes; custom validation via clean_ methods
  - Liskov Substitution: Custom user model extends AbstractBaseUser
  - Interface Segregation: Separate serializers for read vs write operations
  - Dependency Inversion: Views depend on serializers (abstraction), not direct models
- [x] Interfaces and abstractions properly identified
  - Backend: DRF serializers abstract model serialization; ViewSets abstract CRUD operations
  - Frontend: Service layer abstracts API calls from components; custom hooks abstract stateful logic
- [x] Inheritance vs composition strategy documented
  - Favor composition: React functional components with hooks, not class inheritance
  - Use inheritance: Django models (User extends AbstractBaseUser), DRF ViewSets for standard patterns
  - Mixins: DRF permission mixins, React HOCs only when hooks insufficient

**Human-Readable Code**:
- [x] Naming conventions prioritize clarity over brevity
  - `transpose_melody_to_key()` not `transpose()`
  - `is_valid_solfege_notation()` not `validate()`
  - `user_melody_list` not `uml` or `data`
- [x] Complex algorithms include explanatory documentation
  - Transposition logic: document semitone calculations and interval preservation
  - Audio synthesis: document Web Audio API context management and autoplay policies
  - Share ID generation: document uniqueness guarantee and collision handling
- [x] Code review checklist includes readability verification
  - Can a new developer understand the code without asking questions?
  - Are variable names self-explanatory?
  - Would removing comments break understanding? (If no, comments are good)

## Project Structure

### Documentation (this feature)

```text
specs/001-solfege-melody-composer/
├── spec.md                      # Feature specification (P0, P1, P2, P3 user stories)
├── plan.md                      # This file (implementation plan)
├── research.md                  # Phase 0 output (architecture decisions, tech stack)
├── data-model.md                # Phase 1 output (entities, relationships, validation)
├── quickstart.md                # Phase 1 output (developer setup guide)
├── contracts/
│   └── api-endpoints.md         # Phase 1 output (REST API contract specification)
└── tasks.md                     # Phase 2 output (/speckit-tasks - NOT YET CREATED)
```

### Source Code (repository root)

```text
melody-txt/
├── backend/                     # Django REST Framework API
│   ├── api/                     # Centralized API layer
│   │   ├── __init__.py
│   │   ├── serializers.py       # DRF serializers
│   │   ├── views.py             # DRF ViewSets and APIViews
│   │   └── urls.py              # API URL routing
│   ├── melodies/                # Melody domain app
│   │   ├── __init__.py
│   │   ├── models.py            # Melody model (notation, key, share_id)
│   │   ├── admin.py             # Django admin configuration
│   │   ├── apps.py
│   │   └── utils.py             # Solfege parsing, transposition logic
│   ├── users/                   # User authentication app
│   │   ├── __init__.py
│   │   ├── models.py            # Custom User model
│   │   ├── admin.py
│   │   └── apps.py
│   ├── config/                  # Django project settings
│   │   ├── __init__.py
│   │   ├── settings.py          # Main settings
│   │   ├── urls.py              # Root URL configuration
│   │   ├── wsgi.py
│   │   └── asgi.py
│   ├── tests/                   # Backend test suite
│   │   ├── unit/
│   │   │   ├── test_models.py
│   │   │   ├── test_serializers.py
│   │   │   └── test_utils.py
│   │   ├── integration/
│   │   │   ├── test_api_auth.py
│   │   │   ├── test_api_melodies.py
│   │   │   └── test_transposition.py
│   │   └── fixtures/
│   │       └── melody_fixtures.py
│   ├── manage.py
│   ├── requirements.txt         # Python dependencies
│   ├── Dockerfile
│   └── pytest.ini
│
├── frontend/                    # React SPA
│   ├── public/
│   │   ├── index.html
│   │   └── favicon.ico
│   ├── src/
│   │   ├── components/          # Reusable React components
│   │   │   ├── MelodyComposer.js
│   │   │   ├── MelodyComposer.test.js
│   │   │   ├── MelodyPlayer.js
│   │   │   ├── MelodyPlayer.test.js
│   │   │   ├── KeySelector.js
│   │   │   ├── KeySelector.test.js
│   │   │   └── index.js
│   │   ├── pages/               # Page-level components
│   │   │   ├── Home.js
│   │   │   ├── ComposerPage.js
│   │   │   ├── MyMelodiesPage.js
│   │   │   ├── SharedMelodyPage.js
│   │   │   └── AuthPage.js
│   │   ├── services/            # API client layer
│   │   │   ├── api.js           # Axios instance + interceptors
│   │   │   ├── authService.js   # Auth API calls
│   │   │   ├── melodyService.js # Melody API calls
│   │   │   └── api.test.js
│   │   ├── utils/               # Utility functions
│   │   │   ├── audioEngine.js   # Tone.js audio synthesis
│   │   │   ├── audioEngine.test.js
│   │   │   ├── validation.js    # Solfege notation validation
│   │   │   └── validation.test.js
│   │   ├── hooks/               # Custom React hooks
│   │   │   └── useAuth.js       # Authentication state management
│   │   ├── App.js               # Root component
│   │   ├── App.test.js
│   │   └── index.js             # Entry point
│   ├── package.json
│   ├── Dockerfile
│   └── jest.config.js
│
├── docker/                      # Docker configuration
│   ├── docker-compose.yml       # Development orchestration
│   ├── docker-compose.prod.yml  # Production configuration
│   └── nginx/                   # Nginx reverse proxy (production)
│       └── nginx.conf
│
├── .gitignore
├── README.md
└── CLAUDE.md                    # Agent context (updated with plan reference)
```

**Structure Decision**: 

Selected **Web Application (Option 2)** with monorepo architecture due to:
- Single deployment unit (frontend + backend + database)
- Simplified Docker orchestration with one docker-compose.yml
- Shared configuration and version control
- Small team working across full stack
- Clear separation of concerns: backend/ and frontend/ directories

Backend uses Django's app-based structure:
- `melodies/`: Core domain logic for melody composition
- `users/`: User authentication and management
- `api/`: Centralized REST API layer (views, serializers, URLs)
- `config/`: Django project settings

Frontend uses standard React SPA structure:
- `components/`: Reusable UI components (MelodyComposer, MelodyPlayer, KeySelector)
- `pages/`: Route-level components (Home, ComposerPage, MyMelodiesPage)
- `services/`: API client abstraction (authService, melodyService)
- `utils/`: Business logic and helpers (audioEngine, validation)

## Complexity Tracking

> **No constitutional violations identified.** All design decisions align with constitutional principles.

**Architectural Complexity Justifications**:

| Decision | Complexity Added | Justification |
|----------|------------------|---------------|
| Separate apps (melodies, users) | Multiple Django apps | Single Responsibility Principle - clear domain boundaries |
| Service layer (audioEngine) | Additional abstraction | Isolates Tone.js complexity; enables easy library swap in future |
| Custom User model | Extends AbstractBaseUser | Future-proofs for additional user fields; standard Django pattern |
| JWT authentication | Stateless token management | Horizontal scaling requirement; mobile-friendly for future expansion |

**Complexity Avoided** (simpler alternatives chosen):
- No GraphQL: REST API sufficient for CRUD operations
- No microservices: Monolithic Django app appropriate for v1 scale
- No NoSQL: PostgreSQL handles all requirements; JSONB available if needed
- No server-side audio: Client-side Web Audio API avoids infrastructure complexity
- No WebSockets: HTTP requests sufficient for current feature set (no real-time collaboration)
