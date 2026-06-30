import { parseNote, noteToString, parseNotation } from './noteParser';

describe('parseNote', () => {
  test('parses plain lowercase notes as octave 4', () => {
    expect(parseNote('do')).toMatchObject({ syllable: 'do', accidental: '', octave: 4, semitone: 48 });
    expect(parseNote('re')).toMatchObject({ syllable: 're', accidental: '', octave: 4, semitone: 50 });
    expect(parseNote('mi')).toMatchObject({ syllable: 'mi', accidental: '', octave: 4, semitone: 52 });
    expect(parseNote('si')).toMatchObject({ syllable: 'si', accidental: '', octave: 4, semitone: 59 });
  });

  test('parses lowercase + number as lower octaves', () => {
    expect(parseNote('do1')).toMatchObject({ syllable: 'do', octave: 3, semitone: 36 });
    expect(parseNote('do2')).toMatchObject({ syllable: 'do', octave: 2, semitone: 24 });
    expect(parseNote('sol2')).toMatchObject({ syllable: 'sol', octave: 2, semitone: 31 });
  });

  test('parses uppercase as octave 5', () => {
    expect(parseNote('DO')).toMatchObject({ syllable: 'do', octave: 5, semitone: 60 });
    expect(parseNote('RE')).toMatchObject({ syllable: 're', octave: 5, semitone: 62 });
    expect(parseNote('SOL')).toMatchObject({ syllable: 'sol', octave: 5, semitone: 67 });
  });

  test('parses uppercase + number as higher octaves (new notation)', () => {
    expect(parseNote('DO3')).toMatchObject({ syllable: 'do', octave: 6, semitone: 72 });
    expect(parseNote('DO4')).toMatchObject({ syllable: 'do', octave: 7, semitone: 84 });
    expect(parseNote('DO5')).toMatchObject({ syllable: 'do', octave: 8, semitone: 96 });
  });

  test('rejects uppercase with octave number 1 or 2', () => {
    expect(parseNote('DO1')).toBeNull();
    expect(parseNote('DO2')).toBeNull();
    expect(parseNote('FA2')).toBeNull();
    expect(parseNote('RE1')).toBeNull();
  });

  test('parses sharps', () => {
    expect(parseNote('do#')).toMatchObject({ syllable: 'do', accidental: '#', octave: 4, semitone: 49 });
    expect(parseNote('fa#')).toMatchObject({ syllable: 'fa', accidental: '#', octave: 4, semitone: 54 });
  });

  test('parses flats', () => {
    expect(parseNote('reb')).toMatchObject({ syllable: 're', accidental: 'b', octave: 4, semitone: 49 });
    expect(parseNote('mib')).toMatchObject({ syllable: 'mi', accidental: 'b', octave: 4, semitone: 51 });
  });

  test('parses new format: octave before accidental', () => {
    expect(parseNote('DO3#')).toMatchObject({ syllable: 'do', accidental: '#', octave: 6, semitone: 73 });
    expect(parseNote('RE3b')).toMatchObject({ syllable: 're', accidental: 'b', octave: 6, semitone: 73 });
    expect(parseNote('sol1b')).toMatchObject({ syllable: 'sol', accidental: 'b', octave: 3, semitone: 42 });
    expect(parseNote('mi1#')).toMatchObject({ syllable: 'mi', accidental: '#', octave: 3, semitone: 41 });
  });

  test('rejects old format: accidental before octave', () => {
    expect(parseNote('DO#3')).toBeNull();
    expect(parseNote('REb2')).toBeNull();
    expect(parseNote('FA#1')).toBeNull();
  });

  test('rejects uppercase with octave 1 or 2 plus accidental', () => {
    expect(parseNote('FA2#')).toBeNull();
    expect(parseNote('DO1b')).toBeNull();
  });

  test('parses lowercase octave + accidental (new format)', () => {
    expect(parseNote('re2b')).toMatchObject({ syllable: 're', accidental: 'b', octave: 2, semitone: 25 });
    expect(parseNote('do1#')).toMatchObject({ syllable: 'do', accidental: '#', octave: 3, semitone: 37 });
  });

  test('strips leading/trailing symbols before parsing', () => {
    expect(parseNote('(do')).toMatchObject({ syllable: 'do', octave: 4 });
    expect(parseNote('mi)')).toMatchObject({ syllable: 'mi', octave: 4 });
    expect(parseNote('-do')).toMatchObject({ syllable: 'do', octave: 4 });
    expect(parseNote('|DO|')).toMatchObject({ syllable: 'do', octave: 5 });
    expect(parseNote('(re#)')).toMatchObject({ syllable: 're', accidental: '#', octave: 4 });
  });

  test('returns null for invalid input', () => {
    expect(parseNote('')).toBeNull();
    expect(parseNote('xyz')).toBeNull();
    expect(parseNote('dox')).toBeNull();
    expect(parseNote(null)).toBeNull();
  });

  test('enharmonic equivalents have same semitone', () => {
    expect(parseNote('do#').semitone).toBe(parseNote('reb').semitone);
  });
});

describe('noteToString', () => {
  test('converts octave 4 to lowercase', () => {
    expect(noteToString(48)).toBe('do');
    expect(noteToString(50)).toBe('re');
    expect(noteToString(52)).toBe('mi');
  });

  test('converts octave 5 to uppercase', () => {
    expect(noteToString(60)).toBe('DO');
    expect(noteToString(62)).toBe('RE');
  });

  test('converts lower octaves with number suffix', () => {
    expect(noteToString(36)).toBe('do1');
    expect(noteToString(24)).toBe('do2');
  });

  test('converts higher octaves with new number notation', () => {
    expect(noteToString(72)).toBe('DO3');
    expect(noteToString(84)).toBe('DO4');
    expect(noteToString(96)).toBe('DO5');
  });

  test('uses sharps when preferSharp is true', () => {
    expect(noteToString(49, true)).toBe('do#');
    expect(noteToString(51, true)).toBe('re#');
  });

  test('uses flats when preferSharp is false', () => {
    expect(noteToString(49, false)).toBe('reb');
    expect(noteToString(51, false)).toBe('mib');
  });

  test('round-trip identity for upper octaves', () => {
    [72, 84, 96].forEach((semitone) => {
      const str = noteToString(semitone);
      const parsed = parseNote(str);
      expect(parsed.semitone).toBe(semitone);
    });
  });
});

describe('parseNotation', () => {
  test('parses space-separated notation', () => {
    const result = parseNotation('do re mi');
    expect(result).toHaveLength(3);
    expect(result[0].syllable).toBe('do');
    expect(result[2].syllable).toBe('mi');
  });

  test('marks invalid tokens', () => {
    const result = parseNotation('do xyz mi');
    expect(result[1].invalid).toBe(true);
    expect(result[1].original).toBe('xyz');
  });

  test('handles empty input', () => {
    expect(parseNotation('')).toEqual([]);
    expect(parseNotation('   ')).toEqual([]);
  });
});
