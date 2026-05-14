# Data Model: Site Settings

**Feature**: 005-site-settings
**Date**: 2026-05-14

## Entity: SiteSettings (Singleton)

A single configuration record controlling site-wide appearance.

### Attributes

| Attribute | Type | Default | Constraints |
|-----------|------|---------|-------------|
| id | Integer | Auto | Primary key (always 1) |
| site_title | String(200) | "Melody Txt" | NOT NULL, max 200 chars |
| primary_color | String(7) | "#1976d2" | NOT NULL, valid hex (#RRGGBB) |
| header_background_color | String(7) | "#282c34" | NOT NULL, valid hex (#RRGGBB) |
| logo_text_color | String(7) | "#61dafb" | NOT NULL, valid hex (#RRGGBB) |

### Validation Rules

- Only one record can exist (singleton enforced in model save + admin)
- Color fields must match regex `^#[0-9a-fA-F]{6}$`
- site_title must be non-empty, max 200 characters

### Singleton Behavior

- `SiteSettings.load()` class method: returns existing record or creates one with defaults
- `save()` override: prevents creating a second record (sets pk=1 always)
- Admin: `has_add_permission` returns False if a record already exists

---

## API Contract

### GET /api/site-settings/

**Authentication**: None (public)

**Response 200**:
```json
{
  "site_title": "Melody Txt",
  "primary_color": "#1976d2",
  "header_background_color": "#282c34",
  "logo_text_color": "#61dafb"
}
```

**Behavior**: Returns the singleton record's values. If no record exists, returns default values (creates the record lazily).

---

## Frontend CSS Variables

Settings are applied as CSS custom properties on `:root`:

| CSS Variable | Maps to Field | Default |
|--------------|---------------|---------|
| `--primary-color` | primary_color | #1976d2 |
| `--header-bg` | header_background_color | #282c34 |
| `--logo-color` | logo_text_color | #61dafb |

The `site_title` is applied directly to the Header component's logo text.
