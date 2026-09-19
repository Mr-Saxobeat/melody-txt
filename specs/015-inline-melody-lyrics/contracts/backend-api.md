# Backend API Contracts: Inline Melody Lyrics

## No REST API Changes

The backend REST API is unchanged — no new endpoints, no modified request/response schemas. The `notation` field continues to accept and return raw text. Quote-delimited lyrics are stored as-is.

## Updated Internal Functions

### `melodies/utils.py`

#### `strip_quoted_segments(text: str) -> str` (NEW)

Removes double-quote-delimited segments (and the quotes) from a text string, returning only the non-quoted portions. Used to count notation tokens without counting lyrics.

```python
# Input: 'sol sol "Parabéns pra você" DO si'
# Output: 'sol sol  DO si'

# Input: '"just lyrics"'
# Output: ''

# Input: 'no quotes at all'
# Output: 'no quotes at all'
```

### `melodies/models.py`

#### `Melody.save()`

Updated to use `strip_quoted_segments()` before counting syllables:

```python
def save(self, *args, **kwargs):
    if not self.share_id:
        self.share_id = generate_share_id()

    stripped = strip_quoted_segments(self.notation)
    syllables = stripped.split()
    self.note_count = len(syllables)
    self.duration_seconds = self.note_count * 0.5

    super().save(*args, **kwargs)
```

#### `Melody.clean()`

No changes. Validation (`is_valid_solfege_notation`) applies to the raw notation — the presence of quotes does not invalidate the notation. Lines with only quoted text are classified as lyrics and skipped by the validator. **Note**: `is_valid_solfege_notation` checks whether at least one note line exists; a melody with only quoted lyrics and no notation tokens should still fail validation (a melody needs at least some notes).
