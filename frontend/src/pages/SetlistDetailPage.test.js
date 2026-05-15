import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import SetlistDetailPage from './SetlistDetailPage';
import setlistService from '../services/setlistService';
import melodyService from '../services/melodyService';

jest.mock('../services/setlistService');
jest.mock('../services/melodyService');
jest.mock('../services/api', () => ({
  __esModule: true,
  default: { get: jest.fn() },
}));
jest.mock('../utils/clipboard', () => ({
  copyToClipboard: jest.fn().mockResolvedValue(true),
}));

const mockSetlist = {
  id: 'setlist-1',
  title: 'My Setlist',
  share_id: 'sl-abc123',
  is_public: true,
  entries: [
    { id: 'e1', melody_title: 'Song A', melody_share_id: 'ma1', position: 0 },
  ],
};

const mockSearchResults = {
  results: [
    { id: 'm1', title: 'Bossa Nova', share_id: 'bn1', created_at: '2026-05-01T00:00:00Z' },
    { id: 'm2', title: 'Jazz Waltz', share_id: 'jw1', created_at: '2026-05-02T00:00:00Z' },
  ],
  next: null,
  previous: null,
};

beforeEach(() => {
  jest.useFakeTimers();
  setlistService.getSetlist.mockResolvedValue(mockSetlist);
  setlistService.addEntry.mockResolvedValue({});
  melodyService.searchMelodies.mockResolvedValue(mockSearchResults);
});

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

async function renderSetlistPage() {
  let result;
  await act(async () => {
    result = render(
      <MemoryRouter initialEntries={['/setlists/setlist-1']}>
        <Routes>
          <Route path="/setlists/:id" element={<SetlistDetailPage />} />
        </Routes>
      </MemoryRouter>
    );
  });
  return result;
}

describe('SetlistDetailPage - Add Melody Modal Search', () => {
  test('Add Melody button opens modal with a search input', async () => {
    await renderSetlistPage();
    await waitFor(() => expect(screen.getByText('My Setlist')).toBeInTheDocument());

    const addButton = screen.getByText('Adicionar Melodia');
    await act(async () => fireEvent.click(addButton));

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Buscar melodias...')).toBeInTheDocument();
    });
  });

  test('typing in modal search triggers melodyService.searchMelodies after debounce', async () => {
    await renderSetlistPage();
    await waitFor(() => expect(screen.getByText('My Setlist')).toBeInTheDocument());

    await act(async () => fireEvent.click(screen.getByText('Adicionar Melodia')));
    await waitFor(() => expect(screen.getByPlaceholderText('Buscar melodias...')).toBeInTheDocument());

    melodyService.searchMelodies.mockClear();
    melodyService.searchMelodies.mockResolvedValue({
      results: [mockSearchResults.results[0]],
      next: null,
      previous: null,
    });

    const input = screen.getByPlaceholderText('Buscar melodias...');
    fireEvent.change(input, { target: { value: 'bossa' } });

    await act(async () => jest.advanceTimersByTime(300));

    await waitFor(() => {
      expect(melodyService.searchMelodies).toHaveBeenCalledWith('bossa');
    });
  });

  test('displays search results in the modal', async () => {
    await renderSetlistPage();
    await waitFor(() => expect(screen.getByText('My Setlist')).toBeInTheDocument());

    await act(async () => fireEvent.click(screen.getByText('Adicionar Melodia')));

    await waitFor(() => {
      expect(screen.getByText('Bossa Nova')).toBeInTheDocument();
      expect(screen.getByText('Jazz Waltz')).toBeInTheDocument();
    });
  });

  test('clicking a melody adds it to the setlist', async () => {
    await renderSetlistPage();
    await waitFor(() => expect(screen.getByText('My Setlist')).toBeInTheDocument());

    await act(async () => fireEvent.click(screen.getByText('Adicionar Melodia')));
    await waitFor(() => expect(screen.getByText('Bossa Nova')).toBeInTheDocument());

    await act(async () => fireEvent.click(screen.getByText('Bossa Nova')));

    expect(setlistService.addEntry).toHaveBeenCalledWith('setlist-1', 'm1', 1);
  });

  test('shows empty state when no results match', async () => {
    await renderSetlistPage();
    await waitFor(() => expect(screen.getByText('My Setlist')).toBeInTheDocument());

    await act(async () => fireEvent.click(screen.getByText('Adicionar Melodia')));
    await waitFor(() => expect(screen.getByPlaceholderText('Buscar melodias...')).toBeInTheDocument());

    melodyService.searchMelodies.mockResolvedValue({
      results: [],
      next: null,
      previous: null,
    });

    const input = screen.getByPlaceholderText('Buscar melodias...');
    fireEvent.change(input, { target: { value: 'nonexistent' } });
    await act(async () => jest.advanceTimersByTime(300));

    await waitFor(() => {
      expect(screen.getByText(/Nenhuma melodia encontrada/)).toBeInTheDocument();
    });
  });

  test('clearing search shows all melodies', async () => {
    await renderSetlistPage();
    await waitFor(() => expect(screen.getByText('My Setlist')).toBeInTheDocument());

    await act(async () => fireEvent.click(screen.getByText('Adicionar Melodia')));
    await waitFor(() => expect(screen.getByPlaceholderText('Buscar melodias...')).toBeInTheDocument());

    const input = screen.getByPlaceholderText('Buscar melodias...');
    fireEvent.change(input, { target: { value: 'bossa' } });
    await act(async () => jest.advanceTimersByTime(300));

    melodyService.searchMelodies.mockClear();
    melodyService.searchMelodies.mockResolvedValue(mockSearchResults);

    fireEvent.change(input, { target: { value: '' } });
    await act(async () => jest.advanceTimersByTime(300));

    await waitFor(() => {
      expect(melodyService.searchMelodies).toHaveBeenCalledWith('');
    });
  });
});
