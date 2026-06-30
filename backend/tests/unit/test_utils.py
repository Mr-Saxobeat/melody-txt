"""Unit tests for solfege utility functions."""

import pytest
from melodies.utils import (
    is_valid_solfege_notation,
    is_valid_note_token,
    migrate_notation_format,
    parse_solfege_notation,
    get_semitone_offset,
    transpose_solfege_to_key,
)


class TestSolfegeValidation:
    """Test solfege notation validation."""

    def test_is_valid_solfege_notation_with_valid_input(self):
        """Test validation accepts valid solfege syllables."""
        assert is_valid_solfege_notation("do re mi") is True
        assert is_valid_solfege_notation("do re mi fa sol la si") is True
        assert is_valid_solfege_notation("do mi sol") is True

    def test_is_valid_solfege_notation_case_insensitive(self):
        """Test validation is case-insensitive."""
        assert is_valid_solfege_notation("Do Re Mi") is True
        assert is_valid_solfege_notation("DO RE MI") is True
        assert is_valid_solfege_notation("dO rE mI") is True

    def test_is_valid_solfege_notation_accepts_lyrics(self):
        """Test validation accepts lyrics lines (not rejected)."""
        assert is_valid_solfege_notation("da de di") is True
        assert is_valid_solfege_notation("do re xyz") is True
        assert is_valid_solfege_notation("hello world") is True

    def test_is_valid_solfege_notation_mixed_notes_and_lyrics(self):
        """Test validation accepts mixed notes and lyrics."""
        assert is_valid_solfege_notation("do re mi\nHappy birthday") is True

    def test_is_valid_solfege_notation_whitespace_handling(self):
        """Test validation handles whitespace correctly."""
        assert is_valid_solfege_notation("  do   re   mi  ") is True
        assert is_valid_solfege_notation("do\tre\nmi") is True

    def test_is_valid_solfege_notation_with_commas(self):
        """Test validation accepts comma-separated syllables."""
        assert is_valid_solfege_notation("do, re, mi") is True
        assert is_valid_solfege_notation("do,re,mi") is True

    def test_is_valid_solfege_notation_empty_string(self):
        """Test validation rejects empty string."""
        assert is_valid_solfege_notation("") is False
        assert is_valid_solfege_notation("   ") is False


class TestSolfegeParsing:
    """Test solfege notation parsing."""

    def test_parse_solfege_notation_basic(self):
        """Test parsing basic solfege notation."""
        result = parse_solfege_notation("do re mi")
        assert result == ["do", "re", "mi"]

    def test_parse_solfege_notation_preserves_case(self):
        """Test parsing preserves case for octave detection."""
        result = parse_solfege_notation("Do Re Mi")
        assert result == ["Do", "Re", "Mi"]

        result = parse_solfege_notation("DO RE MI")
        assert result == ["DO", "RE", "MI"]

    def test_parse_solfege_notation_handles_extra_whitespace(self):
        """Test parsing handles extra whitespace."""
        result = parse_solfege_notation("  do   re   mi  ")
        assert result == ["do", "re", "mi"]

    def test_parse_solfege_notation_with_commas(self):
        """Test parsing handles comma separators."""
        result = parse_solfege_notation("do, re, mi")
        assert result == ["do", "re", "mi"]

        result = parse_solfege_notation("do,re,mi")
        assert result == ["do", "re", "mi"]

    def test_parse_solfege_notation_mixed_separators(self):
        """Test parsing handles mixed separators."""
        result = parse_solfege_notation("do re, mi fa")
        assert result == ["do", "re", "mi", "fa"]

    def test_parse_solfege_notation_rejects_empty(self):
        """Test parsing raises error for empty input."""
        with pytest.raises(ValueError, match="empty"):
            parse_solfege_notation("")

        with pytest.raises(ValueError, match="empty"):
            parse_solfege_notation("   ")

    def test_parse_solfege_notation_all_syllables(self):
        """Test parsing all valid solfege syllables."""
        result = parse_solfege_notation("do re mi fa sol la si")
        assert result == ["do", "re", "mi", "fa", "sol", "la", "si"]


class TestExtendedNotation:
    """Test extended notation validation (accidentals, octaves)."""

    def test_valid_accidentals(self):
        assert is_valid_solfege_notation("do# re# fa") is True
        assert is_valid_solfege_notation("reb mib sol") is True
        assert is_valid_solfege_notation("fa# solb") is True

    def test_valid_uppercase_octave(self):
        assert is_valid_solfege_notation("DO RE MI") is True
        assert is_valid_solfege_notation("DO3 RE3") is True

    def test_valid_lowercase_octave(self):
        assert is_valid_solfege_notation("do1 re1 mi1") is True
        assert is_valid_solfege_notation("sol2") is True

    def test_valid_new_format_octave_before_accidental(self):
        assert is_valid_note_token("DO3#") is True
        assert is_valid_note_token("RE3b") is True
        assert is_valid_note_token("sol1b") is True
        assert is_valid_note_token("mi1#") is True
        assert is_valid_note_token("DO4#") is True

    def test_old_format_accidental_before_octave_rejected(self):
        assert is_valid_note_token("DO#3") is False
        assert is_valid_note_token("REb2") is False
        assert is_valid_note_token("FA#1") is False
        assert is_valid_note_token("sol#1") is False

    def test_octave_number_validation_uppercase_rejects_1_and_2(self):
        assert is_valid_note_token("FA2#") is False
        assert is_valid_note_token("DO1b") is False
        assert is_valid_note_token("DO1") is False
        assert is_valid_note_token("RE2") is False
        assert is_valid_note_token("DO3#") is True
        assert is_valid_note_token("do1b") is True
        assert is_valid_note_token("do2#") is True

    def test_text_with_non_notes_treated_as_lyrics(self):
        assert is_valid_solfege_notation("dox") is True
        assert is_valid_solfege_notation("re##") is True

    def test_mixed_valid_notation(self):
        assert is_valid_solfege_notation("do DO do1 DO3 do# reb") is True

    def test_backward_compatible_plain_notation(self):
        assert is_valid_solfege_notation("do re mi fa sol la si") is True

    def test_no_regression_accidental_without_octave(self):
        assert is_valid_note_token("do#") is True
        assert is_valid_note_token("REb") is True
        assert is_valid_note_token("SOL#") is True
        assert is_valid_note_token("fab") is True

    def test_no_regression_octave_without_accidental(self):
        assert is_valid_note_token("DO3") is True
        assert is_valid_note_token("re1") is True
        assert is_valid_note_token("do") is True
        assert is_valid_note_token("DO") is True


class TestSemitoneOffset:
    """Test semitone offset calculation."""

    def test_c_to_g_is_7(self):
        assert get_semitone_offset('C', 'G') == 7

    def test_c_to_eb_is_3(self):
        assert get_semitone_offset('C', 'Eb') == 3

    def test_c_to_c_is_0(self):
        assert get_semitone_offset('C', 'C') == 0

    def test_g_to_c_is_5(self):
        assert get_semitone_offset('G', 'C') == 5

    def test_all_keys_produce_valid_offsets(self):
        from melodies.utils import KEY_TO_SEMITONE
        for key in KEY_TO_SEMITONE:
            offset = get_semitone_offset('C', key)
            assert 0 <= offset < 12


class TestTransposeSolfegeToKey:
    """Test solfege transposition to different keys."""

    def test_transpose_c_to_g(self):
        result = transpose_solfege_to_key('do re mi', 'C', 'G')
        assert len(result) == 3
        assert result[0]['solfege'] == 'do'
        assert result[0]['pitch'] == 'G4'
        assert result[1]['pitch'] == 'A4'
        assert result[2]['pitch'] == 'B4'

    def test_transpose_c_to_c_unchanged(self):
        result = transpose_solfege_to_key('do mi sol', 'C', 'C')
        assert result[0]['pitch'] == 'C4'
        assert result[1]['pitch'] == 'E4'
        assert result[2]['pitch'] == 'G4'

    def test_transpose_returns_frequencies(self):
        result = transpose_solfege_to_key('la', 'C', 'C')
        assert result[0]['frequency'] == 440.0

    def test_transpose_wraps_octave(self):
        result = transpose_solfege_to_key('si', 'C', 'G')
        assert result[0]['pitch'] == 'F#5'

    def test_transpose_all_syllables(self):
        result = transpose_solfege_to_key('do re mi fa sol la si', 'C', 'C')
        expected_pitches = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4']
        for i, expected in enumerate(expected_pitches):
            assert result[i]['pitch'] == expected


class TestMigrateNotationFormat:
    """Test notation format migration from old to new."""

    def test_migrates_old_format_to_new(self):
        assert migrate_notation_format("DO#3 REb2") == "DO3# RE2b"

    def test_migrates_mixed_content(self):
        assert migrate_notation_format("do re DO#3 mi") == "do re DO3# mi"

    def test_preserves_plain_notes(self):
        assert migrate_notation_format("do re mi fa sol") == "do re mi fa sol"

    def test_preserves_notes_without_octave(self):
        assert migrate_notation_format("do# REb SOL#") == "do# REb SOL#"

    def test_preserves_notes_without_accidental(self):
        assert migrate_notation_format("DO3 re1 mi") == "DO3 re1 mi"

    def test_preserves_lyrics_lines(self):
        text = "DO#3 RE#3\nHappy birthday\nFA#1"
        expected = "DO3# RE3#\nHappy birthday\nFA1#"
        assert migrate_notation_format(text) == expected

    def test_idempotent(self):
        text = "DO3# RE2b FA1#"
        assert migrate_notation_format(text) == text

    def test_handles_empty_input(self):
        assert migrate_notation_format("") == ""
        assert migrate_notation_format(None) is None

    def test_handles_lowercase_old_format(self):
        assert migrate_notation_format("sol#1 do#2") == "sol1# do2#"

    def test_melodytab_notation(self):
        assert migrate_notation_format("FA#3 SOL#3 LA#3") == "FA3# SOL3# LA3#"
