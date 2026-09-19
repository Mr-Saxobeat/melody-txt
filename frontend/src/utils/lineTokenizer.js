export function parseLineSegments(line) {
  if (!line) return [];

  const segments = [];
  let current = '';
  let inQuote = false;

  for (let i = 0; i < line.length; i++) {
    if (line[i] === '"') {
      if (inQuote) {
        if (current) {
          segments.push({ text: current, type: 'lyrics' });
        }
        current = '';
        inQuote = false;
      } else {
        if (current) {
          segments.push({ text: current, type: 'notation' });
        }
        current = '';
        inQuote = true;
      }
    } else {
      current += line[i];
    }
  }

  if (current) {
    segments.push({ text: current, type: inQuote ? 'lyrics' : 'notation' });
  }

  return segments;
}
