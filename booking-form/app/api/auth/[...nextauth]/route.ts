import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import type { NextAuthOptions } from "next-auth"
import { saveUserData, testSupabaseConnection, supabase } from "@/lib/supabase"

// 🔍 환경변수 점검
console.log("🔧 === NextAuth 환경변수 점검 ===")
console.log("GOOGLE_CLIENT_ID 존재:", !!process.env.GOOGLE_CLIENT_ID)
console.log("GOOGLE_CLIENT_SECRET 존재:", !!process.env.GOOGLE_CLIENT_SECRET)
console.log("NEXTAUTH_SECRET 존재:", !!process.env.NEXTAUTH_SECRET)

if (!process.env.GOOGLE_CLIENT_ID) {
  console.error("❌ GOOGLE_CLIENT_ID 환경변수가 없습니다")
}

if (!process.env.GOOGLE_CLIENT_SECRET) {
  console.error("❌ GOOGLE_CLIENT_SECRET 환경변수가 없습니다")
}

// NextAuth 설정
export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
    error: "/auth/error",
  },
  debug: process.env.NODE_ENV === "development",
  callbacks: {
    // 🔍 구글 로그인 처리 코드 점검 - JWT 콜백
    async jwt({ token, user, account }) {
      // 구글 로그인 성공 시 실행
      if (user && account?.provider === "google") {
        console.log("🔐 === 구글 로그인 성공! ===")

        // 🔍 user 객체 점검
        console.log("👤 구글에서 반환된 user 객체:")
        console.log("- user.id:", user.id)
        console.log("- user.email:", user.email)
        console.log("- user.name:", user.name)
        console.log("[DEBUG] user object after Google login:", JSON.stringify(user, null, 2))

        token.id = user.id

        // Supabase 연결 테스트 먼저 실행
        console.log("🧪 Supabase 연결 테스트 실행...")
        const connectionTest = await testSupabaseConnection()

        if (!connectionTest.success) {
          console.error("❌ Supabase 연결 실패, 사용자 저장 건너뜀")
          console.error("연결 오류:", connectionTest.error)
          return token
        }

        console.log("✅ Supabase 연결 확인됨, 사용자 저장 진행...")

        try {
          // 🔍 saveUserData 함수 호출 - image 필드 제거
          console.log("💾 사용자 데이터 저장 시작...")

          const userToSave = {
            id: user.id,
            email: user.email || "",
            name: user.name || "",
          }

          console.log("[DEBUG] userToSave object before saving:", JSON.stringify(userToSave, null, 2))

          // 메인 저장 시도
          const saveResult = await saveUserData(userToSave)

          if (saveResult.success) {
            console.log("✅ 구글 로그인 후 사용자 저장 성공!")
            console.log("💾 저장 결과:", saveResult.data)
          } else {
            console.error("❌ 구글 로그인 후 사용자 저장 실패:")
            console.error("저장 오류:", saveResult.error)

            // 🔄 직접 upsert 백업 시도 (image 필드 제거)
            console.log("🔄 직접 upsert 백업 시도...")
            if (supabase) {
              try {
                const { data: directData, error: directError } = await supabase
                  .from("users")
                  .upsert({
                    id: user.id,
                    email: user.email || "",
                    name: user.name || "",
                  })
                  .select()

                if (directError) {
                  console.error("[ERROR] Failed to directly upsert user data:", directError)
                } else {
                  console.log("[SUCCESS] User data directly saved via backup:", directData)
                }
              } catch (directUpsertError) {
                console.error("[ERROR] Exception during direct upsert backup:", directUpsertError)
              }
            }

            // 🔄 재시도 로직
            console.log("🔄 3초 후 재시도...")
            setTimeout(async () => {
              console.log("🔄 사용자 저장 재시도 중...")
              const retryResult = await saveUserData(userToSave)

              if (retryResult.success) {
                console.log("✅ 재시도 저장 성공!")
              } else {
                console.error("❌ 재시도 저장도 실패:", retryResult.error)
              }
            }, 3000)
          }
        } catch (error) {
          console.error("🚨 사용자 저장 중 예상치 못한 오류:", error)
          console.error("🚨 오류 상세:", error instanceof Error ? error.message : "알 수 없는 오류")
          console.error("🚨 오류 스택:", error instanceof Error ? error.stack : "스택 없음")
        }
      }

      return token
    },

    // 세션 콜백
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string
      }

      // 🔍 세션 정보 점검
      console.log("🔍 세션 생성됨:")
      console.log("- session.user.id:", session.user?.id)
      console.log("- session.user.email:", session.user?.email)
      console.log("- session.user.name:", session.user?.name)

      return session
    },
  },
  events: {
    // 🔍 로그인 이벤트 점검
    async signIn({ user, account, profile }) {
      console.log("🎯 === 로그인 이벤트 발생 ===")
      console.log("👤 로그인 이벤트 사용자 정보:")
      console.log("- Provider:", account?.provider)
      console.log("- User ID:", user.id)
      console.log("- User Email:", user.email)
      console.log("- User Name:", user.name)

      // 구글 로그인인 경우 추가 백업 저장 (image 필드 제거)
      if (account?.provider === "google" && user.email && user.name) {
        console.log("🔄 로그인 이벤트에서 백업 저장 시도...")

        // 5초 후 백그라운드에서 추가 저장 시도
        setTimeout(async () => {
          try {
            console.log("🔄 백그라운드 백업 저장 실행...")

            const backupResult = await saveUserData({
              id: user.id,
              email: user.email,
              name: user.name,
            })

            if (backupResult.success) {
              console.log("✅ 백그라운드 백업 저장 성공!")
            } else {
              console.error("❌ 백그라운드 백업 저장 실패:", backupResult.error)
            }
          } catch (error) {
            console.error("🚨 백그라운드 백업 저장 중 오류:", error)
          }
        }, 5000)
      }

      return true
    },
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
