import { parseNote, noteToString, stripSymbols } from './noteParser';
import { parseLineSegments } from './lineTokenizer';

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

function transposeTokensInText(text, semitones, useSharp) {
  return text.replace(/\S+/g, (token) => {
    const parsed = parseNote(token);
    if (!parsed) return token;
    const stripped = stripSymbols(token);
    const prefixLen = token.indexOf(stripped);
    const prefix = token.slice(0, prefixLen);
    const suffix = token.slice(prefixLen + stripped.length);
    const newSemitone = parsed.semitone + semitones;
    return prefix + noteToString(newSemitone, useSharp) + suffix;
  });
}

function hasQuotes(line) {
  return line.indexOf('"') !== -1;
}

function transposeLineWithQuotes(line, semitones, useSharp) {
  const segments = parseLineSegments(line);
  const notationText = segments.filter((s) => s.type === 'notation').map((s) => s.text).join(' ');
  if (!notationText.trim() || !isNoteLine(notationText)) return line;

  let result = '';
  let current = '';
  let inQuote = false;

  for (let i = 0; i < line.length; i++) {
    if (line[i] === '"') {
      if (!inQuote) {
        result += transposeTokensInText(current, semitones, useSharp);
        current = '';
        result += '"';
        inQuote = true;
      } else {
        result += current + '"';
        current = '';
        inQuote = false;
      }
    } else {
      current += line[i];
    }
  }

  if (current) {
    result += inQuote ? current : transposeTokensInText(current, semitones, useSharp);
  }

  return result;
}

export function transposeNotes(notationString, semitones, preferSharp = null) {
  if (!notationString || !notationString.trim()) return notationString;

  const useSharp = preferSharp !== null ? preferSharp : semitones > 0;
  const lines = notationString.split('\n');

  const transposedLines = lines.map((line) => {
    if (hasQuotes(line)) {
      return transposeLineWithQuotes(line, semitones, useSharp);
    }
    if (!isNoteLine(line)) return line;

    return transposeTokensInText(line, semitones, useSharp);
  });

  return transposedLines.join('\n');
}

function convertTokensInText(text, preferSharp) {
  return text.replace(/\S+/g, (token) => {
    const parsed = parseNote(token);
    if (!parsed) return token;
    const stripped = stripSymbols(token);
    const prefixLen = token.indexOf(stripped);
    const prefix = token.slice(0, prefixLen);
    const suffix = token.slice(prefixLen + stripped.length);
    return prefix + noteToString(parsed.semitone, preferSharp) + suffix;
  });
}

function convertLineWithQuotes(line, preferSharp) {
  let result = '';
  let current = '';
  let inQuote = false;

  for (let i = 0; i < line.length; i++) {
    if (line[i] === '"') {
      if (!inQuote) {
        result += convertTokensInText(current, preferSharp);
        current = '';
        result += '"';
        inQuote = true;
      } else {
        result += current + '"';
        current = '';
        inQuote = false;
      }
    } else {
      current += line[i];
    }
  }

  if (current) {
    result += inQuote ? current : convertTokensInText(current, preferSharp);
  }

  return result;
}

export function convertAccidentals(notationString, preferSharp) {
  if (!notationString || !notationString.trim()) return notationString;

  const lines = notationString.split('\n');
  const converted = lines.map((line) => {
    if (hasQuotes(line)) return convertLineWithQuotes(line, preferSharp);
    if (!isNoteLine(line)) return line;
    return convertTokensInText(line, preferSharp);
  });

  return converted.join('\n');
}

export function transposeUp(notationString, halfSteps = 1) {
  return transposeNotes(notationString, halfSteps);
}

export function transposeDown(notationString, halfSteps = 1) {
  return transposeNotes(notationString, -halfSteps);
}
