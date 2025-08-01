"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { syncExistingUserToSupabase, getUserFromSupabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FolderSyncIcon as Sync, CheckCircle, XCircle, Clock, User, Database } from "lucide-react"

export default function UserSyncManager() {
  const { data: session, status } = useSession()
  const [syncStatus, setSyncStatus] = useState<"idle" | "checking" | "syncing" | "synced" | "error">("idle")
  const [syncMessage, setSyncMessage] = useState<string>("")
  const [isInSupabase, setIsInSupabase] = useState<boolean | null>(null)
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)

  // 세션이 로드되면 자동으로 동기화 확인
  useEffect(() => {
    if (status === "authenticated" && session?.user?.email) {
      checkAndSyncUser()
    }
  }, [session, status])

  const checkAndSyncUser = async () => {
    if (!session?.user?.email) return

    setSyncStatus("checking")
    setSyncMessage("사용자 동기화 상태 확인 중...")

    try {
      // 먼저 Supabase에 사용자가 있는지 확인
      const existingUser = await getUserFromSupabase(session.user.email)

      if (existingUser.success && existingUser.data) {
        // 이미 존재함
        setIsInSupabase(true)
        setSyncStatus("synced")
        setSyncMessage("사용자 정보가 이미 Supabase에 저장되어 있습니다.")
        setLastSyncTime(new Date(existingUser.data.updated_at))
        console.log("✅ 사용자가 이미 Supabase에 존재함")
      } else {
        // 존재하지 않음 - 동기화 필요
        setIsInSupabase(false)
        setSyncStatus("syncing")
        setSyncMessage("기존 사용자 정보를 Supabase에 저장 중...")

        console.log("🔄 기존 사용자 Supabase 동기화 시작")

        const syncResult = await syncExistingUserToSupabase({
          id: session.user.id,
          email: session.user.email,
          name: session.user.name,
          image: session.user.image,
        })

        if (syncResult.success) {
          setIsInSupabase(true)
          setSyncStatus("synced")
          setSyncMessage("기존 사용자 정보가 성공적으로 Supabase에 저장되었습니다!")
          setLastSyncTime(new Date())
          console.log("✅ 기존 사용자 동기화 완료")
        } else {
          setSyncStatus("error")
          setSyncMessage(`동기화 실패: ${syncResult.error?.message || "알 수 없는 오류"}`)
          console.error("❌ 기존 사용자 동기화 실패:", syncResult.error)
        }
      }
    } catch (error) {
      setSyncStatus("error")
      setSyncMessage(`동기화 중 오류 발생: ${error instanceof Error ? error.message : "알 수 없는 오류"}`)
      console.error("🚨 사용자 동기화 중 예상치 못한 오류:", error)
    }
  }

  const manualSync = async () => {
    if (!session?.user?.email) return

    setSyncStatus("syncing")
    setSyncMessage("수동 동기화 진행 중...")

    try {
      const syncResult = await syncExistingUserToSupabase({
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        image: session.user.image,
      })

      if (syncResult.success) {
        setIsInSupabase(true)
        setSyncStatus("synced")
        setSyncMessage(
          syncResult.alreadyExists
            ? "사용자 정보가 이미 최신 상태입니다."
            : "사용자 정보가 성공적으로 동기화되었습니다!",
        )
        setLastSyncTime(new Date())
      } else {
        setSyncStatus("error")
        setSyncMessage(`동기화 실패: ${syncResult.error?.message || "알 수 없는 오류"}`)
      }
    } catch (error) {
      setSyncStatus("error")
      setSyncMessage(`동기화 중 오류 발생: ${error instanceof Error ? error.message : "알 수 없는 오류"}`)
    }
  }

  // 로그인하지 않은 경우 표시하지 않음
  if (status !== "authenticated") {
    return null
  }

  const getStatusIcon = () => {
    switch (syncStatus) {
      case "checking":
      case "syncing":
        return <Sync className="h-4 w-4 animate-spin text-blue-500" />
      case "synced":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = () => {
    switch (syncStatus) {
      case "checking":
        return (
          <Badge variant="secondary" className="text-xs">
            확인 중
          </Badge>
        )
      case "syncing":
        return (
          <Badge variant="secondary" className="text-xs">
            동기화 중
          </Badge>
        )
      case "synced":
        return (
          <Badge variant="default" className="text-xs bg-green-600">
            동기화 완료
          </Badge>
        )
      case "error":
        return (
          <Badge variant="destructive" className="text-xs">
            오류
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="text-xs">
            대기 중
          </Badge>
        )
    }
  }

  return (
    <Card className="max-w-lg mx-auto border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Database className="h-5 w-5 text-blue-600" />
          사용자 동기화 관리자
          {getStatusBadge()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 동기화 상태 */}
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            {getStatusIcon()}
            <span className="font-medium text-sm">동기화 상태</span>
          </div>
          <p className="text-sm text-blue-700">{syncMessage}</p>
          {lastSyncTime && (
            <p className="text-xs text-blue-600 mt-1">마지막 동기화: {lastSyncTime.toLocaleString("ko-KR")}</p>
          )}
        </div>

        {/* 사용자 정보 요약 */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-sm mb-2 flex items-center gap-1">
            <User className="h-4 w-4" />
            현재 사용자 정보
          </h4>
          <div className="text-xs space-y-1">
            <p>
              <strong>이메일:</strong> {session?.user?.email}
            </p>
            <p>
              <strong>이름:</strong> {session?.user?.name}
            </p>
            <p>
              <strong>Supabase 저장 여부:</strong>{" "}
              {isInSupabase === null ? (
                <span className="text-gray-500">확인 중...</span>
              ) : isInSupabase ? (
                <span className="text-green-600">✓ 저장됨</span>
              ) : (
                <span className="text-red-600">✗ 미저장</span>
              )}
            </p>
          </div>
        </div>

        {/* 수동 동기화 버튼 */}
        <Button
          onClick={manualSync}
          disabled={syncStatus === "checking" || syncStatus === "syncing"}
          className="w-full"
          size="sm"
          variant={syncStatus === "synced" ? "outline" : "default"}
        >
          <Sync className={`h-4 w-4 mr-2 ${syncStatus === "syncing" ? "animate-spin" : ""}`} />
          {syncStatus === "syncing" ? "동기화 중..." : "수동 동기화"}
        </Button>

        {/* 도움말 */}
        <div className="text-xs text-muted-foreground bg-gray-50 p-2 rounded">
          <p>
            <strong>자동 동기화:</strong> 로그인 시 자동으로 사용자 정보를 Supabase에 저장합니다.
          </p>
          <p>
            <strong>수동 동기화:</strong> 필요시 수동으로 동기화를 실행할 수 있습니다.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
