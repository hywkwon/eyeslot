"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import AuthWrapper from "@/components/auth-wrapper"
import LogoutButton from "@/components/logout-button"
import UserManagementDashboard from "@/components/user-management-dashboard"

export default function Home() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const email = localStorage.getItem("lens-user-email")
      setIsLoggedIn(!!email)

      if (!email) {
        router.replace("/login")
      } else {
        setIsLoading(false)
      }
    }
  }, [router])

  if (isLoading && !isLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p>리다이렉트 중...</p>
      </div>
    )
  }

  // 로그인된 상태일 때 홈 화면
  if (isLoggedIn) {
    return (
      <AuthWrapper>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8">
          <div className="w-full flex justify-end mb-4">
            <LogoutButton />
          </div>

          <div>
            <h1 className="text-3xl font-bold mb-6 text-primary">eyeslot에 오신 것을 환영합니다</h1>
            <p className="text-lg mb-8">한국의 프리미엄 안경 서비스</p>
          </div>

          {/* 신규/기존 사용자 통합 관리 대시보드 */}
          <UserManagementDashboard />

          <div className="space-y-4 w-full max-w-md">
            <button
              onClick={() => router.push("/booking-form")}
              className="block w-full bg-primary text-white px-6 py-3 rounded-md hover:bg-primary/90 transition-colors"
            >
              예약하기
            </button>
            <button
              onClick={() => router.push("/booking-lookup")}
              className="block w-full border border-primary text-primary px-6 py-3 rounded-md hover:bg-primary/10 transition-colors"
            >
              내 예약 확인하기
            </button>
          </div>
        </div>
      </AuthWrapper>
    )
  }

  return null
}
