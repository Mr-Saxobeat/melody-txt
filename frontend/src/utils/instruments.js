import { transposeNotes } from './transposer';

export const INSTRUMENTS = [
  { id: 'piano', name: 'Piano', key: 'C', offset: 0 },
  { id: 'saxophone', name: 'Saxophone', key: 'Eb', offset: 9 },
  { id: 'trumpet', name: 'Trumpet', key: 'Bb', offset: 2 },
  { id: 'trombone', name: 'Trombone', key: 'C', offset: 0 },
];

export function getInstrumentById(id) {
  return INSTRUMENTS.find((i) => i.id === id) || INSTRUMENTS[0];
}

export function transposeForInstrument(notation, fromInstrument, toInstrument, preferSharp = true) {
  const from = getInstrumentById(fromInstrument);
  const to = getInstrumentById(toInstrument);
  const netShift = to.offset - from.offset;
  if (netShift === 0) return notation;
  return transposeNotes(notation, netShift, preferSharp);
}
