# Puppeteer를 사용한 PDF 생성 가이드

## 개요

FeedMillStandards 컴포넌트를 Puppeteer를 사용하여 고품질 PDF로 변환하는 기능이 추가되었습니다.

## 설치된 패키지

- `puppeteer`: 브라우저 자동화 및 PDF 생성
- `express`: PDF 생성 서버
- `cors`: CORS 설정
- `axios`: HTTP 클라이언트 (기존)

## 파일 구조

```
anniecongFrontEnd/
├── server.js                                    # Express 서버 (PDF 생성 API)
├── src/
│   ├── utils/
│   │   └── pdfGenerator.js                      # PDF 생성 유틸리티 함수
│   └── components/
│       ├── common/
│       │   ├── PdfDownloadButton.jsx            # 기존 html2canvas 방식
│       │   └── PuppeteerPdfButton.jsx           # 새로운 Puppeteer 방식
│       └── template/
│           └── FeedMillStandards.jsx            # 두 가지 PDF 다운로드 버튼 포함
```

## 사용 방법

### 1. PDF 생성 서버 실행

터미널에서 다음 명령어를 실행합니다:

```bash
node server.js
```

서버가 정상적으로 실행되면 다음 메시지가 표시됩니다:
```
PDF generation server running on http://223.130.143.87:3001
API endpoint: http://223.130.143.87:3001/api/generate-pdf
```

### 2. React 앱 실행

다른 터미널에서 React 앱을 실행합니다:

```bash
npm start
```

### 3. PDF 다운로드

FeedMillStandards 페이지에서 두 가지 PDF 다운로드 옵션을 사용할 수 있습니다:

1. **PDF 다운로드 (html2canvas)**: 기존 클라이언트 사이드 방식
2. **PDF 다운로드 (Puppeteer)**: 새로운 서버 사이드 방식 (더 정확한 레이아웃)

## 두 방식의 차이점

### html2canvas 방식
- ✅ 서버 불필요 (클라이언트에서 모두 처리)
- ✅ 빠른 처리
- ⚠️ 복잡한 레이아웃에서 부정확할 수 있음
- ⚠️ 브라우저 간 차이 발생 가능

### Puppeteer 방식
- ✅ 정확한 레이아웃 렌더링
- ✅ 고품질 PDF 생성
- ✅ 브라우저와 동일한 출력
- ⚠️ 서버 필요 (node server.js 실행)
- ⚠️ 약간 느린 처리 속도

## API 엔드포인트

### POST `/api/generate-pdf`

HTML을 PDF로 변환합니다.

**요청 본문:**
```json
{
  "html": "<html>...</html>",
  "filename": "document.pdf"
}
```

**응답:**
- Content-Type: `application/pdf`
- PDF 파일 바이너리 데이터

### GET `/health`

서버 상태를 확인합니다.

**응답:**
```json
{
  "status": "OK",
  "message": "Server is running"
}
```

## 컴포넌트 사용 예제

```jsx
import PuppeteerPdfButton from '../common/PuppeteerPdfButton';

const MyComponent = () => {
  const contentRef = useRef();

  return (
    <div>
      <div ref={contentRef}>
        {/* PDF로 변환할 내용 */}
      </div>

      <PuppeteerPdfButton
        contentRef={contentRef}
        filename="내문서.pdf"
        buttonText="PDF 다운로드"
        className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
        onDownloadStart={() => console.log('시작')}
        onDownloadComplete={() => console.log('완료')}
        onDownloadError={(error) => console.error('오류', error)}
      />
    </div>
  );
};
```

## 문제 해결

### 서버 연결 오류

만약 "PDF 서버가 실행되고 있지 않습니다" 오류가 발생하면:

1. 터미널에서 `node server.js`가 실행 중인지 확인
2. 포트 3001이 사용 가능한지 확인
3. 방화벽 설정 확인

### PDF 생성 실패

1. 서버 로그 확인 (server.js 실행 터미널)
2. 브라우저 콘솔 확인
3. 네트워크 탭에서 요청/응답 확인

## 프로덕션 배포

프로덕션 환경에서는:

1. `server.js`를 별도 서버에서 실행
2. 환경 변수로 API URL 관리 (`REACT_APP_PDF_SERVER_URL`)
3. `src/utils/pdfGenerator.js`의 `API_BASE_URL` 수정
4. HTTPS 사용 권장
5. Puppeteer 헤드리스 모드 확인

## 성능 최적화 팁

1. **대용량 문서**: 페이지를 나누어 처리
2. **이미지 최적화**: 압축된 이미지 사용
3. **타임아웃 설정**: 큰 문서의 경우 타임아웃 증가
4. **캐싱**: 동일한 내용은 캐시 활용

## 참고 사항

- Puppeteer는 Chromium을 포함하므로 약 300MB의 디스크 공간 필요
- 첫 실행 시 Chromium 다운로드로 시간이 걸릴 수 있음
- 서버 메모리: PDF 생성 시 약 200-500MB 사용
