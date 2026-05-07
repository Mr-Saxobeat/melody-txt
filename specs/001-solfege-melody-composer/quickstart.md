# Quickstart Guide: Solfege Melody Composer

**Feature**: Solfege Melody Composer  
**Date**: 2026-05-07  
**Audience**: Developers setting up local development environment

## Prerequisites

Ensure you have the following installed:

- **Docker**: 24.0+ ([Install Docker](https://docs.docker.com/get-docker/))
- **Docker Compose**: 2.23+ (included with Docker Desktop)
- **Git**: 2.30+
- **(Optional) Node.js**: 20+ for local frontend development without Docker
- **(Optional) Python**: 3.11+ for local backend development without Docker

---

## Quick Start (5 Minutes)

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/melody-txt.git
cd melody-txt
```

### 2. Start Services with Docker Compose

```bash
# Start all services (database, backend, frontend)
docker-compose up -d

# View logs
docker-compose logs -f
```

**Services Running**:
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`
- API Documentation: `http://localhost:8000/api/schema/swagger-ui/`
- PostgreSQL: `localhost:5432`

### 3. Verify Installation

```bash
# Check all containers are running
docker-compose ps

# Expected output:
# NAME                COMMAND                  STATUS
# melody-txt-db       "docker-entrypoint.s…"   Up
# melody-txt-backend  "python manage.py ru…"   Up
# melody-txt-frontend "npm start"              Up
```

### 4. Create Superuser (Django Admin)

```bash
docker-compose exec backend python manage.py createsuperuser
```

Follow prompts to create admin account.

### 5. Access Application

Open browser and navigate to:
- **Frontend**: http://localhost:3000
- **Django Admin**: http://localhost:8000/admin
- **API Docs**: http://localhost:8000/api/schema/swagger-ui/

---

## Detailed Setup

### Project Structure

```
melody-txt/
├── backend/                  # Django REST API
│   ├── api/                  # API views, serializers, URLs
│   ├── melodies/             # Melody app (models, business logic)
│   ├── users/                # User authentication app
│   ├── config/               # Django settings
│   ├── manage.py
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/                 # React SPA
│   ├── public/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── pages/            # Page components
│   │   ├── services/         # API client
│   │   └── utils/            # Utility functions
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml        # Development orchestration
├── docker-compose.prod.yml   # Production configuration
└── specs/                    # Feature specifications
```

---

## Backend Setup (Django)

### Using Docker (Recommended)

```bash
# Start only backend services
docker-compose up -d db backend

# Run migrations
docker-compose exec backend python manage.py migrate

# Create superuser
docker-compose exec backend python manage.py createsuperuser

# Run tests
docker-compose exec backend pytest

# Check coverage
docker-compose exec backend pytest --cov=. --cov-report=html
```

### Local Development (Without Docker)

```bash
cd backend

# Create virtual environment
python3.11 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
export DATABASE_URL="postgresql://melody_user:melody_pass@localhost:5432/melody_db"
export SECRET_KEY="your-secret-key-here"
export DEBUG=True

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Run development server
python manage.py runserver 0.0.0.0:8000
```

**Environment Variables** (create `backend/.env`):
```env
# Database
DATABASE_URL=postgresql://melody_user:melody_pass@localhost:5432/melody_db

# Django
SECRET_KEY=your-secret-key-generate-with-get-random-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000

# JWT
JWT_ACCESS_TOKEN_LIFETIME=15  # minutes
JWT_REFRESH_TOKEN_LIFETIME=10080  # 7 days in minutes
```

---

## Frontend Setup (React)

### Using Docker (Recommended)

```bash
# Start frontend service
docker-compose up -d frontend

# Install new dependency
docker-compose exec frontend npm install <package-name>

# Run tests
docker-compose exec frontend npm test

# Check coverage
docker-compose exec frontend npm test -- --coverage
```

### Local Development (Without Docker)

```bash
cd frontend

# Install dependencies
npm install

# Set environment variables
export REACT_APP_API_URL=http://localhost:8000

# Run development server (hot reload)
npm start

# Run tests
npm test

# Check coverage
npm test -- --coverage

# Build for production
npm run build
```

**Environment Variables** (create `frontend/.env.local`):
```env
REACT_APP_API_URL=http://localhost:8000
```

---

## Database Setup (PostgreSQL)

### Using Docker (Recommended)

Database is automatically configured via `docker-compose.yml`.

### Local PostgreSQL

```bash
# Install PostgreSQL 15
brew install postgresql@15  # macOS
# or: sudo apt install postgresql-15  # Ubuntu

# Start PostgreSQL service
brew services start postgresql@15

# Create database and user
psql postgres
```

```sql
CREATE DATABASE melody_db;
CREATE USER melody_user WITH PASSWORD 'melody_pass';
GRANT ALL PRIVILEGES ON DATABASE melody_db TO melody_user;
\q
```

### Database Migrations

```bash
# Create migration after model changes
docker-compose exec backend python manage.py makemigrations

# Apply migrations
docker-compose exec backend python manage.py migrate

# View migration SQL (without applying)
docker-compose exec backend python manage.py sqlmigrate melodies 0001

# Rollback migration
docker-compose exec backend python manage.py migrate melodies 0001
```

---

## Running Tests

### Backend Tests (pytest)

```bash
# Run all tests
docker-compose exec backend pytest

# Run specific test file
docker-compose exec backend pytest tests/unit/test_models.py

# Run with coverage report
docker-compose exec backend pytest --cov=. --cov-report=html --cov-report=term

# View coverage report
open backend/htmlcov/index.html

# Run only unit tests
docker-compose exec backend pytest tests/unit/

# Run only integration tests
docker-compose exec backend pytest tests/integration/
```

**Coverage Requirement**: Minimum 80% (constitutional requirement)

### Frontend Tests (Jest + React Testing Library)

```bash
# Run all tests
docker-compose exec frontend npm test

# Run with coverage
docker-compose exec frontend npm test -- --coverage

# Run specific test file
docker-compose exec frontend npm test -- src/components/MelodyComposer.test.js

# Watch mode (auto-rerun on changes)
docker-compose exec frontend npm test -- --watch
```

---

## Common Development Tasks

### Adding a New Django App

```bash
docker-compose exec backend python manage.py startapp <app_name>
```

Then:
1. Add app to `INSTALLED_APPS` in `config/settings.py`
2. Create models, views, serializers
3. Register URLs in `api/urls.py`
4. Run `makemigrations` and `migrate`

### Adding API Endpoint

1. **Define serializer** (`api/serializers.py`):
```python
from rest_framework import serializers

class MySerializer(serializers.ModelSerializer):
    class Meta:
        model = MyModel
        fields = ['id', 'name', 'created_at']
```

2. **Define view** (`api/views.py`):
```python
from rest_framework import viewsets

class MyViewSet(viewsets.ModelViewSet):
    queryset = MyModel.objects.all()
    serializer_class = MySerializer
    permission_classes = [IsAuthenticated]
```

3. **Register URL** (`api/urls.py`):
```python
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'myresource', MyViewSet)
```

4. **Update OpenAPI schema**:
```bash
docker-compose exec backend python manage.py spectacular --file schema.yml
```

### Adding React Component

1. **Create component** (`frontend/src/components/MyComponent.js`):
```jsx
import React from 'react';

export const MyComponent = ({ prop1, prop2 }) => {
  return (
    <div>
      <h1>{prop1}</h1>
      <p>{prop2}</p>
    </div>
  );
};
```

2. **Create test** (`frontend/src/components/MyComponent.test.js`):
```jsx
import { render, screen } from '@testing-library/react';
import { MyComponent } from './MyComponent';

test('renders component with props', () => {
  render(<MyComponent prop1="Hello" prop2="World" />);
  expect(screen.getByText('Hello')).toBeInTheDocument();
});
```

3. **Export from index** (`frontend/src/components/index.js`):
```javascript
export { MyComponent } from './MyComponent';
```

---

## Code Quality Tools

### Backend (Python)

```bash
# Run linter (flake8)
docker-compose exec backend flake8 .

# Format code (black)
docker-compose exec backend black .

# Type checking (mypy)
docker-compose exec backend mypy .

# Security check (bandit)
docker-compose exec backend bandit -r .
```

### Frontend (JavaScript)

```bash
# Run linter (ESLint)
docker-compose exec frontend npm run lint

# Fix linting issues
docker-compose exec frontend npm run lint -- --fix

# Format code (Prettier)
docker-compose exec frontend npm run format
```

---

## Debugging

### Backend (Django)

1. **Add breakpoint** in Python code:
```python
import pdb; pdb.set_trace()
```

2. **Attach to container**:
```bash
docker attach melody-txt-backend
```

3. **View Django logs**:
```bash
docker-compose logs -f backend
```

### Frontend (React)

1. **Browser DevTools**: F12 → Console/Network/React DevTools

2. **View frontend logs**:
```bash
docker-compose logs -f frontend
```

3. **Debug in VS Code**: Install React DevTools extension

---

## Database Management

### Backup Database

```bash
# Backup to file
docker-compose exec db pg_dump -U melody_user melody_db > backup.sql

# Restore from file
docker-compose exec -T db psql -U melody_user melody_db < backup.sql
```

### Access Database Shell

```bash
# PostgreSQL shell
docker-compose exec db psql -U melody_user melody_db

# Django shell
docker-compose exec backend python manage.py shell
```

```python
# Example: Query melodies
from melodies.models import Melody
melodies = Melody.objects.all()
for m in melodies:
    print(f"{m.title}: {m.notation}")
```

---

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 8000
lsof -ti:8000

# Kill process
kill -9 <PID>

# Or change port in docker-compose.yml
```

### Database Connection Error

```bash
# Restart database
docker-compose restart db

# Check database logs
docker-compose logs db

# Verify database is running
docker-compose ps db
```

### Frontend Not Updating

```bash
# Clear cache and rebuild
docker-compose down
docker-compose build --no-cache frontend
docker-compose up -d
```

### Permission Denied (Docker on Linux)

```bash
# Add user to docker group
sudo usermod -aG docker $USER

# Re-login for changes to take effect
```

---

## Production Deployment

### Build Production Images

```bash
# Build optimized images
docker-compose -f docker-compose.prod.yml build

# Start production services
docker-compose -f docker-compose.prod.yml up -d
```

### Environment Variables (Production)

Create `.env.prod` file (never commit to Git):

```env
# Django
SECRET_KEY=<generate-strong-secret-key>
DEBUG=False
ALLOWED_HOSTS=melody-txt.com,www.melody-txt.com
DATABASE_URL=postgresql://user:pass@db:5432/melody_db

# CORS
CORS_ALLOWED_ORIGINS=https://melody-txt.com

# Security
SECURE_SSL_REDIRECT=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True

# JWT
JWT_ACCESS_TOKEN_LIFETIME=15
JWT_REFRESH_TOKEN_LIFETIME=10080
```

### Health Checks

```bash
# Backend health
curl http://localhost:8000/api/health/

# Expected: {"status": "healthy"}
```

---

## Additional Resources

- **Django Documentation**: https://docs.djangoproject.com/
- **Django REST Framework**: https://www.django-rest-framework.org/
- **React Documentation**: https://react.dev/
- **Tone.js Documentation**: https://tonejs.github.io/
- **Docker Documentation**: https://docs.docker.com/
- **PostgreSQL Documentation**: https://www.postgresql.org/docs/

---

## Getting Help

- **Project Issues**: https://github.com/yourusername/melody-txt/issues
- **API Documentation**: http://localhost:8000/api/schema/swagger-ui/
- **Feature Specs**: See `specs/` directory
- **Architecture Docs**: See `specs/001-solfege-melody-composer/research.md`

---

## Next Steps

1. ✅ Complete quickstart setup
2. → Read feature specification: `specs/001-solfege-melody-composer/spec.md`
3. → Review API contracts: `specs/001-solfege-melody-composer/contracts/api-endpoints.md`
4. → Review data model: `specs/001-solfege-melody-composer/data-model.md`
5. → Run `/speckit-tasks` to generate implementation tasks
6. → Start implementing Priority 1 features (melody composition and playback)
