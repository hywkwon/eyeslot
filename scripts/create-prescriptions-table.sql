-- 사용자별 처방전 저장을 위한 prescriptions 테이블 생성

CREATE TABLE IF NOT EXISTS prescriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT NOT NULL,
  name TEXT NOT NULL,
  power_type TEXT NOT NULL,
  prescription_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 사용자 이메일별 인덱스 추가 (빠른 조회를 위해)
CREATE INDEX IF NOT EXISTS idx_prescriptions_user_email 
ON prescriptions (user_email);

-- prescription_data 검색을 위한 GIN 인덱스
CREATE INDEX IF NOT EXISTS idx_prescriptions_data 
ON prescriptions USING GIN (prescription_data);

-- updated_at 자동 업데이트를 위한 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- updated_at 자동 업데이트 트리거
CREATE TRIGGER update_prescriptions_updated_at 
BEFORE UPDATE ON prescriptions 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- prescription_data 구조 예시:
-- {
--   "rightEye": {
--     "spherical": "-2.50",
--     "cylindrical": "-2.00", 
--     "axis": "175"
--   },
--   "leftEye": {
--     "spherical": "-2.00",
--     "cylindrical": "-2.75",
--     "axis": "10"
--   }
-- }

-- 테이블에 대한 코멘트
COMMENT ON TABLE prescriptions IS 'User prescription storage table for eyeslot booking system';
COMMENT ON COLUMN prescriptions.user_email IS 'User email address for linking prescriptions to accounts';
COMMENT ON COLUMN prescriptions.name IS 'User-defined name for the prescription (e.g., "Daily Use", "Computer Work")';
COMMENT ON COLUMN prescriptions.power_type IS 'Type of lens power (SINGLE_VISION, PROGRESSIVE, BIFOCAL)';
COMMENT ON COLUMN prescriptions.prescription_data IS 'JSON data containing spherical, cylindrical, and axis values for both eyes';