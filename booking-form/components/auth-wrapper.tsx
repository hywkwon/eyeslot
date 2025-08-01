"use client"

import type React from "react"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    // Only redirect if we're sure the user is not authenticated
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  // Show loading spinner while checking authentication
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Don't render children if user is not authenticated
  if (status === "unauthenticated") {
    return null
  }

  // Render children if user is authenticated
  return <>{children}</>
}
