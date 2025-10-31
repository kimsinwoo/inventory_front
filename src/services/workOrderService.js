import apiClient from './api';

const WORK_ORDER_BASE_PATH = '/work-orders';

const workOrderService = {
  /**
   * 작업 지시서 생성
   * POST /api/work-orders
   */
  create: async (data) => {
    const response = await apiClient.post(WORK_ORDER_BASE_PATH, data);
    return response.data;
  },

  /**
   * 작업 지시서 목록 조회
   * GET /api/work-orders
   */
  getAll: async (params = {}) => {
    const response = await apiClient.get(WORK_ORDER_BASE_PATH, { params });
    return response.data;
  },

  /**
   * 작업 지시서 상세 조회
   * GET /api/work-orders/:id
   */
  getById: async (id) => {
    const response = await apiClient.get(`${WORK_ORDER_BASE_PATH}/${id}`);
    return response.data;
  },

  /**
   * 작업 지시서 수정
   * PUT /api/work-orders/:id
   */
  update: async (id, data) => {
    const response = await apiClient.put(`${WORK_ORDER_BASE_PATH}/${id}`, data);
    return response.data;
  },

  /**
   * 작업 지시서 삭제
   * DELETE /api/work-orders/:id
   */
  delete: async (id) => {
    const response = await apiClient.delete(`${WORK_ORDER_BASE_PATH}/${id}`);
    return response.data;
  },

  /**
   * 작업 시작
   * POST /api/work-orders/:id/start
   */
  start: async (id) => {
    const response = await apiClient.post(`${WORK_ORDER_BASE_PATH}/${id}/start`);
    return response.data;
  },

  /**
   * 생산 완료 처리 (원재료 자동 소비 + 완제품 생성)
   * POST /api/work-orders/:id/complete
   */
  complete: async (id, data = {}) => {
    const response = await apiClient.post(`${WORK_ORDER_BASE_PATH}/${id}/complete`, data);
    return response.data;
  },

  /**
   * 작업 취소
   * POST /api/work-orders/:id/cancel
   */
  cancel: async (id, reason) => {
    const response = await apiClient.post(`${WORK_ORDER_BASE_PATH}/${id}/cancel`, { reason });
    return response.data;
  },

  /**
   * 통계 조회
   * GET /api/work-orders/stats
   */
  getStats: async (params = {}) => {
    const response = await apiClient.get(`${WORK_ORDER_BASE_PATH}/stats`, { params });
    return response.data;
  },
};

export default workOrderService;

