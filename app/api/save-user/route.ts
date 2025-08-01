import { NextResponse } from "next/server"
import { saveUserToSupabase } from "@/lib/supabase"

export async function POST(request: Request) {
  console.log("🌐 === 클라이언트 사용자 저장 API 호출 ===")
  console.log("⏰ 요청 시간:", new Date().toISOString())

  try {
    // 요청 헤더 상세 로깅
    console.log("📋 요청 헤더:")
    const headers = Object.fromEntries(request.headers.entries())
    console.log(JSON.stringify(headers, null, 2))

    // Content-Type 확인
    const contentType = request.headers.get("content-type")
    console.log("📄 Content-Type:", contentType)

    if (!contentType || !contentType.includes("application/json")) {
      console.error("❌ 잘못된 Content-Type:", contentType)
      return NextResponse.json({ success: false, error: "Content-Type must be application/json" }, { status: 400 })
    }

    // 요청 본문 파싱
    let body
    try {
      body = await request.json()
      console.log("📝 받은 사용자 데이터:")
      console.log("[DEBUG] req.body:", JSON.stringify(body, null, 2))
    } catch (parseError) {
      console.error("❌ JSON 파싱 오류:", parseError)
      return NextResponse.json({ success: false, error: "Invalid JSON in request body" }, { status: 400 })
    }

    const { id, email, name } = body // image 필드 제거

    // 데이터 검증
    console.log("🔍 데이터 검증 시작...")
    console.log("- id:", id)
    console.log("- email:", email)
    console.log("- name:", name)

    if (!email || !name) {
      console.error("❌ 필수 데이터 누락:")
      console.error("- email:", email)
      console.error("- name:", name)
      return NextResponse.json(
        {
          success: false,
          error: "이메일과 이름은 필수입니다.",
          received: { id, email, name },
        },
        { status: 400 },
      )
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      console.error("❌ 잘못된 이메일 형식:", email)
      return NextResponse.json({ success: false, error: "유효한 이메일 주소를 입력해주세요." }, { status: 400 })
    }

    console.log("✅ 데이터 검증 통과")
    console.log("🔄 Supabase 저장 시작...")

    // Supabase에 저장 (image 필드 제거)
    const result = await saveUserToSupabase({
      id: id || `user-${Date.now()}`,
      email,
      name,
    })

    console.log("💾 Supabase 저장 결과:")
    console.log("[DEBUG] saveUserToSupabase result:", JSON.stringify(result, null, 2))

    if (result.success) {
      console.log("✅ API를 통한 사용자 저장 성공!")
      console.log("[UPSERT SUCCESS]", result.data)

      return NextResponse.json(
        {
          success: true,
          message: "사용자 정보가 성공적으로 저장되었습니다.",
          data: result.data,
        },
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
    } else {
      console.error("❌ API를 통한 사용자 저장 실패:")
      console.error("[UPSERT ERROR]", result.error)

      // 구체적인 오류 정보 반환
      return NextResponse.json(
        {
          success: false,
          error: result.error?.message || result.error || "저장 실패",
          details: result.error,
          timestamp: new Date().toISOString(),
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("🚨 API 사용자 저장 중 예상치 못한 오류:")
    console.error("- Error type:", typeof error)
    console.error("- Error message:", error instanceof Error ? error.message : "알 수 없는 오류")
    console.error("- Error stack:", error instanceof Error ? error.stack : "스택 없음")
    console.error("- Full error object:", JSON.stringify(error, null, 2))

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "서버 오류가 발생했습니다.",
        type: typeof error,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

// GET 요청 처리 (디버깅용)
export async function GET() {
  console.log("📋 GET 요청 수신: /api/save-user")
  return NextResponse.json(
    {
      message: "이 엔드포인트는 POST 요청만 지원합니다.",
      method: "POST",
      contentType: "application/json",
      timestamp: new Date().toISOString(),
    },
    { status: 405 },
  )
}
