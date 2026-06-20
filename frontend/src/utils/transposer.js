import { parseNote, noteToString, stripSymbols } from './noteParser';

const IGNORED_SYMBOL_REGEX = /^[|:\-./()0-9,;]+$/;
const REPEAT_MARKER_REGEX = /^\(?(\d+[x,)]*)\)?$/i;

export function isIgnoredSymbol(token) {
  return IGNORED_SYMBOL_REGEX.test(token) || REPEAT_MARKER_REGEX.test(token);
}

export function isNoteLine(line) {
  if (!line || !line.trim()) return false;
  const tokens = line.trim().split(/\s+/);
  const nonIgnored = tokens.filter((t) => !isIgnoredSymbol(t));
  if (nonIgnored.length === 0) return false;
  const noteCount = nonIgnored.filter((t) => parseNote(t) !== null).length;
  return noteCount > nonIgnored.length / 2;
}

export function transposeNotes(notationString, semitones, preferSharp = null) {
  if (!notationString || !notationString.trim()) return notationString;

  const useSharp = preferSharp !== null ? preferSharp : semitones > 0;
  const lines = notationString.split('\n');

  const transposedLines = lines.map((line) => {
    if (!isNoteLine(line)) return line;

    return line.replace(/\S+/g, (token) => {
      const parsed = parseNote(token);
      if (!parsed) return token;
      const stripped = stripSymbols(token);
      const prefixLen = token.indexOf(stripped);
      const prefix = token.slice(0, prefixLen);
      const suffix = token.slice(prefixLen + stripped.length);
      const newSemitone = parsed.semitone + semitones;
      return prefix + noteToString(newSemitone, useSharp) + suffix;
    });
  });

  return transposedLines.join('\n');
}

export function convertAccidentals(notationString, preferSharp) {
  if (!notationString || !notationString.trim()) return notationString;

  const lines = notationString.split('\n');
  const converted = lines.map((line) => {
    if (!isNoteLine(line)) return line;

    return line.replace(/\S+/g, (token) => {
      const parsed = parseNote(token);
      if (!parsed) return token;
      const stripped = stripSymbols(token);
      const prefixLen = token.indexOf(stripped);
      const prefix = token.slice(0, prefixLen);
      const suffix = token.slice(prefixLen + stripped.length);
      return prefix + noteToString(parsed.semitone, preferSharp) + suffix;
    });
  });

  return converted.join('\n');
}

export function transposeUp(notationString, halfSteps = 1) {
  return transposeNotes(notationString, halfSteps);
}

export function transposeDown(notationString, halfSteps = 1) {
  return transposeNotes(notationString, -halfSteps);
}
