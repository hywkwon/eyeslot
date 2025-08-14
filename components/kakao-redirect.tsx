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

  const handleOpenExternal = () => {
    const currentUrl = window.location.href
    const isAndroid = /Android/i.test(navigator.userAgent)
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent)
    
    if (isAndroid) {
      // Android: intent URL 사용
      const intentUrl = `intent://${window.location.host}${window.location.pathname}${window.location.search}#Intent;scheme=https;package=com.android.chrome;end`
      window.location.href = intentUrl
    } else if (isIOS) {
      // iOS에서는 자동 리디렉션이 제한되므로 수동 안내
      alert('iOS에서는 자동 이동이 제한됩니다.\n\n우상단 점 3개 메뉴(⋯)를 터치한 후\n"Safari에서 열기"를 선택해주세요.')
    } else {
      // 기타 환경
      window.open(currentUrl, '_blank') || (window.location.href = currentUrl)
    }
  }

  if (!showKakaoWarning) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-100 border-b border-yellow-300 p-4 text-center">
      <div className="max-w-md mx-auto">
        <p className="text-sm text-yellow-800 mb-2">
          ⚠️ 카카오톡 브라우저에서는 로그인이 제한될 수 있습니다
        </p>
        <div className="flex gap-2 justify-center">
          <button
            onClick={handleOpenExternal}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium"
          >
            외부 브라우저 열기
          </button>
          <button
            onClick={() => setShowKakaoWarning(false)}
            className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded text-sm font-medium"
          >
            계속하기
          </button>
        </div>
      </div>
    </div>
  )
}