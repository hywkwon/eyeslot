"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { saveUserFromClient, getUserFromSupabase } from "@/lib/supabase"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, RefreshCw, AlertTriangle } from "lucide-react"

export default function UserSaveBackup() {
  const { data: session, status } = useSession()
  const [saveStatus, setSaveStatus] = useState<"idle" | "checking" | "saving" | "success" | "error">("idle")
  const [message, setMessage] = useState("")
  const [retryCount, setRetryCount] = useState(0)
  const [lastError, setLastError] = useState<any>(null)

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      checkAndSaveUser()
    }
  }, [session, status])

  const checkAndSaveUser = async () => {
    if (!session?.user?.email) return

    setSaveStatus("checking")
    setMessage("사용자 저장 상태 확인 중...")

    try {
      console.log("🔍 사용자 존재 여부 확인 중...")

      // 먼저 Supabase에 사용자가 있는지 확인
      const existingUser = await getUserFromSupabase(session.user.email)

      if (existingUser.success && existingUser.data) {
        setSaveStatus("success")
        setMessage("사용자 정보가 이미 저장되어 있습니다.")
        console.log("✅ 사용자가 이미 존재함")
        return
      }

      console.log("📝 사용자가 없음, 저장 시도...")

      // 사용자가 없으면 저장 시도
      await saveUser()
    } catch (error) {
      console.error("🚨 확인 중 오류:", error)
      setSaveStatus("error")
      setMessage(`확인 중 오류 발생: ${error instanceof Error ? error.message : "알 수 없는 오류"}`)
      setLastError(error)
    }
  }

  const saveUser = async () => {
    if (!session?.user?.email) return

    setSaveStatus("saving")
    setMessage("사용자 정보를 저장하는 중...")

    try {
      console.log("💾 클라이언트에서 사용자 저장 시도...")

      const saveResult = await saveUserFromClient({
        id: session.user.id || `user-${Date.now()}`,
        email: session.user.email,
        name: session.user.name || "",
      })

      if (saveResult.success) {
        setSaveStatus("success")
        setMessage("사용자 정보가 성공적으로 저장되었습니다!")
        setRetryCount(0)
        setLastError(null)
        console.log("✅ 클라이언트 저장 성공")
      } else {
        throw new Error(saveResult.error || "저장 실패")
      }
    } catch (error) {
      console.error("❌ 저장 실패:", error)
      setSaveStatus("error")
      setMessage(`저장 실패: ${error instanceof Error ? error.message : "알 수 없는 오류"}`)
      setLastError(error)
      setRetryCount((prev) => prev + 1)
    }
  }

  const retrySave = () => {
    console.log(`🔄 재시도 ${retryCount + 1}회차 시작...`)
    saveUser()
  }

  if (status !== "authenticated") {
    return null
  }

  const getIcon = () => {
    switch (saveStatus) {
      case "checking":
      case "saving":
        return <RefreshCw className="h-4 w-4 animate-spin" />
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    }
  }

  return (
    <div className="max-w-md mx-auto mt-4">
      <Alert variant={saveStatus === "error" ? "destructive" : "default"}>
        <div className="flex items-center gap-2">
          {getIcon()}
          <AlertDescription>{message}</AlertDescription>
        </div>

        {saveStatus === "error" && (
          <div className="mt-3 space-y-2">
            <Button onClick={retrySave} size="sm" variant="outline">
              다시 시도 ({retryCount}회 시도함)
            </Button>

            {lastError && (
              <details className="text-xs">
                <summary className="cursor-pointer text-gray-600">오류 상세 정보</summary>
                <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-auto">
                  {JSON.stringify(lastError, null, 2)}
                </pre>
              </details>
            )}
          </div>
        )}
      </Alert>
    </div>
  )
}
