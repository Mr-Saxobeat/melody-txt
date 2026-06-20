# Data Model: Hidden Notes

## Entities

### Hidden Note Token

A hidden note is an inline text segment within a melody notation string, delimited by asterisks. It is purely visual — used only for rendering purposes.

**Attributes:**
- `content`: The text between the asterisks (excluding the asterisks themselves)
- `startIndex`: Character position of the opening asterisk in the line
- `endIndex`: Character position of the closing asterisk in the line

**Constraints:**
- Must open and close on the same line
- Inner content must be at least 1 character
- Inner content must not contain asterisks
- Multiple hidden notes may exist on the same line

### Notation String (extended)

The existing notation string stored in the database is extended to support hidden note syntax:

```
do re *breath* mi fa sol
*intro* DO RE MI FA SOL
```

**Storage format**: Raw text with asterisks preserved. No schema change required.

**Parsing behavior**: Note parsing and transposition operate on all tokens normally, including those inside `*...*`. The asterisks themselves are already non-note tokens (they fail `parseNote()`), so existing parsing logic handles them without modification.

## Rendering Modes

### Editor Mode
- Asterisks always visible
- Full `*content*` segment styled with muted color
- No cursor state tracking needed

### View Mode
- Asterisks never visible
- Only inner content rendered, styled with muted color

## Relationships

- A **Melody** contains one or more **lines** of notation text
- Each **line** may contain zero or more **Hidden Note Tokens** interspersed with regular note/lyric content
- Hidden Note Tokens do not affect line classification — the existing `isNoteLine()` logic works as-is since asterisks already fail `parseNote()` and are treated as non-note tokens
