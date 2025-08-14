import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// 업체별 Webhook 연결 (지금은 viewraum만)
const storeWebhookMap: Record<string, string> = {
  viewraum: "https://script.google.com/macros/s/AKfycbxVda1sTk0yJVIpaZNoMCCUS49GwST_Nfif24j5UL_2mIwgwdVO-FmXBTEdK0UDN0i1GA/exec",
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function POST(req: Request) {
  const body = await req.json();
  const { user_name, email, phone, store_id, visit_date, visit_time, request_note, prescription, selectedPrescription } = body;

  if (!user_name || !email || !phone || !store_id || !visit_date || !visit_time) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Supabase에 예약 저장
  const insertRes = await fetch(`${supabaseUrl}/rest/v1/bookings`, {
    method: "POST",
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify([
      {
        user_name,
        email,
        phone,
        store_id,
        visit_date,
        visit_time,
        request_note,
        ...(prescription && Object.keys(prescription).length > 0 && { prescription })
      },
    ]),
  });

  const data = await insertRes.json();

  if (!insertRes.ok) {
    console.error("❌ Failed to insert booking:", data);
    return NextResponse.json({ message: "Failed to insert booking", detail: data }, { status: 500 });
  }

  // Google Sheets에 전달
  const webhook = storeWebhookMap[store_id];
  if (webhook) {
    try {
      const webhookData = {
        name: user_name,
        email,
        phone,
        visit_date,
        visit_time,
        request_note,
        store_id,
        status: "BOOKED",
        lens_type: selectedPrescription ? selectedPrescription.powerType || '' : '',
        right_eye: prescription ? `${prescription.rightEye.spherical || ''},${prescription.rightEye.cylindrical || ''},${prescription.rightEye.axis || ''}` : '',
        left_eye: prescription ? `${prescription.leftEye.spherical || ''},${prescription.leftEye.cylindrical || ''},${prescription.leftEye.axis || ''}` : '',
      };
      
      console.log("📤 Sending to Google Sheets:", JSON.stringify(webhookData, null, 2));
      
      const response = await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(webhookData),
      });
      
      const responseText = await response.text();
      console.log("📥 Google Sheets response:", response.status, responseText);
      
    } catch (err) {
      console.error("❌ Google Sheets 전송 실패:", err);
    }
  } else {
    console.warn(`⚠️ Webhook 없음: store_id=${store_id}`);
  }

  return NextResponse.json({ success: true, data });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json({ message: "Email is required" }, { status: 400 });
  }

  const fetchRes = await fetch(`${supabaseUrl}/rest/v1/bookings?email=eq.${email}`, {
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
    },
  });

  const data = await fetchRes.json();

  if (!fetchRes.ok) {
    console.error("❌ Failed to fetch bookings:", data);
    return NextResponse.json({ message: "Failed to fetch bookings" }, { status: 500 });
  }

  return NextResponse.json({ data });
}

export async function DELETE(req: Request) {
  console.log("📥 DELETE method triggered");

  const body = await req.json();
  const { id } = body;

  if (!id) {
    return NextResponse.json({ message: "ID is required" }, { status: 400 });
  }

  // 삭제 전 예약 정보 조회
  const fetchRes = await fetch(`${supabaseUrl}/rest/v1/bookings?id=eq.${id}`, {
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
    },
  });

  const result = await fetchRes.json();
  const booking = result?.[0];

  if (!booking) {
    return NextResponse.json({ message: "Booking not found" }, { status: 404 });
  }

  // 예약 삭제
  const deleteRes = await fetch(`${supabaseUrl}/rest/v1/bookings?id=eq.${id}`, {
    method: "DELETE",
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
  });

  const detail = await deleteRes.text();
  console.log("🧾 Supabase DELETE response:", detail);

  if (!deleteRes.ok) {
    console.error("❌ Supabase DELETE failed:", detail);
    return NextResponse.json({ message: "Failed to cancel booking", detail }, { status: 500 });
  }

  // Google Sheets에 "CANCELLED" 기록 추가
  const webhook = storeWebhookMap[booking.store_id];
  if (webhook) {
    try {
      await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: booking.user_name,
          email: booking.email,
          phone: booking.phone,
          visit_date: booking.visit_date,
          visit_time: booking.visit_time,
          request_note: booking.request_note,
          store_id: booking.store_id,
          status: "CANCELLED",
          lens_type: booking.selectedPrescription ? booking.selectedPrescription.powerType || '' : '',
          right_eye: booking.prescription ? `${booking.prescription.rightEye.spherical || ''},${booking.prescription.rightEye.cylindrical || ''},${booking.prescription.rightEye.axis || ''}` : '',
          left_eye: booking.prescription ? `${booking.prescription.leftEye.spherical || ''},${booking.prescription.leftEye.cylindrical || ''},${booking.prescription.leftEye.axis || ''}` : '',
        }),
      });
    } catch (err) {
      console.error("❌ 취소 시 Google Sheets 전송 실패:", err);
    }
  }

  console.log("✅ Supabase DELETE success for ID:", id);
  return NextResponse.json({ message: "Cancelled" });
}
