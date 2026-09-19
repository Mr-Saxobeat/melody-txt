import { transposeNotes } from './transposer';
import melodyService from '../services/melodyService';

let instrumentsCache = null;

export async function loadInstruments() {
  if (instrumentsCache) return instrumentsCache;
  instrumentsCache = await melodyService.getInstruments();
  return instrumentsCache;
}

export function getLoadedInstruments() {
  return instrumentsCache || [];
}

export function clearInstrumentsCache() {
  instrumentsCache = null;
  melodyService.clearInstrumentCache();
}

export function getInstrumentById(id) {
  const instruments = getLoadedInstruments();
  return instruments.find((i) => i.id === id) || instruments[0];
}

export function transposeForInstrument(notation, fromInstrument, toInstrument, preferSharp = true) {
  const from = getInstrumentById(fromInstrument);
  const to = getInstrumentById(toInstrument);
  if (!from || !to) return notation;
  const netShift = to.offset - from.offset;
  if (netShift === 0) return notation;
  return transposeNotes(notation, netShift, preferSharp);
}
