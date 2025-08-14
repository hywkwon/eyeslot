import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// 개발/테스트용 데이터베이스 설정 API
export async function POST(req: Request) {
  console.log("🔧 Database setup requested");
  
  try {
    // 인증 체크 (간단한 보안)
    const { password } = await req.json();
    if (password !== "eyeslot-setup-2025") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // prescriptions 테이블 생성 SQL
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS prescriptions (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_email TEXT NOT NULL,
        name TEXT NOT NULL,
        power_type TEXT NOT NULL,
        prescription_data JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_prescriptions_user_email 
      ON prescriptions (user_email);

      CREATE INDEX IF NOT EXISTS idx_prescriptions_data 
      ON prescriptions USING GIN (prescription_data);

      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = timezone('utc'::text, now());
          RETURN NEW;
      END;
      $$ language 'plpgsql';

      CREATE TRIGGER update_prescriptions_updated_at 
      BEFORE UPDATE ON prescriptions 
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `;

    console.log("📡 Executing database setup...");

    // Supabase SQL 실행
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sql: createTableSQL
      }),
    });

    console.log("📊 Setup response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Database setup failed:", errorText);
      
      // Alternative: Use direct SQL execution
      return NextResponse.json({ 
        error: "Database setup failed", 
        detail: errorText,
        sql: createTableSQL 
      }, { status: 500 });
    }

    const result = await response.json();
    console.log("✅ Database setup completed:", result);

    return NextResponse.json({ 
      success: true, 
      message: "Database tables created successfully",
      result 
    });

  } catch (error) {
    console.error("❌ Error during database setup:", error);
    return NextResponse.json({ 
      error: "Setup failed", 
      detail: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}

// 테이블 존재 여부 확인
export async function GET() {
  console.log("🔍 Checking database tables...");
  
  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/prescriptions?limit=1`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.ok) {
      console.log("✅ prescriptions table exists");
      return NextResponse.json({ tableExists: true, status: "ready" });
    } else {
      const errorText = await response.text();
      console.log("❌ prescriptions table check failed:", errorText);
      
      if (errorText.includes('relation "prescriptions" does not exist')) {
        return NextResponse.json({ 
          tableExists: false, 
          status: "needs_setup",
          error: errorText 
        });
      }
      
      return NextResponse.json({ 
        tableExists: false, 
        status: "error",
        error: errorText 
      });
    }
  } catch (error) {
    console.error("❌ Error checking tables:", error);
    return NextResponse.json({ 
      tableExists: false, 
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
}