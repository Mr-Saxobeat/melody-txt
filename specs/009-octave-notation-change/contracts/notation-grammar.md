# Notation Grammar Contract: Octave Notation Change

## Grammar

```
note     := syllable accidental? octave_marker?
syllable := "do" | "re" | "mi" | "fa" | "sol" | "la" | "si"
           | "DO" | "RE" | "MI" | "FA" | "SOL" | "LA" | "SI"
accidental := "#" | "b"
octave_marker := digit
digit    := "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9"
```

## Parsing Contract

| Input | Expected Semitone | Octave |
|-------|-------------------|--------|
| `do` | 48 | 4 |
| `DO` | 60 | 5 |
| `DO3` | 72 | 6 |
| `DO4` | 84 | 7 |
| `DO5` | 96 | 8 |
| `DO1` | 72 | 6 (backward compat) |
| `DO2` | 84 | 7 (backward compat) |
| `do1` | 36 | 3 |
| `do2` | 24 | 2 |
| `DO#3` | 73 | 6 |
| `REb3` | 73 | 6 |

## Rendering Contract

| Semitone | Expected Output (prefer sharp) | Expected Output (prefer flat) |
|----------|-------------------------------|------------------------------|
| 48 | `do` | `do` |
| 60 | `DO` | `DO` |
| 72 | `DO3` | `DO3` |
| 84 | `DO4` | `DO4` |
| 96 | `DO5` | `DO5` |
| 36 | `do1` | `do1` |
| 24 | `do2` | `do2` |
| 73 | `DO#3` | `REb3` |

## Invariants

1. `parseNote(noteToString(semitone)).semitone === semitone` (round-trip identity)
2. Rendering never produces `DO1` or `DO2` — always uses `DO3`, `DO4` for octaves 6, 7
3. Parsing accepts both old (`DO1`) and new (`DO3`) for octave 6 — they produce the same semitone
