# JSPrintManager 로드 문제 해결 가이드

## 문제 상황

브라우저 콘솔에서 다음과 같은 경고가 나타납니다:
```
⚠️ JSPrintManager가 로드되지 않았습니다.
```

하지만 프린터 목록은 정상적으로 가져와집니다:
```
✅ 가져온 프린터 목록: ['OneNote (Desktop)', 'Microsoft Print to PDF']
```

## 원인 분석

1. **JSPrintManager 스크립트가 로드되지 않음**
   - CDN URL이 접근 불가능하거나
   - 스크립트 로드 순서 문제
   - 네트워크 지연

2. **Fallback 메커니즘이 작동**
   - JSPrintManager가 실패하면 브라우저 API를 사용
   - 브라우저 API는 제한적인 프린터 목록만 제공

## 해결 방법

### 1. 로컬 파일 사용 (권장)

npm 패키지에서 JSPrintManager.js 파일을 `public/js/` 폴더에 복사했습니다.

**파일 위치**: `public/js/JSPrintManager.js`

**HTML 설정**: `index.html`에서 로컬 파일을 참조합니다:
```html
<script src="/js/JSPrintManager.js"></script>
```

### 2. 스크립트 로드 대기 시간 증가

코드에서 JSPrintManager 로드를 최대 5초 동안 대기하도록 수정했습니다.

### 3. 개선된 로그 메시지

더 자세한 로그 메시지를 제공하여 문제를 쉽게 진단할 수 있습니다.

## 확인 방법

### 1. 브라우저 개발자 도구 확인

1. **Network 탭**:
   - `/js/JSPrintManager.js` 파일이 로드되는지 확인
   - 상태 코드가 200인지 확인

2. **Console 탭**:
   - `window.JSPM`이 정의되어 있는지 확인:
     ```javascript
     console.log(window.JSPM);
     ```
   - `window.JSPM.JSPrintManager`가 있는지 확인:
     ```javascript
     console.log(window.JSPM?.JSPrintManager);
     ```

### 2. 파일 존재 확인

```bash
# public/js/JSPrintManager.js 파일이 있는지 확인
ls public/js/JSPrintManager.js
```

### 3. 개발 서버 재시작

파일을 추가한 후 개발 서버를 재시작하세요:
```bash
npm run dev
```

## 현재 상태

### 작동하는 경우

✅ **브라우저 API를 통한 프린터 목록 가져오기**
- `navigator.mediaDevices.getPrinters()` API 사용
- 제한적인 프린터 목록만 제공
- JSPrintManager 없이도 작동

### 작동하지 않는 경우

❌ **JSPrintManager를 통한 프린터 목록 가져오기**
- 더 많은 프린터 정보 제공
- 프린터 설정 및 제어 가능
- WebSocket을 통한 실시간 통신

## 다음 단계

### JSPrintManager를 제대로 사용하려면

1. **JSPrintManager 클라이언트 소프트웨어 설치**
   - [JSPrintManager 공식 웹사이트](https://www.neodynamic.com/products/printing/js-print-manager/)에서 다운로드
   - 설치 후 Windows 서비스로 실행

2. **JSPM 서버 실행**
   - 기본 포트: 28443 (WSS)
   - 시스템 트레이에서 서비스 상태 확인

3. **스크립트 로드 확인**
   - 브라우저 개발자 도구에서 `/js/JSPrintManager.js` 로드 확인
   - `window.JSPM` 객체 확인

## Fallback 메커니즘

현재 코드는 다음 순서로 프린터 목록을 가져옵니다:

1. **JSPrintManager** (최우선) ⭐
   - WebSocket을 통한 실시간 통신
   - 가장 많은 프린터 정보 제공

2. **브라우저 API** (Fallback)
   - `navigator.mediaDevices.getPrinters()` 사용
   - 제한적인 프린터 목록만 제공
   - **현재 이 방법이 작동 중**

3. **백엔드 API** (Fallback)
   - `/barcode/printers` 엔드포인트 호출
   - 백엔드 서버 필요

4. **localStorage** (Fallback)
   - 이전에 저장된 프린터 목록 사용

## 요약

✅ **프린터 목록은 정상적으로 가져와집니다** (브라우저 API 사용)

⚠️ **JSPrintManager는 로드되지 않았습니다** (스크립트 로드 문제)

💡 **해결 방법**:
1. 로컬 파일 사용 (이미 설정됨)
2. 개발 서버 재시작
3. 브라우저 개발자 도구에서 스크립트 로드 확인
4. JSPrintManager 클라이언트 소프트웨어 설치 및 실행

## 관련 문서

- [JSPRINTMANAGER_SETUP.md](./JSPRINTMANAGER_SETUP.md) - JSPrintManager 설정 가이드
- [JSPM_WEBSOCKET_GUIDE.md](./JSPM_WEBSOCKET_GUIDE.md) - WebSocket 연결 가이드
- [JSPM_SERVER_GUIDE.md](./JSPM_SERVER_GUIDE.md) - JSPM 서버 실행 가이드
- [PRINTER_WITHOUT_BACKEND.md](./PRINTER_WITHOUT_BACKEND.md) - 백엔드 없이 프린터 사용 가이드

