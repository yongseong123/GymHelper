# 🏋️‍♂️ GymHelper

**GymHelper**는 운동 기록을 저장하고(운동명/중량/횟수/부위/타겟/타입),  
**월간 통계(Chart.js)** + **캘린더(FullCalendar)**로 루틴 변화를 한눈에 확인할 수 있는  
**Node.js(Express) + EJS(SSR)** 기반 웹 애플리케이션입니다.

커뮤니티(게시글/댓글 CRUD)와 계정 설정(닉네임/비밀번호 변경, 탈퇴)도 함께 제공합니다.

---

## ✨ 주요 기능

### ✅ 인증/계정
- Passport(LocalStrategy) + Session 기반 로그인
- 회원가입 / 로그인 / 로그아웃
- 계정 설정: 닉네임 변경, 비밀번호 변경, 회원 탈퇴

### ✅ 운동 기록(Workout Dashboard)
- 운동 기록 추가/수정/삭제
- 날짜별 운동 기록 조회(“내 운동 모아보기”)
- 전체 기록 기반 캘린더 표시(운동한 날짜 확인)
- 월간 운동 통계(부위별 횟수)
- 부위별 타겟 통계(가슴/등/어깨/하체 타겟 빈도)

### ✅ 커뮤니티(Community)
- 게시글 목록(SSR 렌더링)
- 게시글 작성/수정/삭제
- 댓글 작성/삭제
- 게시글 상세 + 댓글 조회 API 제공

### ✅ UI/UX
- Tailwind CSS v4 + daisyUI 기반 디자인 시스템
- 라이트/다크 테마(`gym-light`, `gym-dark`) + 로컬스토리지 저장
- 반응형 App Shell(Drawer + Navbar)
- 모달 기반 입력 UX(운동 기록/커뮤니티 작성·수정·상세)

---

## 🧰 기술 스택

### Backend
- Node.js
- Express
- EJS (Server-Side Rendering)
- Passport (LocalStrategy) + express-session
- connect-sqlite3 (세션 스토리지)
- MSSQL (`mssql`)
- dotenv, morgan, cookie-parser

### Frontend
- Tailwind CSS v4 (CLI 빌드)
- daisyUI (테마/컴포넌트)
- Chart.js (CDN)
- FullCalendar v5 (CDN)

---

## 📁 프로젝트 구조

```txt
GymHelper/
├─ app.js                      # 서버 진입점 (현재 이 파일이 listen 수행)
├─ package.json
├─ src/
│  └─ styles/
│     └─ app.css               # Tailwind v4 + daisyUI + 커스텀 CSS(원본)
├─ public/
│  ├─ stylesheets/
│  │  └─ app.css               # (빌드 결과물) 실제 서비스에 로딩되는 CSS
│  ├─ javascripts/
│  │  ├─ theme.js              # 테마 토글 + 사용자명 표시(hydrate)
│  │  ├─ work.js               # 대시보드/차트/캘린더/운동 CRUD
│  │  ├─ community.js          # 커뮤니티 모달/댓글/게시글 CRUD
│  │  ├─ logIn.js / signUp.js
│  │  └─ accountSettings.js
│  └─ images/
├─ routes/                     # 라우팅
├─ controller/                 # 컨트롤러(비즈니스 로직)
├─ model/                      # DB 접근(mssql 쿼리)
├─ passport/                   # Passport 설정
├─ middleware/                 # 인증 미들웨어
├─ session/                    # 세션 SQLite 파일 생성 위치
└─ views/                      # EJS 템플릿
```

> ⚠️ `bin/www` 파일이 존재하지만, 현재는 `app.js` 자체가 `app.listen()`을 수행합니다.  
> 따라서 실행은 **`node app.js` 또는 `npm run dev`** 기준으로 사용하세요. (`bin/www` 실행은 포트 충돌을 유발할 수 있습니다.)

---

## ✅ 실행 준비

### 1) 사전 요구사항
- Node.js 18 이상 권장
- Microsoft SQL Server (로컬 SQL Server / Azure SQL 등)

---

## 🔐 환경 변수 설정 (.env)

루트에 `.env` 파일을 생성하세요.

```bash
# Server
PORT=3000
SERVER_URL=http://localhost:3000

# Session (필수)
SESSION_SECRET=your_session_secret

# MSSQL
DB_SERVER=localhost
DB_PORT=1433
DB_USER=sa
DB_PW=your_password
DB_NAME=gymhelper
```

| 변수 | 설명 |
|---|---|
| `PORT` | 서버 포트(기본 3000) |
| `SERVER_URL` | 서버 시작 시 콘솔 출력용 URL |
| `SESSION_SECRET` | 세션 암호화 키(필수) |
| `DB_SERVER` | MSSQL 서버 주소 |
| `DB_PORT` | MSSQL 포트(기본 1433) |
| `DB_USER` | DB 계정 |
| `DB_PW` | DB 비밀번호 |
| `DB_NAME` | DB 이름 |

> DB 연결 옵션은 `model/index.js`에 있으며 기본값으로 `encrypt: true`, `trustServerCertificate: true`가 설정되어 있습니다.  
> 로컬 환경에서 TLS 관련 오류가 발생하면 해당 옵션을 환경에 맞게 조정해야 할 수 있습니다.

---

## ▶️ 설치 & 실행

### 1) 의존성 설치
```bash
npm install
```

### 2) CSS 빌드
Tailwind v4 CLI로 `src/styles/app.css` → `public/stylesheets/app.css`로 빌드합니다.

- 1회 빌드(배포용)
```bash
npm run build:css
```

- 감시 모드(개발용)
```bash
npm run watch:css
```

### 3) 개발 서버 실행(권장)
CSS watch + nodemon을 동시에 실행합니다.

```bash
npm run dev
```

### 4) 단순 실행(프로덕션/테스트)
```bash
npm run build:css
node app.js
```

---

## 🌐 접속 경로

- 기본: `http://localhost:3000`
- `/` : 로그인 상태면 `/work`, 아니면 `/logIn`으로 리다이렉트
- `/logIn` (`/login`) : 로그인
- `/signUp` (`/signup`) : 회원가입
- `/work` : 대시보드(차트/캘린더/운동 기록) ✅ 로그인 필요
- `/community` : 커뮤니티(게시글/댓글) *(작성/수정/삭제는 로그인 필요)*
- `/accountSettings` : 계정 설정 ✅ 로그인 필요

---

## 🔌 API 엔드포인트 요약

> API 응답은 공통적으로 `{ success: boolean, ... }` 형태입니다.  
> 실패 시 `{ success: false, message: string }`

### Users (`/api/users`)
- `POST /api/users/signUp` : 회원가입
- `POST /api/users/idCheck` : 아이디 중복 확인
- `POST /api/users/logIn` : 로그인
- `POST /api/users/logOut` : 로그아웃 ✅ 로그인 필요
- `GET  /api/users/getUserName` : 사용자명 조회 ✅ 로그인 필요
- `POST /api/users/modifyUserInfo` : 사용자명/비밀번호 변경 ✅ 로그인 필요
- `POST /api/users/deleteUser` : 회원 탈퇴 ✅ 로그인 필요

### Works (`/api/works`) ✅ 로그인 필요
- `POST   /api/works/add` : 운동 기록 추가
- `PUT    /api/works/update` : 운동 기록 수정
- `DELETE /api/works/delete` : 운동 기록 삭제
- `POST   /api/works/myWorkouts` : 날짜별 운동 조회
- `POST   /api/works/allWorkouts` : 전체 운동 날짜 조회(캘린더용)
- `POST   /api/works/monthlyStats` : 월간 통계
- `POST   /api/works/partStats` : 부위별 타겟 통계

### Community (`/community`)
- `GET    /community` : 커뮤니티 페이지 렌더링(SSR)
- `POST   /community/create` : 게시글 작성 ✅ 로그인 필요
- `GET    /community/getPostAndComments/:id` : 게시글 + 댓글 조회
- `POST   /community/addComment` : 댓글 작성 ✅ 로그인 필요
- `DELETE /community/deleteComment/:id` : 댓글 삭제 ✅ 로그인 필요
- `PUT    /community/edit/:id` : 게시글 수정 ✅ 로그인 필요
- `DELETE /community/delete/:id` : 게시글 삭제 ✅ 로그인 필요

---

## 🎨 스타일/테마 커스터마이징

- 원본 스타일 파일: `src/styles/app.css`
  - Tailwind v4 구성(`@import "tailwindcss"`)
  - daisyUI 테마(`gym-light`, `gym-dark`)
  - FullCalendar 커스텀 변수 포함
- 빌드 결과물: `public/stylesheets/app.css`  
  → 이 파일은 **직접 수정하지 말고**, `src/styles/app.css`를 수정 후 다시 빌드하세요.

테마 토글:
- 로컬스토리지 키: `gymhelper-theme`
- HTML 속성: `<html data-theme="gym-light|gym-dark">`
- 토글 로직: `public/javascripts/theme.js`

---

## 🧩 세션 저장소

- 로그인 세션은 `connect-sqlite3`로 **SQLite 파일에 저장**됩니다.
- 생성 위치: `./session/session.db`
- 세션 쿠키 만료: 1시간(`maxAge: 3600000`)

---

## ⚠️ 참고 사항

- Chart.js / FullCalendar는 CDN으로 로딩되므로, 개발/테스트 환경에서 인터넷 연결이 필요할 수 있습니다.
- MSSQL 테이블/컬럼 구조는 `model/*.js`에서 사용하는 쿼리 기준으로 준비되어야 합니다.
  (이 README에서는 스키마 SQL을 포함하지 않습니다.)

---

## 🛠️ 트러블슈팅

### DB 연결이 실패합니다
- `.env` 값이 올바른지 확인하세요(`DB_SERVER`, `DB_PORT`, `DB_USER`, `DB_PW`, `DB_NAME`)
- SQL Server가 실행 중인지, 원격 접속이 허용되는지 확인하세요.
- TLS/인증 관련 오류가 발생하면 `model/index.js`의 `options` 설정을 환경에 맞게 조정해야 할 수 있습니다.

### CSS가 반영되지 않습니다
- `src/styles/app.css` 수정 후 `npm run build:css` 또는 `npm run watch:css`를 실행했는지 확인하세요.
- 브라우저 캐시 문제라면 강력 새로고침(Ctrl/Cmd+Shift+R) 후 확인하세요.

### 포트가 이미 사용 중입니다(EADDRINUSE)
- 다른 프로세스가 3000 포트를 점유 중인지 확인하거나, `.env`에서 `PORT`를 변경하세요.