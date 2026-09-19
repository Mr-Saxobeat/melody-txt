# Frontend API Contracts: Inline Melody Lyrics

## New: `lineTokenizer.js`

### `parseLineSegments(line: string): LineSegment[]`

Parses a single line into an ordered array of segments.

```js
// Input: 'sol sol "Parabéns pra você" DO si'
// Output:
[
  { text: 'sol sol ', type: 'notation' },
  { text: 'Parabéns pra você', type: 'lyrics' },
  { text: ' DO si', type: 'notation' }
]

// Input: '"Então me ajude a" DO DO DO "segurar"'
// Output:
[
  { text: 'Então me ajude a', type: 'lyrics' },
  { text: ' DO DO DO ', type: 'notation' },
  { text: 'segurar', type: 'lyrics' }
]

// Input: 'sol sol la' (no quotes)
// Output:
[
  { text: 'sol sol la', type: 'notation' }
]

// Input: 'sol sol "unmatched'
// Output:
[
  { text: 'sol sol ', type: 'notation' },
  { text: 'unmatched', type: 'lyrics' }
]

// Input: '""' (empty quotes)
// Output:
[
  { text: '', type: 'notation' }
]
```

**Rules**:
- Quote characters are consumed, never included in segment text
- Empty segments are filtered out (except when the line itself is empty)
- Unmatched trailing quote: everything after it is lyrics
- Empty quoted segment (`""`) is discarded

---

## Updated: `validation.js`

### `classifyLines(text: string): ClassifiedLine[]`

Updated return type. For mixed lines, includes a `segments` array.

```js
// Type definition (conceptual)
// ClassifiedLine = {
//   text: string,
//   type: 'notes' | 'lyrics' | 'empty' | 'mixed',
//   segments?: LineSegment[]  // present only when type === 'mixed'
// }

// Input: 'sol sol "text" DO\npure lyrics line\nsol la si'
// Output:
[
  { text: 'sol sol "text" DO', type: 'mixed', segments: [
    { text: 'sol sol ', type: 'notation' },
    { text: 'text', type: 'lyrics' },
    { text: ' DO', type: 'notation' }
  ]},
  { text: 'pure lyrics line', type: 'lyrics' },
  { text: 'sol la si', type: 'notes' }
]
```

**Multi-line quote tracking**: An unclosed quote on line N causes all subsequent lines to be classified as `'lyrics'` until a closing quote is found.

### `parseNotes(text: string): string[]`

Updated to exclude tokens inside quoted segments. Returns only notation tokens from note lines and notation segments of mixed lines.

### `countNotes(text: string): number`

Updated — delegates to `parseNotes()`, which now excludes quoted segments.

---

## Updated: `transposer.js`

### `transposeNotes(notation: string, semitones: number, preferSharp?: boolean): string`

Updated to preserve quoted segments verbatim. Notation segments are transposed; lyrics segments are passed through unchanged. Quote characters in the raw text are preserved.

```js
// Input: 'sol sol "happy" DO si', semitones: 1
// Output: 'sol# sol# "happy" DO# do'
```

### `convertAccidentals(notation: string, preferSharp: boolean): string`

Same treatment — quoted segments are preserved.

---

## Updated: `hiddenNotes.js`

**No changes.** Hidden markers (`*text*`) inside a quoted lyrics segment are treated as literal text by the tokenizer (they're inside a lyrics segment, so `renderLineWithHiddenNotes` is not applied to them — the mixed-line renderer handles segments individually).
