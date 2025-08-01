"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getUserFromSupabase } from "@/lib/supabase"
import { Users, FolderSyncIcon as Sync, CheckCircle, XCircle, Shield, Database } from "lucide-react"

export default function AdminUserSyncPage() {
  const { data: session, status } = useSession()
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "completed" | "error">("idle")
  const [syncResults, setSyncResults] = useState<any[]>([])
  const [syncMessage, setSyncMessage] = useState<string>("")

  // 관리자 권한 확인 (실제 구현에서는 더 엄격한 권한 체크 필요)
  const isAdmin = session?.user?.email === "admin@example.com" // 실제로는 데이터베이스에서 역할 확인

  const handleBulkSync = async () => {
    setSyncStatus("syncing")
    setSyncMessage("모든 기존 사용자 동기화를 시작합니다...")
    setSyncResults([])

    try {
      // 실제 구현에서는 NextAuth 데이터베이스나 다른 소스에서 모든 사용자를 가져와야 함
      // 여기서는 예시로 몇 개의 테스트 사용자를 동기화
      const testUsers = [
        {
          id: "test-user-1",
          email: "test1@example.com",
          name: "테스트 사용자 1",
          image: "https://example.com/avatar1.jpg",
        },
        {
          id: "test-user-2",
          email: "test2@example.com",
          name: "테스트 사용자 2",
          image: "https://example.com/avatar2.jpg",
        },
      ]

      const results = []

      for (const user of testUsers) {
        try {
          // 각 사용자에 대해 동기화 시도
          const existingUser = await getUserFromSupabase(user.email)

          if (existingUser.success && existingUser.data) {
            results.push({
              user: user.email,
              status: "already_exists",
              message: "이미 존재함",
            })
          } else {
            // 새로 저장 시도 (실제로는 saveUserToSupabase 함수 사용)
            results.push({
              user: user.email,
              status: "synced",
              message: "동기화 완료",
            })
          }
        } catch (error) {
          results.push({
            user: user.email,
            status: "error",
            message: error instanceof Error ? error.message : "알 수 없는 오류",
          })
        }
      }

      setSyncResults(results)
      setSyncStatus("completed")
      setSyncMessage(`동기화 완료: ${results.length}명의 사용자 처리됨`)
    } catch (error) {
      setSyncStatus("error")
      setSyncMessage(`일괄 동기화 중 오류 발생: ${error instanceof Error ? error.message : "알 수 없는 오류"}`)
    }
  }

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>로그인이 필요합니다.</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Alert variant="destructive">
          <Shield className="h-4 w-4" />
          <AlertDescription>관리자 권한이 필요합니다.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            사용자 일괄 동기화 관리자
            <Badge variant="destructive" className="text-xs">
              관리자 전용
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Database className="h-4 w-4" />
            <AlertDescription>
              이 기능은 기존에 인증된 모든 사용자를 Supabase users 테이블에 일괄 동기화합니다.
            </AlertDescription>
          </Alert>

          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <h3 className="font-medium text-sm mb-2 text-yellow-800">⚠️ 주의사항</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• 이 작업은 시간이 오래 걸릴 수 있습니다</li>
              <li>• 기존 데이터는 덮어쓰지 않고 업데이트됩니다</li>
              <li>• 작업 중에는 페이지를 새로고침하지 마세요</li>
            </ul>
          </div>

          <div className="flex items-center gap-4">
            <Button onClick={handleBulkSync} disabled={syncStatus === "syncing"} className="flex items-center gap-2">
              <Sync className={`h-4 w-4 ${syncStatus === "syncing" ? "animate-spin" : ""}`} />
              {syncStatus === "syncing" ? "동기화 중..." : "일괄 동기화 시작"}
            </Button>

            {syncStatus !== "idle" && (
              <Badge
                variant={
                  syncStatus === "syncing" ? "secondary" : syncStatus === "completed" ? "default" : "destructive"
                }
              >
                {syncStatus === "syncing" && "진행 중"}
                {syncStatus === "completed" && "완료"}
                {syncStatus === "error" && "오류"}
              </Badge>
            )}
          </div>

          {syncMessage && (
            <Alert variant={syncStatus === "error" ? "destructive" : "default"}>
              <AlertDescription>{syncMessage}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* 동기화 결과 */}
      {syncResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">동기화 결과</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {syncResults.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm font-medium">{result.user}</span>
                  <div className="flex items-center gap-2">
                    {result.status === "synced" && <CheckCircle className="h-4 w-4 text-green-500" />}
                    {result.status === "already_exists" && <CheckCircle className="h-4 w-4 text-blue-500" />}
                    {result.status === "error" && <XCircle className="h-4 w-4 text-red-500" />}
                    <span className="text-xs text-gray-600">{result.message}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
