import axios from 'axios';

// API 기본 설정 (Vite 환경 변수 사용)
// .env 파일의 VITE_API_URL을 사용합니다
// 배포 시: .env 파일을 변경한 후 반드시 재빌드해야 합니다 (npm run build)

// 환경 변수 가져오기 (개발/프로덕션 자동 감지)
const getApiBaseUrl = () => {
  // 1. Vite 환경 변수 우선 사용 (VITE_ 접두사 필요)
  // 빌드 시점에 환경 변수가 코드에 포함됨
  if (import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL !== '') {
    return import.meta.env.VITE_API_URL;
  }
  
  // 2. React App 환경 변수 (하위 호환성)
  if (import.meta.env.REACT_APP_API_URL && import.meta.env.REACT_APP_API_URL !== '') {
    return import.meta.env.REACT_APP_API_URL;
  }
  
  // 3. 개발 환경 기본값 (환경 변수가 없을 때만)
  if (import.meta.env.MODE === 'development') {
    console.warn('⚠️ VITE_API_URL 환경 변수가 설정되지 않았습니다. 기본값을 사용합니다.');
    console.warn('📝 .env 파일에 VITE_API_URL=http://localhost:4000/api 를 추가하세요.');
    return 'http://localhost:4000/api';
  }
  
  // 4. 프로덕션 환경: 환경 변수가 없으면 현재 도메인 기반으로 자동 설정
  // 주의: 이는 런타임에 동적으로 설정되므로, 가능하면 환경 변수를 명시적으로 설정하는 것을 권장합니다
  if (import.meta.env.MODE === 'production') {
    if (typeof window !== 'undefined' && window.location) {
      const origin = window.location.origin;
      console.warn('⚠️ 프로덕션 환경에서 VITE_API_URL 환경 변수가 설정되지 않았습니다.');
      console.warn('⚠️ 현재 도메인 기반으로 API URL을 자동 설정합니다:', `${origin}/api`);
      console.warn('📝 권장: .env 파일에 VITE_API_URL을 명시적으로 설정하고 재빌드하세요.');
      return `${origin}/api`;
    }
  }
  
  return null;
};

let API_BASE_URL = getApiBaseUrl();

// API_BASE_URL이 null인 경우 최종 fallback
if (!API_BASE_URL) {
  // 서버 사이드 렌더링 환경이 아닌 경우
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    API_BASE_URL = `${origin}/api`;
    console.warn('⚠️ API Base URL을 자동으로 설정했습니다:', API_BASE_URL);
    console.warn('📝 권장: .env 파일에 VITE_API_URL을 명시적으로 설정하고 재빌드하세요.');
  } else {
    // 서버 사이드 환경에서는 개발 환경 기본값 사용
    API_BASE_URL = 'http://localhost:4000/api';
    console.warn('⚠️ 서버 사이드 환경에서 기본값을 사용합니다:', API_BASE_URL);
  }
}

// API Base URL 로그
if (import.meta.env.MODE === 'development') {
  console.log('🔗 API Base URL:', API_BASE_URL);
  console.log('🌍 Environment:', import.meta.env.MODE);
} else if (import.meta.env.MODE === 'production') {
  // 프로덕션에서는 간단한 로그만 (보안을 위해 민감한 정보는 로그하지 않음)
  console.log('🔗 API Base URL이 설정되었습니다.');
}

// Axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30초로 증가 (프린트 작업 등 긴 작업 대응)
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // 세션 기반 인증 (쿠키 포함)
});

// 요청 인터셉터
apiClient.interceptors.request.use(
  (config) => {
    // 세션 기반 인증을 사용하므로 쿠키가 자동으로 포함됩니다
    // 필요시 추가 헤더나 토큰을 여기서 설정할 수 있습니다
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터 (에러 처리)
apiClient.interceptors.response.use(
  (response) => {
    // 성공 응답 처리
    return response;
  },
  (error) => {
    // 에러 응답 처리
    if (error.response) {
      const { status, data } = error.response;
      
      // 401 Unauthorized - 인증 실패
      if (status === 401) {
        console.warn('⚠️ 인증이 필요합니다. 로그인 페이지로 이동합니다.');
        // 세션 기반이므로 서버에서 쿠키를 통해 처리됨
        // 필요시 리다이렉트
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
      
      // 403 Forbidden - 권한 없음
      if (status === 403) {
        console.error('❌ 접근 권한이 없습니다.');
      }
      
      // 404 Not Found
      if (status === 404) {
        console.error('❌ 요청한 리소스를 찾을 수 없습니다.');
      }
      
      // 500 Server Error
      if (status >= 500) {
        console.error('❌ 서버 오류가 발생했습니다.');
      }
      
      // 에러 메시지 로깅
      if (data?.message) {
        console.error('📄 Error Message:', data.message);
      }
    } else if (error.request) {
      // 요청은 보냈지만 응답을 받지 못한 경우
      console.error('❌ 네트워크 오류: 서버에 연결할 수 없습니다.');
      console.error('🔍 API Base URL을 확인하세요:', API_BASE_URL);
    } else {
      // 요청 설정 중 오류
      console.error('❌ 요청 설정 오류:', error.message);
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
  getStorageConditions: () => apiClient.get('/storage-conditions'),
  getStorageConditionById: (id) => apiClient.get(`/storage-conditions/${id}`),
  createStorage: (data) => apiClient.post('/storage-conditions', data),
  updateStorage: (id, data) => apiClient.put(`/storage-conditions/${id}`, data),
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

// ==================== 바코드/라벨 관리 API ====================
// 문서: FRONTEND_API_GUIDE.md 참고
export const barcodeApi = {
  /**
   * 프린터 목록 조회
   * @returns {Promise} 프린터 목록
   */
  getPrinters: () => apiClient.get('/barcode/printers'),

  /**
   * Finished 품목 목록 조회
   * @returns {Promise} Finished 품목 목록
   */
  getFinishedItems: () => apiClient.get('/barcode/items/finished'),

  /**
   * 라벨 생성
   * @param {Object} data - 라벨 생성 데이터
   * @param {number} data.itemId - 품목 ID
   * @param {number} data.inventoryId - 재고 ID
   * @param {string} data.barcode - 바코드
   * @param {number} [data.quantity] - 수량
   * @param {string} [data.unit] - 단위
   * @returns {Promise} 생성된 라벨 정보
   */
  createLabel: (data) => apiClient.post('/barcode/labels', data),

  /**
   * 라벨 목록 조회 (페이지네이션)
   * @param {number} [page=1] - 페이지 번호
   * @param {number} [limit=50] - 페이지당 항목 수
   * @returns {Promise} 라벨 목록
   */
  getLabels: (page = 1, limit = 50) => 
    apiClient.get('/barcode/labels', { params: { page, limit } }),

  /**
   * 라벨 ID로 조회
   * @param {number} labelId - 라벨 ID
   * @returns {Promise} 라벨 정보
   */
  getLabelById: (labelId) => apiClient.get(`/barcode/labels/${labelId}`),

  /**
   * 바코드로 라벨 조회
   * @param {string} barcode - 바코드
   * @returns {Promise} 라벨 목록
   */
  getLabelsByBarcode: (barcode) => apiClient.get(`/barcode/labels/barcode/${barcode}`),

  /**
   * 재고 ID로 라벨 조회
   * @param {number} inventoryId - 재고 ID
   * @returns {Promise} 라벨 목록
   */
  getLabelsByInventoryId: (inventoryId) => 
    apiClient.get(`/barcode/labels/inventory/${inventoryId}`),

  /**
   * 등록번호로 라벨 템플릿 조회
   * @param {string} registrationNumber - 등록번호
   * @returns {Promise} 라벨 템플릿 정보
   */
  getLabelTemplateByRegistrationNumber: (registrationNumber) =>
    apiClient.get(`/barcode/labeltemplates/registration/${registrationNumber}`),

  /**
   * 라벨 프린트 (HTML 컨텐츠)
   * @param {Object} data - 프린트 데이터
   * @param {string} data.htmlContent - HTML 컨텐츠
   * @param {string} [data.printerName] - 프린터 이름 (로컬 환경에서만 필요)
   * @param {number} [data.printCount=1] - 프린트 개수
   * @param {Object} [data.pdfOptions] - PDF 옵션
   * @param {string} [data.pdfOptions.width] - 너비 (예: '50mm')
   * @param {string} [data.pdfOptions.height] - 높이 (예: '30mm')
   * @param {string} [data.pdfOptions.margin] - 마진 (예: '0mm')
   * @param {string} [data.labelType] - 라벨 타입
   * @param {string} [data.productName] - 제품명
   * @param {string} [data.storageCondition] - 보관 조건
   * @param {string} [data.registrationNumber] - 등록번호
   * @param {string} [data.categoryAndForm] - 카테고리 및 형태
   * @param {string} [data.ingredients] - 성분
   * @param {string} [data.rawMaterials] - 원료
   * @param {string} [data.actualWeight] - 실제 무게
   * @param {number} [data.itemId] - 품목 ID
   * @returns {Promise} 프린트 결과
   */
  printLabel: (data) => apiClient.post('/barcode/print-label', data, { timeout: 60000 }),

  /**
   * 저장된 라벨 프린트
   * @param {Object} data - 프린트 데이터
   * @param {number} data.labelId - 라벨 ID
   * @param {string} [data.printerName] - 프린터 이름 (로컬 환경에서만 필요)
   * @param {string} data.manufactureDate - 제조일자 (YYYY-MM-DD 형식)
   * @param {string} data.expiryDate - 유통기한 (YYYY-MM-DD 형식)
   * @param {number} [data.printCount=1] - 프린트 개수
   * @param {Object} [data.pdfOptions] - PDF 옵션
   * @returns {Promise} 프린트 결과
   */
  printSavedLabel: (data) => apiClient.post('/barcode/print-saved-label', data, { timeout: 60000 }),

  /**
   * 바코드 스캔
   * @param {string} barcode - 바코드
   * @returns {Promise} 바코드 정보
   */
  scanBarcode: (barcode) => apiClient.get(`/barcode/scan/${barcode}`),

  /**
   * 바코드 생성
   * @param {Object} data - 바코드 생성 데이터
   * @param {number} data.itemId - 품목 ID
   * @param {number} data.quantity - 수량
   * @param {string} [data.receivedAt] - 입고일시
   * @returns {Promise} 생성된 바코드 정보
   */
  generateBarcode: (data) => apiClient.post('/barcode/generate-label', data),

  /**
   * 입고 처리 (바코드 사용)
   * @param {Object} data - 입고 데이터
   * @param {string} data.barcode - 바코드
   * @param {number} data.itemId - 품목 ID
   * @param {number} data.factoryId - 공장 ID
   * @param {number} data.storageConditionId - 보관 조건 ID
   * @param {number} data.wholesalePrice - 도매가
   * @param {number} data.quantity - 수량
   * @param {string} [data.receivedAt] - 입고일시
   * @param {string} [data.unit] - 단위
   * @param {string} [data.note] - 메모
   * @returns {Promise} 입고 결과
   */
  receiveWithBarcode: (data) => apiClient.post('/barcode/receive', data),

  /**
   * 공장 이동 출고
   * @param {Object} data - 출고 데이터
   * @param {string} data.barcode - 바코드
   * @param {number} data.quantity - 수량
   * @param {number} data.toFactoryId - 이동 대상 공장 ID
   * @param {string} [data.note] - 메모
   * @returns {Promise} 출고 결과
   */
  transferOut: (data) => apiClient.post('/barcode/transfer-out', data),

  /**
   * 공장 이동 입고
   * @param {Object} data - 입고 데이터
   * @param {string} data.barcode - 바코드
   * @param {number} data.factoryId - 공장 ID
   * @param {number} [data.storageConditionId] - 보관 조건 ID
   * @param {string} [data.note] - 메모
   * @returns {Promise} 입고 결과
   */
  transferIn: (data) => apiClient.post('/barcode/transfer-in', data),

  /**
   * 출고 처리 (바코드 사용)
   * @param {Object} data - 출고 데이터
   * @param {string} data.barcode - 바코드
   * @param {number} data.quantity - 수량
   * @param {string} [data.issueType] - 출고 타입 ('SHIPPING' | 'PRODUCTION' | 'DISPOSAL' | 'SAMPLE' | 'OTHER')
   * @param {string} [data.note] - 메모
   * @param {string} [data.customerName] - 고객명
   * @param {string} [data.trackingNumber] - 운송장 번호
   * @returns {Promise} 출고 결과
   */
  issueByBarcode: (data) => apiClient.post('/barcode/issue', data),

  /**
   * 배송 처리 (바코드 사용)
   * @param {Object} data - 배송 데이터
   * @param {string} data.barcode - 바코드
   * @param {number} data.quantity - 수량
   * @param {string} data.customerName - 고객명
   * @param {string} [data.customerAddress] - 고객 주소
   * @param {string} [data.customerPhone] - 고객 전화번호
   * @param {string} [data.shippingCompany] - 배송 회사 ('CJ대한통운' | '롯데택배' | '우체국택배' | '한진택배' | '로젠택배' | '기타')
   * @param {string} [data.trackingNumber] - 운송장 번호
   * @param {string} [data.shippingMessage] - 배송 메시지
   * @returns {Promise} 배송 결과
   */
  shipByBarcode: (data) => apiClient.post('/barcode/ship', data),

  /**
   * 바코드 이력 조회
   * @param {string} barcode - 바코드
   * @returns {Promise} 바코드 이력
   */
  getBarcodeHistory: (barcode) => apiClient.get(`/barcode/history/${barcode}`),
};

// ==================== 라벨 관리 API (하위 호환성 유지) ====================
// 기존 코드와의 호환성을 위해 labelAPI도 유지
export const labelAPI = {
  getPrinters: () => barcodeApi.getPrinters(),
  saveTemplate: (templateData) => barcodeApi.printLabel(templateData),
  getAllLabels: (params) => {
    const page = params?.page || 1;
    const limit = params?.limit || 50;
    return barcodeApi.getLabels(page, limit);
  },
  getLabelsByBarcode: (barcode) => barcodeApi.getLabelsByBarcode(barcode),
  getLabelsByInventory: (inventoryId) => barcodeApi.getLabelsByInventoryId(inventoryId),
  printSavedLabel: (data) => barcodeApi.printSavedLabel(data),
  getLabelTemplate: (registrationNumber) => 
    barcodeApi.getLabelTemplateByRegistrationNumber(registrationNumber),
  generateBarcode: (barcodeNumber) => 
    apiClient.get(`/barcode/generate/${barcodeNumber}`, { responseType: 'blob' }),
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
