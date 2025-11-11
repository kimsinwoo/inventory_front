# 환경 변수 설정 가이드

이 문서는 프로젝트의 환경 변수 설정 방법을 설명합니다.

## 환경 변수 파일 생성

1. 프로젝트 루트 디렉토리에 `.env` 파일을 생성하세요.
2. `.env.example` 파일을 참고하여 필요한 환경 변수를 설정하세요.

## 환경 변수 목록

### 필수 환경 변수

- `VITE_API_URL`: 백엔드 API 서버의 기본 URL
  - 개발 환경: `http://localhost:4000/api`
  - 프로덕션 환경: 배포된 백엔드 서버 URL (예: `https://api.yourdomain.com/api`)

### 선택 환경 변수

- `VITE_ENV`: 환경 모드 (`development` | `production`)
  - 기본값: `development`

- `VITE_JSPM_SERVER_URL`: JSPrintManager 서버 URL (WebSocket)
  - 기본값: `wss://localhost:28443` (WSS 포트)
  - 또는: `ws://localhost:9595` (WS 포트, 비보안)
  - JSPrintManager는 WebSocket을 사용하여 실시간 통신합니다
  - JSPrintManager를 사용하여 프린터 목록을 가져오는 경우에만 필요
  - 자세한 내용은 [JSPRINTMANAGER_SETUP.md](./JSPRINTMANAGER_SETUP.md) 참고

- `VITE_JSPM_PORT`: JSPrintManager WebSocket 포트 (선택적)
  - 기본값: `28443` (WSS), `9595` (WS)
  - 환경 변수에서 포트만 설정하려는 경우 사용

## 개발 환경 설정

### 1. .env 파일 생성

프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
# API Base URL
VITE_API_URL=http://localhost:4000/api

# 환경 모드
VITE_ENV=development

# JSPrintManager 서버 URL (WebSocket, 선택적)
# WSS (WebSocket Secure, 권장): wss://localhost:28443
# WS (WebSocket, 비보안): ws://localhost:9595
VITE_JSPM_SERVER_URL=wss://localhost:28443

# JSPrintManager WebSocket 포트 (선택적, 기본값: 28443 for WSS)
VITE_JSPM_PORT=28443
```

### 2. 개발 서버 재시작

환경 변수를 변경한 후에는 개발 서버를 재시작해야 합니다:

```bash
# 개발 서버 중지 (Ctrl + C)
# 개발 서버 재시작
npm run dev
```

## 프로덕션 환경 설정

### 1. 환경 변수 설정

프로덕션 환경에서는 배포된 백엔드 서버 URL로 설정해야 합니다:

```env
# API Base URL
VITE_API_URL=https://api.yourdomain.com/api

# 환경 모드
VITE_ENV=production
```

### 2. 빌드

환경 변수를 설정한 후 빌드를 실행하세요:

```bash
npm run build
```

### 3. 빌드 확인

빌드된 파일은 `build` 디렉토리에 생성됩니다. 환경 변수는 빌드 시점에 코드에 포함되므로, 환경 변수를 변경한 후에는 반드시 재빌드해야 합니다.

## 환경 변수 자동 감지

프로젝트는 다음과 같은 순서로 환경 변수를 자동으로 감지합니다:

1. **Vite 환경 변수** (`VITE_API_URL`) - 최우선
2. **React App 환경 변수** (`REACT_APP_API_URL`) - 하위 호환성
3. **프로덕션 자동 감지** - 프로덕션 환경에서 `window.location.origin` 기반으로 자동 설정
4. **개발 환경 기본값** - 개발 환경에서 환경 변수가 없을 경우 `http://localhost:4000/api` 사용

## 배포 시 주의사항

### 1. 환경 변수는 빌드 시점에 포함됨

Vite는 환경 변수를 빌드 시점에 코드에 포함시킵니다. 따라서:
- 환경 변수를 변경한 후에는 **반드시 재빌드**해야 합니다
- 빌드 후에는 환경 변수를 변경해도 반영되지 않습니다

### 2. 프로덕션 환경에서의 자동 감지

프로덕션 환경에서 환경 변수가 설정되지 않은 경우, 다음과 같이 동작합니다:
- 같은 도메인에서 실행되는 경우: `window.location.origin/api`로 자동 설정
- 예: `https://yourdomain.com`에서 실행 → `https://yourdomain.com/api`로 자동 설정

### 3. CORS 설정

백엔드 서버에서 CORS 설정이 올바르게 되어 있어야 합니다:
- `withCredentials: true`를 사용하므로, 백엔드에서 `credentials: true` 설정 필요
- 허용된 오리진에 프론트엔드 도메인 포함 필요

## 문제 해결

### 환경 변수가 적용되지 않는 경우

1. **.env 파일 위치 확인**: 프로젝트 루트 디렉토리에 있는지 확인하세요
2. **환경 변수 이름 확인**: `VITE_` 접두사가 있는지 확인하세요
3. **서버 재시작**: 개발 서버를 재시작했는지 확인하세요
4. **빌드 재실행**: 프로덕션 환경에서는 빌드를 다시 실행하세요

### 네트워크 오류가 발생하는 경우

1. **API Base URL 확인**: 브라우저 콘솔에서 API Base URL을 확인하세요
2. **백엔드 서버 실행 확인**: 백엔드 서버가 실행 중인지 확인하세요
3. **CORS 설정 확인**: 백엔드 서버의 CORS 설정을 확인하세요
4. **방화벽 확인**: 방화벽이나 네트워크 설정을 확인하세요

### 세션 인증이 작동하지 않는 경우

1. **withCredentials 설정 확인**: API 클라이언트에서 `withCredentials: true`가 설정되어 있는지 확인하세요
2. **백엔드 CORS 설정 확인**: 백엔드에서 `credentials: true`가 설정되어 있는지 확인하세요
3. **쿠키 설정 확인**: 브라우저 개발자 도구에서 쿠키가 설정되는지 확인하세요
4. **도메인 확인**: 프론트엔드와 백엔드가 같은 도메인에서 실행되는지 확인하세요 (다른 도메인인 경우 CORS 설정 필요)

## 예제

### 개발 환경

```env
VITE_API_URL=http://localhost:4000/api
VITE_ENV=development
```

### 프로덕션 환경 (별도 도메인)

```env
VITE_API_URL=https://api.yourdomain.com/api
VITE_ENV=production
```

### 프로덕션 환경 (같은 도메인)

프론트엔드와 백엔드가 같은 도메인에서 실행되는 경우, 환경 변수를 설정하지 않아도 자동으로 감지됩니다:

```env
# 환경 변수 없이도 자동으로 window.location.origin/api로 설정됨
VITE_ENV=production
```

## 추가 리소스

- [Vite 환경 변수 문서](https://vitejs.dev/guide/env-and-mode.html)
- [FRONTEND_API_GUIDE.md](./FRONTEND_API_GUIDE.md) - API 사용 가이드

