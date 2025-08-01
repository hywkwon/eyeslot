"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { syncUserToUsersTable, getUserFromSupabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  User,
  Database,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  UserPlus,
  Users,
  FolderSyncIcon as Sync,
} from "lucide-react"

interface SupabaseUser {
  id: string
  email: string
  name: string
  image?: string
  created_at: string
  updated_at: string
}

export default function UserManagementDashboard() {
  const { data: session, status } = useSession()
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null)
  const [syncStatus, setSyncStatus] = useState<"idle" | "checking" | "syncing" | "synced" | "error">("idle")
  const [syncMessage, setSyncMessage] = useState<string>("")
  const [isInSupabase, setIsInSupabase] = useState<boolean | null>(null)
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)
  const [userType, setUserType] = useState<"new" | "existing" | "unknown">("unknown")

  // 세션이 로드되면 자동으로 사용자 상태 확인 및 동기화
  useEffect(() => {
    if (status === "authenticated" && session?.user?.email) {
      checkUserStatusAndSync()
    }
  }, [session, status])

  const checkUserStatusAndSync = async () => {
    if (!session?.user?.email) return

    setSyncStatus("checking")
    setSyncMessage("사용자 상태 확인 중...")

    try {
      console.log("🔍 === 사용자 상태 확인 및 동기화 시작 ===")

      // 먼저 Supabase에 사용자가 있는지 확인
      const existingUser = await getUserFromSupabase(session.user.email)

      if (existingUser.success && existingUser.data) {
        // 기존 사용자
        setIsInSupabase(true)
        setSupabaseUser(existingUser.data)
        setUserType("existing")
        setSyncStatus("synced")
        setSyncMessage("기존 사용자 - 이미 users 테이블에 저장되어 있습니다.")
        setLastSyncTime(new Date(existingUser.data.updated_at))
        console.log("✅ 기존 사용자 확인됨")

        // 기존 사용자 정보 업데이트
        await updateExistingUser()
      } else {
        // 신규 사용자 또는 동기화 필요
        setIsInSupabase(false)
        setUserType("new")
        setSyncStatus("syncing")
        setSyncMessage("신규 사용자 - users 테이블에 저장 중...")

        console.log("🆕 신규 사용자 또는 동기화 필요한 사용자")

        const syncResult = await syncUserToUsersTable({
          id: session.user.id,
          email: session.user.email,
          name: session.user.name,
        })

        if (syncResult.success) {
          setIsInSupabase(true)
          setSyncStatus("synced")
          setSyncMessage("신규 사용자 정보가 성공적으로 users 테이블에 저장되었습니다!")
          setLastSyncTime(new Date())
          console.log("✅ 신규 사용자 저장 완료")

          // 저장된 사용자 정보 다시 가져오기
          const updatedUser = await getUserFromSupabase(session.user.email)
          if (updatedUser.success) {
            setSupabaseUser(updatedUser.data)
          }
        } else {
          setSyncStatus("error")
          setSyncMessage(`저장 실패: ${syncResult.error?.message || "알 수 없는 오류"}`)
          console.error("❌ 신규 사용자 저장 실패:", syncResult.error)
        }
      }
    } catch (error) {
      setSyncStatus("error")
      setSyncMessage(`확인 중 오류 발생: ${error instanceof Error ? error.message : "알 수 없는 오류"}`)
      console.error("🚨 사용자 상태 확인 중 예상치 못한 오류:", error)
    }
  }

  const updateExistingUser = async () => {
    if (!session?.user?.email) return

    try {
      console.log("🔄 기존 사용자 정보 업데이트")

      const updateResult = await syncUserToUsersTable({
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
      })

      if (updateResult.success) {
        console.log("✅ 기존 사용자 정보 업데이트 완료")

        // 업데이트된 정보 다시 가져오기
        const updatedUser = await getUserFromSupabase(session.user.email)
        if (updatedUser.success) {
          setSupabaseUser(updatedUser.data)
          setLastSyncTime(new Date(updatedUser.data.updated_at))
        }
      }
    } catch (error) {
      console.error("🚨 기존 사용자 업데이트 중 오류:", error)
    }
  }

  const manualSync = async () => {
    if (!session?.user?.email) return

    setSyncStatus("syncing")
    setSyncMessage("수동 동기화 진행 중...")

    try {
      const syncResult = await syncUserToUsersTable({
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
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

        // 동기화된 정보 다시 가져오기
        const updatedUser = await getUserFromSupabase(session.user.email)
        if (updatedUser.success) {
          setSupabaseUser(updatedUser.data)
        }
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
        return <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
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

  const getUserTypeBadge = () => {
    switch (userType) {
      case "new":
        return (
          <Badge variant="default" className="text-xs bg-blue-600">
            <UserPlus className="h-3 w-3 mr-1" />
            신규 사용자
          </Badge>
        )
      case "existing":
        return (
          <Badge variant="secondary" className="text-xs">
            <Users className="h-3 w-3 mr-1" />
            기존 사용자
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="text-xs">
            확인 중
          </Badge>
        )
    }
  }

  return (
    <Card className="max-w-lg mx-auto border-l-4 border-l-green-500">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Database className="h-5 w-5 text-green-600" />
          신규/기존 사용자 통합 관리
          <div className="flex gap-1">
            {getUserTypeBadge()}
            {getStatusBadge()}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 동기화 상태 */}
        <div className="p-3 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center gap-2 mb-2">
            {getStatusIcon()}
            <span className="font-medium text-sm">동기화 상태</span>
          </div>
          <p className="text-sm text-green-700">{syncMessage}</p>
          {lastSyncTime && (
            <p className="text-xs text-green-600 mt-1">마지막 동기화: {lastSyncTime.toLocaleString("ko-KR")}</p>
          )}
        </div>

        {/* NextAuth 사용자 정보 */}
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-medium text-sm mb-2 flex items-center gap-1">
            <User className="h-4 w-4 text-blue-600" />
            NextAuth 인증 정보
          </h4>
          <div className="text-xs space-y-1">
            <p>
              <strong>이메일:</strong> {session?.user?.email}
            </p>
            <p>
              <strong>이름:</strong> {session?.user?.name}
            </p>
            <p>
              <strong>ID:</strong> {session?.user?.id}
            </p>
          </div>
        </div>

        {/* Supabase 사용자 정보 */}
        {supabaseUser && (
          <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
            <h4 className="font-medium text-sm mb-2 flex items-center gap-1">
              <Database className="h-4 w-4 text-purple-600" />
              Supabase users 테이블 정보
            </h4>
            <div className="text-xs space-y-1">
              <p>
                <strong>DB ID:</strong> {supabaseUser.id}
              </p>
              <p>
                <strong>이메일:</strong> {supabaseUser.email}
              </p>
              <p>
                <strong>이름:</strong> {supabaseUser.name}
              </p>
              <p>
                <strong>생성일:</strong> {new Date(supabaseUser.created_at).toLocaleString("ko-KR")}
              </p>
              <p>
                <strong>수정일:</strong> {new Date(supabaseUser.updated_at).toLocaleString("ko-KR")}
              </p>
            </div>
          </div>
        )}

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

        {/* 상태 요약 */}
        <div className="text-center text-xs text-muted-foreground bg-gray-50 p-3 rounded">
          <p>
            <strong>사용자 유형:</strong>{" "}
            {userType === "new" ? "신규 사용자" : userType === "existing" ? "기존 사용자" : "확인 중"} |{" "}
            <strong>Supabase 저장:</strong>{" "}
            <Badge variant={isInSupabase ? "default" : "destructive"} className="text-xs">
              {isInSupabase ? "✓ 저장됨" : "✗ 미저장"}
            </Badge>
          </p>
        </div>

        {/* 도움말 */}
        <Alert>
          <Database className="h-4 w-4" />
          <AlertDescription className="text-xs">
            <strong>자동 처리:</strong> 신규 사용자는 자동으로 저장되고, 기존 사용자는 정보가 업데이트됩니다.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
