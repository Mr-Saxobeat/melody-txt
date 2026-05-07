"""Utility functions for melody composition."""

import re
import secrets
import string

# Valid solfege syllables
VALID_SOLFEGE_SYLLABLES = {'do', 're', 'mi', 'fa', 'sol', 'la', 'si'}

# Regex for extended notation: syllable (case-insensitive) + optional accidental + optional octave number
EXTENDED_NOTE_REGEX = re.compile(
    r'^(sol|la|si|do|re|mi|fa)(#|b)?(\d)?$',
    re.IGNORECASE
)

# Symbols that are ignored when determining if a line is notes
IGNORED_SYMBOL_REGEX = re.compile(r'^[|:\-./()0-9]+$')

# Symbols to strip from beginning/end of tokens before validating as notes
STRIP_SYMBOLS_REGEX = re.compile(r'^[|:\-./()]*(.*?)[|:\-./()]*$')


def strip_symbols(token):
    """Strip leading/trailing ignored symbols from a token."""
    match = STRIP_SYMBOLS_REGEX.match(token)
    return match.group(1) if match else token


def is_ignored_symbol(token):
    """Check if a token is composed entirely of ignored symbols/digits."""
    return IGNORED_SYMBOL_REGEX.match(token) is not None


def is_valid_note_token(token):
    """Validate a single note token (supports accidentals, octave markers, and attached symbols)."""
    stripped = strip_symbols(token)
    if not stripped:
        return False
    return EXTENDED_NOTE_REGEX.match(stripped) is not None


def is_note_line(line):
    """Determine if a line contains only notes and ignored symbols (not lyrics)."""
    if not line or not line.strip():
        return False
    tokens = line.strip().split()
    return all(
        is_valid_note_token(token) or is_ignored_symbol(token)
        for token in tokens
    )


def is_valid_solfege_notation(text):
    """
    Validate mixed-content notation (notes + lyrics).

    Line-based validation:
    - Lines with ALL valid note tokens (+ ignored symbols) are note lines
    - Lines with ANY non-note/non-symbol text are lyrics lines (not validated)
    - Text is valid if it contains at least one note line OR is all lyrics

    Supports:
    - Plain syllables: do, re, mi, fa, sol, la, si
    - Accidentals: do#, reb, fa#, mib
    - Octave markers: do1 (C3), DO (C5), DO1 (C6)
    - Combined: DO#1, reb2
    - Attached symbols: (do, mi), -re
    - Ignored symbols: |, :, -, ., /, (, ), standalone digits
    - Lyrics lines: any line with non-note text (skipped)

    Args:
        text (str): Notation text to validate

    Returns:
        bool: True if valid (has note lines or is all lyrics), False if empty
    """
    if not text or not text.strip():
        return False

    return True


def parse_solfege_notation(text):
    """
    Parse solfege notation text into a list of syllables.

    Handles:
    - Case-insensitive input (normalized to lowercase)
    - Multiple separators (spaces, commas, tabs, newlines)
    - Extra whitespace

    Args:
        text (str): Solfege notation text

    Returns:
        list: List of normalized solfege syllables

    Raises:
        ValueError: If text is empty or contains only whitespace
    """
    if not text or not text.strip():
        raise ValueError("Solfege notation cannot be empty")

    # Replace commas with spaces and normalize whitespace
    text = re.sub(r'[,\s]+', ' ', text.strip())

    # Split and preserve case (needed for octave detection)
    syllables = text.split()

    return syllables


SHARE_ID_CHARS = string.ascii_letters + string.digits + '_-'
SHARE_ID_LENGTH = 12


def generate_share_id():
    """
    Generate a unique 12-character URL-safe share ID.

    Returns:
        str: 12-character string from [A-Za-z0-9_-]
    """
    from melodies.models import Melody

    while True:
        share_id = ''.join(secrets.choice(SHARE_ID_CHARS) for _ in range(SHARE_ID_LENGTH))
        if not Melody.objects.filter(share_id=share_id).exists():
            return share_id


SOLFEGE_TO_SEMITONE = {
    'do': 0,
    're': 2,
    'mi': 4,
    'fa': 5,
    'sol': 7,
    'la': 9,
    'si': 11,
}

KEY_TO_SEMITONE = {
    'C': 0, 'C#': 1, 'D': 2, 'Eb': 3, 'E': 4,
    'F': 5, 'F#': 6, 'G': 7, 'Ab': 8, 'A': 9,
    'Bb': 10, 'B': 11,
}

NOTE_NAMES = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B']


def get_semitone_offset(from_key, to_key):
    """
    Calculate semitone offset between two keys.

    Args:
        from_key (str): Source key (e.g., 'C')
        to_key (str): Target key (e.g., 'G')

    Returns:
        int: Semitone offset (positive = up, can wrap around)
    """
    from_val = KEY_TO_SEMITONE.get(from_key, 0)
    to_val = KEY_TO_SEMITONE.get(to_key, 0)
    return (to_val - from_val) % 12


def transpose_solfege_to_key(notation, original_key, target_key):
    """
    Transpose solfege notation from one key to another.

    Returns list of dicts with solfege, pitch name, and frequency.

    Args:
        notation (str): Solfege notation string
        original_key (str): Original key (e.g., 'C')
        target_key (str): Target key (e.g., 'G')

    Returns:
        list: List of dicts with 'solfege', 'pitch', 'frequency' keys
    """
    syllables = parse_solfege_notation(notation)
    offset = get_semitone_offset(original_key, target_key)
    base_octave = 4
    result = []

    for syllable in syllables:
        base_semitone = SOLFEGE_TO_SEMITONE[syllable]
        absolute_semitone = base_semitone + offset
        octave = base_octave + (absolute_semitone // 12)
        note_index = absolute_semitone % 12
        note_name = NOTE_NAMES[note_index]
        pitch = f"{note_name}{octave}"

        # Calculate frequency using A4 = 440Hz
        midi_number = (octave + 1) * 12 + note_index
        a4_midi = 69
        frequency = round(440.0 * (2 ** ((midi_number - a4_midi) / 12)), 2)

        result.append({
            'solfege': syllable,
            'pitch': pitch,
            'frequency': frequency,
        })

    return result


def get_invalid_syllables(text):
    """
    Get list of invalid syllables from notation text.

    Args:
        text (str): Solfege notation text

    Returns:
        list: List of invalid syllables found
    """
    if not text or not text.strip():
        return []

    try:
        syllables = parse_solfege_notation(text)
        return [s for s in syllables if s not in VALID_SOLFEGE_SYLLABLES]
    except ValueError:
        return []
