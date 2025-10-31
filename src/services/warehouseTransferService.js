import apiClient from './api';

/**
 * 창고 이동 API 서비스
 * Base Path: /api/warehouse-transfers
 */
const warehouseTransferService = {
  /**
   * 창고 이동 이력 조회
   * GET /api/warehouse-transfers/history
   * @param {Object} params - 쿼리 파라미터
   * @returns {Promise}
   */
  getHistory: async (params = {}) => {
    const response = await apiClient.get('/warehouse-transfers/history', { params });
    return response.data;
  },

  /**
   * 이동 경로 통계
   * GET /api/warehouse-transfers/path-stats
   * @param {Object} params - 쿼리 파라미터
   * @returns {Promise}
   */
  getPathStats: async (params = {}) => {
    const response = await apiClient.get('/warehouse-transfers/path-stats', { params });
    return response.data;
  },

  /**
   * 창고 이동 생성
   * POST /api/warehouse-transfers
   * @param {Object} transferData - 이동 데이터
   * @returns {Promise}
   */
  create: async (transferData) => {
    const response = await apiClient.post('/warehouse-transfers', transferData);
    return response.data;
  },
};

export default warehouseTransferService;

