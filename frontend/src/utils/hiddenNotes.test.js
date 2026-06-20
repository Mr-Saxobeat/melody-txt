import { parseHiddenNotes, renderLineWithHiddenNotes, renderLineForView } from './hiddenNotes';
import { isNoteLine } from './transposer';

describe('parseHiddenNotes', () => {
  it('returns empty array for null/empty input', () => {
    expect(parseHiddenNotes(null)).toEqual([]);
    expect(parseHiddenNotes('')).toEqual([]);
  });

  it('finds a single hidden note', () => {
    const result = parseHiddenNotes('do re *breath* mi');
    expect(result).toEqual([{ content: 'breath', start: 6, end: 13 }]);
  });

  it('finds multiple hidden notes on one line', () => {
    const result = parseHiddenNotes('*a* text *b*');
    expect(result).toEqual([
      { content: 'a', start: 0, end: 2 },
      { content: 'b', start: 9, end: 11 },
    ]);
  });

  it('returns empty array for unmatched asterisks', () => {
    expect(parseHiddenNotes('do re * mi fa')).toEqual([]);
    expect(parseHiddenNotes('just a * here')).toEqual([]);
  });

  it('does not match empty content between asterisks', () => {
    expect(parseHiddenNotes('do ** re')).toEqual([]);
  });

  it('handles hidden notes with multiple words', () => {
    const result = parseHiddenNotes('do *multi word note* re');
    expect(result).toEqual([{ content: 'multi word note', start: 3, end: 19 }]);
  });

  it('matches first valid pairs when asterisks overlap', () => {
    const result = parseHiddenNotes('*bold *nested* text*');
    expect(result).toEqual([
      { content: 'bold ', start: 0, end: 6 },
      { content: ' text', start: 13, end: 19 },
    ]);
  });
});

describe('renderLineWithHiddenNotes', () => {
  it('returns empty string for null/empty input', () => {
    expect(renderLineWithHiddenNotes(null)).toBe('');
    expect(renderLineWithHiddenNotes('')).toBe('');
  });

  it('wraps hidden notes in highlight-hidden span with asterisks', () => {
    const result = renderLineWithHiddenNotes('do re *breath* mi', 'notes');
    expect(result).toBe('do re <span class="highlight-hidden">*breath*</span> mi');
  });

  it('uses highlight-hidden-lyrics class for lyric lines', () => {
    const result = renderLineWithHiddenNotes('hello *note* world', 'lyrics');
    expect(result).toBe('hello <span class="highlight-hidden-lyrics">*note*</span> world');
  });

  it('handles multiple hidden notes', () => {
    const result = renderLineWithHiddenNotes('*a* text *b*', 'notes');
    expect(result).toBe('<span class="highlight-hidden">*a*</span> text <span class="highlight-hidden">*b*</span>');
  });

  it('leaves unmatched asterisks as plain text', () => {
    const result = renderLineWithHiddenNotes('do re * mi fa', 'notes');
    expect(result).toBe('do re * mi fa');
  });

  it('escapes HTML in hidden note content', () => {
    const result = renderLineWithHiddenNotes('*<script>*', 'notes');
    expect(result).toBe('<span class="highlight-hidden">*&lt;script&gt;*</span>');
  });
});

describe('renderLineForView', () => {
  it('returns single segment for null/empty input', () => {
    expect(renderLineForView(null)).toEqual([{ text: '', hidden: false }]);
    expect(renderLineForView('')).toEqual([{ text: '', hidden: false }]);
  });

  it('returns content without asterisks for hidden notes', () => {
    const result = renderLineForView('do re *breath* mi fa');
    expect(result).toEqual([
      { text: 'do re ', hidden: false },
      { text: 'breath', hidden: true },
      { text: ' mi fa', hidden: false },
    ]);
  });

  it('handles multiple hidden notes', () => {
    const result = renderLineForView('*a* text *b*');
    expect(result).toEqual([
      { text: 'a', hidden: true },
      { text: ' text ', hidden: false },
      { text: 'b', hidden: true },
    ]);
  });

  it('returns full line as single non-hidden segment when no hidden notes', () => {
    const result = renderLineForView('do re mi fa');
    expect(result).toEqual([{ text: 'do re mi fa', hidden: false }]);
  });

  it('handles hidden note at start of line', () => {
    const result = renderLineForView('*intro* do re mi');
    expect(result).toEqual([
      { text: 'intro', hidden: true },
      { text: ' do re mi', hidden: false },
    ]);
  });

  it('handles hidden note at end of line', () => {
    const result = renderLineForView('do re mi *end*');
    expect(result).toEqual([
      { text: 'do re mi ', hidden: false },
      { text: 'end', hidden: true },
    ]);
  });

  it('leaves unmatched asterisks as-is', () => {
    const result = renderLineForView('do re * mi fa');
    expect(result).toEqual([{ text: 'do re * mi fa', hidden: false }]);
  });
});

describe('integration: hidden notes with line classification', () => {
  it('isNoteLine still detects note lines with hidden notes', () => {
    expect(isNoteLine('do re *do mi* fa')).toBe(true);
  });

  it('isNoteLine works with hidden notes containing non-note text', () => {
    expect(isNoteLine('do re *breath* mi fa')).toBe(true);
  });

  it('isNoteLine classifies line with mostly hidden non-note text as lyrics', () => {
    expect(isNoteLine('*this is a lyric line with annotations*')).toBe(false);
  });
});
