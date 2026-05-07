import { noteToFrequency } from './audioEngine';

jest.mock('tone', () => {
  const mockSynth = {
    toDestination: jest.fn(function () { return this; }),
    triggerAttackRelease: jest.fn(),
    triggerRelease: jest.fn(),
    dispose: jest.fn(),
  };
  return {
    Synth: jest.fn(() => mockSynth),
    start: jest.fn().mockResolvedValue(undefined),
    now: jest.fn(() => 0),
    __mockSynth: mockSynth,
  };
});

describe('noteToFrequency', () => {
  test('converts do (C4) to ~261.63 Hz', () => {
    const freq = noteToFrequency('do');
    expect(freq).toBeCloseTo(261.63, 0);
  });

  test('converts la (A4) to 440 Hz', () => {
    const freq = noteToFrequency('la');
    expect(freq).toBeCloseTo(440, 0);
  });

  test('converts DO (C5) to ~523.25 Hz', () => {
    const freq = noteToFrequency('DO');
    expect(freq).toBeCloseTo(523.25, 0);
  });

  test('converts do1 (C3) to ~130.81 Hz', () => {
    const freq = noteToFrequency('do1');
    expect(freq).toBeCloseTo(130.81, 0);
  });

  test('converts do# (C#4) correctly', () => {
    const freq = noteToFrequency('do#');
    expect(freq).toBeCloseTo(277.18, 0);
  });

  test('do# and reb produce same frequency', () => {
    expect(noteToFrequency('do#')).toBeCloseTo(noteToFrequency('reb'), 2);
  });

  test('throws for invalid note', () => {
    expect(() => noteToFrequency('xyz')).toThrow('Invalid note');
  });
});

describe('playMelody', () => {
  let playMelody, Tone;

  beforeEach(() => {
    jest.resetModules();
    jest.mock('tone', () => {
      const mockSynth = {
        toDestination: jest.fn(function () { return this; }),
        triggerAttackRelease: jest.fn(),
        triggerRelease: jest.fn(),
        dispose: jest.fn(),
      };
      return {
        Synth: jest.fn(() => mockSynth),
        start: jest.fn().mockResolvedValue(undefined),
        now: jest.fn(() => 0),
        __mockSynth: mockSynth,
      };
    });
    jest.mock('./noteParser', () => ({
      parseNote: jest.fn((token) => {
        const map = { do: 48, re: 50, mi: 52 };
        const s = map[token];
        if (s === undefined) return null;
        return { syllable: token, accidental: '', octave: 4, semitone: s };
      }),
    }));
    const audioEngine = require('./audioEngine');
    playMelody = audioEngine.playMelody;
    Tone = require('tone');
  });

  test('schedules notes and resolves', async () => {
    await playMelody(['do', 're', 'mi'], 0.01);
    expect(Tone.__mockSynth.triggerAttackRelease).toHaveBeenCalledTimes(3);
  });

  test('calls Tone.start', async () => {
    await playMelody(['do'], 0.01);
    expect(Tone.start).toHaveBeenCalled();
  });
});

describe('stopPlayback', () => {
  test('disposes synth to cancel all scheduled notes', async () => {
    jest.resetModules();
    jest.mock('tone', () => {
      const mockSynth = {
        toDestination: jest.fn(function () { return this; }),
        triggerAttackRelease: jest.fn(),
        triggerRelease: jest.fn(),
        dispose: jest.fn(),
      };
      return {
        Synth: jest.fn(() => mockSynth),
        start: jest.fn().mockResolvedValue(undefined),
        now: jest.fn(() => 0),
        __mockSynth: mockSynth,
      };
    });
    jest.mock('./noteParser', () => ({
      parseNote: jest.fn(() => ({ syllable: 'do', accidental: '', octave: 4, semitone: 48 })),
    }));
    const { playMelody, stopPlayback } = require('./audioEngine');
    const Tone = require('tone');

    await playMelody(['do'], 0.01);
    stopPlayback();
    expect(Tone.__mockSynth.dispose).toHaveBeenCalled();
  });
});
