import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MyMelodiesPage from './MyMelodiesPage';
import melodyService from '../services/melodyService';

jest.mock('../services/melodyService');
jest.mock('../hooks/useAuth', () => ({
  useAuth: () => ({ isAuthenticated: true, loading: false }),
}));

const mockMelodies = {
  count: 2,
  results: [
    {
      id: 'uuid-1',
      title: 'Song One',
      notation: 'do re mi',
      key: 'C',
      share_id: 'abc123def456',
      note_count: 3,
      duration_seconds: 1.5,
      created_at: '2026-05-07T10:00:00Z',
    },
    {
      id: 'uuid-2',
      title: 'Song Two',
      notation: 'fa sol la',
      key: 'G',
      share_id: 'xyz789ghi012',
      note_count: 3,
      duration_seconds: 1.5,
      created_at: '2026-05-06T10:00:00Z',
    },
  ],
};

function renderPage() {
  return render(
    <MemoryRouter>
      <MyMelodiesPage />
    </MemoryRouter>
  );
}

describe('MyMelodiesPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    melodyService.getUserMelodies.mockResolvedValue(mockMelodies);
  });

  test('renders melody list', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Song One')).toBeInTheDocument();
      expect(screen.getByText('Song Two')).toBeInTheDocument();
    });
  });

  test('shows empty state when no melodies', async () => {
    melodyService.getUserMelodies.mockResolvedValue({ count: 0, results: [] });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText(/nenhuma melodia/i)).toBeInTheDocument();
    });
  });

  test('shows delete confirmation on delete click', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Song One')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByText('Excluir');
    fireEvent.click(deleteButtons[0]);

    expect(screen.getByText('Excluir?')).toBeInTheDocument();
    expect(screen.getByText('Sim')).toBeInTheDocument();
    expect(screen.getByText('Não')).toBeInTheDocument();
  });

  test('deletes melody on confirm', async () => {
    melodyService.deleteMelody.mockResolvedValue();
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Song One')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByText('Excluir');
    fireEvent.click(deleteButtons[0]);
    fireEvent.click(screen.getByText('Sim'));

    await waitFor(() => {
      expect(melodyService.deleteMelody).toHaveBeenCalledWith('uuid-1');
      expect(screen.queryByText('Song One')).not.toBeInTheDocument();
    });
  });

  test('cancels delete on No click', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Song One')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByText('Excluir');
    fireEvent.click(deleteButtons[0]);
    fireEvent.click(screen.getByText('Não'));

    expect(screen.queryByText('Excluir?')).not.toBeInTheDocument();
    expect(screen.getByText('Song One')).toBeInTheDocument();
  });
});
