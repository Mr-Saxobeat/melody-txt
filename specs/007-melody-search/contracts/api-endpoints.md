# API Contracts: Melody Search

## Modified Endpoint: GET /api/melodies/recent/

**Change**: Add pagination (cursor-based) and optional `search` query parameter. Remove hardcoded `[:50]` slice.

### Request

```
GET /api/melodies/recent/?search=<term>&cursor=<cursor_token>
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| search | string | No | Case-insensitive substring search on melody title. Trimmed of whitespace. |
| cursor | string | No | Opaque cursor token for next page. Provided by `next` field in response. |

### Response (200 OK)

```json
{
  "next": "http://host/api/melodies/recent/?cursor=cD0yMDI2LTA1...",
  "previous": null,
  "results": [
    {
      "id": "uuid",
      "title": "string",
      "notation": "string",
      "key": "string",
      "share_id": "string",
      "created_at": "iso-datetime",
      "note_count": 0,
      "duration_seconds": 0.0,
      "author": {
        "username": "string"
      },
      "tabs": []
    }
  ]
}
```

| Field | Type | Description |
|-------|------|-------------|
| next | string or null | URL for the next page. `null` when no more pages. |
| previous | string or null | URL for the previous page. |
| results | array | Array of melody objects (same shape as current SharedMelodySerializer). |

### Behavior

- When `search` is empty or not provided, returns all public melodies ordered by most recent.
- When `search` is provided, returns only melodies whose title contains the search term (case-insensitive).
- Results are always ordered by `-created_at`.
- Page size: 20 items per page (suitable for infinite scroll).

---

## New Endpoint: GET /api/melodies/search/

**Purpose**: Search across user's own melodies and public melodies. Used by the add-to-setlist modal.

### Request

```
GET /api/melodies/search/?search=<term>
Authorization: Bearer <token>
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| search | string | No | Case-insensitive substring search on melody title. |

### Response (200 OK)

```json
{
  "results": [
    {
      "id": "uuid",
      "title": "string",
      "notation": "string",
      "key": "string",
      "share_id": "string",
      "created_at": "iso-datetime",
      "note_count": 0,
      "duration_seconds": 0.0,
      "author": {
        "username": "string"
      },
      "tabs": []
    }
  ]
}
```

### Behavior

- Requires authentication (returns 401 if not authenticated).
- Returns melodies the user owns OR that are public, de-duplicated.
- When `search` is empty or not provided, returns all accessible melodies ordered by most recent.
- When `search` is provided, returns only melodies whose title matches (case-insensitive substring).
- Results ordered by `-created_at`.
- Paginated (cursor-based, same as `/recent/`).
