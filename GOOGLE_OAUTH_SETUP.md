# Google OAuth 설정 가이드

## 1. Google Cloud Console 설정

### 프로젝트 생성/선택
1. https://console.cloud.google.com/ 접속
2. 프로젝트 선택 또는 새 프로젝트 생성

### OAuth 동의 화면 설정
1. "API 및 서비스" > "OAuth 동의 화면" 클릭
2. 사용자 유형: **"외부"** 선택
3. 필수 정보 입력:
   - 앱 이름: `eyeslot`
   - 사용자 지원 이메일: 본인 이메일
   - 개발자 연락처 정보: 본인 이메일
4. "저장 후 계속" 클릭

### OAuth 2.0 클라이언트 ID 생성
1. "사용자 인증 정보" 탭으로 이동
2. "+ 사용자 인증 정보 만들기" > "OAuth 클라이언트 ID" 클릭
3. 애플리케이션 유형: **"웹 애플리케이션"** 선택
4. 이름: `eyeslot-local` 입력
5. **승인된 자바스크립트 원본** 추가:
   ```
   http://localhost:3001
   ```
6. **승인된 리디렉션 URI** 추가:
   ```
   http://localhost:3001/api/auth/callback/google
   ```
7. "만들기" 클릭

## 2. 환경변수 설정

생성된 클라이언트 ID와 시크릿을 `.env.local` 파일에 입력:

```bash
# Google OAuth
GOOGLE_CLIENT_ID=123456789012-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-actual_secret_here
```

## 3. 서버 재시작

```bash
# 서버 중지 후 재시작
npm run dev
```

## 4. 테스트

http://localhost:3001/login 에서 Google 로그인 버튼 클릭하여 테스트

## 주의사항

- 로컬 개발용이므로 `http://localhost:3001`만 설정
- 프로덕션에서는 실제 도메인으로 변경 필요
- 클라이언트 시크릿은 절대 공개하지 말 것