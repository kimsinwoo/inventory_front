# 배송 관리 페이지 설정 가이드

## 📦 설치 완료

배송 관리 페이지 (`src/pages/Shipping.jsx`)가 성공적으로 생성되었습니다!

## 🔧 필수 패키지 설치

이 페이지는 `react-hook-form` 패키지를 사용합니다. 다음 명령어로 설치하세요:

```bash
npm install react-hook-form
```

## 📋 CJ대한통운 업로드 양식

프로젝트에 CJ대한통운 업로드 양식 파일이 포함되어 있습니다:
- **위치**: `public/templates/CJ대한통운_업로드_양식.xlsx`
- **용도**: 백엔드가 생성해야 하는 엑셀 파일의 참고 양식
- **다운로드**: 배송 관리 페이지 (B2C 출고 탭)에서 다운로드 가능

백엔드 개발자는 이 양식을 참고하여 `/api/shipment/cj/generate` 엔드포인트에서 동일한 형식의 엑셀 파일을 생성해야 합니다.

## 🎯 기능 소개

### 1. B2B 출고
- **직접 입력 폼**: 거래처 정보와 품목을 직접 입력하여 출고 주문 생성
- **다중 품목 지원**: 동적으로 품목 행 추가/제거 가능
- **유효성 검사**: 필수 필드 자동 검증

**필수 입력 항목**:
- 거래처명
- 받는분 성명
- 연락처
- 우편번호
- 주소
- 품목 (최소 1개)

### 2. B2C 출고
- **엑셀 업로드**: 자사몰, 쿠팡, 스마트스토어 주문서를 엑셀로 업로드
- **자동 병합**: 여러 채널의 주문을 하나의 CJ 택배 업로드 파일로 통합
- **마감 태그**: 채널별 마감 시간 자동 표시
- **결과 다운로드**: 병합된 CJ 엑셀 파일 및 오류 리포트 다운로드

## 🔌 API 엔드포인트

### B2B 주문 저장
```
POST /api/outbound/b2b
Content-Type: application/json

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
    }
  ]
}
```

### B2C CJ 파일 생성
```
POST /api/shipment/cj/generate
Content-Type: multipart/form-data

- self: File (자사몰 엑셀)
- coupang: File (쿠팡 엑셀)
- smartstore: File (스마트스토어 엑셀)
- cutoff_self: "[자사몰 15:00마감]"
- cutoff_coupang: "[쿠팡 16:00마감]"
- cutoff_smart: "[스마트스토어 17:00마감]"
```

**응답 (JSON)**:
```json
{
  "ok": true,
  "downloadUrl": "http://localhost:4000/downloads/cj_upload.xlsx",
  "errorReportUrl": "http://localhost:4000/downloads/errors.xlsx",
  "message": "처리 완료",
  "summary": {
    "orders_parsed": 150,
    "orders_aggregated": 120
  }
}
```

**응답 (바이너리 엑셀 직접 다운로드)**:
```
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename="CJ_업로드_통합.xlsx"
```

## 📍 라우트

`App.jsx`에 이미 설정되어 있습니다:

- `/shipping/nav1` - 배송 관리 (B2B 출고)
- `/shipping/nav2` - 배송 관리 (B2C 출고)
- `/shipping/nav3` - (추가 기능 구현 가능)

## 🎨 UI/UX 특징

- **Tailwind CSS**: 기존 프로젝트 스타일과 일관성 유지
- **Lucide React 아이콘**: Package, Upload, FileText, Plus, Trash2 사용
- **반응형 디자인**: 모바일/태블릿/데스크톱 지원
- **실시간 유효성 검사**: onChange 모드로 즉각적인 피드백
- **로딩 상태**: 버튼 비활성화 및 로딩 텍스트 표시

## 🔄 통합 포인트

### 입출고 관리와 연동
B2C 출고 결과 화면에서 "출고 관리 페이지로 이동" 링크를 통해 `/receiving?tab=nav2` (출고 관리) 페이지로 이동할 수 있습니다.

### 백엔드 요구사항
백엔드 서버는 다음 엔드포인트를 구현해야 합니다:
1. `POST /api/outbound/b2b` - B2B 주문 저장
2. `POST /api/shipment/cj/generate` - B2C CJ 파일 생성

## 📝 사용 예시

### B2B 출고 입력
1. "B2B 출고" 탭 클릭
2. 거래처 정보 입력
3. 품목 정보 입력 (행 추가 버튼으로 여러 품목 추가 가능)
4. "저장" 버튼 클릭

### B2C 출고 처리
1. "B2C 출고" 탭 클릭
2. 각 채널의 엑셀 파일 업로드 (선택 사항)
3. "CJ 업로드 파일 만들기" 버튼 클릭
4. 결과 확인 및 엑셀 다운로드

## ⚠️ 주의사항

1. **파일 형식**: B2C 출고는 `.xlsx` 또는 `.xls` 파일만 업로드 가능
2. **필수 채널**: 최소 1개 이상의 채널 파일을 업로드해야 CJ 파일 생성 가능
3. **API 연결**: 백엔드 API가 구현되어 있어야 정상 작동

## 🚀 테스트 방법

1. 패키지 설치 후 개발 서버 실행:
```bash
npm install react-hook-form
npm run dev
```

2. 브라우저에서 접속:
```
http://localhost:5173/shipping/nav1
```

3. B2B/B2C 탭을 전환하며 기능 테스트

## 📞 문의

페이지 사용 중 문제가 발생하면:
1. 브라우저 콘솔 확인
2. 네트워크 탭에서 API 요청/응답 확인
3. 백엔드 서버 로그 확인

