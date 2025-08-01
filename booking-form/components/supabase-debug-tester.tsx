"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase, saveUserFromClient } from "@/lib/supabase"

export default function SupabaseDebugTester() {
  const { data: session } = useSession()
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const testDirectUpsert = async () => {
    if (!session?.user) {
      setError("로그인이 필요합니다")
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      console.log("🧪 직접 Supabase upsert 테스트 시작...")
      console.log("사용자 정보:", session.user)

      if (!supabase) {
        throw new Error("Supabase 클라이언트가 초기화되지 않았습니다")
      }

      // 1. 테이블 존재 확인
      try {
        const { count, error: countError } = await supabase.from("users").select("*", { count: "exact", head: true })

        if (countError) {
          console.error("테이블 접근 오류:", countError)
          setError(`테이블 접근 오류: ${countError.message}`)
          return
        }

        console.log("현재 users 테이블 레코드 수:", count)
      } catch (tableError) {
        console.error("테이블 확인 오류:", tableError)
      }

      // 2. 직접 upsert 실행 (image 필드 제거)
      const userData = {
        id: session.user.id || `manual-${Date.now()}`,
        email: session.user.email || "",
        name: session.user.name || "",
      }

      console.log("저장할 데이터:", userData)

      const { data, error } = await supabase
        .from("users")
        .upsert(userData, {
          onConflict: "email",
          ignoreDuplicates: false,
        })
        .select()

      if (error) {
        console.error("Upsert 오류:", error)
        setError(`Upsert 실패: ${error.message}`)
        return
      }

      console.log("Upsert 성공:", data)
      setResult({ type: "direct_upsert", data })
    } catch (e) {
      console.error("예상치 못한 오류:", e)
      setError(`오류 발생: ${e instanceof Error ? e.message : "알 수 없는 오류"}`)
    } finally {
      setLoading(false)
    }
  }

  const testApiSave = async () => {
    if (!session?.user) {
      setError("로그인이 필요합니다")
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      console.log("🌐 API를 통한 사용자 저장 테스트...")

      const saveResult = await saveUserFromClient({
        id: session.user.id || `api-test-${Date.now()}`,
        email: session.user.email || "",
        name: session.user.name || "",
      })

      if (saveResult.success) {
        console.log("API 저장 성공:", saveResult)
        setResult({ type: "api_save", data: saveResult.data })
      } else {
        setError(`API 저장 실패: ${saveResult.error}`)
      }
    } catch (e) {
      setError(`API 테스트 오류: ${e instanceof Error ? e.message : "알 수 없는 오류"}`)
    } finally {
      setLoading(false)
    }
  }

  const checkUserInTable = async () => {
    if (!session?.user?.email) {
      setError("이메일 정보가 없습니다")
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      if (!supabase) {
        throw new Error("Supabase 클라이언트가 초기화되지 않았습니다")
      }

      // .maybeSingle() 사용으로 406 오류 방지
      const { data, error } = await supabase.from("users").select("*").eq("email", session.user.email).maybeSingle()

      if (error) {
        setError(`조회 오류: ${error.message}`)
        return
      }

      if (!data) {
        setError("사용자를 찾을 수 없습니다")
        return
      }

      console.log("사용자 조회 결과:", data)
      setResult({ type: "user_lookup", data })
    } catch (e) {
      setError(`오류 발생: ${e instanceof Error ? e.message : "알 수 없는 오류"}`)
    } finally {
      setLoading(false)
    }
  }

  if (!session) {
    return null
  }

  return (
    <Card className="max-w-2xl mx-auto mt-6">
      <CardHeader>
        <CardTitle>🔧 Supabase 디버그 테스터 (완전 개선됨)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium mb-2">현재 로그인 정보</h3>
          <pre className="text-xs bg-white p-2 rounded overflow-auto">{JSON.stringify(session.user, null, 2)}</pre>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <Button onClick={testDirectUpsert} disabled={loading} size="sm">
            {loading ? "처리 중..." : "직접 Upsert"}
          </Button>
          <Button onClick={testApiSave} disabled={loading} variant="outline" size="sm">
            {loading ? "처리 중..." : "API 저장"}
          </Button>
          <Button onClick={checkUserInTable} disabled={loading} variant="secondary" size="sm">
            {loading ? "조회 중..." : "사용자 조회"}
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {result && (
          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="font-medium mb-2">✅ 성공 결과 ({result.type})</h3>
            <pre className="text-xs bg-white p-2 rounded overflow-auto">{JSON.stringify(result.data, null, 2)}</pre>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
