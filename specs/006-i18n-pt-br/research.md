# Research: Internationalization (i18n)

**Feature**: 006-i18n-pt-br
**Date**: 2026-05-14

## Decision 1: i18n Approach

**Decision**: Custom lightweight `useTranslation` hook with JSON locale files. No third-party library.

**Rationale**: The app has ~100-150 translatable strings across ~15 files. react-i18next or similar adds ~30KB+ for features we don't need (lazy loading, namespaces, ICU formatting). A simple `t('key')` hook reading from a JSON object is sufficient and zero-dependency.

**Alternatives considered**:
- react-i18next — industry standard but overkill for this scale, adds dependency
- react-intl (FormatJS) — even heavier, designed for complex formatting needs
- Context-based approach — what we're doing, just formalized as a hook

## Decision 2: Translation File Format

**Decision**: Single JSON file per locale (e.g., `pt-BR.json`), flat dot-notation keys organized by section.

**Rationale**: JSON is natively importable in React (no loader needed). Flat keys with dots (`nav.compose`, `compose.save`) are easy to search/grep and avoid deep nesting. One file per locale keeps things simple for 1-2 languages.

**Alternatives considered**:
- Nested JSON — harder to grep, deeper access paths
- YAML — requires a loader/parser
- Multiple files per locale (one per page) — over-engineering for this scale

## Decision 3: Hook API Design

**Decision**: `useTranslation()` returns a `t(key, params?)` function. Supports simple string interpolation with `{variable}` placeholders. Falls back to the key name if missing.

```
const { t } = useTranslation();
t('compose.save')           // "Salvar Melodia"
t('compose.by', { name })   // "por João"
t('missing.key')            // "missing.key" (fallback)
```

**Rationale**: Minimal API surface — one function covers 99% of use cases. Placeholder interpolation handles the few dynamic strings (user names, counts). Fallback to key name makes missing translations visible without breaking the UI.

## Decision 4: Locale Configuration

**Decision**: Default locale set to `'pt-BR'` in a config constant. The hook imports the locale file directly (static import, bundled). No runtime language switching in v1 — architecture supports it later by adding a locale state and dynamic import.

**Rationale**: Static import means zero extra network requests. For v1 with one language, this is the simplest path. The hook structure allows easy extension to multi-language later.

## Decision 5: Key Naming Convention

**Decision**: Dot-notation organized by page/section:

```
nav.setlists        → "Setlists"
nav.compose         → "Compor"
nav.myMelodies      → "Minhas Melodias"
compose.title       → "Componha sua Melodia"
compose.save        → "Salvar Melodia"
auth.login.button   → "Entrar"
errors.titleRequired → "Por favor, insira um título."
```

**Rationale**: Predictable, searchable, mirrors the component hierarchy. Developers can find the right key by knowing which page/section the string belongs to.
