import apiClient from './api';

/**
 * 재고 관리 API 서비스
 * Base Path: /api/inventories
 */
const inventoryService = {
  /**
   * 재고 목록 조회
   * GET /api/inventories
   * @param {Object} params - 쿼리 파라미터
   * @param {number} params.itemId - 품목 ID
   * @param {number} params.factoryId - 공장 ID
   * @param {string} params.status - 상태 (Normal, LowStock, Expiring, Expired)
   * @param {string} params.category - 카테고리
   * @param {string} params.search - 검색어
   * @param {number} params.page - 페이지 번호
   * @param {number} params.limit - 페이지당 항목 수
   * @returns {Promise}
   */
  getAll: async (params = {}) => {
    const response = await apiClient.get('/inventories', { params });
    return response.data;
  },

  /**
   * 재고 상태 조회 (getAll과 동일)
   * GET /api/inventories
   * @param {Object} params - 쿼리 파라미터
   * @returns {Promise}
   */
  getStatus: async (params = {}) => {
    const response = await apiClient.get('/inventories', { params });
    return response.data;
  },

  /**
   * 재고 요약 조회
   * GET /api/inventories/summary
   * @param {Object} params - 쿼리 파라미터
   * @param {number} params.factoryId - 공장 ID
   * @returns {Promise}
   */
  getSummary: async (params = {}) => {
    const response = await apiClient.get('/inventories/summary', { params });
    return response.data;
  },

  /**
   * 창고 이용률 조회
   * GET /api/inventories/utilization
   * @returns {Promise}
   */
  getUtilization: async () => {
    const response = await apiClient.get('/inventories/utilization');
    return response.data;
  },

  /**
   * 재고 이동 이력 조회
   * GET /api/inventories/movements
   * @param {Object} params - 쿼리 파라미터
   * @param {number} params.itemId - 품목 ID
   * @param {number} params.factoryId - 공장 ID
   * @param {string} params.from - 시작 날짜 (ISO 8601)
   * @param {string} params.to - 종료 날짜 (ISO 8601)
   * @param {number} params.page - 페이지 번호
   * @param {number} params.limit - 페이지당 항목 수
   * @returns {Promise}
   */
  getMovements: async (params = {}) => {
    const response = await apiClient.get('/inventories/movements', { params });
    console.log('원본 데이터 값: ', response)
    return response.data;
  },

  /**
   * 입고 처리
   * POST /api/inventories/receive
   * @param {Object} receiveData - 입고 데이터
   * @returns {Promise}
   */
  receive: async (receiveData) => {
    const response = await apiClient.post('/inventories/receive', receiveData);
    return response.data;
  },

  /**
   * 출고 처리
   * POST /api/inventories/issue
   * @param {Object} issueData - 출고 데이터
   * @returns {Promise}
   */
  issue: async (issueData) => {
    const response = await apiClient.post('/inventories/issue', issueData);
    return response.data;
  },

  /**
   * 공장 간 이동
   * POST /api/inventories/transfer
   * @param {Object} transferData - 이동 데이터
   * @returns {Promise}
   */
  transfer: async (transferData) => {
    const response = await apiClient.post('/inventories/transfer', transferData);
    return response.data;
  },

  /**
   * 재고 삭제
   * DELETE /api/inventories/:id
   * @param {number} id - 재고 ID
   * @returns {Promise}
   */
  delete: async (id) => {
    const response = await apiClient.delete(`/inventories/${id}`);
    return response.data;
  },
};

export default inventoryService;

