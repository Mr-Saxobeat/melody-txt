# Feature Specification: Site Settings

**Feature Branch**: `005-site-settings`
**Created**: 2026-05-14
**Status**: Draft
**Input**: User description: "Site title and main colors customizable via Django admin page"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Admin Customizes Site Appearance (Priority: P1)

An admin user wants to change the site title and main colors (header background, primary accent color, logo text color) from the Django admin panel, so that the frontend reflects the branding without code changes.

**Why this priority**: Core value — this is the entire feature. Without admin-editable settings, the feature doesn't exist.

**Independent Test**: Log into Django admin, change the site title to "My Music App" and the primary color to "#ff5722", visit the frontend — verify the header shows "My Music App" and buttons/accents use orange instead of blue.

**Acceptance Scenarios**:

1. **Given** an admin user is logged into Django admin, **When** they navigate to "Site Settings", **Then** they see a form with fields: site title, primary color, header background color, logo text color
2. **Given** the admin changes the site title to "My Band App", **When** they save and a visitor loads the frontend, **Then** the header logo shows "My Band App" instead of "Melody Txt"
3. **Given** the admin sets the primary color to "#ff5722", **When** a visitor views the frontend, **Then** buttons, active tabs, and accent elements use that color
4. **Given** the admin sets header background color to "#1a1a2e", **When** a visitor views the frontend, **Then** the header background uses that color
5. **Given** no settings have been configured in admin yet, **When** a visitor loads the frontend, **Then** the default values are used (current hardcoded values: title "Melody Txt", primary "#1976d2", header background "#282c34", logo color "#61dafb")

---

### User Story 2 - Frontend Loads Settings Dynamically (Priority: P2)

The frontend loads site settings from a public API endpoint on startup so that color and title changes take effect without redeployment.

**Why this priority**: Necessary for the admin changes to actually reach users, but the admin UI (P1) must exist first.

**Independent Test**: Call the public API endpoint `/api/site-settings/`, verify it returns the current site title and color values as JSON.

**Acceptance Scenarios**:

1. **Given** site settings exist in the database, **When** the frontend loads, **Then** it fetches settings from the API and applies them to the page
2. **Given** the API is unreachable or returns an error, **When** the frontend loads, **Then** it falls back to default hardcoded values gracefully (no blank page, no error shown to user)

---

### Edge Cases

- What happens when no SiteSettings record exists in the database? The API returns default values.
- What happens if the admin enters an invalid color value (not a valid hex)? The admin form validates that colors are valid hex codes (#RRGGBB format).
- Can there be multiple SiteSettings records? No — this is a singleton model (only one record allowed).
- What happens if the admin leaves a field blank? Blank fields fall back to their default values.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide a "Site Settings" section in Django admin with the following editable fields: site title (text), primary color (hex), header background color (hex), logo text color (hex)
- **FR-002**: The system MUST enforce that only one Site Settings record can exist (singleton model)
- **FR-003**: The system MUST provide a public (no authentication required) API endpoint that returns the current site settings as JSON
- **FR-004**: The frontend MUST fetch site settings on page load and apply the title and colors dynamically
- **FR-005**: The frontend MUST fall back to default values if the API is unreachable or returns empty data
- **FR-006**: Color fields in the admin MUST validate hex color format (#RRGGBB)
- **FR-007**: Each field MUST have a sensible default value (title: "Melody Txt", primary: "#1976d2", header background: "#282c34", logo color: "#61dafb")
- **FR-008**: The system MUST support a customizable browser tab title (document title) with default "Melody Txt"
- **FR-009**: The system MUST support a customizable main page background color with default "#f5f7fa"
- **FR-010**: The system MUST support customizable logo font family (default: system sans-serif) and logo font size (default: "1.4rem")
- **FR-011**: The system MUST support a customizable header gradient (CSS gradient string, e.g. "linear-gradient(90deg, #282c34, #1a1a2e)") with default being solid color (empty = use header_background_color as solid)

### Key Entities

- **SiteSettings**: A singleton configuration record with fields: site_title, primary_color, header_background_color, logo_text_color, tab_title, main_background_color, logo_font_family, logo_font_size, header_gradient. All fields have default values.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Admin can change the site title and see it reflected on the frontend within 5 seconds of saving (after page refresh)
- **SC-002**: Admin can change any color and the frontend applies it correctly to all relevant elements
- **SC-003**: Frontend loads without errors when no settings have been configured (defaults used)
- **SC-004**: Frontend loads without errors when the settings API is down (graceful fallback)

## Assumptions

- Only admin/superuser can edit site settings (standard Django admin permissions)
- The frontend will fetch settings on each page load (no caching in v1 — simplicity over performance)
- Color changes apply globally to all pages (header, buttons, active states, links)
- The site title replaces only the header logo text, not the browser tab title (document title can remain as-is)
