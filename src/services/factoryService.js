import apiClient from './api';

/**
 * 공장 관리 API 서비스
 * Base Path: /api/factories
 */
const factoryService = {
  /**
   * 공장 목록 조회
   * GET /api/factories
   * @returns {Promise}
   */
  getAll: async () => {
    const response = await apiClient.get('/factories');
    return response.data;
  },

  /**
   * 공장 상세 조회
   * GET /api/factories/:id
   * @param {number} id - 공장 ID
   * @returns {Promise}
   */
  getById: async (id) => {
    const response = await apiClient.get(`/factories/${id}`);
    return response.data;
  },

  /**
   * 공장 생성
   * POST /api/factories
   * @param {Object} factoryData - 공장 데이터
   * @param {string} factoryData.type - 공장 타입 (필수)
   * @param {string} factoryData.name - 공장명 (필수)
   * @param {string} factoryData.address - 주소 (선택)
   * @returns {Promise}
   */
  create: async (factoryData) => {
    const response = await apiClient.post('/factories', factoryData);
    return response.data;
  },

  /**
   * 공장 수정
   * PUT /api/factories/:id
   * @param {number} id - 공장 ID
   * @param {Object} factoryData - 수정할 공장 데이터
   * @returns {Promise}
   */
  update: async (id, factoryData) => {
    const response = await apiClient.put(`/factories/${id}`, factoryData);
    return response.data;
  },

  /**
   * 공장 삭제
   * DELETE /api/factories/:id
   * @param {number} id - 공장 ID
   * @returns {Promise}
   */
  delete: async (id) => {
    const response = await apiClient.delete(`/factories/${id}`);
    return response.data;
  },

  /**
   * 공장에 공정 추가
   * POST /api/factories/:id/processes
   * @param {number} id - 공장 ID
   * @param {Array<number>} processIds - 공정 ID 배열
   * @returns {Promise}
   */
  addProcesses: async (id, processIds) => {
    const response = await apiClient.post(`/factories/${id}/processes`, { processIds });
    return response.data;
  },

  /**
   * 공장에서 공정 제거
   * DELETE /api/factories/:id/processes/:processId
   * @param {number} id - 공장 ID
   * @param {number} processId - 공정 ID
   * @returns {Promise}
   */
  removeProcess: async (id, processId) => {
    const response = await apiClient.delete(`/factories/${id}/processes/${processId}`);
    return response.data;
  },
};

export default factoryService;

