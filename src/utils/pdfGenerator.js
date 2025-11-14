import axios from 'axios';

<<<<<<< HEAD
// PDF 서버 URL (환경 변수에서 가져오거나 기본값 사용)
const PDF_SERVER_URL = import.meta.env.VITE_PDF_SERVER_URL || 'http://223.130.143.87:3001';
=======
// PDF 서버 URL (환경 변수에서 가져오기)
// PDF 서버는 별도 포트를 사용할 수 있으므로 별도 환경 변수 지원
// VITE_PDF_SERVER_URL이 없으면 VITE_API_URL에서 포트를 추출하거나 기본 포트 사용
const PDF_SERVER_URL = import.meta.env.VITE_PDF_SERVER_URL || 
  (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '').replace(/:\d+$/, '') + ':3001' : null);
>>>>>>> origin/label-print

/**
 * Puppeteer를 사용하여 HTML을 PDF로 변환
 * @param {HTMLElement} element - PDF로 변환할 DOM 요소
 * @param {string} filename - 저장될 파일명
 * @returns {Promise<void>}
 */
export const generatePdfWithPuppeteer = async (element, filename = 'document.pdf') => {
  try {
    if (!element) {
      throw new Error('PDF로 변환할 요소를 찾을 수 없습니다.');
    }

    // DOM 요소를 복제하여 처리
    const clonedElement = element.cloneNode(true);

    // 원본 요소에서 input 값을 가져와서 복제본에 적용
    const originalInputs = element.querySelectorAll('input[type="text"], input:not([type])');
    const clonedInputs = clonedElement.querySelectorAll('input[type="text"], input:not([type])');
    originalInputs.forEach((input, index) => {
      if (clonedInputs[index]) {
        clonedInputs[index].setAttribute('value', input.value || '');
      }
    });

    // 원본 요소에서 textarea 값을 가져와서 복제본에 적용
    const originalTextareas = element.querySelectorAll('textarea');
    const clonedTextareas = clonedElement.querySelectorAll('textarea');
    originalTextareas.forEach((textarea, index) => {
      if (clonedTextareas[index]) {
        clonedTextareas[index].textContent = textarea.value || '';
      }
    });

    // 이미지를 Base64로 변환 (blob: URL을 data: URL로 변환)
    const images = clonedElement.querySelectorAll('img');
    const imagePromises = Array.from(images).map(async (img) => {
      const src = img.getAttribute('src');
      if (src && src.startsWith('blob:')) {
        try {
          const response = await fetch(src);
          const blob = await response.blob();
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              img.setAttribute('src', reader.result);
              resolve();
            };
            reader.readAsDataURL(blob);
          });
        } catch (error) {
          console.error('이미지 변환 실패:', error);
        }
      }
    });

    // 모든 이미지 변환 완료 대기
    await Promise.all(imagePromises);

    // 전체 HTML 문서 생성
    const styles = Array.from(document.styleSheets)
      .map(styleSheet => {
        try {
          return Array.from(styleSheet.cssRules)
            .map(rule => rule.cssText)
            .join('\n');
        } catch (e) {
          // CORS 에러 등으로 접근 불가능한 스타일시트는 무시
          return '';
        }
      })
      .join('\n');

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="ko">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>PDF Document</title>
        <style>
          ${styles}

          /* 추가 PDF 최적화 스타일 */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          body {
            margin: 0;
            padding: 20px;
            background: white;
          }

          table {
            border-collapse: collapse !important;
          }

          td, th {
            page-break-inside: avoid;
          }
        </style>
      </head>
      <body>
        ${clonedElement.outerHTML}
      </body>
      </html>
    `;

    // 서버에 PDF 생성 요청
    const response = await axios.post(
      `${PDF_SERVER_URL}/api/generate-pdf`,
      {
        html: htmlContent,
        filename: filename
      },
      {
        responseType: 'blob',
        timeout: 60000, // 60초 타임아웃
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    // Blob을 다운로드
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return { success: true };
  } catch (error) {
    console.error('PDF 생성 중 오류:', error);

    let errorMessage = 'PDF 생성에 실패했습니다.';

    if (error.code === 'ECONNABORTED') {
      errorMessage = 'PDF 생성 시간이 초과되었습니다. 다시 시도해주세요.';
    } else if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
      errorMessage = 'PDF 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.';
    } else if (error.response) {
      errorMessage = `서버 오류: ${error.response.data?.message || error.response.statusText}`;
    }

    throw new Error(errorMessage);
  }
};

/**
 * 서버 상태 확인
 * @returns {Promise<boolean>}
 */
export const checkServerHealth = async () => {
  try {
    const response = await axios.get(`${PDF_SERVER_URL}/health`, { timeout: 5000 });
    return response.data.status === 'OK';
  } catch (error) {
    console.error('서버 연결 실패:', error);
    return false;
  }
};
