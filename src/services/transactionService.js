import apiClient from './api';

/**
 * 입출고 트랜잭션 API 서비스
 * Base Path: /api/inventory-transactions
 * 
 * 주의: 모든 엔드포인트는 인증이 필요함
 */
const transactionService = {
  /**
   * 트랜잭션 목록 조회
   * GET /api/inventory-transactions
   * @param {Object} params - 쿼리 파라미터
   * @param {string} params.type - RECEIVE, ISSUE, TRANSFER, ALL
   * @param {number} params.itemId - 품목 ID
   * @param {number} params.factoryId - 공장 ID
   * @param {string} params.startDate - 시작 날짜 (ISO 8601)
   * @param {string} params.endDate - 종료 날짜 (ISO 8601)
   * @param {number} params.userId - 사용자 ID
   * @param {number} params.page - 페이지 번호
   * @param {number} params.limit - 페이지당 항목 수
   * @returns {Promise}
   */
  getAll: async (params = {}) => {
    const response = await apiClient.get('/inventory-transactions', { params });
    return response.data;
  },

  /**
   * 트랜잭션 상세 조회
   * GET /api/inventory-transactions/:id
   * @param {number} id - 트랜잭션 ID
   * @returns {Promise}
   */
  getById: async (id) => {
    const response = await apiClient.get(`/inventory-transactions/${id}`);
    return response.data;
  },

  /**
   * 트랜잭션 통계
   * GET /api/inventory-transactions/stats
   * @param {Object} params - 쿼리 파라미터
   * @param {number} params.factoryId - 공장 ID
   * @param {string} params.startDate - 시작 날짜 (ISO 8601)
   * @param {string} params.endDate - 종료 날짜 (ISO 8601)
   * @param {string} params.groupBy - day, week, month
   * @returns {Promise}
   */
  getStats: async (params = {}) => {
    const response = await apiClient.get('/inventory-transactions/stats', { params });
    return response.data;
  },

  /**
   * 월별 이용률
   * GET /api/inventory-transactions/monthly-utilization
   * @returns {Promise}
   */
  getMonthlyUtilization: async () => {
    const response = await apiClient.get('/inventory-transactions/monthly-utilization');
    return response.data;
  },

  /**
   * 입고 트랜잭션 생성
   * POST /api/inventory-transactions/receive
   * @param {Object} receiveData - 입고 데이터
   * @param {number} receiveData.itemId - 품목 ID (필수)
   * @param {number} receiveData.factoryId - 공장 ID (필수)
   * @param {number} receiveData.storageConditionId - 보관 조건 ID (필수)
   * @param {string} receiveData.lotNumber - LOT 번호 (필수)
   * @param {number} receiveData.wholesalePrice - 도매가 (필수)
   * @param {number} receiveData.quantity - 수량 (필수)
   * @param {string} receiveData.unit - 단위 (필수)
   * @param {string} receiveData.receivedAt - 입고 날짜 (필수, ISO 8601)
   * @param {string} receiveData.firstReceivedAt - 최초 입고 날짜 (선택)
   * @param {string} receiveData.note - 비고 (선택)
   * @param {boolean} receiveData.printLabel - 라벨 출력 여부 (선택)
   * @param {string} receiveData.labelSize - 라벨 크기 (선택)
   * @param {number} receiveData.labelQuantity - 라벨 출력 수량 (선택)
   * @returns {Promise}
   */
  createReceive: async (receiveData) => {
    const response = await apiClient.post('/inventory-transactions/receive', receiveData);
    return response.data;
  },

  /**
   * 출고 트랜잭션 생성
   * POST /api/inventory-transactions/issue
   * @param {Object} issueData - 출고 데이터
   * @param {number} issueData.itemId - 품목 ID (필수)
   * @param {number} issueData.factoryId - 공장 ID (필수)
   * @param {number} issueData.quantity - 수량 (필수)
   * @param {string} issueData.unit - 단위 (필수)
   * @param {string} issueData.issueType - 출고 유형 (선택)
   * @param {Object} issueData.shippingInfo - 배송 정보 (선택)
   * @param {string} issueData.note - 비고 (선택)
   * @returns {Promise}
   */
  createIssue: async (issueData) => {
    const response = await apiClient.post('/inventory-transactions/issue', issueData);
    return response.data;
  },

  /**
   * 일괄 출고
   * POST /api/inventory-transactions/batch-issue
   * @param {Array} transactions - 트랜잭션 배열 (최소 1개, 최대 100개)
   * @returns {Promise}
   */
  batchIssue: async (transactions) => {
    const response = await apiClient.post('/inventory-transactions/batch-issue', { transactions });
    return response.data;
  },

  /**
   * 공장 간 이동 트랜잭션
   * POST /api/inventory-transactions/transfer
   * @param {Object} transferData - 이동 데이터
   * @param {number} transferData.itemId - 품목 ID (필수)
   * @param {number} transferData.sourceFactoryId - 출발 공장 ID (필수)
   * @param {number} transferData.destFactoryId - 도착 공장 ID (필수)
   * @param {number} transferData.storageConditionId - 보관 조건 ID (필수)
   * @param {number} transferData.quantity - 수량 (필수)
   * @param {string} transferData.unit - 단위 (필수)
   * @param {string} transferData.transferType - 이동 유형 (선택)
   * @param {string} transferData.note - 비고 (선택)
   * @returns {Promise}
   */
  createTransfer: async (transferData) => {
    const response = await apiClient.post('/inventory-transactions/transfer', transferData);
    return response.data;
  },

  /**
   * 트랜잭션 삭제 (입고/출고 취소)
   * DELETE /api/inventory-transactions/:id
   * @param {number} id - 트랜잭션 ID
   * @returns {Promise}
   */
  deleteTransaction: async (id) => {
    const response = await apiClient.delete(`/inventory-transactions/${id}`);
    return response.data;
  },
};

export default transactionService;

