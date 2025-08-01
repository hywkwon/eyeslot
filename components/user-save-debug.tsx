"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { getUserFromSupabase, testSupabaseConnection, saveUserData } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, RefreshCw, Database, User, TestTube } from "lucide-react"

export default function UserSaveDebug() {
  const { data: session, status } = useSession()
  const [supabaseUser, setSupabaseUser] = useState<any>(null)
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "testing" | "success" | "error">("idle")
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle")
  const [message, setMessage] = useState("")
  const [lastChecked, setLastChecked] = useState<Date | null>(null)

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      testConnection()
      checkUserInSupabase()
    }
  }, [session, status])

  const testConnection = async () => {
    setConnectionStatus("testing")
    setMessage("Supabase 연결 테스트 중...")

    try {
      const result = await testSupabaseConnection()

      if (result.success) {
        setConnectionStatus("success")
        setMessage("Supabase 연결 성공!")
      } else {
        setConnectionStatus("error")
        setMessage(`연결 실패: ${result.error}`)
      }
    } catch (error) {
      setConnectionStatus("error")
      setMessage(`연결 테스트 오류: ${error}`)
    }
  }

  const checkUserInSupabase = async () => {
    if (!session?.user?.email) return

    try {
      const result = await getUserFromSupabase(session.user.email)

      if (result.success && result.data) {
        setSupabaseUser(result.data)
        setLastChecked(new Date())
      } else if (result.notFound) {
        setSupabaseUser(null)
        setLastChecked(new Date())
      }
    } catch (error) {
      console.error("사용자 조회 오류:", error)
    }
  }

  const manualSave = async () => {
    if (!session?.user) return

    setSaveStatus("saving")
    setMessage("수동으로 사용자 저장 중...")

    try {
      const result = await saveUserData({
        id: session.user.id || `user-${Date.now()}`,
        email: session.user.email || "",
        name: session.user.name || "",
        image: session.user.image || "",
      })

      if (result.success) {
        setSaveStatus("success")
        setMessage("사용자 저장 성공!")
        await checkUserInSupabase() // 저장 후 다시 확인
      } else {
        setSaveStatus("error")
        setMessage(`저장 실패: ${result.error}`)
      }
    } catch (error) {
      setSaveStatus("error")
      setMessage(`저장 오류: ${error}`)
    }
  }

  if (status !== "authenticated") {
    return null
  }

  return (
    <Card className="max-w-2xl mx-auto mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          사용자 저장 디버그 도구
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Supabase 연결 상태 */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
            <Database className="h-4 w-4 text-blue-600" />
            Supabase 연결 상태
            {connectionStatus === "testing" && <RefreshCw className="h-4 w-4 animate-spin" />}
            {connectionStatus === "success" && <CheckCircle className="h-4 w-4 text-green-500" />}
            {connectionStatus === "error" && <XCircle className="h-4 w-4 text-red-500" />}
          </h3>
          <p className="text-sm text-blue-700">{message}</p>
          <Button onClick={testConnection} size="sm" className="mt-2">
            연결 테스트
          </Button>
        </div>

        {/* NextAuth 사용자 정보 */}
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
            <User className="h-4 w-4 text-green-600" />
            NextAuth 사용자 정보
          </h3>
          <div className="text-sm space-y-1">
            <p>
              <strong>ID:</strong> {session?.user?.id}
            </p>
            <p>
              <strong>Email:</strong> {session?.user?.email}
            </p>
            <p>
              <strong>Name:</strong> {session?.user?.name}
            </p>
            <p>
              <strong>Image:</strong> {session?.user?.image}
            </p>
          </div>
        </div>

        {/* Supabase 사용자 정보 */}
        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
          <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
            <Database className="h-4 w-4 text-purple-600" />
            Supabase users 테이블 정보
            {supabaseUser ? (
              <Badge variant="default" className="text-xs">
                저장됨
              </Badge>
            ) : (
              <Badge variant="destructive" className="text-xs">
                미저장
              </Badge>
            )}
          </h3>

          {supabaseUser ? (
            <div className="text-sm space-y-1">
              <p>
                <strong>DB ID:</strong> {supabaseUser.id}
              </p>
              <p>
                <strong>Email:</strong> {supabaseUser.email}
              </p>
              <p>
                <strong>Name:</strong> {supabaseUser.name}
              </p>
              <p>
                <strong>생성일:</strong> {new Date(supabaseUser.created_at).toLocaleString()}
              </p>
              <p>
                <strong>수정일:</strong> {new Date(supabaseUser.updated_at).toLocaleString()}
              </p>
            </div>
          ) : (
            <p className="text-sm text-purple-700">사용자가 users 테이블에 저장되지 않았습니다.</p>
          )}

          {lastChecked && <p className="text-xs text-purple-600 mt-2">마지막 확인: {lastChecked.toLocaleString()}</p>}
        </div>

        {/* 수동 저장 */}
        <div className="flex gap-2">
          <Button onClick={manualSave} disabled={saveStatus === "saving"} className="flex items-center gap-2">
            {saveStatus === "saving" ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Database className="h-4 w-4" />
            )}
            수동 저장
          </Button>

          <Button onClick={checkUserInSupabase} variant="outline" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            다시 확인
          </Button>
        </div>

        {/* 상태 메시지 */}
        {(saveStatus === "success" || saveStatus === "error") && (
          <Alert variant={saveStatus === "error" ? "destructive" : "default"}>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
