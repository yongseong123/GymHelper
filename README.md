# 🏋️‍♂️ GymHelper

**GymHelper**는 운동 루틴과 운동 기록을 체계적으로 관리하기 위한  
Node.js 기반 웹 애플리케이션입니다.

> “오늘 뭐 했지?”에서  
> “이번 달 볼륨이 얼마나 늘었지?”까지 이어지는  
> **기록 → 누적 → 개선** 흐름을 목표로 합니다.

---

## ✨ 핵심 컨셉

- 🧠 **기록 중심 설계**: 운동 데이터를 쌓아갈수록 가치가 커지는 구조
- 🧱 **명확한 역할 분리**: routes / controller / model 기반 MVC 패턴
- 🔐 **확장 가능한 인증 구조**: Passport & Session 디렉터리 분리
- 🎨 **서버 사이드 렌더링**: EJS 기반의 단순하고 직관적인 UI

---

## 📌 목차
- [주요 기능](#-주요-기능)
- [기술 스택](#-기술-스택)
- [프로젝트 구조](#-프로젝트-구조)
- [실행 방법](#-실행-방법)
- [환경 변수](#-환경-변수)
- [아키텍처 설명](#-아키텍처-설명)
- [개발 가이드](#-개발-가이드)
- [트러블슈팅](#-트러블슈팅)
- [향후 개선 방향](#-향후-개선-방향)

---

## ✅ 주요 기능

### 🗓️ 운동 관리
- 운동 루틴 생성 / 수정 / 삭제
- 운동 부위 및 종목 구조화
- 날짜 기반 운동 기록 관리

### 🧾 기록 관리
- 세트 / 횟수 / 중량 단위 기록
- 과거 기록 조회
- 누적 데이터 기반 확장 가능 구조

### 🔐 인증 & 세션
- 세션 기반 로그인 구조
- Passport를 활용한 인증 로직 분리
- 사용자 단위 데이터 관리 확장 가능

---

## 🧰 기술 스택

### Backend
- **Node.js**
- **Express**
- **Session 기반 인증**
- **Passport (확장용 구조 포함)**

### Frontend
- **EJS (Server-side Rendering)**
- **CSS**
- 정적 리소스: `public/`

### Architecture
- MVC 패턴
- 미들웨어 기반 요청 처리

---

## 🗂 프로젝트 구조

```txt
GymHelper/
├─ app.js                # 애플리케이션 진입점
├─ package.json
│
├─ routes/               # 라우팅 정의
├─ controller/           # 비즈니스 로직
├─ model/                # 데이터 모델
│
├─ middleware/           # 공통 미들웨어
├─ passport/             # 인증 전략
├─ session/              # 세션 설정
│
├─ views/                # EJS 템플릿
├─ public/               # CSS, 이미지 등 정적 파일
└─ bin/                  # 실행 스크립트

▶️ 실행 방법 (로컬)
# 1. 저장소 클론
git clone https://github.com/yongseong123/GymHelper.git

# 2. 디렉터리 이동
cd GymHelper

# 3. 패키지 설치
npm install

# 4. 서버 실행
npm start


👉 기본 접속 주소

http://localhost:3000

🔑 환경 변수
PORT=3000
SESSION_SECRET=your_session_secret

변수명	설명
PORT	서버 포트
SESSION_SECRET	세션 암호화 키

⚠️ .env 파일은 Git에 커밋하지 않는 것을 권장합니다.

🏗 아키텍처 설계 포인트

MVC 패턴 적용

역할 분리로 유지보수성 강화

Controller 중심 설계

Route는 요청 분기만 담당

확장 가능한 인증 구조

Passport 디렉터리 분리

기록 중심 데이터 흐름

누적 데이터 기반 기능 확장 용이

🚀 향후 개선 방향

📊 운동 기록 통계 시각화 (주/월/연)

🏋️ 루틴 템플릿 기능

🔐 OAuth 로그인 (Google / GitHub)

🗄 DB 연동 (MongoDB / PostgreSQL)

📱 모바일 UI 최적화