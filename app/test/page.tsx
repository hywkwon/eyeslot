export default function TestPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">테스트 페이지</h1>
        <p className="text-lg">서버가 정상적으로 동작하고 있습니다!</p>
        <div className="mt-8 space-y-2">
          <p>환경변수 테스트:</p>
          <p>NEXT_PUBLIC_SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ 설정됨' : '❌ 설정안됨'}</p>
        </div>
      </div>
    </div>
  )
}