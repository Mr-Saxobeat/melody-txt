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
    expect(isValidSolfege('DO1 sol#')).toBe(true);
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

  test('line with any invalid token is lyrics', () => {
    const result = classifyLines('do re hello mi');
    expect(result[0].type).toBe('lyrics');
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
