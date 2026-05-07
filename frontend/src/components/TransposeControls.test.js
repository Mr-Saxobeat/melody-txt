import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TransposeControls from './TransposeControls';

describe('TransposeControls', () => {
  test('renders six transpose buttons (3 groups x 2)', () => {
    render(<TransposeControls onTranspose={() => {}} disabled={false} />);
    expect(screen.getByLabelText(/up half step/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/down half step/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/up whole step/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/down whole step/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/up octave/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/down octave/i)).toBeInTheDocument();
  });

  test('calls onTranspose with +1 for up half step', () => {
    const handler = jest.fn();
    render(<TransposeControls onTranspose={handler} disabled={false} />);
    fireEvent.click(screen.getByLabelText(/up half step/i));
    expect(handler).toHaveBeenCalledWith(1);
  });

  test('calls onTranspose with -1 for down half step', () => {
    const handler = jest.fn();
    render(<TransposeControls onTranspose={handler} disabled={false} />);
    fireEvent.click(screen.getByLabelText(/down half step/i));
    expect(handler).toHaveBeenCalledWith(-1);
  });

  test('calls onTranspose with +2 for up whole step', () => {
    const handler = jest.fn();
    render(<TransposeControls onTranspose={handler} disabled={false} />);
    fireEvent.click(screen.getByLabelText(/up whole step/i));
    expect(handler).toHaveBeenCalledWith(2);
  });

  test('calls onTranspose with -2 for down whole step', () => {
    const handler = jest.fn();
    render(<TransposeControls onTranspose={handler} disabled={false} />);
    fireEvent.click(screen.getByLabelText(/down whole step/i));
    expect(handler).toHaveBeenCalledWith(-2);
  });

  test('calls onTranspose with +12 for up octave', () => {
    const handler = jest.fn();
    render(<TransposeControls onTranspose={handler} disabled={false} />);
    fireEvent.click(screen.getByLabelText(/up octave/i));
    expect(handler).toHaveBeenCalledWith(12);
  });

  test('calls onTranspose with -12 for down octave', () => {
    const handler = jest.fn();
    render(<TransposeControls onTranspose={handler} disabled={false} />);
    fireEvent.click(screen.getByLabelText(/down octave/i));
    expect(handler).toHaveBeenCalledWith(-12);
  });

  test('buttons are disabled when disabled prop is true', () => {
    render(<TransposeControls onTranspose={() => {}} disabled={true} />);
    expect(screen.getByLabelText(/up half step/i)).toBeDisabled();
    expect(screen.getByLabelText(/down octave/i)).toBeDisabled();
  });

  test('displays labels for each group', () => {
    render(<TransposeControls onTranspose={() => {}} disabled={false} />);
    expect(screen.getByText('half step')).toBeInTheDocument();
    expect(screen.getByText('whole step')).toBeInTheDocument();
    expect(screen.getByText('octave')).toBeInTheDocument();
  });
});
