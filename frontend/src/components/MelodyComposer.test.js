import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import MelodyComposer from './MelodyComposer';

describe('MelodyComposer', () => {
  test('renders textarea input', () => {
    render(<MelodyComposer notation="" onChange={() => {}} />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeInTheDocument();
  });

  test('displays notation value', () => {
    render(<MelodyComposer notation="do re mi" onChange={() => {}} />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveValue('do re mi');
  });

  test('calls onChange when user types', () => {
    const handleChange = jest.fn();
    render(<MelodyComposer notation="" onChange={handleChange} />);

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'do re mi' } });

    expect(handleChange).toHaveBeenCalledWith('do re mi');
  });

  test('renders backdrop with highlighted content', () => {
    const { container } = render(<MelodyComposer notation="do re mi" onChange={() => {}} />);
    const backdrop = container.querySelector('.editor-backdrop');
    expect(backdrop).toBeInTheDocument();
    expect(backdrop.innerHTML).toContain('highlight-notes');
  });

  test('highlights lyrics lines differently from note lines', () => {
    const { container } = render(
      <MelodyComposer notation={"do re mi\nHappy birthday"} onChange={() => {}} />
    );
    const backdrop = container.querySelector('.editor-backdrop');
    expect(backdrop.innerHTML).toContain('highlight-notes');
    expect(backdrop.innerHTML).toContain('highlight-lyrics');
  });

  test('calls onValidationChange with true for valid notes', () => {
    const handleValidation = jest.fn();
    render(
      <MelodyComposer
        notation="do re mi"
        onChange={() => {}}
        onValidationChange={handleValidation}
      />
    );
    expect(handleValidation).toHaveBeenCalledWith(true);
  });

  test('calls onValidationChange with true for pure lyrics', () => {
    const handleValidation = jest.fn();
    render(
      <MelodyComposer
        notation="Happy birthday to you"
        onChange={() => {}}
        onValidationChange={handleValidation}
      />
    );
    expect(handleValidation).toHaveBeenCalledWith(true);
  });
});
