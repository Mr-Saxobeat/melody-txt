import api from './api';

const melodyService = {
  async createMelody(title, notation, key = 'C', isPublic = true) {
    const response = await api.post('/melodies/', {
      title,
      notation,
      key,
      is_public: isPublic,
    });
    return response.data;
  },

  async getUserMelodies(page = 1, pageSize = 50) {
    const response = await api.get('/melodies/', {
      params: { page, page_size: pageSize },
    });
    return response.data;
  },

  async getMelody(id) {
    const response = await api.get(`/melodies/${id}/`);
    return response.data;
  },

  async updateMelody(id, data) {
    const response = await api.put(`/melodies/${id}/`, data);
    return response.data;
  },

  async deleteMelody(id) {
    await api.delete(`/melodies/${id}/`);
  },

  async getSharedMelody(shareId) {
    const response = await api.get(`/melodies/shared/${shareId}/`);
    return response.data;
  },
};

export default melodyService;
