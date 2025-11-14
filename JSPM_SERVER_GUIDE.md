# JSPM 서버 실행 가이드

이 문서는 JSPrintManager(JSPM) 서버를 실행하는 방법을 상세히 설명합니다.

## 📋 목차

1. [JSPM 서버란?](#jspm-서버란)
2. [Windows에서 서버 실행](#windows에서-서버-실행)
3. [서버 실행 확인](#서버-실행-확인)
4. [문제 해결](#문제-해결)
5. [서비스 관리](#서비스-관리)

## JSPM 서버란?

JSPM 서버는 JSPrintManager 클라이언트 소프트웨어가 제공하는 로컬 웹 서버입니다. 이 서버는 웹 애플리케이션과 클라이언트 측 프린터 간의 통신을 중개합니다.

- **기본 포트**: 9595
- **기본 URL**: `http://localhost:9595`
- **실행 방식**: Windows 서비스 또는 독립 실행형 애플리케이션

## Windows에서 서버 실행

### 방법 1: 자동 실행 (권장)

JSPrintManager를 설치하면 Windows 서비스로 자동 등록되어 컴퓨터 시작 시 자동으로 실행됩니다.

1. **설치 확인**
   - JSPrintManager 클라이언트 소프트웨어가 설치되어 있는지 확인
   - 설치 경로: `C:\Program Files\Neodynamic\JSPrintManager\`

2. **서비스 확인**
   - `Win + R` 키를 누르고 `services.msc` 입력
   - "JSPrintManager Service" 또는 "JSPM Service" 찾기
   - 상태가 "실행 중"인지 확인

3. **자동 시작 설정**
   - 서비스 속성에서 "시작 유형"을 "자동"으로 설정
   - 컴퓨터를 시작할 때마다 자동으로 서버가 실행됩니다

### 방법 2: 수동 실행

1. **시작 메뉴에서 실행**
   - 시작 메뉴에서 "JSPrintManager" 검색
   - "JSPrintManager Service" 또는 "JSPrintManager Client" 실행

2. **실행 파일 직접 실행**
   - 설치 경로로 이동: `C:\Program Files\Neodynamic\JSPrintManager\`
   - `JSPrintManager.exe` 또는 `JSPM.exe` 실행
   - 관리자 권한으로 실행 권장

3. **명령 프롬프트에서 실행**
   ```bash
   cd "C:\Program Files\Neodynamic\JSPrintManager"
   JSPrintManager.exe
   ```

### 방법 3: 서비스로 실행

1. **서비스 관리자에서 시작**
   - `Win + R` → `services.msc` 입력
   - "JSPrintManager Service" 찾기
   - 서비스 우클릭 → "시작" 선택

2. **명령 프롬프트에서 시작** (관리자 권한 필요)
   ```bash
   net start JSPrintManager
   ```
   또는
   ```bash
   sc start JSPrintManager
   ```

## 서버 실행 확인

### 1. 시스템 트레이 확인

- 시스템 트레이(시계 옆)에 JSPrintManager 아이콘이 표시되는지 확인
- 아이콘을 클릭하여 서버 상태 확인
- 서버가 실행 중이면 "Running" 또는 "Connected" 상태 표시

### 2. 브라우저에서 확인

브라우저에서 다음 URL로 접속:

```
http://localhost:9595
```

**정상 작동 시:**
- 서버 정보 페이지가 표시됩니다
- 서버 버전, 상태 등의 정보가 표시됩니다

**연결 실패 시:**
- "연결할 수 없음" 또는 "페이지를 찾을 수 없음" 메시지 표시
- 서버가 실행되지 않았거나 포트가 차단되었을 수 있습니다

### 3. 포트 확인 (명령 프롬프트)

```bash
netstat -an | findstr 9595
```

**정상 작동 시:**
```
TCP    0.0.0.0:9595           0.0.0.0:0              LISTENING
```

**서버가 실행되지 않은 경우:**
- 출력이 없거나 다른 상태 표시

### 4. 방화벽 확인

Windows 방화벽에서 포트 9595가 허용되어 있는지 확인:

1. **Windows 방화벽 설정**
   - 제어판 → 시스템 및 보안 → Windows Defender 방화벽
   - "고급 설정" 클릭
   - "인바운드 규칙" 확인

2. **포트 허용 추가** (필요한 경우)
   - "새 규칙" 클릭
   - "포트" 선택
   - 포트 번호: 9595
   - "연결 허용" 선택
   - 규칙 이름: "JSPrintManager Server"

### 5. PowerShell에서 확인

```powershell
Test-NetConnection -ComputerName localhost -Port 9595
```

**정상 작동 시:**
```
TcpTestSucceeded : True
```

## 문제 해결

### 서버가 시작되지 않는 경우

1. **관리자 권한 확인**
   - JSPrintManager를 관리자 권한으로 실행
   - Windows 서비스도 관리자 권한이 필요할 수 있습니다

2. **포트 충돌 확인**
   - 다른 프로그램이 포트 9595를 사용 중인지 확인
   - 포트를 사용하는 프로그램 확인:
     ```bash
     netstat -ano | findstr 9595
     ```
   - 포트가 사용 중이면:
     - 해당 프로그램 종료
     - 또는 JSPM 서버 포트 변경

3. **서비스 재시작**
   ```bash
   net stop JSPrintManager
   net start JSPrintManager
   ```

4. **로그 확인**
   - 설치 경로의 로그 파일 확인
   - 일반 경로: `C:\Program Files\Neodynamic\JSPrintManager\logs\`
   - 또는: `C:\ProgramData\Neodynamic\JSPrintManager\logs\`

### 서버가 자동으로 시작되지 않는 경우

1. **서비스 시작 유형 확인**
   - Windows 서비스 관리자에서 서비스 속성 확인
   - "시작 유형"을 "자동"으로 설정

2. **서비스 등록 확인**
   - 서비스가 제대로 등록되어 있는지 확인
   - 서비스가 없으면 재설치 필요

### 연결이 안 되는 경우

1. **방화벽 확인**
   - Windows 방화벽에서 포트 9595 허용
   - 바이러스 백신 소프트웨어에서도 허용 필요할 수 있음

2. **서버 URL 확인**
   - `.env` 파일에서 서버 URL 확인
   - 기본값: `http://localhost:9595`
   - 다른 포트를 사용하는 경우 올바른 포트 번호 확인

3. **브라우저 콘솔 확인**
   - 브라우저 개발자 도구의 콘솔에서 에러 메시지 확인
   - 네트워크 탭에서 연결 시도 확인

## 서비스 관리

### 서비스 시작

```bash
net start JSPrintManager
```

또는 PowerShell에서:
```powershell
Start-Service JSPrintManager
```

### 서비스 중지

```bash
net stop JSPrintManager
```

또는 PowerShell에서:
```powershell
Stop-Service JSPrintManager
```

### 서비스 재시작

```bash
net stop JSPrintManager
net start JSPrintManager
```

또는 PowerShell에서:
```powershell
Restart-Service JSPrintManager
```

### 서비스 상태 확인

```bash
sc query JSPrintManager
```

또는 PowerShell에서:
```powershell
Get-Service JSPrintManager
```

### 서비스 시작 유형 변경

```bash
sc config JSPrintManager start= auto
```

시작 유형:
- `auto`: 자동 시작
- `demand`: 수동 시작
- `disabled`: 비활성화

## 환경 변수 설정

프로젝트의 `.env` 파일에서 JSPM 서버 URL을 설정할 수 있습니다:

```env
# JSPrintManager 서버 URL
VITE_JSPM_SERVER_URL=http://localhost:9595
```

다른 포트를 사용하는 경우:
```env
VITE_JSPM_SERVER_URL=http://localhost:9596
```

## 추가 리소스

- [JSPrintManager 공식 문서](https://www.neodynamic.com/products/printing/js-print-manager/)
- [JSPRINTMANAGER_SETUP.md](./JSPRINTMANAGER_SETUP.md) - JSPrintManager 설정 가이드
- [ENV_SETUP_GUIDE.md](./ENV_SETUP_GUIDE.md) - 환경 변수 설정 가이드

## 참고사항

1. **포트 변경**: 서버 포트를 변경하려면 JSPrintManager 설정에서 변경해야 합니다. 기본 포트는 9595입니다.

2. **보안**: JSPM 서버는 로컬 호스트(localhost)에서만 접근 가능하도록 설정하는 것을 권장합니다.

3. **라이선스**: JSPrintManager는 상업용 라이선스가 필요할 수 있습니다. 무료 평가판도 제공됩니다.

4. **다중 사용자**: 각 사용자의 컴퓨터에 JSPrintManager 클라이언트 소프트웨어가 설치되어 있어야 합니다.

