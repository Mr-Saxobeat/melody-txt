# Data Model: Inline Melody Lyrics

**Date**: 2026-09-19
**Branch**: `015-inline-melody-lyrics`

## No Schema Changes Required

This feature does not add or modify any database entities. The `Melody.notation` and `MelodyTab.notation` fields already store raw text — the quote-delimited inline lyrics format is stored as-is in these existing fields (FR-009).

## Conceptual Entities (Frontend Only)

### Line Segment

A line segment is a parsed portion of a single line of notation text. Not stored in the database — computed at render time.

| Property | Type   | Description                                      |
|----------|--------|--------------------------------------------------|
| text     | string | The segment content (quotes stripped for lyrics)  |
| type     | enum   | `'notation'` or `'lyrics'`                        |

### Classified Line (Updated)

The existing classified line structure gains a new type value and an optional segments array.

| Property  | Type             | Description                                              |
|-----------|------------------|----------------------------------------------------------|
| text      | string           | The raw line text (unchanged)                            |
| type      | enum             | `'notes'`, `'lyrics'`, `'empty'`, or `'mixed'` (new)    |
| segments  | LineSegment[]    | Present only for `'mixed'` lines; absent for other types |

### Multi-line Quote State

Tracked during `classifyLines` iteration but not stored.

| Property | Type    | Description                                   |
|----------|---------|-----------------------------------------------|
| inQuote  | boolean | Whether currently inside an unclosed quote     |

## Impact on Existing Fields

### Melody.notation / MelodyTab.notation

- **Storage**: No change — raw text with quotes is stored as-is
- **Note count**: Backend `Melody.save()` must skip quoted segments when counting syllables
- **Duration**: Derived from note count — automatically correct once count is fixed

## Backward Compatibility

All existing melodies without quotes are unaffected:
- Lines without quotes continue through the existing `isNoteLine` majority-vote path
- The new `'mixed'` classification only activates when quotes are present
- No migration needed
