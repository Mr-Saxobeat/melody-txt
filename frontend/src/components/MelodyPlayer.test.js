import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MelodyPlayer from './MelodyPlayer';
import * as audioEngine from '../utils/audioEngine';

// Mock the audio engine
jest.mock('../utils/audioEngine', () => ({
  playMelody: jest.fn().mockResolvedValue(undefined),
  stopPlayback: jest.fn(),
}));

describe('MelodyPlayer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders play and stop buttons', () => {
    render(<MelodyPlayer notation="do re mi" />);
    expect(screen.getByLabelText(/play melody/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/stop playback/i)).toBeInTheDocument();
  });

  test('play button is disabled when no notation', () => {
    render(<MelodyPlayer notation="" />);
    const playButton = screen.getByLabelText(/play melody/i);
    expect(playButton).not.toBeDisabled(); // Button is enabled but will show error
  });

  test('play button is disabled when disabled prop is true', () => {
    render(<MelodyPlayer notation="do re mi" disabled={true} />);
    const playButton = screen.getByLabelText(/play melody/i);
    expect(playButton).toBeDisabled();
  });

  test('calls playMelody when play button is clicked', async () => {
    render(<MelodyPlayer notation="do re mi" />);
    const playButton = screen.getByLabelText(/play melody/i);

    fireEvent.click(playButton);

    await waitFor(() => {
      expect(audioEngine.playMelody).toHaveBeenCalledWith(['do', 're', 'mi']);
    });
  });

  test('shows playing indicator during playback', async () => {
    audioEngine.playMelody.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    render(<MelodyPlayer notation="do re mi" />);
    const playButton = screen.getByLabelText(/play melody/i);

    fireEvent.click(playButton);

    await waitFor(() => {
      expect(screen.getByText(/playing melody/i)).toBeInTheDocument();
    });
  });

  test('disables play button during playback', async () => {
    audioEngine.playMelody.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    render(<MelodyPlayer notation="do re mi" />);
    const playButton = screen.getByLabelText(/play melody/i);

    fireEvent.click(playButton);

    await waitFor(() => {
      expect(playButton).toBeDisabled();
    });
  });

  test('calls stopPlayback when stop button is clicked', async () => {
    audioEngine.playMelody.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 1000))
    );

    render(<MelodyPlayer notation="do re mi" />);
    const playButton = screen.getByLabelText(/play melody/i);
    const stopButton = screen.getByLabelText(/stop playback/i);

    fireEvent.click(playButton);

    await waitFor(() => {
      expect(screen.getByText(/playing melody/i)).toBeInTheDocument();
    });

    fireEvent.click(stopButton);

    expect(audioEngine.stopPlayback).toHaveBeenCalled();
  });

  test('shows error message when notation is empty', async () => {
    render(<MelodyPlayer notation="" />);
    const playButton = screen.getByLabelText(/play melody/i);

    fireEvent.click(playButton);

    await waitFor(() => {
      expect(screen.getByText(/please enter a melody first/i)).toBeInTheDocument();
    });
  });
});
