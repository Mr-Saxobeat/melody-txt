import { parseNote, noteToString } from './noteParser';

const IGNORED_SYMBOL_REGEX = /^[|:\-./()0-9]+$/;
const REPEAT_MARKER_REGEX = /^\(?(\d+x)\)?$/i;

export function isIgnoredSymbol(token) {
  return IGNORED_SYMBOL_REGEX.test(token) || REPEAT_MARKER_REGEX.test(token);
}

export function isNoteLine(line) {
  if (!line || !line.trim()) return false;
  const tokens = line.trim().split(/\s+/);
  return tokens.every((token) => parseNote(token) !== null || isIgnoredSymbol(token));
}

export function transposeNotes(notationString, semitones) {
  if (!notationString || !notationString.trim()) return notationString;

  const preferSharp = semitones > 0;
  const lines = notationString.split('\n');

  const transposedLines = lines.map((line) => {
    if (!isNoteLine(line)) return line;

    return line.replace(/\S+/g, (token) => {
      const parsed = parseNote(token);
      if (!parsed) return token;
      const newSemitone = parsed.semitone + semitones;
      return noteToString(newSemitone, preferSharp);
    });
  });

  return transposedLines.join('\n');
}

export function transposeUp(notationString, halfSteps = 1) {
  return transposeNotes(notationString, halfSteps);
}

export function transposeDown(notationString, halfSteps = 1) {
  return transposeNotes(notationString, -halfSteps);
}
