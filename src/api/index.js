import axios from 'axios';

// ============================================
// API Base URL 설정
// ============================================
const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL !== '') {
    return import.meta.env.VITE_API_URL;
  }
  if (import.meta.env.REACT_APP_API_URL && import.meta.env.REACT_APP_API_URL !== '') {
    return import.meta.env.REACT_APP_API_URL;
  }
  if (import.meta.env.MODE === 'development') {
    console.warn('⚠️ VITE_API_URL 환경 변수가 설정되지 않았습니다. 기본값을 사용합니다.');
    console.warn('📝 .env 파일에 VITE_API_URL=http://localhost:4000/api 를 추가하세요.');
    return 'http://localhost:4000/api';
  }
  if (import.meta.env.MODE === 'production') {
    if (typeof window !== 'undefined' && window.location) {
      const origin = window.location.origin;
      console.warn('⚠️ 프로덕션 환경에서 VITE_API_URL 환경 변수가 설정되지 않았습니다.');
      console.warn('⚠️ 현재 도메인 기반으로 API URL을 자동 설정합니다:', `${origin}/api`);
      return `${origin}/api`;
    }
  }
  return 'http://localhost:4000/api';
};

const API_BASE_URL = getApiBaseUrl();

// ============================================
// Axios 인스턴스 생성
// ============================================
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 30000,
});

// ============================================
// 응답 인터셉터 (에러 처리)
// ============================================
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || error.message;
      console.error(`❌ API 오류 [${status}]:`, message);
      if (status === 401) {
        console.warn('⚠️ 인증이 만료되었습니다. 로그인 페이지로 이동합니다.');
        window.location.href = '/login';
      }
      if (status === 403) {
        console.error('❌ 접근 권한이 없습니다.');
      }
      if (status === 404) {
        console.error('❌ 요청한 리소스를 찾을 수 없습니다.');
      }
      if (status >= 500) {
        console.error('❌ 서버 오류가 발생했습니다.');
      }
    } else if (error.request) {
      console.error('❌ 서버에 요청을 보낼 수 없습니다.');
    } else {
      console.error('❌ 요청 설정 중 오류가 발생했습니다:', error.message);
    }
    return Promise.reject(error);
  }
);

// ============================================
// 1. Label API (라벨)
// ============================================
export const labelAPI = {
  getPrinters: async () => {
    const response = await apiClient.get('/label/printers');
    return response;
  },
  printLabel: async (data) => {
    const response = await apiClient.post('/label/print', data);
    return response;
  },
  saveTemplate: async (data) => {
    const response = await apiClient.post('/label/template', data);
    return response;
  },
  getTemplates: async (params = {}) => {
    const response = await apiClient.get('/label/templates', { params });
    return response;
  },
  getTemplate: async (templateId) => {
    const response = await apiClient.get(`/label/template/${templateId}`);
    return response;
  },
};

// ============================================
// 2. Items API (품목)
// ============================================
export const itemsAPI = {
  getItems: async (params = {}) => {
    const response = await apiClient.get('/items', { params });
    return response;
  },
  getItemById: async (id) => {
    const response = await apiClient.get(`/items/id/${id}`);
    return response;
  },
  getItemByCode: async (code) => {
    const response = await apiClient.get(`/items/code/${code}`);
    return response;
  },
  createItem: async (data) => {
    const response = await apiClient.post('/items', data);
    return response;
  },
  updateItem: async (id, data) => {
    const response = await apiClient.patch(`/items/${id}`, data);
    return response;
  },
  deleteItem: async (id) => {
    const response = await apiClient.delete(`/items/${id}`);
    return response;
  },
};

// ============================================
// 3. Auth API (인증)
// ============================================
export const authAPI = {
  login: async (data) => {
    const response = await apiClient.post('/auth/login', data);
    return response;
  },
  join: async (data) => {
    const response = await apiClient.post('/auth/join', data);
    return response;
  },
  logout: async () => {
    const response = await apiClient.post('/auth/logout');
    return response;
  },
  getMe: async () => {
    const response = await apiClient.get('/auth/me');
    return response;
  },
  getUsers: async () => {
    const response = await apiClient.get('/auth/');
    return response;
  },
  getUser: async (id) => {
    const response = await apiClient.get(`/auth/${id}`);
    return response;
  },
  updateUser: async (id, data) => {
    const response = await apiClient.put(`/auth/${id}`, data);
    return response;
  },
  deleteUser: async (id) => {
    const response = await apiClient.delete(`/auth/${id}`);
    return response;
  },
  signup: async (data) => {
    return authAPI.join(data);
  },
};

// ============================================
// 4. User API (호환성 유지 - authAPI로 매핑)
// ============================================
export const userAPI = {
  getUsers: async (params = {}) => {
    return authAPI.getUsers();
  },
  getUserById: async (id) => {
    return authAPI.getUser(id);
  },
  createUser: async (data) => {
    return authAPI.join(data);
  },
  updateUser: async (id, data) => {
    return authAPI.updateUser(id, data);
  },
  deleteUser: async (id) => {
    return authAPI.deleteUser(id);
  },
  getAccessLogs: async (params = {}) => {
    console.warn('getAccessLogs API는 문서에 정의되지 않았습니다.');
    return { data: { data: [] } };
  },
};

// ============================================
// 5. Inventory API (재고)
// ============================================
export const inventoryAPI = {
  getInventories: async (params = {}) => {
    const response = await apiClient.get('/inventories', { params });
    return response;
  },
  getSummary: async (params = {}) => {
    const response = await apiClient.get('/inventories/summary', { params });
    return response;
  },
  getUtilization: async () => {
    const response = await apiClient.get('/inventories/utilization');
    return response;
  },
  getMovements: async (params = {}) => {
    const response = await apiClient.get('/inventories/movements', { params });
    return response;
  },
  receive: async (data) => {
    const response = await apiClient.post('/inventories/receive', data);
    return response;
  },
  issue: async (data) => {
    const response = await apiClient.post('/inventories/issue', data);
    return response;
  },
  transfer: async (data) => {
    const response = await apiClient.post('/inventories/transfer', data);
    return response;
  },
  deleteInventory: async (id) => {
    const response = await apiClient.delete(`/inventories/${id}`);
    return response;
  },
};

// ============================================
// 6. Inventory Transactions API (재고 트랜잭션)
// ============================================
export const inventoryTransactionsAPI = {
  getTransactions: async (params = {}) => {
    const response = await apiClient.get('/inventory-transactions', { params });
    return response;
  },
  getTransaction: async (id) => {
    const response = await apiClient.get(`/inventory-transactions/${id}`);
    return response;
  },
  getStats: async (params = {}) => {
    const response = await apiClient.get('/inventory-transactions/stats', { params });
    return response;
  },
  getMonthlyUtilization: async (params = {}) => {
    const response = await apiClient.get('/inventory-transactions/monthly-utilization', { params });
    return response;
  },
  receive: async (data) => {
    const response = await apiClient.post('/inventory-transactions/receive', data);
    return response;
  },
  issue: async (data) => {
    const response = await apiClient.post('/inventory-transactions/issue', data);
    return response;
  },
  batchIssue: async (data) => {
    const response = await apiClient.post('/inventory-transactions/batch-issue', data);
    return response;
  },
  transfer: async (data) => {
    const response = await apiClient.post('/inventory-transactions/transfer', data);
    return response;
  },
};

// ============================================
// 7. Planned Transactions API (예정 트랜잭션)
// ============================================
export const plannedTransactionsAPI = {
  getPlannedTransactions: async (params = {}) => {
    const response = await apiClient.get('/planned-transactions', { params });
    return response;
  },
  getPlannedTransaction: async (id) => {
    const response = await apiClient.get(`/planned-transactions/${id}`);
    return response;
  },
  getStats: async (params = {}) => {
    const response = await apiClient.get('/planned-transactions/stats', { params });
    return response;
  },
  createPlannedTransaction: async (data) => {
    const response = await apiClient.post('/planned-transactions', data);
    return response;
  },
  updatePlannedTransaction: async (id, data) => {
    const response = await apiClient.put(`/planned-transactions/${id}`, data);
    return response;
  },
  deletePlannedTransaction: async (id) => {
    const response = await apiClient.delete(`/planned-transactions/${id}`);
    return response;
  },
  approve: async (id, data = {}) => {
    const response = await apiClient.post(`/planned-transactions/${id}/approve`, data);
    return response;
  },
  reject: async (id, data) => {
    const response = await apiClient.post(`/planned-transactions/${id}/reject`, data);
    return response;
  },
  completeReceive: async (id, data = {}) => {
    const response = await apiClient.post(`/planned-transactions/${id}/complete-receive`, data);
    return response;
  },
  completeIssue: async (id, data = {}) => {
    const response = await apiClient.post(`/planned-transactions/${id}/complete-issue`, data);
    return response;
  },
};

// ============================================
// 8. Factories API (공장)
// ============================================
export const factoriesAPI = {
  getFactories: async () => {
    const response = await apiClient.get('/factories');
    return response;
  },
  getFactory: async (id) => {
    const response = await apiClient.get(`/factories/${id}`);
    return response;
  },
  createFactory: async (data) => {
    const response = await apiClient.post('/factories', data);
    return response;
  },
  updateFactory: async (id, data) => {
    const response = await apiClient.put(`/factories/${id}`, data);
    return response;
  },
  deleteFactory: async (id) => {
    const response = await apiClient.delete(`/factories/${id}`);
    return response;
  },
  getProcesses: async (id) => {
    const response = await apiClient.get(`/factories/${id}/processes`);
    return response;
  },
  addProcesses: async (id, data) => {
    const response = await apiClient.post(`/factories/${id}/processes`, data);
    return response;
  },
  removeProcess: async (id, processId) => {
    const response = await apiClient.delete(`/factories/${id}/processes/${processId}`);
    return response;
  },
};

// ============================================
// 9. BOM API (자재 명세서)
// ============================================
export const bomsAPI = {
  getBoms: async (params = {}) => {
    const response = await apiClient.get('/boms', { params });
    console.log(response);
    return response;
  },
  getBom: async (id) => {
    const response = await apiClient.get(`/boms/${id}`);
    return response;
  },
  createBom: async (data) => {
    const response = await apiClient.post('/boms', data);
    return response;
  },
  updateBom: async (id, data) => {
    const response = await apiClient.put(`/boms/${id}`, data);
    return response;
  },
  deleteBom: async (id) => {
    const response = await apiClient.delete(`/boms/${id}`);
    return response;
  },
};

// ============================================
// 10. Storage Conditions API (보관 조건)
// ============================================
export const storageConditionsAPI = {
  getStorageConditions: async () => {
    const response = await apiClient.get('/storage-conditions');
    return response;
  },
  getStorageCondition: async (id) => {
    const response = await apiClient.get(`/storage-conditions/${id}`);
    return response;
  },
  createStorageCondition: async (data) => {
    const response = await apiClient.post('/storage-conditions', data);
    return response;
  },
  updateStorageCondition: async (id, data) => {
    const response = await apiClient.put(`/storage-conditions/${id}`, data);
    return response;
  },
  deleteStorageCondition: async (id) => {
    const response = await apiClient.delete(`/storage-conditions/${id}`);
    return response;
  },
};

// ============================================
// 11. Warehouse Transfers API (창고 이동)
// ============================================
export const warehouseTransfersAPI = {
  getHistory: async (params = {}) => {
    const response = await apiClient.get('/warehouse-transfers/history', { params });
    return response;
  },
  getPathStats: async (params = {}) => {
    const response = await apiClient.get('/warehouse-transfers/path-stats', { params });
    return response;
  },
  transfer: async (data) => {
    const response = await apiClient.post('/warehouse-transfers', data);
    return response;
  },
};

// ============================================
// 12. Work Orders API (작업 지시서)
// ============================================
export const workOrdersAPI = {
  createWorkOrder: async (data) => {
    const response = await apiClient.post('/work-orders', data);
    return response;
  },
  getWorkOrders: async (params = {}) => {
    const response = await apiClient.get('/work-orders', { params });
    return response;
  },
  getWorkOrder: async (id) => {
    const response = await apiClient.get(`/work-orders/${id}`);
    return response;
  },
  updateWorkOrder: async (id, data) => {
    const response = await apiClient.put(`/work-orders/${id}`, data);
    return response;
  },
  deleteWorkOrder: async (id) => {
    const response = await apiClient.delete(`/work-orders/${id}`);
    return response;
  },
  startWorkOrder: async (id) => {
    const response = await apiClient.post(`/work-orders/${id}/start`);
    return response;
  },
  completeWorkOrder: async (id, data = {}) => {
    const response = await apiClient.post(`/work-orders/${id}/complete`, data);
    return response;
  },
  cancelWorkOrder: async (id, data = {}) => {
    const response = await apiClient.post(`/work-orders/${id}/cancel`, data);
    return response;
  },
  getStats: async (params = {}) => {
    const response = await apiClient.get('/work-orders/stats', { params });
    return response;
  },
};

// ============================================
// 13. Approval API (전자결재)
// ============================================
export const approvalAPI = {
  getInbox: async () => {
    const response = await apiClient.get('/approval/approvals/inbox');
    return response;
  },
  getApproval: async (id) => {
    const response = await apiClient.get(`/approval/approvals/${id}`);
    return response;
  },
  approve: async (id, data = {}) => {
    const response = await apiClient.post(`/approval/approvals/${id}/approve`, data);
    return response;
  },
  reject: async (id, data = {}) => {
    const response = await apiClient.post(`/approval/approvals/${id}/reject`, data);
    return response;
  },
};

// ============================================
// 14. Dashboard API (대시보드)
// ============================================
export const dashboardAPI = {
  getDashboard: async (params = {}) => {
    const response = await apiClient.get('/dashboard/summary', { params });
    return response;
  },
};

// ============================================
// 15. Shipping API (배송)
// ============================================
export const shippingAPI = {
  /**
   * 출고 대기 목록 조회
   * GET /api/shipping/waiting
   */
  getWaitingList: async (params = {}) => {
    const response = await apiClient.get('/shipping/waiting', { params });
    return response;
  },
  /**
   * 출고 완료 목록 조회
   * GET /api/shipping/completed
   */
  getCompletedList: async (params = {}) => {
    const response = await apiClient.get('/shipping/completed', { params });
    return response;
  },
  /**
   * 출고 추가
   * POST /api/shipping
   */
  createShipping: async (data) => {
    const response = await apiClient.post('/shipping', data);
    return response;
  },
  /**
   * 출고 확인
   * POST /api/shipping/:id/confirm
   */
  confirmShipping: async (id, data = {}) => {
    const response = await apiClient.post(`/shipping/${id}/confirm`, data);
    return response;
  },
  /**
   * 출고 취소
   * POST /api/shipping/:id/cancel
   */
  cancelShipping: async (id) => {
    const response = await apiClient.post(`/shipping/${id}/cancel`);
    return response;
  },
  uploadOrders: async (formData) => {
    const response = await apiClient.post('/shipping/upload-orders', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response;
  },
  getOrders: async (params = {}) => {
    const response = await apiClient.get('/shipping/orders', { params });
    return response;
  },
  getOrder: async (id) => {
    const response = await apiClient.get(`/shipping/orders/${id}`);
    return response;
  },
  updateOrder: async (id, data) => {
    const response = await apiClient.put(`/shipping/orders/${id}`, data);
    return response;
  },
  deleteOrder: async (id) => {
    const response = await apiClient.delete(`/shipping/orders/${id}`);
    return response;
  },
  exportCjLogistics: async (data) => {
    const response = await apiClient.post('/shipping/export/cj-logistics', data);
    return response;
  },
  generateIssueList: async (data) => {
    const response = await apiClient.post('/shipping/issue-list/generate', data);
    return response;
  },
  exportIssueList: async (id) => {
    const response = await apiClient.get(`/shipping/issue-list/${id}/export`);
    return response;
  },
  processIssueList: async (id, data = {}) => {
    const response = await apiClient.post(`/shipping/issue-list/${id}/process`, data);
    return response;
  },
  bulkTrackingNumbers: async (data) => {
    const response = await apiClient.post('/shipping/tracking-numbers/bulk', data);
    return response;
  },
  uploadTrackingNumbers: async (formData) => {
    const response = await apiClient.post('/shipping/tracking-numbers/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response;
  },
  getBatches: async (params = {}) => {
    const response = await apiClient.get('/shipping/batches', { params });
    return response;
  },
  getBatch: async (id) => {
    const response = await apiClient.get(`/shipping/batches/${id}`);
    return response;
  },
  confirmBatch: async (id, data = {}) => {
    const response = await apiClient.post(`/shipping/batches/${id}/confirm`, data);
    return response;
  },
  deleteBatch: async (id) => {
    const response = await apiClient.delete(`/shipping/batches/${id}`);
    return response;
  },
  downloadFile: async (filename) => {
    const response = await apiClient.get(`/shipping/download/${filename}`);
    return response;
  },
  // 기존 출고 관련 API (호환성 유지)
  getWaitingList: async (params = {}) => {
    const response = await apiClient.get('/shipping/waiting', { params });
    return response;
  },
  getCompletedList: async (params = {}) => {
    const response = await apiClient.get('/shipping/completed', { params });
    return response;
  },
  createShipping: async (data) => {
    const response = await apiClient.post('/shipping', data);
    return response;
  },
  confirmShipping: async (id, data = {}) => {
    const response = await apiClient.put(`/shipping/${id}/confirm`, data);
    return response;
  },
  cancelShipping: async (id) => {
    const response = await apiClient.put(`/shipping/${id}/cancel`);
    return response;
  },
};

// ============================================
// 기본 export
// ============================================
export default {
  labelAPI,
  itemsAPI,
  authAPI,
  userAPI,
  inventoryAPI,
  inventoryTransactionsAPI,
  plannedTransactionsAPI,
  factoriesAPI,
  bomsAPI,
  storageConditionsAPI,
  warehouseTransfersAPI,
  workOrdersAPI,
  approvalAPI,
  dashboardAPI,
  shippingAPI,
  apiClient,
};
