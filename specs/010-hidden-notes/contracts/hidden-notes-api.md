# Contract: Hidden Notes Utility API

## `parseHiddenNotes(line: string): HiddenNoteToken[]`

Extracts all hidden note tokens from a line with their positions.

**Input**: A single line of text  
**Output**: Array of `{ content: string, start: number, end: number }`

**Behavior**:
- Matches pairs of asterisks on the same line
- `start` is the index of the opening `*`, `end` is the index of the closing `*`
- Unmatched asterisks produce no results
- Inner content must have at least 1 character and no asterisks

**Examples**:
```
Input:  "do re *breath* mi"
Output: [{ content: "breath", start: 6, end: 13 }]

Input:  "*a* text *b*"
Output: [{ content: "a", start: 0, end: 2 }, { content: "b", start: 9, end: 11 }]

Input:  "do re * mi fa"
Output: []  (unmatched — no closing asterisk with valid content)
```

## `renderLineWithHiddenNotes(line: string): string`

Renders a line as HTML for the editor backdrop layer, applying hidden note styling. Asterisks are always visible in the editor.

**Input**: A single line of text  
**Output**: HTML string with hidden note segments (including asterisks) wrapped in `<span class="highlight-hidden">` elements.

**Behavior**:
- Non-hidden text: rendered as-is (with HTML escaping)
- Hidden note: `<span class="highlight-hidden">*content*</span>` (asterisks always included in editor)
- Unmatched asterisks: rendered as literal characters, no special styling

**Examples**:
```
Input:  "do re *breath* mi"
Output: 'do re <span class="highlight-hidden">*breath*</span> mi'

Input:  "do re * mi fa"
Output: 'do re * mi fa'  (no match, rendered as-is)
```

## `renderLineForView(line: string): React.ReactNode[]`

Renders a line for the SharedMelodyPage view, splitting into normal and hidden-note styled segments. Asterisks are never visible in view mode.

**Input**: A single line of text  
**Output**: Array of React elements — normal text as plain spans, hidden note content in muted spans (no asterisks)

**Examples**:
```
Input:  "do re *breath* mi fa"
Output: [<span>do re </span>, <span class="hidden-note">breath</span>, <span> mi fa</span>]

Input:  "do *DO RE* mi"
Output: [<span>do </span>, <span class="hidden-note">DO RE</span>, <span> mi</span>]
```

## Important: No Parsing Pipeline Changes

Hidden notes are **purely visual**. The note parsing, transposition, and playback pipelines are NOT modified. Tokens inside `*...*` are parsed and transposed normally. The utility functions above are used exclusively for rendering/display purposes.
