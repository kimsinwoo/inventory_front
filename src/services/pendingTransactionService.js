import apiClient from './api';

/**
 * 예정 트랜잭션 API 서비스
 * 입고/출고 예정 목록을 백엔드에 저장하고 관리
 * 
 * API 엔드포인트: /api/planned-transactions
 */
const pendingTransactionService = {
  /**
   * 입고 대기 목록 조회
   * GET /api/planned-transactions?transactionType=RECEIVE&status=PENDING
   */
  getReceivingList: async () => {
    const response = await apiClient.get('/planned-transactions', {
      params: {
        transactionType: 'RECEIVE',
        status: 'PENDING',
        limit: 100
      }
    });
    return response.data;
  },

  /**
   * 출고 대기 목록 조회
   * GET /api/planned-transactions?transactionType=ISSUE&status=PENDING
   */
  getShippingList: async () => {
    const response = await apiClient.get('/planned-transactions', {
      params: {
        transactionType: 'ISSUE',
        status: 'PENDING',
        limit: 100
      }
    });
    return response.data;
  },

  /**
   * 입고 대기 항목 생성
   * POST /api/planned-transactions
   */
  createReceiving: async (data) => {
    const requestBody = {
      transactionType: 'RECEIVE',
      itemId: data.itemId,
      factoryId: data.factoryId,
      quantity: parseFloat(data.quantity || data.expectedQuantity),
      unit: data.unit || 'kg',
      scheduledDate: data.expectedDate || new Date().toISOString(),
      supplierName: data.supplier || data.supplierName,
      lotNumber: data.lotNumber,
      wholesalePrice: data.wholesalePrice ? parseFloat(data.wholesalePrice) : undefined,
      storageConditionId: data.storageConditionId,
      notes: data.note || data.notes
    };

    const response = await apiClient.post('/planned-transactions', requestBody);
    return response.data;
  },

  /**
   * 출고 대기 항목 생성
   * POST /api/planned-transactions
   */
  createShipping: async (data) => {
    const requestBody = {
      transactionType: 'ISSUE',
      itemId: data.itemId,
      factoryId: data.factoryId,
      quantity: parseFloat(data.quantity || data.expectedQuantity),
      unit: data.unit || 'kg',
      scheduledDate: data.expectedDate || new Date().toISOString(),
      customerName: data.customer || data.customerName,
      issueType: data.issueType || 'SHIPPING',
      shippingAddress: data.shippingAddress,
      notes: data.note || data.notes
    };

    const response = await apiClient.post('/planned-transactions', requestBody);
    return response.data;
  },

  /**
   * 입고 대기 항목 삭제
   * DELETE /api/planned-transactions/:id
   */
  deleteReceiving: async (id) => {
    const response = await apiClient.delete(`/planned-transactions/${id}`);
    return response.data;
  },

  /**
   * 출고 대기 항목 삭제
   * DELETE /api/planned-transactions/:id
   */
  deleteShipping: async (id) => {
    const response = await apiClient.delete(`/planned-transactions/${id}`);
    return response.data;
  },

  /**
   * 예정 트랜잭션 상세 조회
   * GET /api/planned-transactions/:id
   */
  getById: async (id) => {
    const response = await apiClient.get(`/planned-transactions/${id}`);
    return response.data;
  },

  /**
   * 예정 트랜잭션 수정
   * PUT /api/planned-transactions/:id
   */
  update: async (id, data) => {
    const response = await apiClient.put(`/planned-transactions/${id}`, data);
    return response.data;
  },

  /**
   * 예정 트랜잭션 승인
   * POST /api/planned-transactions/:id/approve
   */
  approve: async (id, comment) => {
    const response = await apiClient.post(`/planned-transactions/${id}/approve`, { comment });
    return response.data;
  },

  /**
   * 예정 트랜잭션 거부/취소
   * POST /api/planned-transactions/:id/reject
   */
  reject: async (id, rejectionReason) => {
    const response = await apiClient.post(`/planned-transactions/${id}/reject`, { rejectionReason });
    return response.data;
  },

  /**
   * 입고 예정 완료 처리
   * POST /api/planned-transactions/:id/complete-receive
   */
  completeReceive: async (id, data = {}) => {
    const response = await apiClient.post(`/planned-transactions/${id}/complete-receive`, data);
    return response.data;
  },

  /**
   * 출고 예정 완료 처리
   * POST /api/planned-transactions/:id/complete-issue
   */
  completeIssue: async (id, data = {}) => {
    const response = await apiClient.post(`/planned-transactions/${id}/complete-issue`, data);
    return response.data;
  },

  /**
   * 통계 조회
   * GET /api/planned-transactions/stats
   */
  getStats: async (params = {}) => {
    const response = await apiClient.get('/planned-transactions/stats', { params });
    return response.data;
  },
};

export default pendingTransactionService;
