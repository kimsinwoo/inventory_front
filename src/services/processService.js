import apiClient from './api';

/**
 * 공정 관리 API 서비스
 * Base Path: /api/processes
 */
const processService = {
  /**
   * 공정 목록 조회
   * GET /api/processes
   * @returns {Promise}
   */
  getAll: async () => {
    const response = await apiClient.get('/processes');
    return response.data;
  },

  /**
   * 공정 상세 조회
   * GET /api/processes/:id
   * @param {number} id - 공정 ID
   * @returns {Promise}
   */
  getById: async (id) => {
    const response = await apiClient.get(`/processes/${id}`);
    return response.data;
  },

  /**
   * 공정 생성
   * POST /api/processes
   * @param {Object} processData - 공정 데이터
   * @param {string} processData.name - 공정명 (필수)
   * @param {string} processData.description - 공정 설명 (선택)
   * @returns {Promise}
   */
  create: async (processData) => {
    const response = await apiClient.post('/processes', processData);
    return response.data;
  },

  /**
   * 공정 수정
   * PUT /api/processes/:id
   * @param {number} id - 공정 ID
   * @param {Object} processData - 수정할 공정 데이터
   * @returns {Promise}
   */
  update: async (id, processData) => {
    const response = await apiClient.put(`/processes/${id}`, processData);
    return response.data;
  },

  /**
   * 공정 삭제
   * DELETE /api/processes/:id
   * @param {number} id - 공정 ID
   * @returns {Promise}
   */
  delete: async (id) => {
    const response = await apiClient.delete(`/processes/${id}`);
    return response.data;
  },
};

export default processService;

