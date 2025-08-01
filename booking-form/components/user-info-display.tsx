"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { getUserFromSupabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { User, Database, RefreshCw, CheckCircle, XCircle, Clock } from "lucide-react"

interface SupabaseUser {
  id: string
  email: string
  name: string
  image?: string
  created_at: string
  updated_at: string
}

export default function UserInfoDisplay() {
  const { data: session, status } = useSession()
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastChecked, setLastChecked] = useState<Date | null>(null)

  // 세션이 있을 때 Supabase에서 사용자 정보 가져오기
  useEffect(() => {
    if (session?.user?.email) {
      fetchSupabaseUser()
    }
  }, [session])

  const fetchSupabaseUser = async () => {
    if (!session?.user?.email) return

    setLoading(true)
    setError(null)

    try {
      console.log("🔍 Supabase에서 사용자 정보 조회 시작:", session.user.email)

      const result = await getUserFromSupabase(session.user.email)

      if (result.success) {
        setSupabaseUser(result.data)
        setLastChecked(new Date())
        console.log("✅ Supabase에서 사용자 정보 조회 성공:", result.data)
      } else {
        setError(result.error?.message || "사용자 정보를 찾을 수 없습니다")
        console.error("❌ Supabase에서 사용자 정보 조회 실패:", result.error)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류"
      setError(errorMessage)
      console.error("🚨 사용자 정보 조회 중 예상치 못한 오류:", error)
    } finally {
      setLoading(false)
    }
  }

  // 로그인하지 않은 경우
  if (status === "unauthenticated") {
    return null
  }

  // 로딩 중인 경우
  if (status === "loading") {
    return (
      <Card className="max-w-lg mx-auto">
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">인증 상태 확인 중...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          사용자 정보 대시보드
        </CardTitle>
        {lastChecked && (
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            마지막 확인: {lastChecked.toLocaleString("ko-KR")}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* NextAuth 사용자 정보 */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <User className="h-4 w-4 text-blue-600" />
            NextAuth 정보
            <Badge variant="secondary" className="text-xs">
              인증됨
            </Badge>
          </h3>
          <div className="text-sm space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">이메일:</span>
              <span className="text-blue-700">{session?.user?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">이름:</span>
              <span>{session?.user?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">ID:</span>
              <span className="font-mono text-xs">{session?.user?.id}</span>
            </div>
            {session?.user?.image && (
              <div className="flex justify-between items-center">
                <span className="font-medium">프로필:</span>
                <img src={session.user.image || "/placeholder.svg"} alt="Profile" className="w-8 h-8 rounded-full" />
              </div>
            )}
          </div>
        </div>

        {/* Supabase 사용자 정보 */}
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <Database className="h-4 w-4 text-green-600" />
            Supabase 데이터베이스 정보
            {supabaseUser && (
              <Badge variant="default" className="text-xs bg-green-600">
                저장됨
              </Badge>
            )}
          </h3>

          {loading ? (
            <div className="flex items-center gap-2 text-sm">
              <RefreshCw className="h-4 w-4 animate-spin text-green-600" />
              데이터베이스에서 조회 중...
            </div>
          ) : error ? (
            <div className="text-sm">
              <div className="flex items-center gap-2 text-red-600 mb-2">
                <XCircle className="h-4 w-4" />
                오류 발생
              </div>
              <p className="text-red-700 bg-red-100 p-2 rounded text-xs">{error}</p>
            </div>
          ) : supabaseUser ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-green-700 mb-2">
                <CheckCircle className="h-4 w-4" />
                Supabase에서 사용자 정보 확인됨
              </div>
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">DB ID:</span>
                  <span className="font-mono text-xs">{supabaseUser.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">이메일:</span>
                  <span className="text-green-700">{supabaseUser.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">이름:</span>
                  <span>{supabaseUser.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">생성일:</span>
                  <span className="text-xs">{new Date(supabaseUser.created_at).toLocaleString("ko-KR")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">수정일:</span>
                  <span className="text-xs">{new Date(supabaseUser.updated_at).toLocaleString("ko-KR")}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm">
              <div className="flex items-center gap-2 text-orange-600 mb-2">
                <XCircle className="h-4 w-4" />
                데이터베이스에서 찾을 수 없음
              </div>
              <p className="text-orange-700 bg-orange-100 p-2 rounded text-xs">
                사용자 정보가 아직 Supabase에 저장되지 않았습니다. 다시 로그인하거나 새로고침 버튼을 눌러주세요.
              </p>
            </div>
          )}
        </div>

        {/* 새로고침 버튼 */}
        <Button onClick={fetchSupabaseUser} disabled={loading} className="w-full" size="sm">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          {loading ? "조회 중..." : "Supabase 정보 새로고침"}
        </Button>

        {/* 상태 요약 */}
        <div className="text-center text-xs text-muted-foreground bg-gray-50 p-3 rounded">
          <p>
            <strong>상태:</strong> NextAuth{" "}
            <Badge variant="outline" className="text-xs">
              ✓ 연결됨
            </Badge>{" "}
            | Supabase{" "}
            <Badge variant={supabaseUser ? "default" : "destructive"} className="text-xs">
              {supabaseUser ? "✓ 저장됨" : "✗ 미저장"}
            </Badge>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
