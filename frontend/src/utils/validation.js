import { parseNote } from './noteParser';
import { isNoteLine, isIgnoredSymbol } from './transposer';

export function isValidSolfege(text) {
  if (!text || !text.trim()) {
    return false;
  }

  const lines = text.split('\n');
  const noteLines = lines.filter((line) => line.trim() && isNoteLine(line));

  if (noteLines.length === 0) return false;

  const tokens = noteLines.flatMap((line) => line.trim().split(/\s+/));
  return tokens.every((token) => parseNote(token) !== null || isIgnoredSymbol(token));
}

export function parseNotes(text) {
  if (!text || !text.trim()) {
    throw new Error('Solfege notation cannot be empty');
  }

  const lines = text.split('\n');
  const noteTokens = [];

  for (const line of lines) {
    if (!line.trim()) continue;
    if (isNoteLine(line)) {
      const tokens = line.trim().split(/\s+/);
      noteTokens.push(...tokens.filter((t) => !isIgnoredSymbol(t)));
    }
  }

  return noteTokens;
}

export function getInvalidSyllables(text) {
  if (!text || !text.trim()) {
    return [];
  }

  const lines = text.split('\n');
  const invalid = [];

  for (const line of lines) {
    if (!line.trim()) continue;
    if (isNoteLine(line)) {
      const tokens = line.trim().split(/\s+/);
      invalid.push(...tokens.filter((token) => parseNote(token) === null));
    }
  }

  return invalid;
}

export function classifyLines(text) {
  if (!text) return [];
  return text.split('\n').map((line) => ({
    text: line,
    type: !line.trim() ? 'empty' : isNoteLine(line) ? 'notes' : 'lyrics',
  }));
}

export function countNotes(text) {
  if (!text || !text.trim()) return 0;
  try {
    return parseNotes(text).length;
  } catch (error) {
    return 0;
  }
}

export function estimateDuration(text) {
  return countNotes(text) * 0.5;
}
