"use client"

import { useEffect } from 'react'

export default function KakaoRedirect() {
  useEffect(() => {
    // KakaoTalk 인앱 브라우저 감지
    const isKakaoTalk = /KAKAOTALK/i.test(navigator.userAgent)
    
    if (isKakaoTalk) {
      // 현재 URL을 외부 브라우저로 열기
      const currentUrl = window.location.href
      
      // KakaoTalk에서 외부 브라우저로 리디렉션하는 방법
      // intent:// 스킴을 사용하여 외부 브라우저 열기
      const intentUrl = `intent://${window.location.host}${window.location.pathname}${window.location.search}#Intent;scheme=https;package=com.android.chrome;end`
      
      // 안내 메시지 표시 후 리디렉션
      if (confirm('카카오톡 인앱 브라우저에서는 로그인이 제한될 수 있습니다.\n외부 브라우저로 이동하시겠습니까?')) {
        // Android의 경우 intent URL 사용
        if (/Android/i.test(navigator.userAgent)) {
          window.location.href = intentUrl
        } else {
          // iOS의 경우 Safari로 직접 열기
          window.location.href = currentUrl
        }
      }
    }
  }, [])

  return null
}