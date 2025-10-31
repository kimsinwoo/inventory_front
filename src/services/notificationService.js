import apiClient from './api';

/**
 * 알림 API 서비스
 * Base Path: /api/notifications
 */
const notificationService = {
  /**
   * 재고 부족 알림
   * GET /api/notifications/low-stock
   * @returns {Promise}
   */
  getLowStock: async () => {
    const response = await apiClient.get('/notifications/low-stock');
    return response.data;
  },

  /**
   * 유통기한 임박 알림
   * GET /api/notifications/expiring
   * @returns {Promise}
   */
  getExpiring: async () => {
    const response = await apiClient.get('/notifications/expiring');
    return response.data;
  },

  /**
   * 만료된 재고
   * GET /api/notifications/expired
   * @returns {Promise}
   */
  getExpired: async () => {
    const response = await apiClient.get('/notifications/expired');
    return response.data;
  },

  /**
   * 전체 알림 요약
   * GET /api/notifications/summary
   * @returns {Promise}
   */
  getSummary: async () => {
    const response = await apiClient.get('/notifications/summary');
    return response.data;
  },

  /**
   * 공장별 알림
   * GET /api/notifications/factory-alerts
   * @returns {Promise}
   */
  getFactoryAlerts: async () => {
    const response = await apiClient.get('/notifications/factory-alerts');
    return response.data;
  },

  /**
   * 일일 알림 리포트
   * GET /api/notifications/daily-report
   * @returns {Promise}
   */
  getDailyReport: async () => {
    const response = await apiClient.get('/notifications/daily-report');
    return response.data;
  },
};

export default notificationService;

