# Data Model: Octave Notation Change

## Entity Changes

**No schema changes required.** This feature modifies notation parsing/rendering logic only.

### Note Parsing Rules (changed)

| Input Pattern | Octave Formula | Example | Octave |
|---------------|---------------|---------|--------|
| lowercase (no number) | 4 | `do` | 4 |
| lowercase + N | 4 - N | `do1` | 3 |
| UPPERCASE (no number) | 5 | `DO` | 5 |
| UPPERCASE + N (N=1,2) | 5 + N | `DO1` | 6 (backward compat) |
| UPPERCASE + N (N>=3) | N + 3 | `DO3` | 6 (new format) |

### Note Rendering Rules (changed)

| Octave | Output Format | Previous Output |
|--------|--------------|-----------------|
| 4 | `do` | `do` (unchanged) |
| 3 | `do1` | `do1` (unchanged) |
| 2 | `do2` | `do2` (unchanged) |
| 5 | `DO` | `DO` (unchanged) |
| 6 | `DO3` | `DO1` (CHANGED) |
| 7 | `DO4` | `DO2` (CHANGED) |
| 8 | `DO5` | `DO3` (CHANGED) |

### Rendering Formula

```
if octave == 4: lowercase, no number
if octave == 5: UPPERCASE, no number
if octave < 4: lowercase + str(4 - octave)
if octave > 5: UPPERCASE + str(octave - 3)
```

Previous: `if octave > 5: UPPERCASE + str(octave - 5)`  
New: `if octave > 5: UPPERCASE + str(octave - 3)`

### Parsing Formula

```
if uppercase and number >= 3: octave = number + 3
if uppercase and number < 3:  octave = 5 + number   (backward compat)
if uppercase and no number:   octave = 5
if lowercase and number:      octave = 4 - number
if lowercase and no number:   octave = 4
```

## Migrations

None required. Stored notation strings remain unchanged in the database. The backward-compatible parsing handles both old (`DO1`) and new (`DO3`) formats for the same octave.
