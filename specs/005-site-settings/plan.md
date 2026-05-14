# Implementation Plan: Site Settings

**Branch**: `005-site-settings` | **Date**: 2026-05-14 | **Spec**: `specs/005-site-settings/spec.md`
**Input**: Feature specification from `/specs/005-site-settings/spec.md`

## Summary

Create a singleton `SiteSettings` Django model editable via Django admin, exposed through a public API endpoint. The React frontend fetches settings on load and applies site title + CSS custom properties for colors dynamically.

## Technical Context

**Language/Version**: Python 3.11 (backend), JavaScript ES2020+ (frontend)
**Primary Dependencies**: Django 4.2 + DRF 3.14 (backend), React 18 (frontend)
**Storage**: PostgreSQL (backend), CSS custom properties (frontend runtime)
**Testing**: pytest + pytest-django (backend), Jest + React Testing Library (frontend)
**Target Platform**: Web application (Docker-deployed)
**Project Type**: Web application (Django REST API + React SPA)
**Performance Goals**: Settings API response < 100ms, frontend applies colors on load without flash
**Constraints**: Singleton model, public endpoint (no auth), graceful fallback
**Scale/Scope**: Single record, ~4 fields, 1 API endpoint

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Test Coverage Mandate**:
- [x] Plan includes 60%+ test coverage strategy — unit test for model singleton, integration test for API endpoint, frontend test for settings context
- [x] Unit test approach defined for all components — pytest (backend model/validation), Jest (frontend hook/context)
- [x] Integration test scenarios identified — API returns defaults when no record, API returns saved values

**Test-First Development**:
- [x] Testing framework selected and documented — pytest-django, Jest + RTL
- [x] Test structure aligned with TDD workflow

**Clean Code Principles**:
- [x] Naming conventions defined — snake_case (Python), camelCase (JS)
- [x] Code organization follows single responsibility — model in its own app or in existing config app, frontend settings in a context/hook
- [x] Maximum function length guidelines established — under 20 lines

**OOP Design Principles**:
- [x] Architecture demonstrates SOLID — SiteSettings model encapsulates defaults, serializer handles boundaries, frontend context provides settings
- [x] Interfaces and abstractions properly identified — settings as a React context, API as a simple GET endpoint
- [x] Inheritance vs composition strategy — composition (context wraps app)

**Human-Readable Code**:
- [x] Naming conventions prioritize clarity — `SiteSettings`, `useSiteSettings`, `primary_color`
- [x] Complex algorithms include documentation — N/A (no complex logic)
- [x] Code review checklist includes readability verification

## Project Structure

### Documentation (this feature)

```text
specs/005-site-settings/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
└── spec.md              # Feature specification
```

### Source Code (repository root)

```text
backend/
├── config/
│   ├── models.py             # SiteSettings singleton model (new)
│   ├── admin.py              # SiteSettings admin registration (new)
│   └── migrations/           # Migration for SiteSettings table
├── api/
│   ├── serializers.py        # SiteSettingsSerializer (extend)
│   ├── views.py              # SiteSettingsView (extend)
│   └── urls.py               # /api/site-settings/ route (extend)
└── tests/
    └── unit/
        └── test_site_settings.py  # Model + API tests (new)

frontend/
├── src/
│   ├── hooks/
│   │   └── useSiteSettings.js    # Hook to fetch and provide settings (new)
│   ├── components/
│   │   └── Header.js             # Apply title from settings (modify)
│   └── App.js                    # Wrap with settings provider, apply CSS vars (modify)
```

**Structure Decision**: SiteSettings model goes in the existing `config` app (where Django settings.py lives) since it's global configuration. Frontend uses a simple hook pattern.

## Complexity Tracking

No constitution violations. All changes follow existing patterns.
