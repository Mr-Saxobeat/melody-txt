import api from './api';

const setlistService = {
  async getSetlists() {
    const response = await api.get('/setlists/');
    return response.data;
  },

  async createSetlist(title) {
    const response = await api.post('/setlists/', { title });
    return response.data;
  },

  async getSetlist(id) {
    const response = await api.get(`/setlists/${id}/`);
    return response.data;
  },

  async updateSetlist(id, data) {
    const response = await api.put(`/setlists/${id}/`, data);
    return response.data;
  },

  async deleteSetlist(id) {
    await api.delete(`/setlists/${id}/`);
  },

  async addEntry(setlistId, melodyId, position) {
    const response = await api.post(`/setlists/${setlistId}/entries/`, {
      melody_id: melodyId,
      position,
    });
    return response.data;
  },

  async updateEntry(setlistId, entryId, position) {
    const response = await api.put(`/setlists/${setlistId}/entries/${entryId}/`, {
      position,
    });
    return response.data;
  },

  async removeEntry(setlistId, entryId) {
    await api.delete(`/setlists/${setlistId}/entries/${entryId}/`);
  },

  async getSharedSetlist(shareId) {
    const response = await api.get(`/setlists/shared/${shareId}/`);
    return response.data;
  },
};

export default setlistService;
