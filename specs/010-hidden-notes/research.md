# Research: Hidden Notes

## R1: Inline Markdown-Style Highlighting in Textarea

**Decision**: Use the existing backdrop/textarea overlay architecture in MelodyComposer to render hidden notes with a muted style. Asterisks are always visible in the editor.

**Rationale**: The MelodyComposer already uses a dual-layer approach (transparent textarea over a styled backdrop div). The highlighting logic in `renderHighlightedContent()` can be extended to detect `*...*` patterns and wrap them in a dedicated CSS class with muted color.

**Alternatives considered**:
- ContentEditable div: Would provide native inline styling but introduces complexity with cursor management, undo/redo, and paste handling. The existing textarea approach is simpler and already works.
- Third-party rich text editor (Draft.js, Slate): Overkill for this feature. The project already has a working overlay system.

## R2: No Parsing/Transposition Changes Needed

**Decision**: Hidden notes are purely visual. Note parsing and transposition operate on all tokens normally, including those inside `*...*`. No `stripHiddenNotes` function is needed for the parsing pipeline.

**Rationale**: The user clarified that hidden notes must be parsed and transposed like any other text. The feature is exclusively about visual presentation (muted color in editor, no asterisks in view). This significantly simplifies implementation — no changes to `transposer.js`, `validation.js`, or `noteParser.js`.

**Alternatives considered**:
- Strip hidden note content before parsing: Rejected — user explicitly stated hidden notes must participate in parsing and transposition.
- Treat hidden notes as non-note tokens: Rejected — tokens that happen to be valid notes inside asterisks should still parse as notes.

## R3: View Page Rendering

**Decision**: In `SharedMelodyPage`, extend the rendering of `classifyLines` output to detect `*...*` patterns within each line's text and render the inner content in a muted span without asterisks.

**Rationale**: The view page already iterates over classified lines and renders spans. Adding inline detection of hidden note patterns within each line's text content is a minimal change. No asterisks are ever shown in view mode.

**Alternatives considered**:
- Pre-process notation server-side before sending to view: Would couple the backend to a frontend presentation concern and lose the ability to show asterisks in edit mode.
- Use a separate CSS class applied at the line level: Won't work because hidden notes can be inline within a notes or lyrics line.

## R4: Hidden Note Regex Pattern

**Decision**: Use regex `/\*([^*]+)\*/g` to match hidden notes. This matches text between a pair of asterisks on the same line, where the inner text contains at least one character and no asterisks.

**Rationale**: Simple, handles the common case (single-line hidden notes), and avoids ambiguity with nested asterisks. Unmatched asterisks are left as literal characters.

**Alternatives considered**:
- Greedy match `/\*(.+?)\*/g`: Same behavior for non-nested cases. The `[^*]+` approach is more explicit about not matching nested asterisks.
- Multi-line support: Rejected per spec — hidden notes are single-line only.
