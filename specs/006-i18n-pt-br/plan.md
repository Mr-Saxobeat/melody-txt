# Implementation Plan: Internationalization (i18n)

**Branch**: `006-i18n-pt-br` | **Date**: 2026-05-14 | **Spec**: `specs/006-i18n-pt-br/spec.md`
**Input**: Feature specification from `/specs/006-i18n-pt-br/spec.md`

## Summary

Externalize all hardcoded English UI strings in the React frontend into a structured translation file. Create a simple i18n hook (`useTranslation`) that loads translations from a JSON locale file. Ship pt-BR as the default and only locale. No third-party i18n library — a lightweight custom solution fits this project's scale.

## Technical Context

**Language/Version**: JavaScript ES2020+ (frontend only — no backend changes needed)
**Primary Dependencies**: React 18, no new dependencies
**Storage**: JSON locale files bundled with frontend
**Testing**: Jest + React Testing Library
**Target Platform**: Web browser (React SPA)
**Project Type**: Web application (frontend-only change)
**Performance Goals**: Zero additional network requests (locale bundled)
**Constraints**: ~15 component files to update, ~100-150 translatable strings
**Scale/Scope**: 1 locale (pt-BR), extensible to more

## Constitution Check

**Test Coverage Mandate**:
- [x] Plan includes 60%+ test coverage strategy — test the useTranslation hook and verify key components render translated strings
- [x] Unit test approach defined — Jest tests for translation hook fallback behavior
- [x] Integration test scenarios identified — render pages and verify Portuguese strings appear

**Test-First Development**:
- [x] Testing framework selected — Jest + RTL (existing)
- [x] Test structure aligned with TDD

**Clean Code Principles**:
- [x] Naming conventions — `t('key')` pattern, dot-notation keys (e.g., `nav.compose`, `compose.save`)
- [x] Single responsibility — translation logic in hook, locale data in JSON file
- [x] Function length — hook is <20 lines

**OOP Design Principles**:
- [x] Composition — hook wraps locale data, components consume via `t()` function
- [x] Dependency inversion — components depend on `t()` abstraction, not on locale file directly

**Human-Readable Code**:
- [x] Translation keys are self-documenting: `compose.instructions.solfege`, `auth.login.button`
- [x] Locale JSON is organized by page/section

## Project Structure

### Documentation

```text
specs/006-i18n-pt-br/
├── plan.md              # This file
├── research.md          # i18n approach decision
├── data-model.md        # Translation file structure
└── spec.md              # Feature specification
```

### Source Code

```text
frontend/src/
├── i18n/
│   ├── locales/
│   │   └── pt-BR.json        # Portuguese translations (new)
│   └── useTranslation.js     # Translation hook (new)
├── components/
│   ├── Header.js              # Translate nav links (modify)
│   ├── InstrumentTabs.js      # Translate "Select Instrument" modal (modify)
│   ├── InstrumentSelectModal.js # Translate modal text (modify)
│   ├── MelodyComposer.js      # Translate placeholder (modify)
│   ├── TransposeControls.js   # Translate labels (modify)
│   └── FlatToggle.js          # Translate toggle label (modify)
├── pages/
│   ├── ComposerPage.js        # Translate instructions, buttons, dialogs (modify)
│   ├── SharedMelodyPage.js    # Translate controls (modify)
│   ├── AuthPage.js            # Translate form labels, buttons (modify)
│   ├── HomePage.js            # Translate headings, buttons (modify)
│   ├── MyMelodiesPage.js      # Translate headings, buttons (modify)
│   ├── SetlistsPage.js        # Translate headings (modify)
│   └── SetlistDetailPage.js   # Translate buttons (modify)
└── hooks/
    └── useAuth.js             # No changes (auth logic, not UI text)
```

## Complexity Tracking

No constitution violations. Lightweight custom i18n — no new dependencies.
