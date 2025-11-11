/**
 * 프린터 관련 유틸리티 함수
 * 브라우저에서 프린터 목록을 가져오거나 관리하는 함수들
 */

// localStorage 키
const PRINTER_LIST_KEY = 'saved_printers';
const DEFAULT_PRINTER_KEY = 'default_printer';

/**
 * localStorage에서 저장된 프린터 목록 가져오기
 */
export const getSavedPrinters = () => {
  try {
    const saved = localStorage.getItem(PRINTER_LIST_KEY);
    if (saved) {
      const printers = JSON.parse(saved);
      return Array.isArray(printers) ? printers : [];
    }
  } catch (error) {
    console.error('저장된 프린터 목록 불러오기 실패:', error);
  }
  return [];
};

/**
 * 프린터 목록을 localStorage에 저장
 */
export const savePrinters = (printers) => {
  try {
    if (Array.isArray(printers)) {
      localStorage.setItem(PRINTER_LIST_KEY, JSON.stringify(printers));
      return true;
    }
  } catch (error) {
    console.error('프린터 목록 저장 실패:', error);
  }
  return false;
};

/**
 * 프린터 추가
 */
export const addPrinter = (printerName) => {
  if (!printerName || !printerName.trim()) return false;
  
  const printers = getSavedPrinters();
  const trimmedName = printerName.trim();
  
  // 중복 확인
  if (!printers.includes(trimmedName)) {
    printers.push(trimmedName);
    savePrinters(printers);
    return true;
  }
  return false;
};

/**
 * 프린터 삭제
 */
export const removePrinter = (printerName) => {
  const printers = getSavedPrinters();
  const filtered = printers.filter(p => p !== printerName);
  if (filtered.length !== printers.length) {
    savePrinters(filtered);
    return true;
  }
  return false;
};

/**
 * 기본 프린터 가져오기
 */
export const getDefaultPrinter = () => {
  try {
    const defaultPrinter = localStorage.getItem(DEFAULT_PRINTER_KEY);
    if (defaultPrinter) {
      return defaultPrinter;
    }
  } catch (error) {
    console.error('기본 프린터 불러오기 실패:', error);
  }
  return '';
};

/**
 * 기본 프린터 설정
 */
export const setDefaultPrinter = (printerName) => {
  try {
    if (printerName) {
      localStorage.setItem(DEFAULT_PRINTER_KEY, printerName);
      return true;
    }
  } catch (error) {
    console.error('기본 프린터 저장 실패:', error);
  }
  return false;
};

/**
 * 브라우저의 프린트 다이얼로그 열기 (선택적)
 * 실제 프린터 목록은 가져올 수 없지만, 사용자가 프린터를 선택할 수 있음
 */
export const openPrintDialog = (content) => {
  if (!content) return;
  
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    // 프린트 후 창 닫기 (선택적)
    // setTimeout(() => printWindow.close(), 1000);
  }
};

/**
 * 브라우저에서 프린터 목록 가져오기 시도 (Web Print API)
 * Chrome/Edge에서만 지원될 수 있음
 */
export const getBrowserPrinters = async () => {
  try {
    // Web Print API 시도 (Chrome/Edge)
    if ('printers' in navigator && typeof navigator.printers === 'object') {
      const printers = await navigator.printers.getPrinters();
      if (printers && printers.length > 0) {
        return printers.map(p => p.name || p.id || String(p));
      }
    }
    
    // 대안: 브라우저 프린트 다이얼로그를 통한 간접적 방법은 불가능
    // 보안상의 이유로 브라우저에서 직접 프린터 목록을 가져올 수 없음
  } catch (error) {
    console.warn('브라우저 프린터 목록 가져오기 실패:', error);
  }
  return [];
};

/**
 * 백엔드 API를 통해 프린터 목록 가져오기
 * @param {Function} apiCall - labelAPI.getPrinters() 함수
 */
export const fetchPrintersFromAPI = async (apiCall) => {
  try {
    const response = await apiCall();
    
    // 응답 데이터 구조 확인
    let printerList = [];
    if (Array.isArray(response.data)) {
      printerList = response.data;
    } else if (response.data?.data) {
      printerList = Array.isArray(response.data.data) ? response.data.data : [response.data.data];
    } else if (response.data?.printers) {
      printerList = Array.isArray(response.data.printers) ? response.data.printers : [response.data.printers];
    } else if (response.data?.printersList) {
      printerList = Array.isArray(response.data.printersList) ? response.data.printersList : [response.data.printersList];
    }
    
    // 프린터 목록을 문자열 배열로 변환
    if (printerList.length > 0) {
      const printerNames = printerList.map(p => {
        // 객체인 경우 name 필드 사용, 문자열인 경우 그대로 사용
        if (typeof p === 'string') {
          return p;
        } else if (p && typeof p === 'object') {
          return p.name || p.id || p.printerName || String(p);
        }
        return String(p);
      }).filter(name => name && name.trim().length > 0);
      
      // 가져온 프린터 목록을 localStorage에 저장
      if (printerNames.length > 0) {
        savePrinters(printerNames);
        return printerNames;
      }
    }
    return [];
  } catch (error) {
    console.error('API를 통한 프린터 목록 가져오기 실패:', error);
    return null; // null을 반환하여 fallback 사용 가능하도록 함
  }
};

/**
 * 프린터 목록 가져오기 (우선순위: API > localStorage > 빈 배열)
 * @param {Function} apiCall - labelAPI.getPrinters() 함수 (선택적)
 */
export const getPrinters = async (apiCall = null) => {
  // 1. 브라우저에서 직접 가져오기 시도 (지원되는 경우)
  const browserPrinters = await getBrowserPrinters();
  if (browserPrinters.length > 0) {
    savePrinters(browserPrinters);
    return browserPrinters;
  }
  
  // 2. 백엔드 API를 통해 가져오기 시도
  if (apiCall && typeof apiCall === 'function') {
    const apiPrinters = await fetchPrintersFromAPI(apiCall);
    if (apiPrinters && apiPrinters.length > 0) {
      return apiPrinters;
    }
  }
  
  // 3. localStorage에서 가져오기 (fallback)
  const savedPrinters = getSavedPrinters();
  if (savedPrinters.length > 0) {
    return savedPrinters;
  }
  
  // 4. 모두 실패 시 빈 배열 반환
  return [];
};

