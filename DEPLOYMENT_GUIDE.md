# 배포 환경 가이드

이 문서는 배포된 웹사이트(https://anniecong.o-r.kr)에서 JSPrintManager가 작동하도록 설정하는 방법을 설명합니다.

## 배포 아키텍처

```
🌐 배포된 웹사이트 (https://anniecong.o-r.kr)
        │
        │  (1) 사용자의 브라우저에서 HTTPS 접속
        ▼
💻 사용자 PC 브라우저
        │
        │  (2) 로컬의 JSPrintManager Client App 연결 시도
        │      (WSS://localhost:28443)
        ▼
🖨️ JSPrintManager Client App (사용자 PC)
        │
        │  (3) 실제 프린터 장치로 제어
        ▼
🖨️ 물리적 프린터
```

## 중요 사항

### 1. 로컬 연결 사용

**배포된 웹사이트에서도 `localhost`를 사용합니다!**

- 웹사이트는 `https://anniecong.o-r.kr`에 배포됨
- 하지만 JSPrintManager는 **사용자 PC의 localhost:28443**에 연결
- 각 사용자의 PC에 JSPrintManager Client App이 설치되어 있어야 함

### 2. WebSocket 프로토콜

- **개발 환경**: `ws://localhost:9595` (HTTP)
- **프로덕션 환경**: `wss://localhost:28443` (HTTPS/WSS)
- HTTPS 웹사이트에서는 WSS를 사용해야 함

### 3. 보안 고려사항

- HTTPS 웹사이트에서 WSS 연결 사용 (암호화)
- 로컬 연결만 사용 (localhost)
- 방화벽 설정 필요 (포트 28443)

## 배포 전 준비사항

### 1. 빌드 설정 확인

`vite.config.js`에서 빌드 설정 확인:

```javascript
build: {
  outDir: 'build',
  copyPublicDir: true, // public 폴더 파일 복사 보장
}
```

### 2. public 폴더 파일 확인

다음 파일이 `public/js/` 폴더에 있는지 확인:

```
public/
  └── js/
      └── JSPrintManager.js
```

**빌드 시 이 파일이 자동으로 `build/js/JSPrintManager.js`로 복사됩니다.**

### 3. 환경 변수 설정 (선택적)

프로덕션 환경 변수는 빌드 시점에 설정됩니다:

```bash
# .env.production (선택적)
VITE_API_URL=https://anniecong.o-r.kr/api
VITE_JSPM_SERVER_URL=wss://localhost:28443
VITE_JSPM_PORT=28443
```

## 빌드 및 배포

### 1. 프로덕션 빌드

```bash
npm run build
```

빌드 결과:
- `build/` 폴더에 프로덕션 파일 생성
- `build/js/JSPrintManager.js` 파일 포함 확인

### 2. 빌드 결과 확인

```bash
# 빌드 폴더 확인
ls build/js/JSPrintManager.js

# 빌드 결과 확인
ls -la build/
```

### 3. 배포

빌드된 `build/` 폴더를 웹 서버에 배포:

```bash
# 예: Nginx, Apache, 또는 다른 웹 서버
cp -r build/* /var/www/html/
```

## 사용자 측 설정

### 1. JSPrintManager Client App 설치

각 사용자의 PC에 JSPrintManager Client App을 설치해야 합니다:

1. [JSPrintManager 공식 웹사이트](https://www.neodynamic.com/products/printing/js-print-manager/)에서 다운로드
2. 설치 프로그램 실행
3. Windows 서비스로 자동 등록

### 2. JSPrintManager Service 실행

JSPrintManager Service가 실행 중이어야 합니다:

```bash
# 서비스 상태 확인
net start JSPrintManager

# 또는 Windows 서비스 관리자에서 확인
# "JSPrintManager Service" 찾기
```

### 3. 방화벽 설정

Windows 방화벽에서 포트 28443(WSS)을 허용해야 합니다:

1. **Windows 방화벽 설정** 열기
2. **고급 설정** 선택
3. **인바운드 규칙** → **새 규칙**
4. **포트** 선택 → **TCP** → **28443** 입력
5. **연결 허용** 선택
6. **이름**: "JSPrintManager WSS"

### 4. 브라우저 확인

브라우저에서 웹사이트 접속:

1. `https://anniecong.o-r.kr` 접속
2. 브라우저 개발자 도구 열기 (F12)
3. **Network 탭**에서 `/js/JSPrintManager.js` 로드 확인
4. **Console 탭**에서 JSPrintManager 로드 메시지 확인

## 작동 확인

### 1. 브라우저 콘솔 확인

정상 작동 시 다음과 같은 메시지가 표시됩니다:

```
✅ JSPrintManager 로드 확인 (100ms 후)
🌐 환경: 프로덕션 | 호스트: anniecong.o-r.kr | 프로토콜: https:
🔗 JSPrintManager 서버 URL: wss://localhost:28443
🔒 WebSocket 프로토콜: WSS (포트: 28443)
💡 배포된 웹사이트에서도 사용자 PC의 JSPrintManager Client App(localhost:28443)에 연결합니다.
✅ JSPrintManager 초기화 완료
✅ JSPrintManager 준비 완료
```

### 2. 프린터 목록 확인

프린터 목록이 정상적으로 표시되는지 확인:

```
✅ JSPrintManager를 통해 프린터 목록 가져오기 성공: ["프린터1", "프린터2", ...]
```

### 3. WebSocket 연결 확인

브라우저 개발자 도구의 **Network 탭**에서:

1. **WS** 또는 **WSS** 필터 선택
2. `wss://localhost:28443` 연결 확인
3. 연결 상태가 **101 Switching Protocols**인지 확인

## 문제 해결

### 문제 1: JSPrintManager가 로드되지 않음

**증상**:
```
⚠️ JSPrintManager가 로드되지 않았습니다.
```

**해결 방법**:

1. **빌드 파일 확인**:
   ```bash
   ls build/js/JSPrintManager.js
   ```

2. **웹 서버 설정 확인**:
   - `build/js/JSPrintManager.js` 파일이 정적 파일로 제공되는지 확인
   - 경로가 올바른지 확인 (`/js/JSPrintManager.js`)

3. **브라우저 캐시 삭제**:
   - 브라우저 캐시 삭제
   - 하드 새로고침 (Ctrl + Shift + R)

4. **CDN Fallback 확인**:
   - 로컬 파일이 실패하면 자동으로 CDN에서 로드됨
   - Network 탭에서 CDN 로드 확인

### 문제 2: WebSocket 연결 실패

**증상**:
```
⚠️ JSPrintManager 초기화 실패
WebSocket 연결 오류
```

**해결 방법**:

1. **JSPrintManager Service 확인**:
   ```bash
   net start JSPrintManager
   ```

2. **포트 확인**:
   ```bash
   netstat -an | findstr 28443
   ```
   - 포트가 LISTENING 상태인지 확인

3. **방화벽 확인**:
   - Windows 방화벽에서 포트 28443 허용 확인
   - 바이러스 백신 소프트웨어에서도 허용 확인

4. **서비스 재시작**:
   ```bash
   net stop JSPrintManager
   net start JSPrintManager
   ```

### 문제 3: HTTPS에서 WSS 연결 실패

**증상**:
```
Mixed Content 오류
WSS 연결 실패
```

**해결 방법**:

1. **프로토콜 확인**:
   - HTTPS 웹사이트에서는 WSS를 사용해야 함
   - 코드에서 자동으로 WSS로 전환됨

2. **포트 확인**:
   - WSS 포트: 28443
   - WS 포트: 9595 (HTTPS에서는 사용하지 않음)

3. **환경 변수 확인**:
   ```bash
   # .env.production
   VITE_JSPM_SERVER_URL=wss://localhost:28443
   VITE_JSPM_PORT=28443
   ```

### 문제 4: 프린터 목록이 비어있음

**증상**:
```
프린터 목록: []
```

**해결 방법**:

1. **JSPrintManager Service 확인**:
   - 서비스가 실행 중인지 확인
   - 시스템 트레이에서 JSPrintManager 아이콘 확인

2. **프린터 드라이버 확인**:
   - Windows에서 프린터가 설치되어 있는지 확인
   - 프린터 드라이버가 올바르게 설치되어 있는지 확인

3. **Fallback 확인**:
   - JSPrintManager가 실패하면 브라우저 API 사용
   - 브라우저 API는 제한적인 프린터 목록만 제공

## 배포 체크리스트

### 빌드 전

- [ ] `public/js/JSPrintManager.js` 파일 존재 확인
- [ ] `vite.config.js` 빌드 설정 확인
- [ ] 환경 변수 설정 (선택적)

### 빌드

- [ ] `npm run build` 실행
- [ ] `build/js/JSPrintManager.js` 파일 포함 확인
- [ ] 빌드 오류 없음 확인

### 배포

- [ ] `build/` 폴더를 웹 서버에 배포
- [ ] 정적 파일 서비스 설정 확인
- [ ] HTTPS 설정 확인

### 사용자 측

- [ ] JSPrintManager Client App 설치 안내
- [ ] 방화벽 설정 안내
- [ ] 서비스 실행 확인 안내

## 환경 변수 참고

### 개발 환경

```env
# .env.development
VITE_API_URL=http://localhost:4000/api
VITE_JSPM_SERVER_URL=ws://localhost:9595
VITE_JSPM_PORT=9595
```

### 프로덕션 환경

```env
# .env.production
VITE_API_URL=https://anniecong.o-r.kr/api
VITE_JSPM_SERVER_URL=wss://localhost:28443
VITE_JSPM_PORT=28443
```

**중요**: 프로덕션 환경에서도 `localhost`를 사용합니다. 사용자 PC의 JSPrintManager Client App에 연결하기 때문입니다.

## 추가 리소스

- [JSPRINTMANAGER_SETUP.md](./JSPRINTMANAGER_SETUP.md) - JSPrintManager 설정 가이드
- [JSPM_WEBSOCKET_GUIDE.md](./JSPM_WEBSOCKET_GUIDE.md) - WebSocket 연결 가이드
- [JSPM_SERVER_GUIDE.md](./JSPM_SERVER_GUIDE.md) - JSPM 서버 실행 가이드
- [PRINTER_WITHOUT_BACKEND.md](./PRINTER_WITHOUT_BACKEND.md) - 백엔드 없이 프린터 사용 가이드

## 요약

✅ **배포된 웹사이트(https://anniecong.o-r.kr)에서도 JSPrintManager가 작동합니다**

**작동 원리**:
1. 웹사이트는 HTTPS로 배포됨
2. 사용자 브라우저에서 웹사이트 접속
3. JSPrintManager 스크립트가 로드됨 (`/js/JSPrintManager.js`)
4. JSPrintManager가 사용자 PC의 localhost:28443(WSS)에 연결
5. JSPrintManager Client App이 실제 프린터를 제어

**필수 조건**:
- 사용자 PC에 JSPrintManager Client App 설치
- JSPrintManager Service 실행 중
- 방화벽에서 포트 28443 허용
- 빌드에 `public/js/JSPrintManager.js` 파일 포함
