# 배포 가이드

이 문서는 프로젝트를 배포하는 방법을 설명합니다.

## 📋 배포 전 체크리스트

- [ ] 환경 변수 설정 완료
- [ ] 백엔드 서버 URL 확인
- [ ] CORS 설정 확인
- [ ] 빌드 테스트 완료
- [ ] 프로덕션 환경 변수 확인

## 🚀 배포 단계

### 1. 환경 변수 설정

프로덕션 환경에 맞게 `.env` 파일을 수정하세요:

```env
# 프로덕션 API URL
VITE_API_URL=https://api.yourdomain.com/api

# 환경 모드
VITE_ENV=production
```

**중요**: 환경 변수를 변경한 후에는 반드시 재빌드해야 합니다.

### 2. 빌드 실행

```bash
npm run build
```

빌드된 파일은 `build` 디렉토리에 생성됩니다.

### 3. 빌드 확인

빌드가 성공적으로 완료되었는지 확인하세요:

```bash
# 빌드 미리보기
npm run preview
```

브라우저에서 `http://localhost:4173`으로 접속하여 빌드된 애플리케이션을 확인할 수 있습니다.

### 4. 배포

빌드된 `build` 디렉토리의 내용을 웹 서버에 업로드하세요.

## 🌐 배포 환경별 가이드

### 정적 호스팅 (Static Hosting)

#### Netlify

1. Netlify에 프로젝트 연결
2. 빌드 설정:
   - Build command: `npm run build`
   - Publish directory: `build`
3. 환경 변수 설정:
   - Netlify 대시보드 → Site settings → Environment variables
   - `VITE_API_URL` 추가
4. 배포

#### Vercel

1. Vercel에 프로젝트 연결
2. 빌드 설정:
   - Framework preset: Vite
   - Build command: `npm run build`
   - Output directory: `build`
3. 환경 변수 설정:
   - Vercel 대시보드 → Project settings → Environment variables
   - `VITE_API_URL` 추가
4. 배포

#### GitHub Pages

1. `vite.config.js`에 base 설정 추가:

```javascript
export default defineConfig({
  base: '/your-repo-name/', // GitHub 저장소 이름
  // ... 기타 설정
})
```

2. 빌드 및 배포:

```bash
npm run build
# build 디렉토리를 gh-pages 브랜치에 푸시
```

### 서버 배포 (Server Deployment)

#### Nginx

1. 빌드 파일을 서버에 업로드:

```bash
# 빌드 실행
npm run build

# 서버에 업로드 (예: /var/www/html)
scp -r build/* user@server:/var/www/html
```

2. Nginx 설정:

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # API 프록시 (선택사항)
    location /api {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

3. Nginx 재시작:

```bash
sudo nginx -t
sudo systemctl restart nginx
```

#### Apache

1. 빌드 파일을 서버에 업로드
2. `.htaccess` 파일 생성:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

3. Apache 재시작

## 🔒 보안 설정

### HTTPS 설정

프로덕션 환경에서는 반드시 HTTPS를 사용해야 합니다:

1. SSL 인증서 설치 (Let's Encrypt 등)
2. HTTP → HTTPS 리다이렉트 설정
3. 보안 헤더 설정

### CORS 설정

백엔드 서버에서 CORS 설정이 올바르게 되어 있어야 합니다:

```javascript
// 백엔드 예시 (Express)
app.use(cors({
  origin: 'https://yourdomain.com',
  credentials: true
}));
```

## 🔍 배포 후 확인사항

### 1. API 연결 확인

브라우저 개발자 도구의 Network 탭에서 API 요청이 올바르게 전송되는지 확인하세요.

### 2. 인증 확인

로그인 기능이 정상적으로 작동하는지 확인하세요.

### 3. 환경 변수 확인

브라우저 콘솔에서 API Base URL이 올바르게 설정되어 있는지 확인하세요:

```javascript
// 개발 환경에서만 로그가 출력됩니다
console.log('🔗 API Base URL:', API_BASE_URL);
```

### 4. 에러 확인

브라우저 콘솔과 네트워크 탭에서 에러가 발생하지 않는지 확인하세요.

## 🐛 문제 해결

### 빌드 실패

1. **의존성 확인**: `npm install`로 의존성을 다시 설치하세요
2. **Node 버전 확인**: Node.js 버전이 호환되는지 확인하세요
3. **에러 메시지 확인**: 빌드 에러 메시지를 자세히 확인하세요

### API 연결 실패

1. **환경 변수 확인**: `VITE_API_URL`이 올바르게 설정되어 있는지 확인하세요
2. **CORS 설정 확인**: 백엔드 서버의 CORS 설정을 확인하세요
3. **네트워크 확인**: 백엔드 서버가 실행 중인지 확인하세요

### 세션 인증 실패

1. **쿠키 설정 확인**: 브라우저 개발자 도구에서 쿠키가 설정되는지 확인하세요
2. **도메인 확인**: 프론트엔드와 백엔드가 같은 도메인에서 실행되는지 확인하세요
3. **CORS 설정 확인**: 백엔드 서버의 CORS 설정에서 `credentials: true`가 설정되어 있는지 확인하세요

## 📊 모니터링

배포 후 다음 사항을 모니터링하세요:

- 에러 로그
- API 응답 시간
- 사용자 세션
- 페이지 로드 시간

## 🔄 업데이트 배포

애플리케이션을 업데이트할 때:

1. 코드 변경
2. 환경 변수 확인 (필요시 수정)
3. 빌드 실행: `npm run build`
4. 빌드 테스트: `npm run preview`
5. 배포

## 📝 추가 리소스

- [ENV_SETUP_GUIDE.md](./ENV_SETUP_GUIDE.md) - 환경 변수 설정 가이드
- [FRONTEND_API_GUIDE.md](./FRONTEND_API_GUIDE.md) - API 사용 가이드
- [Vite 배포 가이드](https://vitejs.dev/guide/static-deploy.html)

