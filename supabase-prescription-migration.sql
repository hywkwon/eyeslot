-- Supabase에서 실행할 SQL: bookings 테이블에 prescription 컬럼 추가

-- bookings 테이블에 prescription 컬럼 추가 (JSON 타입)
ALTER TABLE bookings 
ADD COLUMN prescription JSONB;

-- prescription 컬럼에 대한 코멘트 추가
COMMENT ON COLUMN bookings.prescription IS 'Lens prescription data including spherical, cylindrical, and axis values for both eyes';

-- 인덱스 추가 (prescription 데이터 검색을 위해)
CREATE INDEX IF NOT EXISTS idx_bookings_prescription 
ON bookings USING GIN (prescription);

-- 예시 prescription 데이터 구조:
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