# Research: Inline Melody Lyrics

**Date**: 2026-09-19
**Branch**: `015-inline-melody-lyrics`

## R-001: Parsing Strategy for Quote-Delimited Inline Lyrics

**Decision**: Introduce a tokenizer that splits a line into segments of two types: `notation` (outside quotes) and `lyrics` (inside quotes). The tokenizer processes left-to-right, toggling between modes at each double-quote character.

**Rationale**: This approach is simple, predictable, and handles all spec scenarios:
- `sol sol "text" DO` → `[notation:"sol sol ", lyrics:"text", notation:" DO"]`
- `"text" DO DO DO "text2"` → `[lyrics:"text", notation:" DO DO DO ", lyrics:"text2"]`
- Unmatched quote at end → everything after it is lyrics

The existing `isNoteLine` majority-vote logic continues to work on the notation segments, while lyrics segments are always rendered in lyrics style.

**Alternatives considered**:
- Regex-based extraction (`/"[^"]*"/g`) — simpler but harder to handle unmatched quotes and multi-line spans
- AST/parser approach — overkill for this use case

## R-002: Line Classification Enhancement

**Decision**: Add a new classification type `'mixed'` alongside `'notes'`, `'lyrics'`, and `'empty'`. A line is classified as `'mixed'` if it contains at least one quoted segment AND at least one valid notation token outside quotes.

**Rationale**: A dedicated `'mixed'` type keeps the existing classification logic untouched for pure note/lyrics lines (FR-005 backward compatibility) while enabling segment-level rendering for mixed lines.

**Classification logic**:
1. If the line has no quotes → use existing `isNoteLine` majority-vote logic (unchanged)
2. If the line has quotes and notation tokens outside quotes → `'mixed'`
3. If the line has quotes but no notation tokens outside quotes → `'lyrics'`

**Alternatives considered**: Extending `'notes'` type to include embedded lyrics (rejected — breaks the semantic meaning of the type and complicates existing code that switches on line type).

## R-003: Multi-line Quote Handling

**Decision**: Process multi-line quotes during tokenization by tracking an "in-quote" state across lines. When an opening quote is found without a closing quote on the same line, all subsequent lines are treated as lyrics until a closing quote is encountered.

**Rationale**: The spec requires multi-line quotes (US2). The state must be tracked across lines during the `classifyLines` pass, which already iterates all lines.

**Impact**: `classifyLines` currently processes each line independently. It must be updated to carry state between lines.

## R-004: Transposition of Mixed Lines

**Decision**: When transposing a mixed line, only process notation segments. Lyrics segments pass through unchanged. The existing `transposeNotes` function operates on text — it must be made aware of quote-delimited regions to skip them.

**Rationale**: FR-006 requires that quoted lyrics are not transposed. The simplest approach is to split the line into segments, transpose only notation segments, and reassemble.

**Alternatives considered**: Stripping quotes before transposition and re-inserting (rejected — loses positional information).

## R-005: Rendering in MelodyComposer Backdrop

**Decision**: The `renderHighlightedContent` function in MelodyComposer must be updated to handle mixed lines by rendering each segment with its appropriate CSS class (`highlight-notes` or `highlight-lyrics`).

**Rationale**: The composer backdrop currently applies a single class per entire line. For mixed lines, segments need individual spans with different classes.

## R-006: Note Count and Duration Calculation

**Decision**: The note count and duration calculations (used by the Melody model's `save()`) must exclude quoted lyrics segments. Only notation tokens outside quotes contribute to the count.

**Rationale**: FR-010 requires this. The backend `Melody.save()` splits notation on whitespace and counts all tokens — it must be updated to skip quoted segments.
