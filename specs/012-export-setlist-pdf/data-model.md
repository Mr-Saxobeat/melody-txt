# Data Model: Export Setlist to PDF

## Entities

### ExportRequest (transient, in-memory)

Represents a user-initiated export action. Not persisted.

| Field | Type | Description |
|-------|------|-------------|
| setlist | Setlist | The setlist being exported |
| melodies | MelodyData[] | Full melody data fetched for each entry |

### MelodyData (fetched from API)

Existing entity returned by `GET /api/melodies/shared/:shareId/`.

| Field | Type | Description |
|-------|------|-------------|
| id | string | Melody identifier |
| title | string | Melody title |
| notation | string | Default notation (fallback if no tabs) |
| tabs | Tab[] | Instrument-specific notation tabs |

### Tab (existing)

| Field | Type | Description |
|-------|------|-------------|
| id | string | Tab identifier |
| instrument | string | Instrument ID (piano, saxophone, trumpet, trombone) |
| notation | string | Notation content for this instrument |
| position | number | Display order |
| suffix | string | null | Optional label suffix (e.g., "1st", "2nd") |

### PdfPage (transient, render-time)

Represents a single page being rendered in a PDF document.

| Field | Type | Description |
|-------|------|-------------|
| melodyTitle | string | Title of the melody (for fallback/placeholder page) |
| notation | string | null | Notation content to render (null = no tab for instrument) |
| lines | ClassifiedLine[] | Parsed lines with type classification |

### ClassifiedLine (existing utility output)

Output of `classifyLines()` from `validation.js`.

| Field | Type | Description |
|-------|------|-------------|
| text | string | Raw line text |
| type | 'notes' \| 'lyrics' \| 'other' | Line classification |

### RenderSegment (existing utility output)

Output of `renderLineForView()` from `hiddenNotes.js`.

| Field | Type | Description |
|-------|------|-------------|
| text | string | Segment text |
| hidden | boolean | Whether this segment is a hidden note |

## Relationships

```
Setlist 1──* SetlistEntry
SetlistEntry *──1 MelodyData (via melody_share_id)
MelodyData 1──* Tab (via tabs array)
Tab ──> classified into ClassifiedLine[] ──> split into RenderSegment[]
```

## Color Mapping

| Line Type | Visible Color | Hidden (muted) Color | Font Weight |
|-----------|--------------|---------------------|-------------|
| notes | #2e7d32 | hsla(120, 7%, 77%, 1.00) | 600 / 400 |
| lyrics | #e65100 | #ffab91 | 600 / 400 |
| other | #333 | #999 | 600 / 400 |

## No New Persistent Storage

This feature does not introduce new database models or API endpoints. All data is fetched from existing endpoints and processed client-side.
