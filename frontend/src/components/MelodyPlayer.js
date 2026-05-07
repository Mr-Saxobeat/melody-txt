import React, { useState } from 'react';
import { playMelody, stopPlayback } from '../utils/audioEngine';
import { parseNotes } from '../utils/validation';
import './MelodyPlayer.css';

function MelodyPlayer({ notation, disabled }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState('');

  const handlePlay = async () => {
    if (!notation || !notation.trim()) {
      setError('Please enter a melody first');
      return;
    }

    setError('');
    setIsPlaying(true);

    try {
      const notes = parseNotes(notation);
      await playMelody(notes);
      setIsPlaying(false);
    } catch (err) {
      setError(err.message || 'Failed to play melody');
      setIsPlaying(false);
    }
  };

  const handleStop = () => {
    stopPlayback();
    setIsPlaying(false);
    setError('');
  };

  return (
    <div className="melody-player">
      <div className="player-controls">
        <button
          className="btn btn-play"
          onClick={handlePlay}
          disabled={disabled || isPlaying}
          aria-label="Play melody"
        >
          {isPlaying ? '▶ Playing...' : '▶ Play'}
        </button>

        <button
          className="btn btn-stop"
          onClick={handleStop}
          disabled={!isPlaying}
          aria-label="Stop playback"
        >
          ⬛ Stop
        </button>
      </div>

      {error && (
        <div className="player-error" role="alert">
          {error}
        </div>
      )}

      {isPlaying && (
        <div className="playback-indicator">
          <div className="pulse-dot"></div>
          <span>Playing melody...</span>
        </div>
      )}
    </div>
  );
}

export default MelodyPlayer;
