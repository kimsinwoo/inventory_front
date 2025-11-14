# JSPrintManager 설정 가이드

이 문서는 JSPrintManager를 사용하여 프린터 목록을 가져오는 방법을 설명합니다.

## JSPrintManager란?

JSPrintManager는 웹 애플리케이션에서 클라이언트 측 프린터에 직접 접근할 수 있게 해주는 JavaScript 라이브러리입니다.

## 사전 요구사항

### 1. JSPrintManager 클라이언트 소프트웨어 설치

JSPrintManager를 사용하려면 클라이언트 컴퓨터에 JSPrintManager 클라이언트 소프트웨어가 설치되어 있어야 합니다.

1. [JSPrintManager 공식 웹사이트](https://www.neodynamic.com/products/printing/js-print-manager/)에서 클라이언트 소프트웨어 다운로드
2. 클라이언트 소프트웨어 설치
3. 클라이언트 소프트웨어 실행 (시스템 트레이에서 실행됨)

### 2. JSPM 서버 실행

JSPrintManager는 로컬 서버(기본 포트: 9595)를 통해 작동합니다.

**📖 자세한 내용은 [JSPM_SERVER_GUIDE.md](./JSPM_SERVER_GUIDE.md)를 참고하세요.**

#### 빠른 시작

1. **서비스 관리자에서 확인 및 시작**
   - `Win + R` 키를 누르고 `services.msc` 입력
   - "JSPrintManager Service" 또는 "JSPM Service" 찾기
   - 서비스가 중지된 경우: 서비스 우클릭 → "시작" 선택

2. **명령 프롬프트에서 시작** (관리자 권한)
   ```bash
   net start JSPrintManager
   ```

3. **브라우저에서 확인**
   - 브라우저에서 `http://localhost:9595` 접속
   - 서버 정보 페이지가 표시되면 정상 작동

#### 서버 실행 확인

- **시스템 트레이**: JSPrintManager 아이콘 확인
- **브라우저**: `http://localhost:9595` 접속
- **포트 확인**: `netstat -an | findstr 9595`

자세한 내용은 [JSPM_SERVER_GUIDE.md](./JSPM_SERVER_GUIDE.md)를 참고하세요.

## 설정 방법

### 1. HTML에 JSPrintManager 스크립트 추가

`index.html` 파일에 JSPrintManager 스크립트를 추가합니다:

```html
<script src="https://cdn.neodynamic.com/jsprintmanager/JSPrintManager.js"></script>
```

또는 로컬 파일로 사용하는 경우:

```html
<script src="/js/JSPrintManager.js"></script>
```

### 2. 환경 변수 설정 (선택적)

`.env` 파일에 JSPM 서버 URL을 설정할 수 있습니다:

```env
# JSPrintManager 서버 URL (WebSocket, 선택적)
# WSS (WebSocket Secure, 권장): wss://localhost:28443
# WS (WebSocket, 비보안): ws://localhost:9595
VITE_JSPM_SERVER_URL=wss://localhost:28443

# WebSocket 포트 (선택적, 기본값: 28443 for WSS)
VITE_JSPM_PORT=28443
```

**중요**: JSPrintManager는 **WebSocket(WSS)**을 사용합니다. HTTP URL이 아닌 WebSocket URL을 사용해야 합니다.

기본값은 `wss://localhost:28443` (WSS, 포트 28443)입니다.

자세한 내용은 [JSPM_WEBSOCKET_GUIDE.md](./JSPM_WEBSOCKET_GUIDE.md)를 참고하세요.

### 3. 코드에서 사용

프린터 목록을 가져오는 코드는 이미 `printerUtils.js`에 구현되어 있습니다:

```javascript
import { getPrinters } from './utils/printerUtils';

// 프린터 목록 가져오기
const printers = await getPrinters();
```

## 작동 방식

프린터 목록 가져오기의 우선순위:

1. **JSPrintManager** (최우선) - 클라이언트 측 프린터 목록
2. **브라우저 API** - 브라우저가 지원하는 경우
3. **백엔드 API** - 서버를 통한 프린터 목록
4. **localStorage** - 저장된 프린터 목록
5. **빈 배열** - 모든 방법 실패 시

## 문제 해결

### JSPrintManager가 초기화되지 않는 경우

1. **클라이언트 소프트웨어 확인**
   - JSPrintManager 클라이언트 소프트웨어가 설치되어 있는지 확인
   - 클라이언트 소프트웨어가 실행 중인지 확인 (시스템 트레이)
   - 방화벽에서 포트 9595가 허용되어 있는지 확인

2. **서버 URL 확인**
   - JSPM 서버가 `http://localhost:9595`에서 실행 중인지 확인
   - 브라우저 콘솔에서 에러 메시지 확인

3. **스크립트 로드 확인**
   - 브라우저 개발자 도구의 Network 탭에서 JSPrintManager.js가 로드되는지 확인
   - 콘솔에서 `window.JSPM`이 정의되어 있는지 확인

### 프린터 목록이 비어있는 경우

1. **프린터 설치 확인**
   - 클라이언트 컴퓨터에 프린터가 설치되어 있는지 확인
   - 프린터가 활성화되어 있는지 확인

2. **권한 확인**
   - 클라이언트 소프트웨어가 프린터에 접근할 수 있는 권한이 있는지 확인
   - Windows의 경우 관리자 권한이 필요할 수 있습니다

3. **Fallback 사용**
   - JSPrintManager가 작동하지 않는 경우, 백엔드 API나 localStorage를 사용할 수 있습니다
   - 코드는 자동으로 fallback을 시도합니다

## 사용 예제

### 프린터 목록 가져오기

```javascript
import { getPrinters, isJSPMConnected } from './utils/printerUtils';

// JSPrintManager 연결 상태 확인
const isConnected = isJSPMConnected();
console.log('JSPM 연결 상태:', isConnected);

// 프린터 목록 가져오기
const printers = await getPrinters();
console.log('프린터 목록:', printers);
```

### JSPrintManager 수동 초기화

```javascript
import { initializeJSPM } from './utils/printerUtils';

// 특정 서버 URL로 초기화
const jspm = await initializeJSPM('http://localhost:9595');
if (jspm) {
  console.log('JSPrintManager 초기화 성공');
} else {
  console.log('JSPrintManager 초기화 실패');
}
```

## 추가 리소스

- [JSPM_WEBSOCKET_GUIDE.md](./JSPM_WEBSOCKET_GUIDE.md) - WebSocket 연결 가이드 (중요!)
- [JSPM_SERVER_GUIDE.md](./JSPM_SERVER_GUIDE.md) - JSPM 서버 실행 가이드 (상세)
- [JSPrintManager 공식 문서](https://www.neodynamic.com/products/printing/js-print-manager/)
- [JSPrintManager GitHub](https://github.com/neodynamic/JSPrintManager)
- [ENV_SETUP_GUIDE.md](./ENV_SETUP_GUIDE.md) - 환경 변수 설정 가이드

## 참고사항

1. **보안**: JSPrintManager는 클라이언트 측에서 실행되므로, 사용자의 컴퓨터에 클라이언트 소프트웨어가 설치되어 있어야 합니다.

2. **크로스 플랫폼**: JSPrintManager는 Windows, Mac, Linux를 지원합니다.

3. **라이선스**: JSPrintManager는 상업용 라이선스가 필요할 수 있습니다. 무료 평가판도 제공됩니다.

4. **Fallback**: JSPrintManager가 작동하지 않는 환경에서는 자동으로 다른 방법(API, localStorage)을 사용합니다.

