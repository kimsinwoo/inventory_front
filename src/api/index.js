import axios from 'axios';

// API 기본 설정 (Vite 환경 변수 사용)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

// Axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 (토큰 자동 추가)
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 (에러 처리)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 인증 만료 처리
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ==================== 인증 API ====================
export const authAPI = {
  login: (credentials) => apiClient.post('/auth/login', credentials), //로그인
  logout: () => apiClient.post('/auth/logout'), //로그아웃
  signup: (userData) => apiClient.post('/auth/join', userData), //회원가입
  
};

// ==================== 사용자 관리 API ====================
export const userAPI = {
  getUsers: (params) => apiClient.get('/auth', { params }), // 사용자 목록 (PaginationQuery & SortQuery)
  getUserById: (id) => apiClient.get(`/auth/${id}`), // 사용자 상세
  updateUser: (id, userData) => apiClient.put(`/auth/${id}`, userData), // 사용자 정보 수정
  deleteUser: (id) => apiClient.delete(`/auth/${id}`), // 사용자 삭제
  changePassword: (passwordData) => apiClient.post('/auth/password', passwordData), // 비밀번호 변경
  changePosition: (positionData) => apiClient.post('/auth/position', positionData), // 직급 변경
};

// ==================== 기초 정보 API ====================
// 품목 등록
export const itemsAPI = {
  getItems: (params) => apiClient.get('/items', { params }), // 품목 목록 조회 (PaginationQuery & { category, factoryId, code, name })
  getItemById: (id) => apiClient.get(`/items/id/${id}`), // 품목 상세 조회 (ID)
  getItemByCode: (code) => apiClient.get(`/items/code/${code}`), // 품목 상세 조회 (코드)
  createItem: (data) => apiClient.post('/items', data), // 품목 등록
  updateItem: (id, data) => apiClient.patch(`/items/${id}`, data), // 품목 수정
  deleteItem: (id) => apiClient.delete(`/items/${id}`), // 품목 삭제
};
//BOM 관리
export const bomsAPI = {
  getBoms: (params) => apiClient.get('/boms', { params }), // BOM 목록 조회 ({ itemId })
  getBomById: (id) => apiClient.get(`/boms/${id}`), // BOM 상세 조회
  createBom: (data) => apiClient.post('/boms', data), // BOM 등록
  updateBom: (id, data) => apiClient.put(`/boms/${id}`, data), // BOM 수정
  deleteBom: (id) => apiClient.delete(`/boms/${id}`), // BOM 삭제
};
// 보관 조건
export const storageAPI = {
  getStorage: () => apiClient.get('/storage-conditions'),
  getStorage: (id) => apiClient.get(`/storage-conitions/${id}`),
  createStorage: (data) => apiClient.post('/storage-conditions', data),
  updateStorage: (id, data) => apiClient.put(`/storage-conditions${id}`, data),
} 

// ==================== 재고 관리 API ====================
export const inventoryAPI = {
  getInventoryStatus: (params) => apiClient.get('/inventories', { params }), // 재고 현황/상태 (PaginationQuery & { itemId, factoryId, includeZero })
  getSummary: (params) => apiClient.get('/inventories/summary', { params }), // 재고 요약 ({ factoryId })
  getUtilization: (params) => apiClient.get('/inventories/utilization', { params }), // 창고 이용률 (DateRangeQuery & { factoryId })
  getMovements: (params) => apiClient.get('/inventories/movements', { params }), // 재고 이동 이력 (PaginationQuery & DateRangeQuery & { itemId, factoryId })
  receiveInventory: (data) => apiClient.post('/inventories/receive', data), // 입고
  issueInventory: (data) => apiClient.post('/inventories/issue', data), // 출고
  transferInventory: (data) => apiClient.post('/inventories/transfer', data), // 공장간 이동
  deleteInventory: (id) => apiClient.delete(`/inventories/${id}`), // 재고 삭제
};

// ==================== 제조 관리 API ====================
export const manufacturingAPI = {
  getManufacturingHistory: (params) => apiClient.get('/manufacturing/history', { params }),
  createManufacturingOrder: (data) => apiClient.post('/manufacturing/orders', data),
  updateManufacturingOrder: (id, data) => apiClient.put(`/manufacturing/orders/${id}`, data),
  getFactory2WorkList: (params) => apiClient.get('/manufacturing/factory2', { params }),
  createTransfer: (data) => apiClient.post('/manufacturing/transfers', data),
  getTransferStatus: (params) => apiClient.get('/manufacturing/transfers', { params }),
};

// ==================== 배송 관리 API ====================
export const shippingAPI = {
  getShippingList: (params) => apiClient.get('/shipping', { params }),
  createShipping: (data) => apiClient.post('/shipping', data),
  updateShipping: (id, data) => apiClient.put(`/shipping/${id}`, data),
  confirmShipping: (id) => apiClient.post(`/shipping/${id}/confirm`),
  getB2BShippings: (params) => apiClient.get('/shipping/b2b', { params }),
  getBC2Shippings: (params) => apiClient.get('/shipping/bc2', { params }),
};

// ==================== 입고 관리 API ====================
export const receivingAPI = {
  getReceivingList: (params) => apiClient.get('/receiving', { params }),
  createReceiving: (data) => apiClient.post('/receiving', data),
  confirmReceiving: (id) => apiClient.post(`/receiving/${id}/confirm`),
  printLabel: (id) => apiClient.get(`/receiving/${id}/label`),
};

// ==================== 라벨 관리 API ====================
export const labelAPI = {
  getPrinters: () => apiClient.get('/barcode/printers'),
  saveTemplate: (templateData) => apiClient.post('/barcode/print-label', templateData, { timeout: 60000 }),
  getAllLabels: (params) => apiClient.get('/barcode/labels', { params }),
  getLabelsByBarcode: (barcode) => apiClient.get(`/barcode/labels/barcode/${barcode}`),
  getLabelsByInventory: (inventoryId) => apiClient.get(`/barcode/labels/inventory/${inventoryId}`),
  printSavedLabel: (data) => apiClient.post('/barcode/print-saved-label', data),
  getLabelTemplate: (registrationNumber) => apiClient.get(`/barcode/labeltemplates/registration/${registrationNumber}`),
  generateBarcode: (barcodeNumber) => apiClient.get(`/barcode/generate/${barcodeNumber}`, { responseType: 'blob' }),
  generateIssueLabel: (data) => apiClient.post('/barcode/generate-issue-label', data),
};

// ==================== 전자 결재 API ====================
export const approvalAPI = {
  getPendingDocuments: (params) => apiClient.get('/approvals/pending', { params }),
  getSubmittedDocuments: (params) => apiClient.get('/approvals/submitted', { params }),
  createDocument: (data) => apiClient.post('/approvals', data),
  approveDocument: (id, data) => apiClient.post(`/approvals/${id}/approve`, data),
  rejectDocument: (id, data) => apiClient.post(`/approvals/${id}/reject`, data),
};

// ==================== 기초 정보 API ====================
export const basicAPI = {
  getItems: (params) => apiClient.get('/basic/items', { params }),
  createItem: (data) => apiClient.post('/basic/items', data),
  updateItem: (id, data) => apiClient.put(`/basic/items/${id}`, data),
  deleteItem: (id) => apiClient.delete(`/basic/items/${id}`),
  getBOMList: (params) => apiClient.get('/basic/bom', { params }),
  createBOM: (data) => apiClient.post('/basic/bom', data),
  getFactoryInfo: () => apiClient.get('/basic/factory'),
  updateFactoryInfo: (data) => apiClient.put('/basic/factory', data),
};

// ==================== 대시보드 API ====================
export const dashboardAPI = {
  getSummary: () => apiClient.get('/dashboard/summary'),
  getManufacturingStats: (params) => apiClient.get('/dashboard/manufacturing-stats', { params }),
  getRecentActivities: () => apiClient.get('/dashboard/recent-activities'),
};

export default apiClient;
