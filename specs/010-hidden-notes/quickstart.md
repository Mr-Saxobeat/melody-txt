# Quickstart: Hidden Notes

## Overview

This feature adds inline hidden notes to the melody editor and viewer. Text wrapped in asterisks (`*like this*`) appears in a muted color. In the editor, asterisks are always visible. In the view page, asterisks are never visible. Hidden notes are purely visual — note parsing and transposition are not affected.

## Key Files to Modify

| File | Change |
|------|--------|
| `frontend/src/utils/hiddenNotes.js` | **NEW** — utility functions: `parseHiddenNotes`, `renderLineWithHiddenNotes` |
| `frontend/src/utils/hiddenNotes.test.js` | **NEW** — tests for hidden note utilities |
| `frontend/src/components/MelodyComposer.js` | Update `renderHighlightedContent` for hidden note styling |
| `frontend/src/components/MelodyComposer.css` | Add `.highlight-hidden` style class |
| `frontend/src/components/MelodyComposer.test.js` | Add tests for hidden note rendering |
| `frontend/src/pages/SharedMelodyPage.js` | Render hidden notes without asterisks in muted style |

**NOT modified**: `transposer.js`, `validation.js`, `noteParser.js` — parsing and transposition work as-is.

## Architecture

```
┌─────────────────────────────────────────────────────┐
│  Storage (DB)                                       │
│  "do re *breath* mi fa"  ← stored with asterisks   │
└──────────────────┬──────────────────────────────────┘
                   │
         ┌─────────┴──────────┐
         │                    │
    Edit Mode            View Mode
         │                    │
    ┌────▼─────┐        ┌────▼──────┐
    │ Composer │        │ SharedPage │
    │          │        │            │
    │ backdrop │        │ spans      │
    │ *text*   │        │ text only  │
    │ (muted)  │        │ (muted)    │
    └──────────┘        └────────────┘

    Note Parsing / Transposing → UNCHANGED
    (operates on full text including hidden note content)
```

## Development Steps

1. **Create `hiddenNotes.js` utility** with `parseHiddenNotes` and `renderLineWithHiddenNotes`
2. **Write tests** for the utility functions (TDD: red-green-refactor)
3. **Update MelodyComposer** backdrop rendering to highlight hidden notes with muted color
4. **Update SharedMelodyPage** to render hidden notes without asterisks
5. **Add CSS** for muted hidden note styling (`.highlight-hidden`)
6. **Component tests** — verify rendering in both editor and view mode

## Running Tests

```bash
cd frontend && npx react-scripts test --watchAll=false
```

## Testing Checklist

- [ ] `parseHiddenNotes` correctly identifies `*text*` positions
- [ ] Unmatched asterisks produce no hidden note matches
- [ ] Editor shows muted color for hidden notes (asterisks visible)
- [ ] View page shows hidden note text without asterisks
- [ ] Note parsing still works with asterisks present (existing behavior)
- [ ] Transposition still works on tokens inside hidden notes
- [ ] Multiple hidden notes on same line each styled independently
