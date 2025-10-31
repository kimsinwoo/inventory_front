# 배송 관리 API 연동 가이드

## 📦 개요

배송 관리 시스템은 B2B와 B2C 출고를 관리하며, 각 플랫폼(쿠팡, 네이버 스마트스토어, 자사몰)의 주문을 통합하여 CJ대한통운 업로드 파일을 생성합니다.

## 🔌 백엔드 API 엔드포인트

### 1. B2C 출고 (CJ 파일 생성)

#### POST /api/shipment/cj/generate
다중 플랫폼 주문 파일을 업로드하여 CJ대한통운 양식으로 통합합니다.

**Request (multipart/form-data)**:
```
- self: File (자사몰 주문 엑셀, 선택)
- coupang: File (쿠팡 주문 엑셀, 선택)
- smartstore: File (스마트스토어 주문 엑셀, 선택)
- cutoff_self: "[자사몰 15:00마감]"
- cutoff_coupang: "[쿠팡 16:00마감]"
- cutoff_smart: "[스마트스토어 17:00마감]"
```

**Response (Blob - 엑셀 파일)**:
```
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename="CJ_업로드_통합.xlsx"
```

**또는 Response (JSON)**:
```json
{
  "ok": true,
  "downloadUrl": "/downloads/cj_upload_20250129.xlsx",
  "errorReportUrl": "/downloads/errors_20250129.xlsx",
  "summary": {
    "orders_parsed": 150,
    "orders_aggregated": 120,
    "inputs_found": {
      "SELF": true,
      "COUPANG": true,
      "SMARTSTORE": false
    }
  }
}
```

---

### 2. B2B 출고 관리

#### POST /api/outbound/b2b
B2B 출고 주문을 생성합니다.

**Request Body**:
```json
{
  "customerName": "ABC유통",
  "receiverName": "홍길동",
  "receiverPhone": "010-1234-5678",
  "zipcode": "12345",
  "address1": "서울시 강남구 테헤란로 123",
  "address2": "ABC빌딩 5층",
  "requestNote": "부재 시 경비실",
  "items": [
    {
      "itemName": "비건펫피자",
      "quantity": 10
    },
    {
      "itemName": "치킨파우더",
      "quantity": 5
    }
  ]
}
```

**Response**:
```json
{
  "ok": true,
  "message": "B2B 주문이 등록되었습니다",
  "data": {
    "id": 123,
    "customerName": "ABC유통",
    "status": "pending",
    "createdAt": "2025-01-29T10:00:00Z"
  }
}
```

---

#### GET /api/outbound/b2b
B2B 출고 리스트를 조회합니다.

**Query Parameters**:
- `page` (number, default: 1): 페이지 번호
- `limit` (number, default: 20): 페이지당 항목 수
- `status` (string, optional): `pending`, `completed`, `cancelled`
- `startDate` (string, optional): 시작 날짜 (ISO 8601)
- `endDate` (string, optional): 종료 날짜 (ISO 8601)

**Response**:
```json
{
  "ok": true,
  "data": [
    {
      "id": 123,
      "customerName": "ABC유통",
      "receiverName": "홍길동",
      "receiverPhone": "010-1234-5678",
      "address1": "서울시 강남구 테헤란로 123",
      "address2": "ABC빌딩 5층",
      "zipcode": "12345",
      "requestNote": "부재 시 경비실",
      "items": [
        {
          "itemName": "비건펫피자",
          "quantity": 10
        }
      ],
      "status": "pending",
      "createdAt": "2025-01-29T10:00:00Z",
      "updatedAt": "2025-01-29T10:00:00Z"
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 20,
  "totalPages": 5
}
```

---

#### GET /api/outbound/b2b/:id
B2B 출고 상세 정보를 조회합니다.

**Response**:
```json
{
  "ok": true,
  "data": {
    "id": 123,
    "customerName": "ABC유통",
    "receiverName": "홍길동",
    "receiverPhone": "010-1234-5678",
    "address1": "서울시 강남구 테헤란로 123",
    "address2": "ABC빌딩 5층",
    "zipcode": "12345",
    "requestNote": "부재 시 경비실",
    "items": [
      {
        "itemName": "비건펫피자",
        "quantity": 10
      }
    ],
    "status": "pending",
    "createdAt": "2025-01-29T10:00:00Z",
    "updatedAt": "2025-01-29T10:00:00Z"
  }
}
```

---

#### GET /api/outbound/b2b/export/excel
B2B 출고 리스트를 엑셀로 내보냅니다.

**Query Parameters** (선택):
- `startDate` (string, optional): 시작 날짜
- `endDate` (string, optional): 종료 날짜
- `status` (string, optional): 상태 필터

**Response (Blob - 엑셀 파일)**:
```
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename="B2B_출고리스트_20250129.xlsx"
```

---

### 3. B2C 출고 관리

#### GET /api/outbound/b2c
B2C 출고 리스트를 조회합니다.

**Query Parameters**:
- `page` (number, default: 1): 페이지 번호
- `limit` (number, default: 20): 페이지당 항목 수
- `platform` (string, optional): `SELF`, `COUPANG`, `SMARTSTORE`
- `status` (string, optional): `pending`, `completed`, `cancelled`

**Response**:
```json
{
  "ok": true,
  "data": [
    {
      "id": 456,
      "orderNumber": "20250129-001",
      "receiverName": "김철수",
      "receiverPhone": "010-9876-5432",
      "address": "서울시 강남구 테헤란로 456",
      "itemName": "닭고기 사료",
      "quantity": 2,
      "platform": "COUPANG",
      "trackingNumber": "123456789012",
      "status": "completed",
      "createdAt": "2025-01-29T10:00:00Z"
    }
  ],
  "total": 200,
  "page": 1,
  "limit": 20,
  "totalPages": 10
}
```

---

#### GET /api/outbound/b2c/export/excel
B2C 출고 리스트를 엑셀로 내보냅니다.

**Query Parameters** (선택):
- `startDate` (string, optional): 시작 날짜
- `endDate` (string, optional): 종료 날짜
- `platform` (string, optional): 플랫폼 필터

**Response (Blob - 엑셀 파일)**:
```
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename="B2C_출고리스트_20250129.xlsx"
```

---

### 4. 공통 출고 관리

#### POST /api/outbound/confirm/:id
출고를 확정합니다.

**Response**:
```json
{
  "ok": true,
  "message": "출고가 확정되었습니다",
  "data": {
    "id": 123,
    "status": "completed"
  }
}
```

---

#### DELETE /api/outbound/:id
출고를 취소합니다.

**Response**:
```json
{
  "ok": true,
  "message": "출고가 취소되었습니다"
}
```

---

#### PUT /api/outbound/:id/tracking
송장번호를 등록합니다.

**Request Body**:
```json
{
  "trackingNumber": "123456789012",
  "shippingCompany": "CJ대한통운"
}
```

**Response**:
```json
{
  "ok": true,
  "message": "송장번호가 등록되었습니다",
  "data": {
    "id": 123,
    "trackingNumber": "123456789012",
    "shippingCompany": "CJ대한통운"
  }
}
```

---

## 🎯 프론트엔드 구현

### 파일 구조
```
src/
├── services/
│   ├── shippingService.js   ✅ 생성됨
│   └── index.js              ✅ 업데이트됨
└── pages/
    └── Shipping.jsx          ✅ 업데이트됨
```

### 주요 기능

#### 1. B2C 출고 (CJ 파일 생성)
```javascript
// 엑셀 파일 업로드 및 CJ 파일 생성
const form = new FormData();
form.append('self', selfFile);
form.append('coupang', coupangFile);
form.append('smartstore', smartFile);

const response = await shippingService.generateCJUpload(form);

// Blob 응답 (엑셀 파일 직접 다운로드)
downloadBlob(response.data, 'CJ_업로드_통합.xlsx');
```

#### 2. B2B 출고 등록
```javascript
// B2B 주문 생성
await shippingService.createB2BOrder({
  customerName: 'ABC유통',
  receiverName: '홍길동',
  receiverPhone: '010-1234-5678',
  zipcode: '12345',
  address1: '서울시 강남구',
  items: [
    { itemName: '비건펫피자', quantity: 10 }
  ]
});

// 출고 리스트 새로고침
fetchB2BOrders();
```

#### 3. 출고 리스트 조회
```javascript
// B2B 출고 리스트
const response = await shippingService.getB2BOrders();
setB2bOrders(response.data || []);

// B2C 출고 리스트
const response = await shippingService.getB2COrders();
setOutboundList(response.data || []);
```

#### 4. 엑셀 다운로드
```javascript
// B2B 출고 리스트 엑셀 다운로드
const response = await shippingService.exportB2BToExcel();
downloadBlob(response.data, `B2B_출고리스트_${new Date().toISOString().split('T')[0]}.xlsx`);

// B2C 출고 리스트 엑셀 다운로드
const response = await shippingService.exportB2CToExcel();
downloadBlob(response.data, `B2C_출고리스트_${new Date().toISOString().split('T')[0]}.xlsx`);
```

---

## 📊 데이터 플로우

### B2C 출고 프로세스
```
1. 사용자가 각 플랫폼에서 주문 엑셀 파일을 다운로드
   ↓
2. 배송 관리 페이지 (B2C 출고 탭)에서 파일 업로드
   ↓
3. 백엔드가 각 플랫폼의 엑셀 파일을 파싱
   ↓
4. CJ대한통운 양식에 맞춰 데이터 병합 및 변환
   ↓
5. 통합된 CJ 엑셀 파일 생성 및 다운로드
   ↓
6. B2C 출고 리스트에 자동 추가
   ↓
7. CJ 파일을 CJ대한통운 시스템에 업로드 (외부 시스템)
   ↓
8. 송장번호 발급 후 시스템에 등록
```

### B2B 출고 프로세스
```
1. 배송 관리 페이지 (B2B 출고 탭)에서 직접 입력
   ↓
2. 거래처 정보 및 품목 입력
   ↓
3. 저장 버튼 클릭
   ↓
4. 백엔드 데이터베이스에 저장
   ↓
5. B2B 출고 리스트에 추가
   ↓
6. 엑셀 다운로드 버튼으로 송장 발부용 파일 생성
   ↓
7. 택배사에 직접 송장 발급 (외부 시스템)
```

---

## 🔒 인증 및 권한

모든 배송 관리 API는 인증이 필요합니다:
- 로그인 후 세션 쿠키 자동 포함 (`credentials: 'include'`)
- 401 에러 시 로컬 모드로 fallback (개발 환경)

---

## 🛠️ 백엔드 구현 체크리스트

### CJ 파일 생성 API
- [ ] 각 플랫폼 엑셀 파일 파싱 (자사몰, 쿠팡, 스마트스토어)
- [ ] 데이터 정규화 (주소, 전화번호 형식)
- [ ] 중복 주문 제거
- [ ] CJ대한통운 양식에 맞춰 엑셀 생성
- [ ] 마감 태그 추가
- [ ] 에러 리포트 생성 (선택)

### B2B 출고 API
- [ ] B2B 주문 생성 (POST /api/outbound/b2b)
- [ ] B2B 출고 리스트 조회 (GET /api/outbound/b2b)
- [ ] B2B 출고 상세 조회 (GET /api/outbound/b2b/:id)
- [ ] B2B 출고 리스트 엑셀 내보내기 (GET /api/outbound/b2b/export/excel)

### B2C 출고 API
- [ ] B2C 출고 리스트 조회 (GET /api/outbound/b2c)
- [ ] B2C 출고 리스트 엑셀 내보내기 (GET /api/outbound/b2c/export/excel)

### 공통 API
- [ ] 출고 확정 (POST /api/outbound/confirm/:id)
- [ ] 출고 취소 (DELETE /api/outbound/:id)
- [ ] 송장번호 등록 (PUT /api/outbound/:id/tracking)

---

## 📝 예상 데이터 구조

### B2B 출고 테이블
```sql
CREATE TABLE b2b_outbound (
  id SERIAL PRIMARY KEY,
  customer_name VARCHAR(100) NOT NULL,
  receiver_name VARCHAR(100) NOT NULL,
  receiver_phone VARCHAR(20) NOT NULL,
  zipcode VARCHAR(10) NOT NULL,
  address1 VARCHAR(200) NOT NULL,
  address2 VARCHAR(200),
  request_note TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE b2b_outbound_items (
  id SERIAL PRIMARY KEY,
  outbound_id INTEGER REFERENCES b2b_outbound(id),
  item_name VARCHAR(200) NOT NULL,
  quantity INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### B2C 출고 테이블
```sql
CREATE TABLE b2c_outbound (
  id SERIAL PRIMARY KEY,
  order_number VARCHAR(100) NOT NULL,
  receiver_name VARCHAR(100) NOT NULL,
  receiver_phone VARCHAR(20) NOT NULL,
  address VARCHAR(300) NOT NULL,
  item_name VARCHAR(200) NOT NULL,
  quantity INTEGER NOT NULL,
  platform VARCHAR(20) NOT NULL, -- SELF, COUPANG, SMARTSTORE
  tracking_number VARCHAR(50),
  shipping_company VARCHAR(50),
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🚀 테스트 방법

### 1. B2C 출고 테스트
```bash
# 테스트 엑셀 파일 준비
# - 자사몰.xlsx
# - 쿠팡.xlsx
# - 스마트스토어.xlsx

# 프론트엔드에서 업로드
http://localhost:5173/shipping/nav2

# 결과 확인
# - CJ 엑셀 파일 다운로드
# - B2C 출고 리스트 표시
# - 엑셀 다운로드 버튼 동작
```

### 2. B2B 출고 테스트
```bash
# 프론트엔드에서 직접 입력
http://localhost:5173/shipping/nav1

# 테스트 데이터 입력
# - 거래처명: ABC유통
# - 받는분: 홍길동
# - 연락처: 010-1234-5678
# - 주소: 서울시 강남구 테헤란로 123
# - 품목: 비건펫피자 x 10

# 저장 후 결과 확인
# - B2B 출고 리스트 표시
# - 엑셀 다운로드 버튼 동작
```

---

## 📞 문의 및 지원

문제 발생 시:
1. 브라우저 콘솔 로그 확인
2. 네트워크 탭에서 API 요청/응답 확인
3. 백엔드 서버 로그 확인
4. `DEVELOPMENT_MODE_GUIDE.md` 참고

## 🎓 관련 문서

- `SHIPPING_SETUP_GUIDE.md` - 초기 설정 가이드
- `DEVELOPMENT_MODE_GUIDE.md` - 개발 모드 가이드
- `public/templates/README.md` - CJ 양식 가이드

