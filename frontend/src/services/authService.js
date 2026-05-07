import api from './api';

const authService = {
  /**
   * Register a new user
   * @param {string} username - Username (3-150 characters)
   * @param {string} email - Email address
   * @param {string} password - Password (8+ characters, uppercase, lowercase, number)
   * @returns {Promise} User data
   */
  async register(username, email, password) {
    const response = await api.post('/auth/register/', {
      username,
      email,
      password,
      password_confirm: password,
    });
    return response.data;
  },

  /**
   * Login user and store tokens
   * @param {string} username - Username
   * @param {string} password - Password
   * @returns {Promise} Tokens (access, refresh)
   */
  async login(username, password) {
    const response = await api.post('/auth/token/', {
      username,
      password,
    });

    const { access, refresh } = response.data;

    // Store tokens in localStorage
    localStorage.setItem('accessToken', access);
    localStorage.setItem('refreshToken', refresh);

    return response.data;
  },

  /**
   * Refresh access token
   * @param {string} refreshToken - Refresh token
   * @returns {Promise} New access token
   */
  async refreshToken(refreshToken) {
    const response = await api.post('/auth/token/refresh/', {
      refresh: refreshToken,
    });

    const { access } = response.data;
    localStorage.setItem('accessToken', access);

    return access;
  },

  /**
   * Logout user (clear tokens)
   */
  logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },

  /**
   * Check if user is authenticated
   * @returns {boolean} True if access token exists
   */
  isAuthenticated() {
    return !!localStorage.getItem('accessToken');
  },

  /**
   * Get stored access token
   * @returns {string|null} Access token or null
   */
  getAccessToken() {
    return localStorage.getItem('accessToken');
  },

  /**
   * Get stored refresh token
   * @returns {string|null} Refresh token or null
   */
  getRefreshToken() {
    return localStorage.getItem('refreshToken');
  },
};

export default authService;
