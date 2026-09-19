"""Unit tests for strip_quoted_segments utility."""

import pytest
from melodies.utils import strip_quoted_segments


class TestStripQuotedSegments:

    def test_removes_quoted_text_and_quotes(self):
        result = strip_quoted_segments('sol sol "Parabéns pra você" DO si')
        assert result == 'sol sol  DO si'

    def test_preserves_unquoted_text(self):
        result = strip_quoted_segments('do re mi fa sol')
        assert result == 'do re mi fa sol'

    def test_handles_no_quotes_input(self):
        result = strip_quoted_segments('no quotes at all')
        assert result == 'no quotes at all'

    def test_handles_only_quotes_input(self):
        result = strip_quoted_segments('"just lyrics"')
        assert result == ''

    def test_handles_unmatched_trailing_quote(self):
        result = strip_quoted_segments('sol sol "unmatched')
        assert result == 'sol sol '

    def test_handles_multiple_quoted_segments(self):
        result = strip_quoted_segments('"hello" DO DO "world"')
        assert result == ' DO DO '

    def test_handles_empty_string(self):
        result = strip_quoted_segments('')
        assert result == ''

    def test_handles_empty_quoted_segment(self):
        result = strip_quoted_segments('sol ""la')
        assert result == 'sol la'
