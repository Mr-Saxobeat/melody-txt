import {
  isValidSolfege,
  parseNotes,
  getInvalidSyllables,
  classifyLines,
  countNotes,
  estimateDuration,
} from './validation';

describe('isValidSolfege', () => {
  test('accepts valid solfege syllables', () => {
    expect(isValidSolfege('do re mi')).toBe(true);
    expect(isValidSolfege('do re mi fa sol la si')).toBe(true);
  });

  test('accepts uppercase as octave 5 notation', () => {
    expect(isValidSolfege('DO RE MI')).toBe(true);
  });

  test('accepts accidentals and octave markers', () => {
    expect(isValidSolfege('do# re# fa')).toBe(true);
    expect(isValidSolfege('DO3 sol#')).toBe(true);
    expect(isValidSolfege('DO3# RE3b')).toBe(true);
  });

  test('returns false for pure lyrics (no note lines)', () => {
    expect(isValidSolfege('Hello world')).toBe(false);
    expect(isValidSolfege('Happy birthday to you')).toBe(false);
  });

  test('returns true for mixed content with at least one note line', () => {
    expect(isValidSolfege('do re mi\nHappy birthday')).toBe(true);
  });

  test('rejects empty string', () => {
    expect(isValidSolfege('')).toBe(false);
    expect(isValidSolfege('   ')).toBe(false);
  });

  test('accepts lines with ignored symbols (|, :, etc.)', () => {
    expect(isValidSolfege('||: LA LA LA SOL :||')).toBe(true);
    expect(isValidSolfege('| do re mi |')).toBe(true);
  });
});

describe('parseNotes', () => {
  test('extracts notes from note lines only', () => {
    expect(parseNotes('do re mi')).toEqual(['do', 're', 'mi']);
  });

  test('skips lyrics lines', () => {
    expect(parseNotes('do re mi\nHappy birthday\nfa sol')).toEqual(['do', 're', 'mi', 'fa', 'sol']);
  });

  test('preserves case for octave detection', () => {
    expect(parseNotes('DO RE MI')).toEqual(['DO', 'RE', 'MI']);
  });

  test('throws error for empty input', () => {
    expect(() => parseNotes('')).toThrow('empty');
    expect(() => parseNotes('   ')).toThrow('empty');
  });

  test('filters out ignored symbols from playable notes', () => {
    expect(parseNotes('||: LA LA SOL :||')).toEqual(['LA', 'LA', 'SOL']);
    expect(parseNotes('| do re mi |')).toEqual(['do', 're', 'mi']);
  });
});

describe('classifyLines', () => {
  test('classifies note lines', () => {
    const result = classifyLines('do re mi');
    expect(result).toEqual([{ text: 'do re mi', type: 'notes' }]);
  });

  test('classifies lyrics lines', () => {
    const result = classifyLines('Happy birthday');
    expect(result).toEqual([{ text: 'Happy birthday', type: 'lyrics' }]);
  });

  test('classifies empty lines', () => {
    const result = classifyLines('do re\n\nmi fa');
    expect(result[1]).toEqual({ text: '', type: 'empty' });
  });

  test('classifies mixed content', () => {
    const result = classifyLines('do re mi\nHappy birthday\nfa sol');
    expect(result[0].type).toBe('notes');
    expect(result[1].type).toBe('lyrics');
    expect(result[2].type).toBe('notes');
  });

  test('line with majority notes is classified as notes despite unrecognized token', () => {
    const result = classifyLines('do re hello mi');
    expect(result[0].type).toBe('notes');
  });

  test('line with majority non-notes is classified as lyrics', () => {
    const result = classifyLines('hello world do foo');
    expect(result[0].type).toBe('lyrics');
  });
});

describe('classifyLines with inline lyrics', () => {
  test('classifies line with quotes and notation as mixed with segments', () => {
    const result = classifyLines('sol sol "text" DO');
    expect(result[0].type).toBe('mixed');
    expect(result[0].segments).toEqual([
      { text: 'sol sol ', type: 'notation' },
      { text: 'text', type: 'lyrics' },
      { text: ' DO', type: 'notation' },
    ]);
  });

  test('classifies line with only quoted text as lyrics', () => {
    const result = classifyLines('"just some lyrics"');
    expect(result[0].type).toBe('lyrics');
  });

  test('preserves existing behavior for pure note lines', () => {
    const result = classifyLines('do re mi fa sol');
    expect(result[0].type).toBe('notes');
    expect(result[0].segments).toBeUndefined();
  });

  test('preserves existing behavior for pure lyrics lines', () => {
    const result = classifyLines('Happy birthday to you');
    expect(result[0].type).toBe('lyrics');
  });

  test('classifies lyrics-first mixed line', () => {
    const result = classifyLines('"Então" DO DO DO "segurar"');
    expect(result[0].type).toBe('mixed');
    expect(result[0].segments).toHaveLength(3);
    expect(result[0].segments[0].type).toBe('lyrics');
    expect(result[0].segments[1].type).toBe('notation');
    expect(result[0].segments[2].type).toBe('lyrics');
  });

  test('mixed classification works alongside other line types', () => {
    const result = classifyLines('sol "text" DO\nHappy birthday\ndo re mi');
    expect(result[0].type).toBe('mixed');
    expect(result[1].type).toBe('lyrics');
    expect(result[2].type).toBe('notes');
  });

  test('line with quotes but non-note tokens outside quotes is lyrics', () => {
    const result = classifyLines('"lyrics" random words here');
    expect(result[0].type).toBe('lyrics');
  });
});

describe('parseNotes with inline lyrics', () => {
  test('excludes tokens inside quoted segments', () => {
    expect(parseNotes('sol sol "text here" DO si')).toEqual(['sol', 'sol', 'DO', 'si']);
  });

  test('works with pure note lines (no quotes)', () => {
    expect(parseNotes('do re mi')).toEqual(['do', 're', 'mi']);
  });
});

describe('countNotes with inline lyrics', () => {
  test('excludes quoted lyrics from count', () => {
    expect(countNotes('sol sol "Parabéns pra você" DO si')).toBe(4);
  });

  test('works unchanged for pure note lines', () => {
    expect(countNotes('do re mi')).toBe(3);
  });
});

describe('estimateDuration with inline lyrics', () => {
  test('reflects updated count excluding lyrics', () => {
    expect(estimateDuration('sol sol "lyrics" DO si')).toBe(2.0);
  });
});

describe('classifyLines with multi-line quotes', () => {
  test('unclosed quote classifies subsequent lines as lyrics', () => {
    const result = classifyLines('do re "start\nlyrics line\nend" sol la');
    expect(result[0].type).toBe('mixed');
    expect(result[1].type).toBe('lyrics');
    expect(result[2].type).toBe('mixed');
  });

  test('unclosed quote at end of input treats remaining as lyrics', () => {
    const result = classifyLines('do re "start\nlyrics line');
    expect(result[0].type).toBe('mixed');
    expect(result[1].type).toBe('lyrics');
  });

  test('closing quote mid-line resumes notation classification', () => {
    const result = classifyLines('"start\nclosing" do re mi');
    expect(result[0].type).toBe('lyrics');
    expect(result[1].type).toBe('mixed');
  });
});

describe('getInvalidSyllables', () => {
  test('returns empty array for valid notation', () => {
    expect(getInvalidSyllables('do re mi')).toEqual([]);
  });

  test('returns empty for lyrics lines (not validated)', () => {
    expect(getInvalidSyllables('hello world')).toEqual([]);
  });

  test('returns empty array for empty input', () => {
    expect(getInvalidSyllables('')).toEqual([]);
  });
});

describe('countNotes', () => {
  test('counts notes from note lines only', () => {
    expect(countNotes('do re mi')).toBe(3);
    expect(countNotes('do re\nlyrics here\nmi fa')).toBe(4);
  });

  test('returns 0 for empty input', () => {
    expect(countNotes('')).toBe(0);
  });
});

describe('estimateDuration', () => {
  test('estimates duration from note lines only', () => {
    expect(estimateDuration('do re mi')).toBe(1.5);
    expect(estimateDuration('do re\nlyrics\nmi fa')).toBe(2.0);
  });

  test('returns 0 for empty input', () => {
    expect(estimateDuration('')).toBe(0);
  });
});
