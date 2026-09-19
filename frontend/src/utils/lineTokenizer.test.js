import { parseLineSegments } from './lineTokenizer';

describe('parseLineSegments', () => {
  test('returns single notation segment for line without quotes', () => {
    expect(parseLineSegments('sol sol la')).toEqual([
      { text: 'sol sol la', type: 'notation' },
    ]);
  });

  test('returns single lyrics segment for entirely quoted line', () => {
    expect(parseLineSegments('"Parabéns pra você"')).toEqual([
      { text: 'Parabéns pra você', type: 'lyrics' },
    ]);
  });

  test('returns mixed segments for notation with inline lyrics', () => {
    expect(parseLineSegments('sol sol "Parabéns pra você" DO si')).toEqual([
      { text: 'sol sol ', type: 'notation' },
      { text: 'Parabéns pra você', type: 'lyrics' },
      { text: ' DO si', type: 'notation' },
    ]);
  });

  test('handles lyrics-first pattern', () => {
    expect(parseLineSegments('"Então me ajude a" DO DO DO "segurar"')).toEqual([
      { text: 'Então me ajude a', type: 'lyrics' },
      { text: ' DO DO DO ', type: 'notation' },
      { text: 'segurar', type: 'lyrics' },
    ]);
  });

  test('treats unmatched trailing quote as lyrics to end of line', () => {
    expect(parseLineSegments('sol sol "unmatched')).toEqual([
      { text: 'sol sol ', type: 'notation' },
      { text: 'unmatched', type: 'lyrics' },
    ]);
  });

  test('discards empty quoted segment (no lyrics segment produced)', () => {
    const result = parseLineSegments('sol ""la');
    expect(result.every((s) => s.type === 'notation')).toBe(true);
    expect(result.some((s) => s.type === 'lyrics')).toBe(false);
  });

  test('returns empty array for empty string', () => {
    expect(parseLineSegments('')).toEqual([]);
  });

  test('returns empty array for null/undefined', () => {
    expect(parseLineSegments(null)).toEqual([]);
    expect(parseLineSegments(undefined)).toEqual([]);
  });

  test('handles line with only a quote character', () => {
    expect(parseLineSegments('"')).toEqual([]);
  });

  test('handles multiple quoted segments', () => {
    expect(parseLineSegments('"hello" sol "world"')).toEqual([
      { text: 'hello', type: 'lyrics' },
      { text: ' sol ', type: 'notation' },
      { text: 'world', type: 'lyrics' },
    ]);
  });

  test('handles quoted segment at end of line', () => {
    expect(parseLineSegments('do re "lyrics"')).toEqual([
      { text: 'do re ', type: 'notation' },
      { text: 'lyrics', type: 'lyrics' },
    ]);
  });

  test('filters out empty notation segments between adjacent quotes', () => {
    expect(parseLineSegments('"a""b"')).toEqual([
      { text: 'a', type: 'lyrics' },
      { text: 'b', type: 'lyrics' },
    ]);
  });
});
