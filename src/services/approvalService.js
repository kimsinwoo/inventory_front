import apiClient from './api';

/**
 * 전자결재 API 서비스
 * Base Path: /api/approvals
 */
const approvalService = {
  /**
   * 결재 대기 목록 조회
   * GET /api/approvals/inbox
   * @returns {Promise}
   */
  getInbox: async () => {
    const response = await apiClient.get('/approvals/inbox');
    return response.data;
  },

  /**
   * 결재 상세 조회
   * GET /api/approvals/:id
   * @param {number} id - 결재 ID
   * @returns {Promise}
   */
  getById: async (id) => {
    const response = await apiClient.get(`/approvals/${id}`);
    return response.data;
  },

  /**
   * 결재 승인
   * POST /api/approvals/:id/approve
   * @param {number} id - 결재 ID
   * @returns {Promise}
   */
  approve: async (id) => {
    const response = await apiClient.post(`/approvals/${id}/approve`);
    return response.data;
  },

  /**
   * 결재 반려
   * POST /api/approvals/:id/reject
   * @param {number} id - 결재 ID
   * @param {string} reason - 반려 사유 (선택)
   * @returns {Promise}
   */
  reject: async (id, reason) => {
    const response = await apiClient.post(`/approvals/${id}/reject`, {
      reason: reason || undefined,
    });
    return response.data;
  },
};

export default approvalService;

