# Feature Specification: Internationalization (i18n)

**Feature Branch**: `006-i18n-pt-br`
**Created**: 2026-05-14
**Status**: Draft
**Input**: User description: "Internationalization. First language: brazilian portuguese"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Interface in Brazilian Portuguese (Priority: P1)

A user visiting the site sees all interface text (navigation, buttons, labels, instructions, error messages) in Brazilian Portuguese (pt-BR) as the default language. This makes the platform accessible to its primary Portuguese-speaking audience.

**Why this priority**: Core value — the platform serves a Brazilian audience and all UI text must be in their language.

**Independent Test**: Visit the site, verify all static text (header navigation, compose page instructions, button labels, form labels, error messages) displays in Portuguese.

**Acceptance Scenarios**:

1. **Given** a user opens the site, **When** the page loads, **Then** all navigation links display in Portuguese (e.g., "Composições" instead of "Compose", "Minhas Melodias" instead of "My Melodies")
2. **Given** a user is on the compose page, **When** the instructions section loads, **Then** all instructional text is in Portuguese
3. **Given** a user clicks "Save Melody" without a title, **When** the error appears, **Then** the error message is in Portuguese
4. **Given** a user is on the login/register page, **When** the form loads, **Then** all labels, placeholders, and button text are in Portuguese
5. **Given** a user views a shared melody page, **When** the transpose controls and tab labels load, **Then** all UI text is in Portuguese

---

### User Story 2 - Language Switcher for Future Languages (Priority: P2)

The system supports a language switching mechanism so that additional languages can be added in the future without restructuring. For v1, the default (and only) language is pt-BR, but the infrastructure allows adding English or other languages later.

**Why this priority**: Establishes the i18n architecture. Without this, adding future languages would require a rewrite.

**Independent Test**: Verify that all translatable strings are externalized into a language file (not hardcoded in components). Confirm a language config exists that could be extended with additional locale files.

**Acceptance Scenarios**:

1. **Given** the i18n system is configured, **When** the application loads, **Then** it uses pt-BR as the default locale
2. **Given** all UI strings are externalized, **When** a developer wants to add a new language, **Then** they only need to create a new translation file without modifying components

---

### Edge Cases

- What about solfege notation (do, re, mi)? Solfege notation is universal and is NOT translated — it remains as-is in all languages.
- What about user-generated content (melody titles, tab suffixes)? User content is never translated — only system UI text is.
- What if a translation key is missing? Fall back to the key name itself (visible as a developer hint, never blank).
- What about pluralization? Use standard plural forms for Portuguese (singular/plural).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: All static UI text (navigation, buttons, labels, instructions, placeholders, error messages, success messages) MUST be displayed in Brazilian Portuguese (pt-BR) by default
- **FR-002**: All translatable strings MUST be externalized into a translation file — no hardcoded UI text in components
- **FR-003**: The system MUST support a locale configuration that defaults to pt-BR
- **FR-004**: Solfege notation (do, re, mi, fa, sol, la, si) and musical terms MUST NOT be translated — they remain universal
- **FR-005**: User-generated content (melody titles, tab suffixes, setlist names) MUST NOT be translated
- **FR-006**: If a translation key is missing, the system MUST display the key name as fallback (never show blank text)
- **FR-007**: Date and number formatting MUST follow Brazilian locale conventions (dd/mm/yyyy, comma as decimal separator)

### Key Entities

- **Locale**: A language configuration (pt-BR for this version) containing all translated strings organized by page/section
- **Translation File**: A structured file mapping keys to Portuguese strings, organized logically (navigation, compose, auth, shared, errors)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of static UI text displays in Portuguese on all pages
- **SC-002**: Zero hardcoded English strings remain in component files (all externalized)
- **SC-003**: Adding a new language requires only creating a new translation file (no component changes)
- **SC-004**: All form validation and error messages display in Portuguese

## Assumptions

- Brazilian Portuguese (pt-BR) is the only language for v1 — no language picker UI needed yet
- The solfege system is universal and shared across all languages
- Admin panel remains in English (Django admin is not translated in this scope)
- Backend API error messages from DRF remain in English (only frontend UI is translated)
- The translation file structure supports future addition of languages without refactoring
