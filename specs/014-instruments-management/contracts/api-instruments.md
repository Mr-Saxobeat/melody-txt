# API Contract: Instruments

**Base path**: `/api/instruments/`

## GET /api/instruments/

List all instruments, ordered alphabetically by name.

**Auth**: None required (public endpoint — instruments are needed by all users for tab display)

**Response** `200 OK`:
```json
[
  {
    "id": "uuid",
    "name": "Piano",
    "pitch": "C",
    "offset": 0
  },
  {
    "id": "uuid",
    "name": "Saxophone",
    "pitch": "Eb",
    "offset": 9
  }
]
```

## Changes to Existing Endpoints

### POST /api/melodies/{melody_id}/tabs/

**Change**: The `instrument` field now accepts an Instrument UUID (string) instead of a hardcoded slug.

**Request body** (updated):
```json
{
  "instrument": "uuid-of-instrument",
  "source_instrument": "uuid-of-source-instrument",
  "notation": "Do Re Mi",
  "position": 0,
  "suffix": "1st"
}
```

**New error response** `400 Bad Request` (deleted instrument):
```json
{
  "instrument": "Instrument not found."
}
```

### GET /api/melodies/{melody_id}/tabs/

**Change**: Tab serialization now includes full instrument details.

**Response item** (updated):
```json
{
  "id": "uuid",
  "instrument": {
    "id": "uuid",
    "name": "Trumpet",
    "pitch": "Bb",
    "offset": 2
  },
  "notation": "Re Mi Fa#",
  "position": 0,
  "suffix": null,
  "created_at": "2026-09-18T10:00:00Z"
}
```

### Melody serializers (MelodySerializer, SharedMelodySerializer)

**Change**: The nested `tabs` field now includes full instrument objects (same structure as above) instead of a plain instrument string.
