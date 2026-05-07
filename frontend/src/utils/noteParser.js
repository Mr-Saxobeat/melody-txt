const SYLLABLES = ['do', 're', 'mi', 'fa', 'sol', 'la', 'si'];

const SYLLABLE_TO_SEMITONE = {
  do: 0, re: 2, mi: 4, fa: 5, sol: 7, la: 9, si: 11,
};

const SEMITONE_TO_SHARP = [
  'do', 'do#', 're', 're#', 'mi', 'fa', 'fa#', 'sol', 'sol#', 'la', 'la#', 'si',
];

const SEMITONE_TO_FLAT = [
  'do', 'reb', 're', 'mib', 'mi', 'fa', 'solb', 'sol', 'lab', 'la', 'sib', 'si',
];

const NOTE_REGEX = /^(sol|la|si|do|re|mi|fa|SOL|LA|SI|DO|RE|MI|FA|Sol|La|Si|Do|Re|Mi|Fa)(#|b)?(\d)?$/;
const STRIP_SYMBOLS_REGEX = /^[|:\-./()]*(.*?)[|:\-./()]*$/;

export function stripSymbols(token) {
  if (!token) return '';
  const match = token.match(STRIP_SYMBOLS_REGEX);
  return match ? match[1] : token;
}

export function parseNote(token) {
  if (!token || typeof token !== 'string') return null;

  const trimmed = token.trim();
  if (!trimmed) return null;

  const stripped = stripSymbols(trimmed);
  if (!stripped) return null;

  const match = stripped.match(NOTE_REGEX);
  if (!match) return null;

  const [, syllableRaw, accidental = '', numberStr] = match;

  const isUpperCase = syllableRaw[0] === syllableRaw[0].toUpperCase() &&
                      syllableRaw[0] !== syllableRaw[0].toLowerCase();

  const syllable = syllableRaw.toLowerCase();
  if (!SYLLABLE_TO_SEMITONE.hasOwnProperty(syllable)) return null;

  const baseSemitone = SYLLABLE_TO_SEMITONE[syllable];
  if (baseSemitone === undefined) return null;

  let accidentalOffset = 0;
  if (accidental === '#') accidentalOffset = 1;
  else if (accidental === 'b') accidentalOffset = -1;

  let octave;
  const number = numberStr ? parseInt(numberStr, 10) : 0;

  if (isUpperCase) {
    octave = 5 + number;
  } else {
    octave = 4 - number;
  }

  const semitone = (octave * 12) + baseSemitone + accidentalOffset;

  return { syllable, accidental, octave, semitone, original: trimmed };
}

export function noteToString(semitone, preferSharp = true) {
  const octave = Math.floor(semitone / 12);
  const noteIndex = ((semitone % 12) + 12) % 12;

  const name = preferSharp ? SEMITONE_TO_SHARP[noteIndex] : SEMITONE_TO_FLAT[noteIndex];

  const syllable = name.replace(/#|b/, '');
  const accidental = name.includes('#') ? '#' : name.includes('b') ? 'b' : '';

  let notation;
  if (octave === 4) {
    notation = syllable + accidental;
  } else if (octave === 5) {
    notation = syllable.toUpperCase() + accidental;
  } else if (octave < 4) {
    const num = 4 - octave;
    notation = syllable + accidental + num;
  } else {
    const num = octave - 5;
    notation = syllable.toUpperCase() + accidental + (num > 0 ? num : '');
  }

  return notation;
}

export function parseNotation(text) {
  if (!text || !text.trim()) return [];
  const tokens = text.trim().split(/[\s,]+/);
  return tokens.map((token) => {
    const parsed = parseNote(token);
    return parsed || { syllable: null, accidental: '', octave: 4, semitone: null, original: token, invalid: true };
  });
}

export { SYLLABLES, SYLLABLE_TO_SEMITONE, SEMITONE_TO_SHARP, SEMITONE_TO_FLAT };
