const HIDDEN_NOTE_REGEX = /\*([^*]+)\*/g;

export function parseHiddenNotes(line) {
  if (!line) return [];
  const tokens = [];
  let match;
  const regex = new RegExp(HIDDEN_NOTE_REGEX.source, 'g');
  while ((match = regex.exec(line)) !== null) {
    tokens.push({
      content: match[1],
      start: match.index,
      end: match.index + match[0].length - 1,
    });
  }
  return tokens;
}

export function renderLineWithHiddenNotes(line, lineType) {
  if (!line) return '';
  const className = lineType === 'lyrics' ? 'highlight-hidden-lyrics' : 'highlight-hidden';
  const regex = new RegExp(HIDDEN_NOTE_REGEX.source, 'g');
  let result = '';
  let lastIndex = 0;
  let match;
  while ((match = regex.exec(line)) !== null) {
    result += escapeHtml(line.slice(lastIndex, match.index));
    result += `<span class="${className}">${escapeHtml(match[0])}</span>`;
    lastIndex = match.index + match[0].length;
  }
  result += escapeHtml(line.slice(lastIndex));
  return result;
}

export function renderLineForView(line, lineType) {
  if (!line) return [{ text: '', hidden: false }];
  const segments = [];
  let lastIndex = 0;
  const regex = new RegExp(HIDDEN_NOTE_REGEX.source, 'g');
  let match;
  while ((match = regex.exec(line)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ text: line.slice(lastIndex, match.index), hidden: false });
    }
    segments.push({ text: match[1], hidden: true });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < line.length) {
    segments.push({ text: line.slice(lastIndex), hidden: false });
  }
  if (segments.length === 0) {
    segments.push({ text: line, hidden: false });
  }
  return segments;
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
