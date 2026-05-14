# Research: Site Settings

**Feature**: 005-site-settings
**Date**: 2026-05-14

## Decision 1: Singleton Model Pattern

**Decision**: Use Django's model with a custom `save()` that enforces max 1 record, plus a class method `SiteSettings.load()` that returns the single instance or creates one with defaults.

**Rationale**: Simple, no extra dependencies. Django admin naturally works with it — just register the model and override `has_add_permission` to prevent creating a second record.

**Alternatives considered**:
- django-solo package — adds a dependency for a trivial pattern
- Environment variables — not admin-editable
- JSON file on disk — requires file system access, harder to manage

## Decision 2: Where to Place the Model

**Decision**: Create the model in the existing `config` app (backend/config/) since it's global site configuration.

**Rationale**: The `config` app already holds settings.py and site-level configuration. Adding a SiteSettings model here is semantically correct.

**Alternatives considered**:
- New `settings` app — over-engineering for a single model
- In `api` app — not the right responsibility

## Decision 3: API Endpoint Design

**Decision**: Single GET endpoint at `/api/site-settings/` with no authentication required. Returns JSON with all settings fields.

**Rationale**: Frontend needs to load settings on every page load for unauthenticated visitors. No write endpoint needed — admin panel handles edits.

**Alternatives considered**:
- Include in an existing endpoint — clutters unrelated responses
- Require auth — would break public pages

## Decision 4: Frontend Application of Colors

**Decision**: Use CSS custom properties (variables) set on `document.documentElement` when settings load. All existing CSS references to hardcoded colors are replaced with `var(--primary-color)`, `var(--header-bg)`, etc.

**Rationale**: CSS variables cascade naturally, can be set once at root level, and all elements using them update automatically. No need to pass colors as props through the component tree.

**Alternatives considered**:
- Inline styles on each component — fragile, verbose
- CSS-in-JS / styled-components — new dependency, different pattern than codebase
- React context with style objects — works but duplicates what CSS variables do natively

## Decision 5: Fallback Strategy

**Decision**: Frontend defines default values in the hook. If the API call fails or returns empty, defaults are used. CSS variables are always set (either from API or from defaults).

**Rationale**: Ensures the site never renders without styling, even if the backend is down.
