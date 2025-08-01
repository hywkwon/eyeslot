-- 기존 users 테이블이 있다면 삭제 (주의: 실제 운영에서는 사용하지 마세요)
-- DROP TABLE IF EXISTS users;

-- users 테이블 생성 (존재하지 않는 경우에만)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 이메일 인덱스 생성 (빠른 검색을 위해)
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 생성 시간 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- 업데이트 시간 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_users_updated_at ON users(updated_at);

-- 테이블 구조 확인
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- 테스트 데이터 삽입 (테이블 구조 확인용)
INSERT INTO users (id, email, name, image) 
VALUES 
  ('test-id-123', 'test@example.com', '테스트 사용자', 'https://example.com/avatar.jpg'),
  ('google-user-456', 'google.user@gmail.com', '구글 사용자', 'https://lh3.googleusercontent.com/test')
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  image = EXCLUDED.image,
  updated_at = NOW();

-- 저장된 데이터 확인
SELECT 
  id,
  email,
  name,
  image,
  created_at,
  updated_at
FROM users 
ORDER BY created_at DESC
LIMIT 10;

-- 테이블 통계 확인
SELECT 
  COUNT(*) as total_users,
  COUNT(DISTINCT email) as unique_emails,
  MIN(created_at) as first_user_created,
  MAX(created_at) as last_user_created
FROM users;
