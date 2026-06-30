# Quickstart: Notation Format Refactor

## What This Feature Does

Changes the canonical note format from `DO#3` (accidental before octave) to `DO3#` (octave before accidental). Includes migration of all existing data.

## Files to Modify

### Backend (Python)

1. **`backend/melodies/utils.py`**
   - `EXTENDED_NOTE_REGEX` — swap capture groups: `(#|b)?(\d)?` → `(\d)?(#|b)?`
   - `_transpose_notation_text()` — change output string assembly order in `result_token` construction
   - Add `migrate_notation_format(text)` utility function for the migration

2. **`backend/melodies/migrations/NNNN_migrate_notation_format.py`** (new)
   - Django data migration iterating `Melody` and `MelodyTab` records
   - Uses `migrate_notation_format()` from utils

3. **`backend/tests/unit/test_utils.py`**
   - Update test expectations for new format
   - Add tests for migration utility

### Frontend (JavaScript)

4. **`frontend/src/utils/noteParser.js`**
   - `NOTE_REGEX` — swap capture groups: `(#|b)?(\d)?` → `(\d)?(#|b)?`
   - `parseNote()` — adjust destructuring of match groups (swap groups 2 and 3)
   - `noteToString()` — change output assembly: `syllable + accidental + num` → `syllable + num + accidental`

5. **`frontend/src/utils/noteParser.test.js`**
   - Update test expectations for new format output

6. **`frontend/src/utils/transposer.test.js`**
   - Update transposition output expectations

## Implementation Order

1. Write failing tests (TDD Red phase)
2. Update backend regex + `_transpose_notation_text` output
3. Update frontend `noteParser.js` (regex + parseNote + noteToString)
4. Create Django data migration
5. Verify all tests pass (TDD Green phase)
6. Run migration against development database

## Key Insight

The `parseNote()` / regex change affects **input acceptance**. The `noteToString()` / `_transpose_notation_text` change affects **output generation**. The migration handles **existing data**. All three must be updated together for consistency.
