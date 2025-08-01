import { createClient } from "@supabase/supabase-js"

// 🔍 환경변수 점검 및 로깅
console.log("🔧 === Supabase 환경변수 점검 ===")
console.log("SUPABASE_URL 존재:", !!process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log("SUPABASE_ANON_KEY 존재:", !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.log("SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 30) + "...")
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Supabase 클라이언트 생성 함수 (싱글톤 패턴)
let supabaseInstance: any = null

const createSupabaseClient = () => {
  // 이미 인스턴스가 있으면 재사용
  if (supabaseInstance) {
    console.log("♻️ 기존 Supabase 클라이언트 재사용")
    return supabaseInstance
  }

  if (!supabaseUrl) {
    console.error("❌ NEXT_PUBLIC_SUPABASE_URL 환경변수가 설정되지 않았습니다.")
    return null
  }

  if (!supabaseAnonKey) {
    console.error("❌ NEXT_PUBLIC_SUPABASE_ANON_KEY 환경변수가 설정되지 않았습니다.")
    return null
  }

  try {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false, // NextAuth 사용으로 세션 지속성 비활성화
        autoRefreshToken: false,
      },
      db: {
        schema: "public",
      },
      global: {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      },
    })

    console.log("✅ Supabase 클라이언트 초기화 성공 (새 인스턴스)")
    return supabaseInstance
  } catch (error) {
    console.error("❌ Supabase 클라이언트 초기화 실패:", error)
    return null
  }
}

// Supabase 클라이언트 생성
export const supabase = createSupabaseClient()

// 🛠️ 개선된 사용자 저장 함수 (image 필드 제거)
export async function saveUserData(user: {
  id: string
  email: string
  name: string
}) {
  console.log("🛠️ saveUserData 호출됨")
  console.log("저장 시도할 user 객체:", JSON.stringify(user, null, 2))

  console.log("🚀 === saveUserData 함수 시작 ===")
  console.log("📝 전달받은 사용자 정보:")
  console.log("- ID:", user.id)
  console.log("- Email:", user.email)
  console.log("- Name:", user.name)

  try {
    // 1. Supabase 클라이언트 확인
    if (!supabase) {
      const errorMsg = "Supabase 클라이언트가 초기화되지 않았습니다."
      console.error("❌", errorMsg)
      return { success: false, error: { message: errorMsg } }
    }

    console.log("✅ Supabase 클라이언트 확인 완료")

    // 2. 필수 데이터 검증
    if (!user.email) {
      console.error("❌ 이메일이 누락되었습니다:", user.email)
      return { success: false, error: { message: "이메일이 필수입니다." } }
    }

    if (!user.name) {
      console.error("❌ 이름이 누락되었습니다:", user.name)
      return { success: false, error: { message: "이름이 필수입니다." } }
    }

    console.log("✅ 필수 데이터 검증 통과")

    // 3. 저장할 데이터 준비 (image 필드 제거, created_at은 DB에서 자동 생성)
    const userData = {
      id: user.id,
      email: user.email.toLowerCase().trim(),
      name: user.name.trim(),
    }

    console.log("💾 Supabase에 저장할 최종 데이터:")
    console.log(JSON.stringify(userData, null, 2))

    // 4. 테이블 접근 테스트
    console.log("🧪 테이블 접근 테스트 시작...")
    try {
      const { count, error: countError } = await supabase.from("users").select("*", { count: "exact", head: true })

      if (countError) {
        console.error("❌ users 테이블 접근 오류:")
        console.error("- 오류 코드:", countError.code)
        console.error("- 오류 메시지:", countError.message)
        console.error("- 전체 오류:", JSON.stringify(countError, null, 2))
        return { success: false, error: countError }
      } else {
        console.log("✅ users 테이블 접근 성공, 현재 레코드 수:", count)
      }
    } catch (tableError) {
      console.error("❌ 테이블 확인 중 예외 발생:", tableError)
      return { success: false, error: { message: "테이블 접근 실패" } }
    }

    // 5. upsert 실행 (id, email, name만 저장)
    console.log("🔄 upsert() 메서드 실행 시작...")

    const { data, error } = await supabase
      .from("users")
      .upsert(userData, {
        onConflict: "email", // 이메일 중복 시 업데이트
        ignoreDuplicates: false, // 중복 시에도 업데이트 수행
      })
      .select() // 저장된 데이터 반환

    // 6. 상세한 결과 로깅
    console.log("📦 Supabase 응답 데이터:", JSON.stringify(data, null, 2))
    console.log("⚠️ Supabase 에러:", JSON.stringify(error, null, 2))

    if (error) {
      console.error("❌ upsert() 실행 중 오류 발생:")
      console.error("- 오류 코드:", error.code)
      console.error("- 오류 메시지:", error.message)
      console.error("- 오류 세부사항:", error.details)
      console.error("- 오류 힌트:", error.hint)
      console.error("- 전체 오류 객체:", JSON.stringify(error, null, 2))

      // 구체적인 오류 메시지 반환
      return {
        success: false,
        error: {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        },
      }
    }

    console.log("✅ upsert() 성공!")
    console.log("💾 저장된 데이터:", JSON.stringify(data, null, 2))

    return { success: true, data }
  } catch (error) {
    console.error("🚨 saveUserData 예상치 못한 오류:")
    console.error("- Error type:", typeof error)
    console.error("- Error message:", error instanceof Error ? error.message : "알 수 없는 오류")
    console.error("- Error stack:", error instanceof Error ? error.stack : "스택 없음")
    console.error("- Full error object:", JSON.stringify(error, null, 2))

    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : "알 수 없는 오류",
        type: typeof error,
        stack: error instanceof Error ? error.stack : undefined,
      },
    }
  }
}

// 🔍 개선된 사용자 조회 함수 (.maybeSingle() 사용)
export async function getUserFromSupabase(email: string) {
  console.log("🔍 === 사용자 조회 시작 ===")
  console.log("📧 조회할 이메일:", email)

  try {
    if (!supabase) {
      return { success: false, error: { message: "Supabase 클라이언트가 초기화되지 않음" } }
    }

    console.log("🔄 Supabase 쿼리 실행 중...")

    // .maybeSingle() 사용으로 406 오류 방지
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email.toLowerCase().trim())
      .maybeSingle() // 0개 또는 1개 결과를 기대, 없어도 오류 없음

    console.log("📦 조회 응답 데이터:", JSON.stringify(data, null, 2))
    console.log("⚠️ 조회 에러:", JSON.stringify(error, null, 2))

    if (error) {
      console.error("❌ 사용자 조회 중 오류:", error)
      console.error("- 오류 코드:", error.code)
      console.error("- 오류 메시지:", error.message)
      return { success: false, error }
    }

    if (!data) {
      console.log("📭 사용자가 존재하지 않음:", email)
      return { success: false, error: null, notFound: true }
    }

    console.log("✅ 사용자 조회 성공:", data)
    return { success: true, data }
  } catch (error) {
    console.error("🚨 사용자 조회 중 예상치 못한 오류:", error)
    return { success: false, error: { message: error instanceof Error ? error.message : "알 수 없는 오류" } }
  }
}

// 연결 테스트 함수
export async function testSupabaseConnection() {
  console.log("🧪 === Supabase 연결 테스트 ===")

  try {
    if (!supabase) {
      console.error("❌ Supabase 클라이언트가 없습니다.")
      return { success: false, error: "클라이언트 없음" }
    }

    // users 테이블 접근 테스트 (.maybeSingle() 사용)
    console.log("🔍 users 테이블 접근 테스트...")
    const { data, error } = await supabase.from("users").select("count", { count: "exact" }).limit(1).maybeSingle()

    console.log("📦 연결 테스트 응답:", JSON.stringify(data, null, 2))
    console.log("⚠️ 연결 테스트 에러:", JSON.stringify(error, null, 2))

    if (error) {
      console.error("❌ 테이블 접근 실패:", error)
      return { success: false, error }
    }

    console.log("✅ users 테이블 접근 성공!")
    console.log("📊 테스트 결과:", data)

    return { success: true, data }
  } catch (error) {
    console.error("🚨 연결 테스트 중 오류:", error)
    return { success: false, error }
  }
}

// NextAuth와 호환되는 사용자 동기화 함수
export async function syncUserToUsersTable(sessionUser: {
  id?: string
  email?: string | null
  name?: string | null
}) {
  console.log("🔄 === NextAuth 사용자 동기화 시작 ===")
  console.log("👤 NextAuth 사용자 정보:")
  console.log("- ID:", sessionUser.id)
  console.log("- Email:", sessionUser.email)
  console.log("- Name:", sessionUser.name)

  try {
    if (!sessionUser.email || !sessionUser.name) {
      console.warn("⚠️ 필수 사용자 정보 누락")
      return { success: false, error: { message: "필수 사용자 정보 누락" } }
    }

    // saveUserData 함수 사용 (image 필드 제거)
    const result = await saveUserData({
      id: sessionUser.id || `user-${Date.now()}`,
      email: sessionUser.email,
      name: sessionUser.name,
    })

    if (result.success) {
      console.log("✅ NextAuth 사용자 동기화 완료")
    } else {
      console.error("❌ NextAuth 사용자 동기화 실패:", result.error)
    }

    return result
  } catch (error) {
    console.error("🚨 NextAuth 사용자 동기화 중 오류:", error)
    return { success: false, error: { message: error instanceof Error ? error.message : "알 수 없는 오류" } }
  }
}

// 🔧 개선된 클라이언트에서 사용자 저장 (image 필드 제거)
export async function saveUserFromClient(user: {
  id: string
  email: string
  name: string
}) {
  console.log("🌐 === 클라이언트에서 사용자 저장 ===")
  console.log("📤 전송할 사용자 데이터:", JSON.stringify(user, null, 2))

  try {
    console.log("📡 API 요청 시작: POST /api/save-user")

    // 올바른 헤더 설정으로 API 엔드포인트를 통해 저장
    const response = await fetch("/api/save-user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(user),
    })

    console.log("📡 API 응답 상태:", response.status, response.statusText)
    console.log("📡 API 응답 헤더:", Object.fromEntries(response.headers.entries()))

    let result
    try {
      result = await response.json()
      console.log("📡 API 응답 데이터:", JSON.stringify(result, null, 2))
    } catch (jsonError) {
      console.error("❌ JSON 파싱 오류:", jsonError)
      const textResponse = await response.text()
      console.error("📄 응답 텍스트:", textResponse)
      return { success: false, error: "응답 JSON 파싱 실패" }
    }

    if (response.ok && result.success) {
      console.log("✅ 클라이언트 저장 성공:", result)
      return { success: true, data: result.data }
    } else {
      console.error("❌ 클라이언트 저장 실패:")
      console.error("- HTTP 상태:", response.status)
      console.error("- 응답 결과:", result)
      return { success: false, error: result.error || "저장 실패" }
    }
  } catch (error) {
    console.error("🚨 클라이언트 저장 중 네트워크 오류:", error)
    return { success: false, error: error instanceof Error ? error.message : "네트워크 오류" }
  }
}

// saveUserToSupabase - Supabase에 사용자 저장 (image 필드 제거)
export async function saveUserToSupabase(user: {
  id: string
  email: string
  name: string
}) {
  console.log("💾 === Supabase에 사용자 저장 (별칭 함수) ===")
  return await saveUserData(user)
}

// 하위 호환성을 위한 별칭들
export const syncExistingUserToSupabase = syncUserToUsersTable

// 타입 정의 (image 필드 제거)
export interface UserData {
  id: string
  email: string
  name: string
}

export interface SaveResult {
  success: boolean
  data?: any
  error?: any
  alreadyExists?: boolean
  notFound?: boolean
}
