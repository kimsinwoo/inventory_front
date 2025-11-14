# AnnieCong Frontend

React + Vite 기반의 프론트엔드 애플리케이션입니다.

## 🚀 빠른 시작

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
VITE_API_URL=http://localhost:4000/api
VITE_ENV=development
```

자세한 환경 변수 설정 방법은 [ENV_SETUP_GUIDE.md](./ENV_SETUP_GUIDE.md)를 참고하세요.

### 3. 개발 서버 실행

```bash
npm run dev
```

개발 서버가 `http://localhost:3000`에서 실행됩니다.

## 📦 빌드

### 프로덕션 빌드

```bash
npm run build
```

빌드된 파일은 `build` 디렉토리에 생성됩니다.

### 빌드 미리보기

```bash
npm run preview
```

## 🔧 환경 변수

환경 변수는 `.env` 파일에서 관리됩니다. 자세한 내용은 [ENV_SETUP_GUIDE.md](./ENV_SETUP_GUIDE.md)를 참고하세요.

### 주요 환경 변수

- `VITE_API_URL`: 백엔드 API 서버의 기본 URL (필수)
- `VITE_ENV`: 환경 모드 (`development` | `production`)
- `VITE_JSPM_SERVER_URL`: JSPrintManager 서버 URL (WebSocket, 선택적, 기본값: `wss://localhost:28443`)
- `VITE_JSPM_PORT`: JSPrintManager WebSocket 포트 (선택적, 기본값: `28443` for WSS)

## 📚 문서

- [ENV_SETUP_GUIDE.md](./ENV_SETUP_GUIDE.md) - 환경 변수 설정 가이드
- [FRONTEND_API_GUIDE.md](./FRONTEND_API_GUIDE.md) - API 사용 가이드
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - 배포 환경 가이드 ⭐
- [JSPRINTMANAGER_SETUP.md](./JSPRINTMANAGER_SETUP.md) - JSPrintManager 설정 가이드
- [JSPM_WEBSOCKET_GUIDE.md](./JSPM_WEBSOCKET_GUIDE.md) - WebSocket 연결 가이드
- [JSPM_SERVER_GUIDE.md](./JSPM_SERVER_GUIDE.md) - JSPM 서버 실행 가이드
- [PRINTER_WITHOUT_BACKEND.md](./PRINTER_WITHOUT_BACKEND.md) - 백엔드 없이 프린터 사용 가이드

## 🔐 인증

이 프로젝트는 세션 기반 인증을 사용합니다. 쿠키를 통해 인증이 처리됩니다.

## 🖨️ 프린터 관리

프린터 목록은 다음 우선순위로 가져옵니다:

1. **JSPrintManager** (최우선) - 클라이언트 측 프린터 목록
2. **브라우저 API** - 브라우저가 지원하는 경우
3. **백엔드 API** - 서버를 통한 프린터 목록
4. **localStorage** - 저장된 프린터 목록

JSPrintManager를 사용하려면 클라이언트 컴퓨터에 JSPrintManager 클라이언트 소프트웨어가 설치되어 있어야 합니다. 자세한 내용은 [JSPRINTMANAGER_SETUP.md](./JSPRINTMANAGER_SETUP.md)를 참고하세요.

## 🌐 API 통신

- **Base URL**: 환경 변수 `VITE_API_URL`에서 설정
- **인증**: 세션 기반 (쿠키 사용)
- **CORS**: `withCredentials: true` 설정

## 🚢 배포

### 배포 전 확인사항

1. 환경 변수 설정 확인
2. 백엔드 서버 URL 확인
3. CORS 설정 확인
4. 빌드 실행

자세한 배포 가이드는 [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)를 참고하세요.

## 🛠️ 기술 스택

- **React**: UI 라이브러리
- **Vite**: 빌드 도구
- **Axios**: HTTP 클라이언트
- **Redux**: 상태 관리
- **React Router**: 라우팅
- **Tailwind CSS**: 스타일링

## 📝 스크립트

- `npm run dev`: 개발 서버 실행
- `npm run build`: 프로덕션 빌드
- `npm run preview`: 빌드 미리보기
- `npm test`: 테스트 실행

## ⚠️ 주의사항

1. 환경 변수를 변경한 후에는 개발 서버를 재시작하거나 빌드를 다시 실행해야 합니다.
2. 프로덕션 환경에서는 환경 변수를 설정한 후 반드시 재빌드해야 합니다.
3. 세션 기반 인증을 사용하므로 백엔드 서버의 CORS 설정이 올바르게 되어 있어야 합니다.
