import axios from 'axios';

/**
 * Axios 인스턴스 생성
 * - baseURL: 환경 변수 또는 기본값 사용
 * - withCredentials: 세션 쿠키 포함
 */
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 요청 인터셉터
 * - 모든 요청에 대한 로깅 및 전처리
 */
apiClient.interceptors.request.use(
  (config) => {
    // 요청 로깅 (개발 환경에서만)
    if (import.meta.env.DEV) {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, config.data || config.params);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * 응답 인터셉터
 * - 에러 처리 및 로그인 페이지 리다이렉트 (조건부)
 */
apiClient.interceptors.response.use(
  (response) => {
    // 성공 응답 로깅 (개발 환경에서만)
    if (import.meta.env.DEV) {
      console.log(`[API Response] ${response.config.url}`, response.data);
    }
    return response;
  },
  (error) => {
    // 에러 로깅
    console.error('[API Error]', error.response?.data || error.message);

    // 네트워크 에러 처리 (백엔드 서버가 실행되지 않은 경우)
    if (!error.response) {
      console.warn('[API] 백엔드 서버에 연결할 수 없습니다. 로컬 모드로 동작합니다.');
      const networkError = {
        ok: false,
        message: '서버에 연결할 수 없습니다. 로컬 모드로 동작합니다.',
        code: 'ERR_NETWORK',
        customMessage: '서버에 연결할 수 없습니다.',
      };
      return Promise.reject(networkError);
    }

    // 401 에러 시 조건부 리다이렉트
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      const isAuthPage = currentPath === '/login' || currentPath === '/signup';
      
      // 로그인/회원가입 페이지가 아니고, 인증 관련 API 호출인 경우에만 리다이렉트
      const isAuthAPI = error.config?.url?.includes('/auth/');
      
      if (!isAuthPage && isAuthAPI) {
        console.warn('[API] 인증이 필요합니다. 로그인 페이지로 이동합니다.');
        localStorage.removeItem('user');
        
        // 3초 후 리다이렉트 (사용자가 에러 메시지를 볼 수 있도록)
        setTimeout(() => {
          window.location.href = '/login';
        }, 1000);
      } else {
        console.warn('[API] 인증이 필요한 API입니다. 로컬 데이터로 동작합니다.');
      }
    }

    // 에러 메시지 포맷팅
    const customError = {
      ok: false,
      message: error.response?.data?.message || error.message || '알 수 없는 오류가 발생했습니다.',
      detail: error.response?.data?.detail || [],
      requestId: error.response?.data?.requestId,
      status: error.response?.status,
      customMessage: error.response?.data?.message || error.message,
    };

    return Promise.reject(customError);
  }
);

export default apiClient;

