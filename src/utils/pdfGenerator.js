import axios from 'axios';

// PDF 서버 URL (환경 변수에서 가져오거나 기본값 사용)
const PDF_SERVER_URL = import.meta.env.VITE_PDF_SERVER_URL || 'http://223.130.143.87:3001';

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

    // input 요소들을 텍스트로 변환
    const inputs = clonedElement.querySelectorAll('input');
    inputs.forEach(input => {
      const value = input.value || input.placeholder || '';
      const textSpan = document.createElement('span');
      textSpan.textContent = value;
      textSpan.style.cssText = window.getComputedStyle(input).cssText;
      textSpan.style.display = 'inline-block';
      textSpan.style.width = '100%';
      input.parentNode.replaceChild(textSpan, input);
    });

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
