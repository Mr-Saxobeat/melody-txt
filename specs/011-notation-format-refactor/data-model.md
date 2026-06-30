# Data Model: Notation Format Refactor

## Entities Affected

### Melody

| Field    | Type      | Change                                                                 |
|----------|-----------|------------------------------------------------------------------------|
| notation | TextField | Content migrated: tokens matching `[syllable][accidental][octave]` reordered to `[syllable][octave][accidental]` |

No schema change. Only data content is modified.

### MelodyTab

| Field    | Type      | Change                                                                 |
|----------|-----------|------------------------------------------------------------------------|
| notation | TextField | Same content migration as Melody                                       |

No schema change. Only data content is modified.

## Note Token Format

### Old Format (deprecated)

```
[syllable][accidental?][octave?]
```

Pattern: `(sol|la|si|do|re|mi|fa)(#|b)?(\d)?`

Examples: `DO#3`, `REb2`, `fa#1`, `SOL#`

### New Format (canonical)

```
[syllable][octave?][accidental?]
```

Pattern: `(sol|la|si|do|re|mi|fa)(\d)?(#|b)?`

Examples: `DO3#`, `RE2b`, `fa1#`, `SOL#`

### Unchanged Formats

These formats are unaffected (no reordering needed):

- Plain syllables: `do`, `re`, `mi`, `DO`, `RE`
- Octave only: `DO3`, `re1`, `MI2`
- Accidental only: `do#`, `REb`, `SOL#`

## Validation Rules

1. A valid note token matches: `^(sol|la|si|do|re|mi|fa)(\d)?(#|b)?$` (case-insensitive)
2. Octave number: single digit (0-9)
3. Accidental: exactly one of `#` or `b`
4. Case determines base octave (uppercase = 5+, lowercase = 4-)

## Migration Transformation

**Input regex** (identifies old-format tokens): `(sol|la|si|do|re|mi|fa)(#|b)(\d)`  
**Output**: `\1\3\2`

Applied only to tokens on note lines (lines where >50% of non-ignored tokens are valid notes). Lyrics lines are untouched.
