import apiClient from './api';

/**
 * 대시보드 API 서비스
 * Base Path: /api/dashboard
 */
const dashboardService = {
  /**
   * 메인 대시보드 (모든 데이터)
   * GET /api/dashboard
   * @returns {Promise}
   */
  getAll: async () => {
    const response = await apiClient.get('/dashboard');
    return response.data;
  },

  /**
   * 총 재고 가치
   * GET /api/dashboard/total-value
   * @returns {Promise}
   */
  getTotalValue: async () => {
    const response = await apiClient.get('/dashboard/total-value');
    return response.data;
  },

  /**
   * 카테고리별 재고 분포
   * GET /api/dashboard/category-breakdown
   * @returns {Promise}
   */
  getCategoryBreakdown: async () => {
    const response = await apiClient.get('/dashboard/category-breakdown');
    return response.data;
  },

  /**
   * 최근 재고 이동
   * GET /api/dashboard/recent-movements
   * @returns {Promise}
   */
  getRecentMovements: async () => {
    const response = await apiClient.get('/dashboard/recent-movements');
    return response.data;
  },

  /**
   * 가장 많이 움직인 품목
   * GET /api/dashboard/top-moving-items
   * @returns {Promise}
   */
  getTopMovingItems: async () => {
    const response = await apiClient.get('/dashboard/top-moving-items');
    return response.data;
  },

  /**
   * 재고 상태 요약
   * GET /api/dashboard/stock-status
   * @returns {Promise}
   */
  getStockStatus: async () => {
    const response = await apiClient.get('/dashboard/stock-status');
    return response.data;
  },

  /**
   * 월별 트렌드
   * GET /api/dashboard/monthly-trend
   * @returns {Promise}
   */
  getMonthlyTrend: async () => {
    const response = await apiClient.get('/dashboard/monthly-trend');
    return response.data;
  },

  /**
   * 공장별 비교
   * GET /api/dashboard/factory-comparison
   * @returns {Promise}
   */
  getFactoryComparison: async () => {
    const response = await apiClient.get('/dashboard/factory-comparison');
    return response.data;
  },

  /**
   * KPI 지표
   * GET /api/dashboard/kpis
   * @returns {Promise}
   */
  getKpis: async () => {
    const response = await apiClient.get('/dashboard/kpis');
    return response.data;
  },
};

export default dashboardService;

