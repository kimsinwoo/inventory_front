import apiClient from './api';

/**
 * 바코드 기반 물류 작업 API 서비스
 * Base Path: /api/barcode
 */
const barcodeService = {
  /**
   * 라벨 프린트용 바코드 생성
   * POST /api/barcode/generate-label
   * @param {Object} data
   * @param {number} data.itemId - 품목 ID
   * @param {number} data.quantity - 입고 수량
   * @param {string} data.receivedAt - 입고 예정 일시 (ISO 8601)
   * @returns {Promise}
   */
  generateLabel: async (data) => {
    const response = await apiClient.post('/barcode/generate-label', data);
    return response.data;
  },

  /**
   * 최초 입고 (바코드 포함)
   * POST /api/barcode/receive
   * @param {Object} data
   * @param {string} data.barcode - 생성된 바코드 (14자리)
   * @param {number} data.itemId - 품목 ID
   * @param {number} data.factoryId - 공장 ID
   * @param {number} data.storageConditionId - 보관 조건 ID
   * @param {number} data.wholesalePrice - 도매가
   * @param {number} data.quantity - 수량
   * @param {string} data.receivedAt - 입고 일시
   * @param {string} data.unit - 단위
   * @param {string} data.note - 메모
   * @returns {Promise}
   */
  receive: async (data) => {
    const response = await apiClient.post('/barcode/receive', data);
    return response.data;
  },

  /**
   * 바코드 스캔 (재고 조회)
   * GET /api/barcode/scan/:barcode
   * @param {string} barcode - 조회할 바코드 (14자리)
   * @returns {Promise}
   */
  scan: async (barcode) => {
    const response = await apiClient.get(`/barcode/scan/${barcode}`);
    return response.data;
  },

  /**
   * 공장 이동 - 출고 (바코드 스캔)
   * POST /api/barcode/transfer-out
   * @param {Object} data
   * @param {string} data.barcode - 스캔한 바코드
   * @param {number} data.quantity - 이동 수량
   * @param {number} data.toFactoryId - 목적지 공장 ID
   * @param {string} data.note - 메모
   * @returns {Promise}
   */
  transferOut: async (data) => {
    const response = await apiClient.post('/barcode/transfer-out', data);
    return response.data;
  },

  /**
   * 공장 이동 - 입고 (바코드 입력)
   * POST /api/barcode/transfer-in
   * @param {Object} data
   * @param {string} data.barcode - 입력한 바코드
   * @param {number} data.factoryId - 현재 공장 ID (목적지)
   * @param {number} data.storageConditionId - 보관 조건 ID
   * @param {string} data.note - 메모
   * @returns {Promise}
   */
  transferIn: async (data) => {
    const response = await apiClient.post('/barcode/transfer-in', data);
    return response.data;
  },

  /**
   * 바코드 기반 출고
   * POST /api/barcode/issue
   * @param {Object} data
   * @param {string} data.barcode - 스캔한 바코드
   * @param {number} data.quantity - 출고 수량
   * @param {string} data.issueType - 출고 유형 (SHIPPING, PRODUCTION, DISPOSAL, SAMPLE, OTHER)
   * @param {string} data.note - 메모
   * @param {string} data.customerName - 고객명
   * @param {string} data.trackingNumber - 송장 번호
   * @returns {Promise}
   */
  issue: async (data) => {
    const response = await apiClient.post('/barcode/issue', data);
    return response.data;
  },

  /**
   * 바코드 배송 처리
   * POST /api/barcode/ship
   * @param {Object} data
   * @param {string} data.barcode - 스캔한 바코드
   * @param {number} data.quantity - 배송 수량
   * @param {string} data.customerName - 고객명
   * @param {string} data.customerAddress - 배송 주소
   * @param {string} data.customerPhone - 고객 연락처
   * @param {string} data.shippingCompany - 택배사
   * @param {string} data.trackingNumber - 송장 번호
   * @param {string} data.shippingMessage - 배송 메시지
   * @returns {Promise}
   */
  ship: async (data) => {
    const response = await apiClient.post('/barcode/ship', data);
    return response.data;
  },

  /**
   * 바코드 이력 조회
   * GET /api/barcode/history/:barcode
   * @param {string} barcode - 조회할 바코드 (14자리)
   * @returns {Promise}
   */
  getHistory: async (barcode) => {
    const response = await apiClient.get(`/barcode/history/${barcode}`);
    return response.data;
  },
};

export default barcodeService;

