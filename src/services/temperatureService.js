import apiClient from './api';

/**
 * 온도 관리 API 서비스
 * Base Path: /api/temperatures
 */
const temperatureService = {
  /**
   * 온도 기록 추가
   * POST /api/temperatures
   * @param {Object} temperatureData - 온도 기록 데이터
   * @returns {Promise}
   */
  create: async (temperatureData) => {
    const response = await apiClient.post('/temperatures', temperatureData);
    return response.data;
  },

  /**
   * 온도 기록 조회
   * GET /api/temperatures
   * @param {Object} params - 쿼리 파라미터
   * @returns {Promise}
   */
  getAll: async (params = {}) => {
    const response = await apiClient.get('/temperatures', { params });
    return response.data;
  },
};

export default temperatureService;

