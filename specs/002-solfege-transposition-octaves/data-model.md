# Data Model: Solfege Transposition, Octaves & Accidentals

**Feature**: 002-solfege-transposition-octaves
**Date**: 2026-05-08

## Entity: Note (Parsed Representation)

A parsed note represents a single solfege token from the notation string.

### Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| `syllable` | String | Base solfege name: do, re, mi, fa, sol, la, si |
| `accidental` | String | Optional: "#" (sharp), "b" (flat), or "" (natural) |
| `octave` | Integer | Absolute octave number (2-7) |
| `semitone` | Integer | Absolute semitone value (0 = C0, 48 = C4, etc.) |

### Notation String Format

```
[case][syllable][accidental][number]
```

- **case**: lowercase = octave 4 base; UPPERCASE = octave 5 base
- **syllable**: do, re, mi, fa, sol, la, si (case follows first letter)
- **accidental** (optional): `#` for sharp, `b` for flat
- **number** (optional): offset from base octave

### Examples

| Notation | Syllable | Accidental | Octave | Semitone |
|----------|----------|------------|--------|----------|
| do       | do       |            | 4      | 48       |
| do#      | do       | #          | 4      | 49       |
| reb      | re       | b          | 4      | 49       |
| DO       | do       |            | 5      | 60       |
| DO#1     | do       | #          | 6      | 73       |
| si1      | si       |            | 3      | 47       |
| sol2     | sol      |            | 2      | 31       |

### Validation Rules

- Syllable MUST be one of: do, re, mi, fa, sol, la, si (case-insensitive for matching)
- Accidental MUST be `#`, `b`, or absent
- Resulting octave MUST be within range 2-7 (C2 to B7)
- Combined notation like "mi#" is valid (equals "fa" enharmonically)
- Combined notation like "dob" is valid (equals "si" of previous octave)

## Entity: Transposition Operation

Represents a transposition applied to the entire notation.

### Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| `direction` | String | "up" or "down" |
| `interval` | Integer | 1 (half step) or 2 (whole step) |
| `semitones` | Integer | Computed: +1, +2, -1, or -2 |

### Behavior

- Operates on ALL notes in the input simultaneously
- Modifies the notation text in-place (cumulative)
- Each click produces a new transposition relative to current state
- Wraps octaves: si+1 → DO (lowercase octave 4 → uppercase octave 5)
- Wraps octaves: do-1 → si1 (lowercase octave 4 → lowercase+1 = octave 3)

## Existing Entity: Melody (Updated)

The `notation` field in the existing Melody model now accepts extended notation.

### Updated Validation

- Old format still valid: "do re mi fa sol la si"
- New format additionally valid: "do1 DO#1 reb mi sol# SI"
- Mixed format valid: "do re mi DO sol# si1"
- Maximum 10,000 notes unchanged
- Accidentals and octave markers do not count as separate notes

## Semitone Mapping Reference

| Semitone (mod 12) | Sharp Name | Flat Name |
|-------------------|-----------|-----------|
| 0                 | do        | do        |
| 1                 | do#       | reb       |
| 2                 | re        | re        |
| 3                 | re#       | mib       |
| 4                 | mi        | mi        |
| 5                 | fa        | fa        |
| 6                 | fa#       | solb      |
| 7                 | sol       | sol       |
| 8                 | sol#      | lab       |
| 9                 | la        | la        |
| 10                | la#       | sib       |
| 11                | si        | si        |
