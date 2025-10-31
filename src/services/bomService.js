import apiClient from './api';

/**
 * BOM (Bill of Materials) 관리 API 서비스
 * Base Path: /api/boms
 */
const bomService = {
  /**
   * BOM 목록 조회
   * GET /api/boms
   * @returns {Promise}
   */
  getAll: async () => {
    const response = await apiClient.get('/boms');
    return response.data;
  },

  /**
   * BOM 상세 조회
   * GET /api/boms/:id
   * @param {number} id - BOM ID
   * @returns {Promise}
   */
  getById: async (id) => {
    const response = await apiClient.get(`/boms/${id}`);
    return response.data;
  },

  /**
   * BOM 생성
   * POST /api/boms
   * @param {Object} bomData - BOM 데이터
   * @param {string} bomData.name - BOM 이름 (필수)
   * @param {Array} bomData.lines - 구성 품목 배열 (필수, 최소 1개)
   * @returns {Promise}
   */
  create: async (bomData) => {
    const response = await apiClient.post('/boms', bomData);
    return response.data;
  },

  /**
   * BOM 수정
   * PUT /api/boms/:id
   * @param {number} id - BOM ID
   * @param {Object} bomData - 수정할 BOM 데이터
   * @returns {Promise}
   */
  update: async (id, bomData) => {
    const response = await apiClient.put(`/boms/${id}`, bomData);
    return response.data;
  },

  /**
   * BOM 삭제
   * DELETE /api/boms/:id
   * @param {number} id - BOM ID
   * @returns {Promise}
   */
  delete: async (id) => {
    const response = await apiClient.delete(`/boms/${id}`);
    return response.data;
  },
};

export default bomService;

