"use client"

import { useEffect, useState } from 'react'

export default function KakaoRedirect() {
  const [showKakaoWarning, setShowKakaoWarning] = useState(false)

  useEffect(() => {
    // KakaoTalk 인앱 브라우저 감지
    const isKakaoTalk = /KAKAOTALK/i.test(navigator.userAgent)
    
    if (isKakaoTalk) {
      setShowKakaoWarning(true)
    }
  }, [])

  if (!showKakaoWarning) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gray-100 border-b border-gray-200 px-4 py-3 text-center">
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        <div className="flex-1 text-sm text-gray-900 font-medium">
          카카오톡 브라우저에서는 로그인이 제한될 수 있습니다. 스마트폰 브라우저를 사용해주세요.
        </div>
        <button
          onClick={() => setShowKakaoWarning(false)}
          className="ml-3 text-gray-600 hover:text-gray-800 text-lg font-medium"
          aria-label="닫기"
        >
          ×
        </button>
      </div>
    </div>
  )
}