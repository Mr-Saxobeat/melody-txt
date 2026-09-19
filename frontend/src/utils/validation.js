import { parseNote } from './noteParser';
import { isNoteLine, isIgnoredSymbol } from './transposer';
import { parseLineSegments } from './lineTokenizer';

export function isValidSolfege(text) {
  if (!text || !text.trim()) {
    return false;
  }

  const classified = classifyLines(text);
  return classified.some((l) => l.type === 'notes' || l.type === 'mixed');
}

export function parseNotes(text) {
  if (!text || !text.trim()) {
    throw new Error('Solfege notation cannot be empty');
  }

  const classified = classifyLines(text);
  const noteTokens = [];

  for (const line of classified) {
    if (line.type === 'notes') {
      const tokens = line.text.trim().split(/\s+/);
      noteTokens.push(...tokens.filter((t) => !isIgnoredSymbol(t)));
    } else if (line.type === 'mixed' && line.segments) {
      for (const seg of line.segments) {
        if (seg.type === 'notation' && seg.text.trim()) {
          const tokens = seg.text.trim().split(/\s+/);
          noteTokens.push(...tokens.filter((t) => !isIgnoredSymbol(t)));
        }
      }
    }
  }

  return noteTokens;
}

export function getInvalidSyllables(text) {
  if (!text || !text.trim()) {
    return [];
  }

  const classified = classifyLines(text);
  const invalid = [];

  for (const line of classified) {
    if (line.type === 'notes') {
      const tokens = line.text.trim().split(/\s+/);
      invalid.push(...tokens.filter((token) => parseNote(token) === null && !isIgnoredSymbol(token)));
    } else if (line.type === 'mixed' && line.segments) {
      for (const seg of line.segments) {
        if (seg.type === 'notation' && seg.text.trim()) {
          const tokens = seg.text.trim().split(/\s+/);
          invalid.push(...tokens.filter((token) => parseNote(token) === null && !isIgnoredSymbol(token)));
        }
      }
    }
  }

  return invalid;
}

function hasQuotes(line) {
  return line.indexOf('"') !== -1;
}

function classifyMixedLine(line) {
  const segments = parseLineSegments(line);
  const notationSegments = segments.filter((s) => s.type === 'notation');
  const notationText = notationSegments.map((s) => s.text).join(' ');
  const hasLyrics = segments.some((s) => s.type === 'lyrics');

  if (hasLyrics && notationText.trim() && isNoteLine(notationText)) {
    return { text: line, type: 'mixed', segments };
  }
  return { text: line, type: hasLyrics ? 'lyrics' : (isNoteLine(line) ? 'notes' : 'lyrics') };
}

export function classifyLines(text) {
  if (!text) return [];
  let inQuote = false;

  return text.split('\n').map((line) => {
    if (!line.trim() && !inQuote) return { text: line, type: 'empty' };

    if (inQuote) {
      const closeIdx = line.indexOf('"');
      if (closeIdx === -1) {
        return { text: line, type: 'lyrics' };
      }
      inQuote = false;
      const afterClose = line.slice(closeIdx + 1);
      if (!afterClose.trim()) {
        return { text: line, type: 'lyrics' };
      }
      const remainingQuoteCount = (afterClose.match(/"/g) || []).length;
      if (remainingQuoteCount % 2 !== 0) {
        inQuote = true;
      }
      const beforeClose = line.slice(0, closeIdx);
      const afterSegments = parseLineSegments(afterClose);
      const afterNotation = afterSegments.filter((s) => s.type === 'notation').map((s) => s.text).join(' ');
      if (afterNotation.trim() && isNoteLine(afterNotation)) {
        const segments = [];
        if (beforeClose) segments.push({ text: beforeClose, type: 'lyrics' });
        segments.push(...afterSegments);
        return { text: line, type: 'mixed', segments };
      }
      return { text: line, type: 'lyrics' };
    }

    if (!hasQuotes(line)) {
      return { text: line, type: isNoteLine(line) ? 'notes' : 'lyrics' };
    }

    const quoteCount = (line.match(/"/g) || []).length;
    if (quoteCount % 2 !== 0) {
      inQuote = true;
    }

    return classifyMixedLine(line);
  });
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
