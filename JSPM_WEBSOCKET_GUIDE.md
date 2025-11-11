# JSPrintManager WebSocket 연결 가이드

이 문서는 JSPrintManager의 WebSocket 연결에 대해 설명합니다.

## WebSocket이란?

JSPrintManager는 **WebSocket(WSS/WS)**을 사용하여 브라우저와 클라이언트 소프트웨어 간의 **실시간 통신**을 합니다.

### WebSocket 프로토콜

- **WSS (WebSocket Secure)**: 암호화된 WebSocket 연결 (권장)
  - 포트: `28443` (기본값)
  - 프로토콜: `wss://`
  - 예: `wss://localhost:28443`

- **WS (WebSocket)**: 비암호화 WebSocket 연결
  - 포트: `9595` (기본값)
  - 프로토콜: `ws://`
  - 예: `ws://localhost:9595`

## JSPrintManager WebSocket 설정

### 기본 설정

JSPrintManager는 기본적으로 **WSS (포트 28443)**를 사용합니다.

이미지에서 보이는 것처럼:
```
WSS Port: 28443 - JAVASCRIPT
```

### 환경 변수 설정

`.env` 파일에서 WebSocket URL을 설정할 수 있습니다:

```env
# WSS (WebSocket Secure, 권장)
VITE_JSPM_SERVER_URL=wss://localhost:28443

# 또는 WS (WebSocket, 비보안)
VITE_JSPM_SERVER_URL=ws://localhost:9595

# 포트만 설정 (선택적)
VITE_JSPM_PORT=28443
```

### 코드에서 사용

```javascript
import { getPrinters, initializeJSPM } from './utils/printerUtils';

// 기본 설정 (WSS, 포트 28443)
const printers = await getPrinters();

// 또는 명시적으로 설정
const jspm = await initializeJSPM('wss://localhost:28443', 28443, true);
const printers = await jspm.getPrinters();
```

## WebSocket 연결 확인

### 1. 브라우저 콘솔 확인

브라우저 개발자 도구의 콘솔에서 WebSocket 연결 상태를 확인할 수 있습니다:

```
🔗 JSPrintManager 서버 URL: wss://localhost:28443
🔒 WebSocket 프로토콜: WSS (포트: 28443)
✅ JSPrintManager 초기화 완료
✅ JSPrintManager 준비 완료
```

### 2. 네트워크 탭 확인

브라우저 개발자 도구의 Network 탭에서:
- **WS** 또는 **WSS** 필터를 선택
- WebSocket 연결이 `wss://localhost:28443` 또는 `ws://localhost:9595`로 표시되는지 확인
- 연결 상태가 **101 Switching Protocols**인지 확인

### 3. JSPrintManager 설정 확인

JSPrintManager 클라이언트 소프트웨어의 시스템 트레이 아이콘을 클릭하여:
- WSS Port가 `28443`으로 표시되는지 확인
- 연결 상태가 "Connected" 또는 "Running"인지 확인

## 포트 설정

### 기본 포트

- **WSS (WebSocket Secure)**: `28443`
- **WS (WebSocket)**: `9595`

### 포트 변경

JSPrintManager 설정에서 포트를 변경할 수 있습니다:

1. **시스템 트레이 아이콘 클릭**
2. **Settings...** 선택
3. **포트 설정 변경**
4. **서비스 재시작**

포트를 변경한 경우, `.env` 파일도 업데이트해야 합니다:

```env
VITE_JSPM_SERVER_URL=wss://localhost:새로운포트
VITE_JSPM_PORT=새로운포트
```

## 보안 고려사항

### WSS vs WS

- **WSS (권장)**: 암호화된 연결, 보안 강화
- **WS**: 비암호화 연결, 개발 환경에서만 사용 권장

### 프로덕션 환경

프로덕션 환경에서는 **WSS**를 사용하는 것을 강력히 권장합니다:

```env
VITE_JSPM_SERVER_URL=wss://localhost:28443
```

### 방화벽 설정

Windows 방화벽에서 WebSocket 포트를 허용해야 합니다:

- **WSS 포트**: `28443`
- **WS 포트**: `9595`

## 연결 문제 해결

### WebSocket 연결 실패

1. **포트 확인**
   ```bash
   netstat -an | findstr 28443
   ```
   - 포트가 LISTENING 상태인지 확인

2. **프로토콜 확인**
   - `wss://` (WSS) 사용 권장
   - `ws://` (WS)는 개발 환경에서만 사용

3. **방화벽 확인**
   - Windows 방화벽에서 포트 허용 확인
   - 바이러스 백신 소프트웨어에서도 허용 확인

4. **JSPrintManager 서비스 확인**
   - 서비스가 실행 중인지 확인
   - 서비스 재시작: `net stop JSPrintManager && net start JSPrintManager`

### 연결 타임아웃

1. **서버 URL 확인**
   - 올바른 WebSocket URL 형식인지 확인: `wss://localhost:28443`
   - HTTP URL이 아닌 WebSocket URL을 사용해야 합니다

2. **포트 확인**
   - JSPrintManager 설정에서 포트 확인
   - 환경 변수와 일치하는지 확인

3. **네트워크 확인**
   - 로컬호스트(`localhost`)에 연결할 수 있는지 확인
   - 원격 서버인 경우 네트워크 연결 확인

## 실시간 통신

### WebSocket의 장점

1. **실시간 통신**
   - 양방향 실시간 통신
   - 서버에서 클라이언트로 즉시 데이터 전송 가능

2. **낮은 지연 시간**
   - HTTP 요청/응답보다 빠름
   - 프린터 상태를 실시간으로 모니터링 가능

3. **연결 유지**
   - 한 번 연결하면 연결 유지
   - 재연결 오버헤드 감소

### 프린터 목록 가져오기

WebSocket을 통해 프린터 목록을 실시간으로 가져올 수 있습니다:

```javascript
// WebSocket 연결을 통해 프린터 목록 가져오기
const printers = await getPrinters();

// 프린터 목록이 자동으로 업데이트됨
console.log('프린터 목록:', printers);
```

## 추가 리소스

- [JSPRINTMANAGER_SETUP.md](./JSPRINTMANAGER_SETUP.md) - JSPrintManager 설정 가이드
- [JSPM_SERVER_GUIDE.md](./JSPM_SERVER_GUIDE.md) - JSPM 서버 실행 가이드
- [PRINTER_WITHOUT_BACKEND.md](./PRINTER_WITHOUT_BACKEND.md) - 백엔드 없이 프린터 사용 가이드
- [WebSocket MDN 문서](https://developer.mozilla.org/ko/docs/Web/API/WebSocket)

## 요약

✅ **JSPrintManager는 WebSocket(WSS)을 사용하여 실시간 통신을 합니다**

- **기본 포트**: `28443` (WSS)
- **프로토콜**: `wss://localhost:28443`
- **실시간 통신**: 브라우저와 클라이언트 소프트웨어 간 양방향 통신
- **보안**: WSS는 암호화된 연결 (권장)
- **환경 변수**: `VITE_JSPM_SERVER_URL=wss://localhost:28443`

