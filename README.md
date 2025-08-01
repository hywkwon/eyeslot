# EyeSlot - Eyewear Reservation System

A modern eyewear reservation platform built with Next.js, featuring Google OAuth authentication, international phone validation, and customer review system.

## Features

- 🔐 **Google OAuth Authentication**
- 📅 **Appointment Booking System**  
- 🌍 **International Phone Number Validation**
- ⭐ **5-Star Review System with Feedback**
- 📱 **Responsive Design**
- 🔍 **Booking Lookup & Management**
- ❌ **Cancellation & Deletion System**

## 프로젝트 구조

```
eyeslot/
├── app/                    # Next.js 앱 라우터 (프론트엔드 + API)
│   ├── api/               # API 라우트 (기존 lens-api 통합)
│   │   ├── book/          # 예약 생성 API
│   │   ├── booking/       # 예약 조회/삭제 API
│   │   └── ...
│   ├── booking-form/      # 예약 폼 페이지
│   ├── booking-lookup/    # 예약 조회 페이지
│   └── ...
├── components/            # React 컴포넌트
├── lib/                   # 유틸리티 함수들
├── public/               # 정적 파일들
└── ...
```

## 시작하기

### 1. 환경변수 설정

`.env.local.example` 파일을 참고하여 `.env.local` 파일을 생성하고 환경변수를 설정하세요:

```bash
cp .env.local.example .env.local
```

필요한 환경변수:
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase 프로젝트 URL
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase 서비스 롤 키
- `NEXTAUTH_URL`: NextAuth URL (개발환경: http://localhost:3000)
- `NEXTAUTH_SECRET`: NextAuth 시크릿 키

### 2. 의존성 설치

```bash
npm install
```

### 3. 개발 서버 실행

```bash
npm run dev
```

애플리케이션이 [http://localhost:3000](http://localhost:3000)에서 실행됩니다.

## 주요 기능

- **예약 시스템**: 매장별 예약 생성 및 관리
- **예약 조회**: 이메일을 통한 예약 내역 조회
- **예약 취소**: 예약 취소 기능
- **Google Sheets 연동**: 예약 정보 자동 전송
- **Supabase 데이터베이스**: 예약 데이터 저장

## API 엔드포인트

### POST /api/book
예약 생성 (기존 lens-api 기능)

### GET /api/booking?email={email}
예약 조회

### DELETE /api/booking
예약 취소

### POST /api/booking
예약 생성 (Google Sheets 연동 포함)

## 기술 스택

- **Frontend**: Next.js 14, React 18, TypeScript
- **UI**: Tailwind CSS, Radix UI, Framer Motion
- **Backend**: Next.js API Routes
- **Database**: Supabase
- **Authentication**: NextAuth.js
- **Forms**: React Hook Form + Zod

## 배포

Vercel을 사용하여 배포할 수 있습니다:

```bash
npm run build
```