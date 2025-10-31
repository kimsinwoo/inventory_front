import apiClient from './api';

/**
 * 배송 관리 API 서비스
 * Base Path: /api/shipping
 */
const shippingService = {
  /**
   * 주문 리스트 업로드 (엑셀 파일)
   * POST /api/shipping/upload-orders
   * @param {FormData} formData - 업로드할 파일들 및 메타데이터
   * @returns {Promise}
   */
  uploadOrders: async (formData) => {
    const response = await apiClient.post('/shipping/upload-orders', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * 주문 목록 조회
   * GET /api/shipping/orders
   * @param {Object} params - 쿼리 파라미터
   * @returns {Promise}
   */
  getOrders: async (params = {}) => {
    const response = await apiClient.get('/shipping/orders', { params });
    return response.data;
  },

  /**
   * 주문 상세 조회
   * GET /api/shipping/orders/:id
   * @param {number} id - 주문 ID
   * @returns {Promise}
   */
  getOrderById: async (id) => {
    const response = await apiClient.get(`/shipping/orders/${id}`);
    return response.data;
  },

  /**
   * 주문 수정
   * PUT /api/shipping/orders/:id
   * @param {number} id - 주문 ID
   * @param {Object} orderData - 수정할 주문 데이터
   * @returns {Promise}
   */
  updateOrder: async (id, orderData) => {
    const response = await apiClient.put(`/shipping/orders/${id}`, orderData);
    return response.data;
  },

  /**
   * 주문 삭제
   * DELETE /api/shipping/orders/:id
   * @param {number} id - 주문 ID
   * @returns {Promise}
   */
  deleteOrder: async (id) => {
    const response = await apiClient.delete(`/shipping/orders/${id}`);
    return response.data;
  },

  /**
   * CJ 대한통운 형식으로 내보내기
   * POST /api/shipping/export/cj-logistics
   * @param {number[]} orderIds - 내보낼 주문 ID 목록
   * @returns {Promise}
   */
  exportToCJLogistics: async (orderIds) => {
    const response = await apiClient.post('/shipping/export/cj-logistics', { orderIds }, {
      responseType: 'blob',
    });
    return response;
  },

  /**
   * 파일 다운로드
   * GET /api/shipping/download/:filename
   * @param {string} filename - 파일명
   * @returns {Promise}
   */
  downloadFile: async (filename) => {
    const response = await apiClient.get(`/shipping/download/${filename}`, {
      responseType: 'blob',
    });
    return response;
  },

  /**
   * 출고 리스트 생성
   * POST /api/shipping/issue-list/generate
   * @param {Object} data - 출고 리스트 데이터
   * @param {number[]} data.orderIds - 주문 ID 목록
   * @param {string} data.issueType - B2C 또는 B2B
   * @returns {Promise}
   */
  generateIssueList: async (data) => {
    const response = await apiClient.post('/shipping/issue-list/generate', data);
    return response.data;
  },

  /**
   * 출고 리스트 내보내기
   * GET /api/shipping/issue-list/:id/export
   * @param {number} id - 출고 리스트 ID
   * @returns {Promise}
   */
  exportIssueList: async (id) => {
    const response = await apiClient.get(`/shipping/issue-list/${id}/export`, {
      responseType: 'blob',
    });
    return response;
  },

  /**
   * 출고 리스트 처리 (재고 감소)
   * POST /api/shipping/issue-list/:id/process
   * @param {number} id - 출고 리스트 ID
   * @returns {Promise}
   */
  processIssueList: async (id) => {
    const response = await apiClient.post(`/shipping/issue-list/${id}/process`);
    return response.data;
  },

  /**
   * 송장번호 일괄 입력
   * POST /api/shipping/tracking-numbers/bulk
   * @param {Object[]} trackingNumbers - 송장번호 배열
   * @param {number} trackingNumbers[].orderId - 주문 ID
   * @param {string} trackingNumbers[].trackingNumber - 송장번호
   * @returns {Promise}
   */
  bulkUpdateTrackingNumbers: async (trackingNumbers) => {
    const response = await apiClient.post('/shipping/tracking-numbers/bulk', { trackingNumbers });
    return response.data;
  },

  /**
   * 송장번호 파일 업로드
   * POST /api/shipping/tracking-numbers/upload
   * @param {FormData} formData - 송장번호 파일
   * @returns {Promise}
   */
  uploadTrackingNumbers: async (formData) => {
    const response = await apiClient.post('/shipping/tracking-numbers/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * 배치 목록 조회
   * GET /api/shipping/batches
   * @param {Object} params - 쿼리 파라미터
   * @returns {Promise}
   */
  getBatches: async (params = {}) => {
    const response = await apiClient.get('/shipping/batches', { params });
    return response.data;
  },

  /**
   * 배치 상세 조회
   * GET /api/shipping/batches/:id
   * @param {number} id - 배치 ID
   * @returns {Promise}
   */
  getBatchById: async (id) => {
    const response = await apiClient.get(`/shipping/batches/${id}`);
    return response.data;
  },

  /**
   * 배치 확정
   * POST /api/shipping/batches/:id/confirm
   * @param {number} id - 배치 ID
   * @returns {Promise}
   */
  confirmBatch: async (id) => {
    const response = await apiClient.post(`/shipping/batches/${id}/confirm`);
    return response.data;
  },

  /**
   * 배치 삭제
   * DELETE /api/shipping/batches/:id
   * @param {number} id - 배치 ID
   * @returns {Promise}
   */
  deleteBatch: async (id) => {
    const response = await apiClient.delete(`/shipping/batches/${id}`);
    return response.data;
  },
};

export default shippingService;
