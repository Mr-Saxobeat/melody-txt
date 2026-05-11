# Data Model: Multi-Instrument Notation

**Feature**: 004-multi-instruments
**Date**: 2026-05-11

## Entity: Instrument (Hardcoded Constants)

Not a DB table — defined as constants in code.

| Name | Key | Offset (concert → written) |
|------|-----|---------------------------|
| Piano | C | 0 |
| Saxophone | Eb | +9 |
| Trumpet | Bb | +2 |
| Trombone | C | 0 |

## Entity: MelodyTab

A single instrument notation tab belonging to a melody.

### Attributes

| Attribute | Type | Constraints |
|-----------|------|-------------|
| id | UUID | Primary key, auto-generated |
| melody | FK → Melody | NOT NULL, CASCADE on melody delete |
| instrument | String | One of: piano, saxophone, trumpet, trombone |
| notation | Text | The notation for this instrument |
| position | Integer | Ordering within the melody's tabs (0-based) |
| suffix | String | Optional user label suffix (max 50 chars) |
| created_at | DateTime | Auto-set |

### Validation Rules

- instrument: required, must be one of the known instrument keys
- Max 10 tabs per melody
- position: non-negative integer, unique within melody

### Indexes

- `(melody, position)` — ordered retrieval
- `(melody, instrument)` — quick lookup by instrument

---

## Updated Entity: Melody

The existing `notation` field becomes a fallback/default. When tabs exist, the API includes them nested. For backward compatibility, melodies without explicit tabs still work — the `notation` field is treated as a "Piano in C" tab.

### Behavior

- `GET /api/melodies/{id}/` returns `tabs: [...]` alongside `notation`
- `GET /api/melodies/shared/{share_id}/` returns `tabs: [...]`
- If no tabs exist, the single `notation` field is the melody content

---

## Transposition Logic

### Concert Pitch Conversion

```
concert_semitone = written_semitone - instrument.offset
written_semitone = concert_semitone + instrument.offset
```

### Any-to-Any Transposition

```
target_written = source_written + (target.offset - source.offset)
```

Or equivalently:
```
net_shift = target.offset - source.offset
transposed_notation = transposeNotes(source_notation, net_shift)
```
