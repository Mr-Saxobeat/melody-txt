# Quickstart: Octave Notation Change

## What This Feature Does

Changes the upper-octave numbering so that `DO3` = octave 6, `DO4` = octave 7, etc. Previously `DO1` = octave 6 and `DO2` = octave 7. Lower octaves and base octaves are unchanged.

## Key Changes

### Frontend (`frontend/src/utils/noteParser.js`)

**`parseNote()` — line 54-55**:
```javascript
// OLD:
octave = 5 + number;

// NEW:
octave = number >= 3 ? number + 3 : 5 + number;
```

**`noteToString()` — line 83-84**:
```javascript
// OLD:
const num = octave - 5;
notation = syllable.toUpperCase() + accidental + (num > 0 ? num : '');

// NEW:
const num = octave - 3;
notation = syllable.toUpperCase() + accidental + num;
```

### Backend (`backend/melodies/utils.py`)

**`_transpose_notation_text()` — line 278**:
```python
# OLD:
octave = 5 + (int(number_str) if number_str else 0)

# NEW:
n = int(number_str) if number_str else 0
octave = (n + 3) if n >= 3 else (5 + n)
```

**`_transpose_notation_text()` — line 303-304**:
```python
# OLD:
num = new_octave - 5
result_token = new_syllable.capitalize() + new_acc + (str(num) if num > 0 else '')

# NEW:
num = new_octave - 3
result_token = new_syllable.capitalize() + new_acc + str(num)
```

### Tests

**`frontend/src/utils/noteParser.test.js`**:
- Update `'parses uppercase + number as higher octaves'` test expectations
- Update `'converts higher octaves with number suffix'` test expectations
- Add backward compatibility tests

**`backend/tests/unit/test_utils.py`**: Update any octave-related assertions.

## What NOT to Change

- Lower octave parsing (lowercase + number)
- Base octave parsing (lowercase without number = 4, uppercase without number = 5)
- Database schema or stored data
- Audio engine (works with semitone values, not notation strings)
- API endpoints or serializers

## Testing

```bash
# Frontend tests
cd frontend && npm test -- --testPathPattern=noteParser

# Backend tests
cd backend && ./venv/bin/python -m pytest tests/unit/test_utils.py -v
```

## Risk Assessment

- **Medium risk**: Formula change affects all notation parsing/rendering. Existing melodies with `DO1`/`DO2` are handled by backward-compatible branch.
- **Rollback**: Revert the formula changes (2 files, 4 locations).
