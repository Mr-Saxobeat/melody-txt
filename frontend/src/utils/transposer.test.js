import { transposeNotes, transposeUp, transposeDown } from './transposer';

describe('transposeNotes', () => {
  test('transposes up half step', () => {
    expect(transposeNotes('do re mi', 1)).toBe('do# re# fa');
  });

  test('transposes up whole step', () => {
    expect(transposeNotes('do re mi', 2)).toBe('re mi fa#');
  });

  test('transposes down half step', () => {
    expect(transposeNotes('do re mi', -1)).toBe('si1 reb mib');
  });

  test('transposes down whole step', () => {
    expect(transposeNotes('do re mi', -2)).toBe('sib1 do re');
  });

  test('cumulative transposition: up whole step twice = up 4 semitones', () => {
    const first = transposeNotes('do re mi', 2);
    const second = transposeNotes(first, 2);
    expect(second).toBe('mi fa# sol#');
  });

  test('wraps octave: si up half step becomes DO', () => {
    expect(transposeNotes('si', 1)).toBe('DO');
  });

  test('wraps octave: do down half step becomes si1', () => {
    expect(transposeNotes('do', -1)).toBe('si1');
  });

  test('12 half steps up = one octave (do → DO)', () => {
    expect(transposeNotes('do re mi', 12)).toBe('DO RE MI');
  });

  test('handles accidentals: do# up half step = re', () => {
    expect(transposeNotes('do#', 1)).toBe('re');
  });

  test('handles uppercase notes', () => {
    expect(transposeNotes('DO RE MI', 1)).toBe('DO# RE# FA');
  });

  test('prefers sharps when transposing up', () => {
    const result = transposeNotes('do', 1);
    expect(result).toBe('do#');
  });

  test('prefers flats when transposing down', () => {
    const result = transposeNotes('re', -1);
    expect(result).toBe('reb');
  });

  test('returns empty/unchanged for empty input', () => {
    expect(transposeNotes('', 1)).toBe('');
    expect(transposeNotes('   ', 1)).toBe('   ');
  });

  test('treats line with invalid token as lyrics (unchanged)', () => {
    expect(transposeNotes('do xyz mi', 1)).toBe('do xyz mi');
  });

  test('preserves whitespace formatting between notes', () => {
    expect(transposeNotes('do  re  mi', 1)).toBe('do#  re#  fa');
    expect(transposeNotes('do   re', 2)).toBe('re   mi');
  });

  test('preserves newlines in notation', () => {
    expect(transposeNotes('do re\nmi fa', 1)).toBe('do# re#\nfa fa#');
  });

  test('preserves leading and trailing whitespace', () => {
    expect(transposeNotes('  do re  ', 1)).toBe('  do# re#  ');
  });

  test('only transposes note lines, preserves lyrics lines', () => {
    expect(transposeNotes('do re mi\nHappy birthday\nfa sol', 1)).toBe('do# re# fa\nHappy birthday\nfa# sol#');
  });

  test('line with any non-note token is treated as lyrics', () => {
    expect(transposeNotes('do re hello\ndo re mi', 1)).toBe('do re hello\ndo# re# fa');
  });

  test('ignores symbol tokens (|, :, etc.) when classifying lines', () => {
    expect(transposeNotes('||: LA LA LA SOL :||', 1)).toBe('||: LA# LA# LA# SOL# :||');
  });

  test('symbol-only tokens are preserved unchanged during transposition', () => {
    expect(transposeNotes('| do re mi |', 2)).toBe('| re mi fa# |');
  });

  test('parentheses as standalone tokens are ignored symbols', () => {
    expect(transposeNotes('( do re mi )', 1)).toBe('( do# re# fa )');
  });

  test('standalone numbers are ignored symbols', () => {
    expect(transposeNotes('1 do re mi 2 fa sol la', 1)).toBe('1 do# re# fa 2 fa# sol# la#');
  });
});

describe('transposeUp', () => {
  test('defaults to half step', () => {
    expect(transposeUp('do')).toBe('do#');
  });

  test('accepts custom half steps', () => {
    expect(transposeUp('do', 2)).toBe('re');
  });
});

describe('transposeDown', () => {
  test('defaults to half step', () => {
    expect(transposeDown('re')).toBe('reb');
  });

  test('accepts custom half steps', () => {
    expect(transposeDown('re', 2)).toBe('do');
  });
});
