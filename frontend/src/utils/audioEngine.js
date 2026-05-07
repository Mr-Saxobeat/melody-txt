import { Synth, start, now } from 'tone';
import { parseNote } from './noteParser';

let synth = null;
let playbackTimeout = null;

function getSynth() {
  if (!synth) {
    synth = new Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.01, decay: 0.1, sustain: 0.3, release: 0.5 },
    }).toDestination();
  }
  return synth;
}

export function noteToFrequency(noteToken) {
  const parsed = parseNote(noteToken);
  if (!parsed) {
    throw new Error(`Invalid note: ${noteToken}`);
  }
  const midiNumber = parsed.semitone + 12;
  return 440 * Math.pow(2, (midiNumber - 69) / 12);
}

export async function playMelody(notes, noteDuration = 0.5) {
  stopPlayback();
  await start();

  const synthInstance = getSynth();
  const currentTime = now();

  notes.forEach((note, index) => {
    const freq = noteToFrequency(note);
    const time = currentTime + index * noteDuration;
    synthInstance.triggerAttackRelease(freq, noteDuration * 0.9, time);
  });

  const totalDuration = notes.length * noteDuration;
  return new Promise((resolve) => {
    playbackTimeout = setTimeout(resolve, totalDuration * 1000);
  });
}

export function stopPlayback() {
  if (playbackTimeout) {
    clearTimeout(playbackTimeout);
    playbackTimeout = null;
  }
  if (synth) {
    synth.dispose();
    synth = null;
  }
}

export function dispose() {
  stopPlayback();
}
