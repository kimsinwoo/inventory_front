import apiClient from './api';

/**
 * 인증 관리 API 서비스
 * Base Path: /api/auth
 */
const authService = {
  /**
   * 로그인
   * POST /api/auth/login
   * @param {string} username - 사용자 아이디
   * @param {string} password - 비밀번호
   * @returns {Promise}
   */
  login: async (username, password) => {
    const response = await apiClient.post('/auth/login', { username, password });
    return response.data;
  },

  /**
   * 회원가입
   * POST /api/auth/join
   * @param {string} username - 사용자 아이디
   * @param {string} password - 비밀번호
   * @param {string} name - 사용자 이름
   * @param {string} email - 이메일 (선택)
   * @returns {Promise}
   */
  signup: async (username, password, name, email) => {
    const payload = {
      username,
      password,
      name,
    };
    if (email) {
      payload.email = email;
    }
    const response = await apiClient.post('/auth/join', payload);
    return response.data;
  },

  /**
   * 로그아웃
   * POST /api/auth/logout
   * @returns {Promise}
   */
  logout: async () => {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  },

  /**
   * 현재 사용자 정보 조회
   * GET /api/auth/me
   * @returns {Promise}
   */
  getCurrentUser: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  /**
   * 사용자 목록 조회
   * GET /api/auth/
   * @returns {Promise}
   */
  getAllUsers: async () => {
    const response = await apiClient.get('/auth/');
    return response.data;
  },

  /**
   * 사용자 상세 조회
   * GET /api/auth/:id
   * @param {number} id - 사용자 ID
   * @returns {Promise}
   */
  getUserById: async (id) => {
    const response = await apiClient.get(`/auth/${id}`);
    return response.data;
  },

  /**
   * 사용자 정보 수정
   * PUT /api/auth/:id
   * @param {number} id - 사용자 ID
   * @param {Object} userData - 수정할 사용자 데이터
   * @returns {Promise}
   */
  updateUser: async (id, userData) => {
    const response = await apiClient.put(`/auth/${id}`, userData);
    return response.data;
  },

  /**
   * 사용자 삭제
   * DELETE /api/auth/:id
   * @param {number} id - 사용자 ID
   * @returns {Promise}
   */
  deleteUser: async (id) => {
    const response = await apiClient.delete(`/auth/${id}`);
    return response.data;
  },
};

export default authService;

