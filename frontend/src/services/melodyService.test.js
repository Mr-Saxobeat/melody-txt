import melodyService from './melodyService';
import api from './api';

jest.mock('./api');

describe('melodyService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createMelody', () => {
    test('creates melody with correct data', async () => {
      const mockResponse = {
        data: {
          id: 'uuid-1',
          title: 'My Song',
          notation: 'do re mi',
          key: 'C',
          share_id: 'abc123def456',
          is_public: true,
          note_count: 3,
          duration_seconds: 1.5,
        },
      };
      api.post.mockResolvedValue(mockResponse);

      const result = await melodyService.createMelody('My Song', 'do re mi', 'C', true);

      expect(api.post).toHaveBeenCalledWith('/melodies/', {
        title: 'My Song',
        notation: 'do re mi',
        key: 'C',
        is_public: true,
      });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getUserMelodies', () => {
    test('fetches user melodies with pagination', async () => {
      const mockResponse = {
        data: { count: 2, results: [{ id: '1' }, { id: '2' }] },
      };
      api.get.mockResolvedValue(mockResponse);

      const result = await melodyService.getUserMelodies(1, 50);

      expect(api.get).toHaveBeenCalledWith('/melodies/', {
        params: { page: 1, page_size: 50 },
      });
      expect(result.count).toBe(2);
    });
  });

  describe('getMelody', () => {
    test('fetches single melody by id', async () => {
      const mockResponse = { data: { id: 'uuid-1', title: 'Song' } };
      api.get.mockResolvedValue(mockResponse);

      const result = await melodyService.getMelody('uuid-1');

      expect(api.get).toHaveBeenCalledWith('/melodies/uuid-1/');
      expect(result.title).toBe('Song');
    });
  });

  describe('updateMelody', () => {
    test('updates melody with new data', async () => {
      const mockResponse = { data: { id: 'uuid-1', title: 'Updated' } };
      api.put.mockResolvedValue(mockResponse);

      const result = await melodyService.updateMelody('uuid-1', { title: 'Updated' });

      expect(api.put).toHaveBeenCalledWith('/melodies/uuid-1/', { title: 'Updated' });
      expect(result.title).toBe('Updated');
    });
  });

  describe('deleteMelody', () => {
    test('deletes melody by id', async () => {
      api.delete.mockResolvedValue({});

      await melodyService.deleteMelody('uuid-1');

      expect(api.delete).toHaveBeenCalledWith('/melodies/uuid-1/');
    });
  });

  describe('getSharedMelody', () => {
    test('fetches shared melody by share_id', async () => {
      const mockResponse = {
        data: { title: 'Shared Song', share_id: 'abc123def456' },
      };
      api.get.mockResolvedValue(mockResponse);

      const result = await melodyService.getSharedMelody('abc123def456');

      expect(api.get).toHaveBeenCalledWith('/melodies/shared/abc123def456/');
      expect(result.title).toBe('Shared Song');
    });
  });
});
