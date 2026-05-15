import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HomePage from './HomePage';
import melodyService from '../services/melodyService';

jest.mock('../services/melodyService');
jest.mock('../hooks/useAuth', () => ({
  useAuth: () => ({ isAuthenticated: true }),
}));

const mockMelodies = [
  {
    id: '1',
    title: 'Bossa Nova',
    share_id: 'abc123',
    created_at: '2026-05-01T00:00:00Z',
    author: { username: 'user1' },
  },
  {
    id: '2',
    title: 'Jazz Waltz',
    share_id: 'def456',
    created_at: '2026-05-02T00:00:00Z',
    author: { username: 'user2' },
  },
];

let intersectionCallback;
const mockObserve = jest.fn();
const mockDisconnect = jest.fn();

beforeEach(() => {
  jest.useFakeTimers();
  window.IntersectionObserver = jest.fn((callback) => {
    intersectionCallback = callback;
    return { observe: mockObserve, disconnect: mockDisconnect, unobserve: jest.fn() };
  });
  melodyService.getRecentMelodiesPaginated.mockResolvedValue({
    results: mockMelodies,
    next: null,
    previous: null,
  });
});

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

async function renderHomePage() {
  let result;
  await act(async () => {
    result = render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );
  });
  return result;
}

describe('HomePage', () => {
  test('renders a search input field', async () => {
    await renderHomePage();
    expect(screen.getByPlaceholderText('Buscar melodias...')).toBeInTheDocument();
  });

  test('displays melodies from API', async () => {
    await renderHomePage();
    await waitFor(() => {
      expect(screen.getByText('Bossa Nova')).toBeInTheDocument();
      expect(screen.getByText('Jazz Waltz')).toBeInTheDocument();
    });
  });

  test('typing in search triggers API call after debounce', async () => {
    await renderHomePage();
    melodyService.getRecentMelodiesPaginated.mockClear();
    melodyService.getRecentMelodiesPaginated.mockResolvedValue({
      results: [mockMelodies[0]],
      next: null,
      previous: null,
    });

    const input = screen.getByPlaceholderText('Buscar melodias...');
    fireEvent.change(input, { target: { value: 'bossa' } });

    expect(melodyService.getRecentMelodiesPaginated).not.toHaveBeenCalled();

    await act(async () => jest.advanceTimersByTime(300));

    await waitFor(() => {
      expect(melodyService.getRecentMelodiesPaginated).toHaveBeenCalledWith(null, 'bossa');
    });
  });

  test('shows empty state message when no search results', async () => {
    await renderHomePage();
    melodyService.getRecentMelodiesPaginated.mockResolvedValue({
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

  test('clearing search restores default listing', async () => {
    await renderHomePage();
    melodyService.getRecentMelodiesPaginated.mockClear();
    melodyService.getRecentMelodiesPaginated.mockResolvedValue({
      results: mockMelodies,
      next: null,
      previous: null,
    });

    const input = screen.getByPlaceholderText('Buscar melodias...');
    fireEvent.change(input, { target: { value: 'bossa' } });
    await act(async () => jest.advanceTimersByTime(300));

    melodyService.getRecentMelodiesPaginated.mockClear();
    melodyService.getRecentMelodiesPaginated.mockResolvedValue({
      results: mockMelodies,
      next: null,
      previous: null,
    });

    fireEvent.change(input, { target: { value: '' } });
    await act(async () => jest.advanceTimersByTime(300));

    await waitFor(() => {
      expect(melodyService.getRecentMelodiesPaginated).toHaveBeenCalledWith(null, '');
    });
  });

  test('renders a sentinel element for infinite scroll', async () => {
    await renderHomePage();
    await waitFor(() => {
      expect(mockObserve).toHaveBeenCalled();
    });
  });

  test('fetches next page when sentinel is visible and next cursor exists', async () => {
    melodyService.getRecentMelodiesPaginated
      .mockReset()
      .mockResolvedValueOnce({
        results: mockMelodies,
        next: 'http://host/api/melodies/recent/?cursor=abc123',
        previous: null,
      });

    await renderHomePage();
    await waitFor(() => expect(screen.getByText('Bossa Nova')).toBeInTheDocument());

    melodyService.getRecentMelodiesPaginated.mockResolvedValueOnce({
      results: [{ id: '3', title: 'Page 2 Song', share_id: 'ghi789', created_at: '2026-05-03T00:00:00Z', author: { username: 'user3' } }],
      next: null,
      previous: null,
    });

    await act(async () => {
      intersectionCallback([{ isIntersecting: true }]);
    });

    await waitFor(() => {
      expect(screen.getByText('Page 2 Song')).toBeInTheDocument();
    });
  });

  test('does not fetch next page when next cursor is null', async () => {
    await renderHomePage();
    await waitFor(() => expect(screen.getByText('Bossa Nova')).toBeInTheDocument());

    melodyService.getRecentMelodiesPaginated.mockClear();

    await act(async () => {
      intersectionCallback([{ isIntersecting: true }]);
    });

    expect(melodyService.getRecentMelodiesPaginated).not.toHaveBeenCalled();
  });
});
