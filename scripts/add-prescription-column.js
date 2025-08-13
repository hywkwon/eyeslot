// Supabase에 prescription 컬럼을 추가하는 스크립트
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://nclaeplplsrxrtozgiss.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jbGFlcGxwbHNyeHJ0b3pnaXNzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTM4ODc0OSwiZXhwIjoyMDYwOTY0NzQ5fQ.xIce_ra4QZywRm4visXCv4B_GZhCHM6PY7pKQRtdaOo'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function addPrescriptionColumn() {
  try {
    console.log('🔧 Adding prescription column to bookings table...')
    
    // SQL을 실행하기 위해 rpc 함수 호출
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE bookings ADD COLUMN IF NOT EXISTS prescription JSONB;'
    })
    
    if (error) {
      console.error('❌ Error adding prescription column:', error)
      
      // 다른 방법으로 시도 - 직접 SQL 실행
      console.log('🔄 Trying alternative method...')
      const { data: data2, error: error2 } = await supabase
        .from('bookings')
        .select('prescription')
        .limit(1)
      
      if (error2 && error2.code === '42703') {
        console.log('✅ Column does not exist, need to add it manually via Supabase dashboard')
        console.log('📋 Please run this SQL in Supabase SQL Editor:')
        console.log('ALTER TABLE bookings ADD COLUMN prescription JSONB;')
        console.log('CREATE INDEX IF NOT EXISTS idx_bookings_prescription ON bookings USING GIN (prescription);')
      } else if (!error2) {
        console.log('✅ Column already exists!')
      } else {
        console.error('❌ Unexpected error:', error2)
      }
    } else {
      console.log('✅ Successfully added prescription column:', data)
    }
    
  } catch (err) {
    console.error('🚨 Unexpected error:', err)
  }
}

addPrescriptionColumn()