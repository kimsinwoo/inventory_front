import apiClient from './api';

/**
 * 보관 조건 관리 API 서비스
 * Base Path: /api/storage-conditions
 */
const storageConditionService = {
  /**
   * 보관 조건 목록 조회
   * GET /api/storage-conditions
   * @returns {Promise}
   */
  getAll: async () => {
    const response = await apiClient.get('/storage-conditions');
    return response.data;
  },

  /**
   * 보관 조건 상세 조회
   * GET /api/storage-conditions/:id
   * @param {number} id - 보관 조건 ID
   * @returns {Promise}
   */
  getById: async (id) => {
    const response = await apiClient.get(`/storage-conditions/${id}`);
    return response.data;
  },

  /**
   * 보관 조건 생성
   * POST /api/storage-conditions
   * @param {Object} conditionData - 보관 조건 데이터
   * @param {string} conditionData.name - 보관 조건명 (필수, 1-50자)
   * @param {string} conditionData.temperature_range - 온도 범위 (선택, 1-50자)
   * @param {string} conditionData.humidity_range - 습도 범위 (선택, 1-50자)
   * @returns {Promise}
   */
  create: async (conditionData) => {
    const response = await apiClient.post('/storage-conditions', conditionData);
    return response.data;
  },

  /**
   * 보관 조건 수정
   * PUT /api/storage-conditions/:id
   * @param {number} id - 보관 조건 ID
   * @param {Object} conditionData - 수정할 보관 조건 데이터
   * @returns {Promise}
   */
  update: async (id, conditionData) => {
    const response = await apiClient.put(`/storage-conditions/${id}`, conditionData);
    return response.data;
  },

  /**
   * 보관 조건 삭제
   * DELETE /api/storage-conditions/:id
   * @param {number} id - 보관 조건 ID
   * @returns {Promise}
   */
  delete: async (id) => {
    const response = await apiClient.delete(`/storage-conditions/${id}`);
    return response.data;
  },
};

export default storageConditionService;

