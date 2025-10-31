# 개발 모드 가이드

## 🔧 로그인 페이지로 리다이렉트 문제 해결

입출고 관리 페이지 접근 시 로그인 페이지로 자동 리다이렉트되는 문제를 해결했습니다.

## ✅ 적용된 변경사항

### 1. **API 인터셉터 개선** (`src/services/api.js`)

#### 이전 동작
- 모든 401 에러 발생 시 즉시 로그인 페이지로 리다이렉트
- 백엔드 서버 미실행 시 페이지 접근 불가

#### 현재 동작
- **네트워크 에러**: 백엔드 서버 미실행 시 로컬 모드로 동작
- **401 에러**: 인증 관련 API(`/auth/`)만 로그인 페이지로 리다이렉트
- **기타 401 에러**: 로컬 데이터로 fallback

```javascript
// 네트워크 에러 처리
if (!error.response) {
  console.warn('[API] 백엔드 서버에 연결할 수 없습니다. 로컬 모드로 동작합니다.');
  // 로컬 모드로 계속 동작
}

// 401 에러 조건부 처리
if (error.response?.status === 401) {
  const isAuthAPI = error.config?.url?.includes('/auth/');
  
  if (isAuthAPI) {
    // 인증 API만 로그인 페이지로 리다이렉트 (1초 후)
    setTimeout(() => {
      window.location.href = '/login';
    }, 1000);
  } else {
    // 그 외 API는 로컬 데이터 사용
    console.warn('[API] 로컬 데이터로 동작합니다.');
  }
}
```

### 2. **개발 모드 배너** (`src/components/common/DevelopmentBanner.jsx`)

백엔드 서버 연결 실패 시 상단에 노란색 배너를 표시합니다:

```
┌────────────────────────────────────────────────┐
│ ⚠️ 개발 모드 (로컬 데이터 사용 중)              │
│ 백엔드 서버에 연결할 수 없습니다.         [X]  │
└────────────────────────────────────────────────┘
```

**특징**:
- 개발 환경(`DEV`)에서만 표시
- 3초 타임아웃으로 빠른 체크
- 닫기 버튼으로 숨길 수 있음
- 세션 동안 한 번만 표시

### 3. **페이지별 Fallback 로직**

각 페이지는 이미 다음과 같은 에러 처리를 구현하고 있습니다:

```javascript
// 예시: Receiving.jsx
try {
  const response = await transactionService.getAll({ type: 'RECEIVE' });
  setCompletedData(response.data || []);
} catch (error) {
  console.error('입고 데이터 조회 실패:', error);
  // 로컬 상태로 계속 동작
  setCompletedData([]);
}
```

## 🚀 사용 시나리오

### 시나리오 1: 백엔드 서버 미실행
```
1. 프론트엔드만 실행: npm run dev
2. 입출고 관리 페이지 접속
3. 상단에 개발 모드 배너 표시
4. 로컬 데이터로 정상 동작
5. API 호출 실패해도 페이지는 정상 표시
```

### 시나리오 2: 백엔드 서버 실행 중 (인증 없음)
```
1. 백엔드 서버 실행
2. 로그인하지 않고 입출고 관리 페이지 접속
3. 일반 API(입출고 조회 등)는 401 에러 → 로컬 모드
4. 인증 API(/auth/me 등)는 401 에러 → 1초 후 로그인 페이지
```

### 시나리오 3: 정상 로그인 상태
```
1. 로그인 완료
2. 모든 페이지 정상 접근
3. API 정상 동작
4. 개발 모드 배너 표시 안 됨
```

## 🔍 디버깅

### 콘솔 로그 확인

개발 모드에서는 다음과 같은 로그가 표시됩니다:

```javascript
// API 요청
[API Request] GET /inventories

// 성공
[API Response] /inventories { ok: true, data: [...] }

// 네트워크 에러
[API Error] Network Error
[API] 백엔드 서버에 연결할 수 없습니다. 로컬 모드로 동작합니다.

// 401 에러 (인증 API)
[API Error] 401 Unauthorized
[API] 인증이 필요합니다. 로그인 페이지로 이동합니다.

// 401 에러 (일반 API)
[API Error] 401 Unauthorized
[API] 인증이 필요한 API입니다. 로컬 데이터로 동작합니다.
```

### 브라우저 네트워크 탭

1. 개발자 도구 열기 (F12)
2. Network 탭 선택
3. API 요청 상태 확인:
   - **200**: 성공
   - **401**: 인증 필요 (조건부 리다이렉트)
   - **ERR_CONNECTION_REFUSED**: 서버 미실행 (로컬 모드)

## 📝 백엔드 개발자를 위한 안내

### 인증 필요 없는 API

다음 API는 인증 없이 접근 가능하도록 구현하면 좋습니다:

- `GET /api/health/ping` - 서버 상태 체크
- `GET /api/health` - 헬스체크
- `GET /api/items` - 품목 목록 (읽기 전용)
- `GET /api/inventories` - 재고 목록 (읽기 전용)

### 인증 필요한 API

다음 API는 반드시 인증이 필요합니다:

- `POST /api/auth/login` - 로그인
- `POST /api/auth/join` - 회원가입
- `GET /api/auth/me` - 현재 사용자 정보
- `POST /api/inventory-transactions/*` - 트랜잭션 생성
- `POST /api/items` - 품목 생성
- `PUT /api/items/:id` - 품목 수정
- `DELETE /api/items/:id` - 품목 삭제

## 🛠️ 환경 변수 설정

`.env` 파일에서 백엔드 URL을 설정할 수 있습니다:

```env
# 개발 환경
VITE_API_URL=http://localhost:4000/api

# 프로덕션 환경
VITE_API_URL=https://api.yourdomain.com/api
```

## ⚠️ 주의사항

1. **프로덕션 환경**: 개발 모드 배너는 프로덕션에서 자동으로 숨겨집니다
2. **세션 관리**: 로그인 후 세션 쿠키가 자동으로 관리됩니다
3. **로컬 데이터**: API 실패 시 빈 배열이나 기본값으로 동작합니다

## 📞 문제 해결

### 여전히 로그인 페이지로 리다이렉트되는 경우

1. **브라우저 캐시 삭제**
   ```
   Ctrl + Shift + Delete
   → 캐시된 이미지 및 파일 선택
   → 데이터 삭제
   ```

2. **로컬 스토리지 확인**
   ```javascript
   // 개발자 도구 콘솔에서 실행
   localStorage.getItem('user')
   ```

3. **세션 스토리지 초기화**
   ```javascript
   // 개발자 도구 콘솔에서 실행
   sessionStorage.clear()
   ```

4. **강제 새로고침**
   ```
   Ctrl + F5 (Windows)
   Cmd + Shift + R (Mac)
   ```

### 백엔드 서버 연결 확인

```bash
# 백엔드 서버 실행 확인
curl http://localhost:4000/api/health/ping

# 또는
curl http://localhost:4000/api/health
```

## 🎯 테스트 체크리스트

- [ ] 백엔드 서버 없이 프론트엔드 실행
- [ ] 입출고 관리 페이지 정상 접근
- [ ] 개발 모드 배너 표시 확인
- [ ] 페이지 기능 정상 동작 (로컬 데이터)
- [ ] 백엔드 서버 실행 후 API 연동 확인
- [ ] 로그인 후 전체 기능 테스트
- [ ] 개발 모드 배너 숨김 확인

모든 체크리스트 항목이 통과하면 정상입니다! ✅

