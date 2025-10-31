import apiClient from './api';

/**
 * 주문 가져오기 API 서비스
 * Base Path: /api/order-import
 */
const orderImportService = {
  /**
   * 단일 주문 파일 업로드
   * POST /api/order-import/upload
   * @param {FormData} formData - 업로드할 파일
   * @returns {Promise}
   */
  uploadSingle: async (formData) => {
    const response = await apiClient.post('/order-import/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * 다중 주문 파일 업로드 및 통합
   * POST /api/order-import/upload-multiple
   * @param {FormData} formData - 업로드할 파일들
   * @returns {Promise}
   */
  uploadMultiple: async (formData) => {
    const response = await apiClient.post('/order-import/upload-multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * 다중 파일 업로드 및 CJ 형식 변환
   * POST /api/order-import/upload-cj
   * @param {FormData} formData - 업로드할 파일들
   * @returns {Promise}
   */
  uploadAndConvertToCJ: async (formData) => {
    const response = await apiClient.post('/order-import/upload-cj', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      responseType: 'blob',
    });
    return response;
  },

  /**
   * 통합 파일 다운로드
   * GET /api/order-import/download/:filename
   * @param {string} filename - 파일명
   * @returns {Promise}
   */
  download: async (filename) => {
    const response = await apiClient.get(`/order-import/download/${filename}`, {
      responseType: 'blob',
    });
    return response;
  },

  /**
   * 업로드된 파일 목록 조회
   * GET /api/order-import/files
   * @returns {Promise}
   */
  getFiles: async () => {
    const response = await apiClient.get('/order-import/files');
    return response.data;
  },

  /**
   * 파일 삭제
   * DELETE /api/order-import/files/:filename
   * @param {string} filename - 파일명
   * @returns {Promise}
   */
  deleteFile: async (filename) => {
    const response = await apiClient.delete(`/order-import/files/${filename}`);
    return response.data;
  },
};

export default orderImportService;

