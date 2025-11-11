import axios from 'axios';

// ============================================
// API Base URL 설정
// ============================================
const getApiBaseUrl = () => {
  // 1. VITE_API_URL 환경 변수 (Vite 프로젝트)
  if (import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL !== '') {
    return import.meta.env.VITE_API_URL;
  }
  
  // 2. REACT_APP_API_URL 환경 변수 (Create React App)
  if (import.meta.env.REACT_APP_API_URL && import.meta.env.REACT_APP_API_URL !== '') {
    return import.meta.env.REACT_APP_API_URL;
  }
  
  // 3. 개발 환경 기본값
  if (import.meta.env.MODE === 'development') {
    console.warn('⚠️ VITE_API_URL 환경 변수가 설정되지 않았습니다. 기본값을 사용합니다.');
    console.warn('📝 .env 파일에 VITE_API_URL=http://localhost:4000/api 를 추가하세요.');
    return 'http://localhost:4000/api';
  }
  
  // 4. 프로덕션 환경 기본값
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
  withCredentials: true, // 쿠키 포함 (세션 인증)
  timeout: 30000, // 30초 타임아웃 (프린트 작업은 시간이 걸릴 수 있음)
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
      
      // 401: 인증 실패 - 로그인 페이지로 리다이렉트
      if (status === 401) {
        console.warn('⚠️ 인증이 만료되었습니다. 로그인 페이지로 이동합니다.');
        window.location.href = '/login';
      }
      
      // 403: 권한 없음
      if (status === 403) {
        console.error('❌ 접근 권한이 없습니다.');
      }
      
      // 404: 리소스를 찾을 수 없음
      if (status === 404) {
        console.error('❌ 요청한 리소스를 찾을 수 없습니다.');
      }
      
      // 500: 서버 오류
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
// Label API
// ============================================
export const labelAPI = {
  /**
   * 프린터 목록 조회
   * GET /api/label/printers
   */
  getPrinters: async () => {
    const response = await apiClient.get('/label/printers');
    return response;
  },

  /**
   * 라벨 프린트
   * POST /api/label/print
   * @param {Object} data - 프린트 데이터
   * @param {string} data.templateType - 라벨 크기 ('large' | 'medium' | 'small' | 'verysmall')
   * @param {number|string} data.itemId - 품목 ID
   * @param {string} data.manufactureDate - 제조일자 (YYYY-MM-DD)
   * @param {string} data.expiryDate - 유통기한 (YYYY-MM-DD)
   * @param {string} [data.printerName] - 프린터 이름
   * @param {number} [data.printCount] - 인쇄 개수 (기본값: 1)
   * @param {Object} [data.pdfOptions] - PDF 옵션
   * @param {string} [data.productName] - 제품명
   * @param {string} [data.storageCondition] - 보관조건
   * @param {string} [data.registrationNumber] - 등록번호
   * @param {string} [data.categoryAndForm] - 카테고리 및 형태
   * @param {string} [data.ingredients] - 원재료
   * @param {string} [data.rawMaterials] - 원료
   * @param {string} [data.actualWeight] - 실제 중량
   * @param {boolean} [data.saveTemplate] - 템플릿 저장 여부
   */
  printLabel: async (data) => {
    const response = await apiClient.post('/label/print', data);
    return response;
  },

  /**
   * 템플릿 저장
   * POST /api/label/template
   * @param {Object} data - 템플릿 데이터
   * @param {string} data.labelType - 라벨 타입 ('large' | 'medium' | 'small' | 'verysmall')
   * @param {number|string} [data.itemId] - 품목 ID
   * @param {string} [data.itemName] - 품목명
   * @param {string} [data.storageCondition] - 보관조건
   * @param {string} [data.registrationNumber] - 등록번호
   * @param {string} [data.categoryAndForm] - 카테고리 및 형태
   * @param {string} [data.ingredients] - 원재료
   * @param {string} [data.rawMaterials] - 원료
   * @param {string} [data.actualWeight] - 실제 중량
   */
  saveTemplate: async (data) => {
    const response = await apiClient.post('/label/template', data);
    return response;
  },

  /**
   * 템플릿 목록 조회
   * GET /api/label/templates
   * @param {Object} [params] - 쿼리 파라미터
   * @param {number} [params.page] - 페이지 번호 (기본값: 1)
   * @param {number} [params.limit] - 페이지당 항목 수 (기본값: 50)
   */
  getTemplates: async (params = {}) => {
    const response = await apiClient.get('/label/templates', { params });
    return response;
  },

  /**
   * 템플릿 조회
   * GET /api/label/template/:templateId
   * @param {number|string} templateId - 템플릿 ID
   */
  getTemplate: async (templateId) => {
    const response = await apiClient.get(`/label/template/${templateId}`);
    return response;
  },
};

// ============================================
// Items API (품목 조회용)
// ============================================
export const itemsAPI = {
  /**
   * 품목 목록 조회
   * GET /api/items
   * @param {Object} [params] - 쿼리 파라미터
   * @param {string} [params.category] - 카테고리 (예: 'Finished')
   * @param {number} [params.page] - 페이지 번호
   * @param {number} [params.limit] - 페이지당 항목 수
   */
  getItems: async (params = {}) => {
    const response = await apiClient.get('/items', { params });
    return response;
  },
};

// ============================================
// 기본 export
// ============================================
export default {
  labelAPI,
  itemsAPI,
  apiClient,
};

