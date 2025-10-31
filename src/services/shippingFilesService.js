import apiClient from './api';

/**
 * 배송 파일 관리 API
 * Base Path: /api/shipping-files
 */
const shippingFilesService = {
  /**
   * 파일 업로드
   * POST /api/shipping-files/upload?issueType=B2B&source=selfmall
   * @param {Object} opts
   * @param {'B2B'|'B2C'} opts.issueType
   * @param {string} opts.source - selfmall|coupang|smartstore|etc
   * @param {File|Blob} opts.file
   */
  upload: async ({ issueType, source, file }) => {
    const form = new FormData();
    form.append('file', file);
    const response = await apiClient.post(
      `/shipping-files/upload`,
      form,
      {
        params: { issueType, source },
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return response.data;
  },

  /**
   * 저장하기
   * POST /api/shipping-files/save { groupId }
   */
  save: async ({ groupId }) => {
    const response = await apiClient.post('/shipping-files/save', { groupId });
    return response.data;
  },

  /**
   * 그룹 목록 조회
   * GET /api/shipping-files/groups?issueType=B2B
   */
  getGroups: async (params = {}) => {
    const response = await apiClient.get('/shipping-files/groups', { params });
    return response.data;
  },

  /**
   * 그룹 다운로드
   * GET /api/shipping-files/download/:groupId?format=cj|standard
   */
  download: async ({ groupId, format = 'cj' }) => {
    const response = await apiClient.get(`/shipping-files/download/${groupId}`, {
      params: { format },
      responseType: 'blob',
    });
    return response;
  },

  /**
   * 개별 파일 삭제
   * DELETE /api/shipping-files/files/:id
   */
  deleteFile: async (id) => {
    const response = await apiClient.delete(`/shipping-files/files/${id}`);
    return response.data;
  },
};

export default shippingFilesService;


