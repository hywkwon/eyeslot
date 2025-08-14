import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

interface PrescriptionData {
  rightEye: {
    spherical: string;
    cylindrical: string;
    axis: string;
  };
  leftEye: {
    spherical: string;
    cylindrical: string;
    axis: string;
  };
}

interface CreatePrescriptionRequest {
  user_email: string;
  name: string;
  power_type: string;
  prescription_data: PrescriptionData;
}

interface UpdatePrescriptionRequest {
  id: string;
  name: string;
  power_type: string;
  prescription_data: PrescriptionData;
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

// GET: 사용자별 처방전 목록 조회
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const user_email = searchParams.get("user_email");

  if (!user_email) {
    return NextResponse.json({ error: "user_email is required" }, { status: 400 });
  }

  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/prescriptions?user_email=eq.${encodeURIComponent(user_email)}&order=created_at.desc`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error("❌ Failed to fetch prescriptions:", errorData);
      return NextResponse.json({ error: "Failed to fetch prescriptions" }, { status: 500 });
    }

    const prescriptions = await response.json();
    
    // 프론트엔드 형식에 맞게 변환
    const formattedPrescriptions = prescriptions.map((p: any) => ({
      id: p.id,
      name: p.name,
      powerType: p.power_type,
      prescription: p.prescription_data,
      savedDate: p.created_at.split('T')[0]
    }));

    return NextResponse.json({ data: formattedPrescriptions });
  } catch (error) {
    console.error("❌ Error fetching prescriptions:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST: 새 처방전 생성
export async function POST(req: Request) {
  try {
    const body: CreatePrescriptionRequest = await req.json();
    const { user_email, name, power_type, prescription_data } = body;

    if (!user_email || !name || !power_type || !prescription_data) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const response = await fetch(`${supabaseUrl}/rest/v1/prescriptions`, {
      method: "POST",
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        user_email,
        name,
        power_type,
        prescription_data,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("❌ Failed to create prescription:", errorData);
      return NextResponse.json({ error: "Failed to create prescription" }, { status: 500 });
    }

    const createdPrescription = await response.json();
    
    // 프론트엔드 형식으로 변환
    const formattedPrescription = {
      id: createdPrescription[0].id,
      name: createdPrescription[0].name,
      powerType: createdPrescription[0].power_type,
      prescription: createdPrescription[0].prescription_data,
      savedDate: createdPrescription[0].created_at.split('T')[0]
    };

    return NextResponse.json({ success: true, data: formattedPrescription });
  } catch (error) {
    console.error("❌ Error creating prescription:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT: 기존 처방전 수정
export async function PUT(req: Request) {
  try {
    const body: UpdatePrescriptionRequest = await req.json();
    const { id, name, power_type, prescription_data } = body;

    if (!id || !name || !power_type || !prescription_data) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const response = await fetch(`${supabaseUrl}/rest/v1/prescriptions?id=eq.${id}`, {
      method: "PATCH",
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        name,
        power_type,
        prescription_data,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("❌ Failed to update prescription:", errorData);
      return NextResponse.json({ error: "Failed to update prescription" }, { status: 500 });
    }

    const updatedPrescription = await response.json();
    
    // 프론트엔드 형식으로 변환
    const formattedPrescription = {
      id: updatedPrescription[0].id,
      name: updatedPrescription[0].name,
      powerType: updatedPrescription[0].power_type,
      prescription: updatedPrescription[0].prescription_data,
      savedDate: updatedPrescription[0].created_at.split('T')[0]
    };

    return NextResponse.json({ success: true, data: formattedPrescription });
  } catch (error) {
    console.error("❌ Error updating prescription:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE: 처방전 삭제
export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "Prescription ID is required" }, { status: 400 });
    }

    const response = await fetch(`${supabaseUrl}/rest/v1/prescriptions?id=eq.${id}`, {
      method: "DELETE",
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("❌ Failed to delete prescription:", errorData);
      return NextResponse.json({ error: "Failed to delete prescription" }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Prescription deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting prescription:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}