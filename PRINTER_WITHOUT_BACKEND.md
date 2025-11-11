# 백엔드 없이 프린터 목록 불러오기

이 문서는 백엔드 서버 없이도 프린터 목록을 불러오는 방법을 설명합니다.

## ✅ 가능합니다!

**JSPrintManager가 작동하면 백엔드 서버 없이도 프린터 목록을 불러올 수 있습니다.**

## 작동 방식

프린터 목록 가져오기의 우선순위:

1. **JSPrintManager** (최우선) ⭐
   - 클라이언트 측에서 직접 프린터 목록을 가져옵니다
   - 백엔드 서버가 필요 없습니다
   - JSPM 서버(`http://localhost:9595`)만 실행되면 됩니다

2. **브라우저 API** (지원되는 경우)
   - 브라우저가 프린터 목록을 제공하는 경우
   - 백엔드 서버가 필요 없습니다

3. **백엔드 API** (Fallback)
   - JSPrintManager와 브라우저 API가 실패한 경우에만 사용
   - 백엔드 서버가 실행 중이어야 합니다

4. **localStorage** (Fallback)
   - 이전에 저장된 프린터 목록 사용
   - 백엔드 서버가 필요 없습니다

5. **빈 배열** (모두 실패 시)

## 백엔드 없이 사용하는 방법

### 1. JSPrintManager 설정

JSPrintManager 클라이언트 소프트웨어만 설치하고 실행하면 됩니다:

1. **JSPrintManager 클라이언트 소프트웨어 설치**
   - [JSPrintManager 공식 웹사이트](https://www.neodynamic.com/products/printing/js-print-manager/)에서 다운로드
   - 설치 및 실행

2. **JSPM 서버 실행**
   - Windows 서비스 관리자에서 "JSPrintManager Service" 시작
   - 또는 `net start JSPrintManager` 명령 실행
   - 자세한 내용: [JSPM_SERVER_GUIDE.md](./JSPM_SERVER_GUIDE.md)

3. **서버 확인**
   - 브라우저에서 `http://localhost:9595` 접속하여 서버 상태 확인

### 2. 코드 사용

현재 코드는 이미 백엔드 없이도 작동하도록 구현되어 있습니다:

```javascript
import { getPrinters } from './utils/printerUtils';

// 백엔드 API를 전달하지 않아도 됩니다 (선택사항)
const printers = await getPrinters();

// 또는 백엔드 API를 fallback으로 사용하려면:
const printers = await getPrinters(() => labelAPI.getPrinters());
```

**중요**: `getPrinters()` 함수에 API 호출 함수를 전달하지 않아도 됩니다. JSPrintManager가 우선적으로 사용되므로, 백엔드가 없어도 정상 작동합니다.

### 3. 컴포넌트에서 사용

대부분의 컴포넌트는 이미 `getPrinters` 함수를 사용하고 있어서 자동으로 JSPrintManager를 우선 사용합니다:

```javascript
// SavedLabelList.jsx, LabelPrintModal.jsx, Label.jsx 등
const printerList = await getPrinters(() => labelAPI.getPrinters());
```

이 경우:
- JSPrintManager가 작동하면: 백엔드 API를 호출하지 않음 ✅
- JSPrintManager가 실패하면: 백엔드 API를 시도 (백엔드가 없으면 에러는 무시되고 localStorage 사용)

## 백엔드 API 호출 비활성화

백엔드 서버가 없는 환경에서도 완전히 작동하도록 하려면:

### 방법 1: API 호출 함수를 전달하지 않기

```javascript
// API 호출 함수를 전달하지 않으면 백엔드 API를 시도하지 않음
const printers = await getPrinters();
```

### 방법 2: 컴포넌트 수정

컴포넌트에서 API 호출을 선택사항으로 만들기:

```javascript
// 기존 코드
const printerList = await getPrinters(() => labelAPI.getPrinters());

// 백엔드 없이 사용 (API 호출 함수 전달하지 않음)
const printerList = await getPrinters();
```

## 확인 방법

### 1. 브라우저 콘솔 확인

브라우저 개발자 도구의 콘솔에서 다음 메시지를 확인:

**JSPrintManager가 작동하는 경우:**
```
✅ JSPrintManager 초기화 완료
✅ JSPrintManager를 통해 프린터 목록 가져오기 성공: ["프린터1", "프린터2", ...]
```

**백엔드 API를 사용하는 경우:**
```
⚠️ JSPrintManager를 통한 프린터 목록 가져오기 실패
✅ API를 통한 프린터 목록 가져오기 성공
```

### 2. 네트워크 탭 확인

브라우저 개발자 도구의 Network 탭에서:
- JSPrintManager가 작동하면: `/barcode/printers` API 호출이 없음
- 백엔드 API를 사용하면: `/barcode/printers` API 호출이 있음

### 3. JSPM 서버 확인

브라우저에서 `http://localhost:9595` 접속:
- 서버 정보 페이지가 표시되면 정상 작동
- 연결할 수 없음이 표시되면 서버가 실행되지 않음

## 장점

### 백엔드 없이 사용하는 경우의 장점:

1. **독립적인 작동**
   - 백엔드 서버에 의존하지 않음
   - 오프라인 환경에서도 작동 가능

2. **빠른 응답**
   - 네트워크 요청 없이 클라이언트에서 직접 프린터 목록 가져오기
   - 응답 시간이 빠름

3. **로컬 프린터 접근**
   - 사용자의 로컬 프린터에 직접 접근
   - 서버를 통한 중개 없이 직접 제어

4. **보안**
   - 프린터 정보가 서버로 전송되지 않음
   - 클라이언트 측에서만 처리

## 제한사항

### 백엔드 없이 사용하는 경우의 제한사항:

1. **JSPrintManager 클라이언트 소프트웨어 필요**
   - 각 사용자의 컴퓨터에 설치되어 있어야 함
   - 라이선스가 필요할 수 있음

2. **JSPM 서버 실행 필요**
   - 로컬 서버(`http://localhost:9595`)가 실행 중이어야 함
   - 서버가 중지되면 작동하지 않음

3. **로컬 프린터만 접근 가능**
   - 네트워크 프린터는 제한적일 수 있음
   - 원격 프린터 접근이 어려울 수 있음

## 권장 사항

### 개발 환경:
- JSPrintManager 사용 권장 (빠르고 독립적)
- 백엔드 API를 fallback으로 유지 (유연성)

### 프로덕션 환경:
- JSPrintManager 우선 사용
- 백엔드 API를 fallback으로 제공
- 두 방법 모두 지원하여 호환성 극대화

## 문제 해결

### JSPrintManager가 작동하지 않는 경우:

1. **JSPM 서버 확인**
   - 서버가 실행 중인지 확인: `http://localhost:9595`
   - 자세한 내용: [JSPM_SERVER_GUIDE.md](./JSPM_SERVER_GUIDE.md)

2. **클라이언트 소프트웨어 확인**
   - JSPrintManager 클라이언트 소프트웨어가 설치되어 있는지 확인
   - 시스템 트레이에 아이콘이 표시되는지 확인

3. **Fallback 사용**
   - JSPrintManager가 실패하면 자동으로 백엔드 API 또는 localStorage 사용
   - 백엔드가 없으면 localStorage에 저장된 프린터 목록 사용

## 추가 리소스

- [JSPRINTMANAGER_SETUP.md](./JSPRINTMANAGER_SETUP.md) - JSPrintManager 설정 가이드
- [JSPM_SERVER_GUIDE.md](./JSPM_SERVER_GUIDE.md) - JSPM 서버 실행 가이드
- [ENV_SETUP_GUIDE.md](./ENV_SETUP_GUIDE.md) - 환경 변수 설정 가이드

## 요약

✅ **백엔드 서버 없이도 프린터 목록을 불러올 수 있습니다!**

- JSPrintManager가 작동하면 백엔드 없이도 정상 작동
- 백엔드 API는 fallback으로만 사용됨
- 현재 코드는 이미 백엔드 없이도 작동하도록 구현되어 있음
- JSPrintManager 클라이언트 소프트웨어와 JSPM 서버만 있으면 됨

