"use client"

import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

export default function LogoutButton() {
  const handleLogout = async () => {
    try {
      await signOut({
        callbackUrl: "/login",
        redirect: true,
      })
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return (
    <Button onClick={handleLogout} variant="outline" size="sm" className="flex items-center gap-1">
      <LogOut className="h-4 w-4" />
      <span>Logout</span>
    </Button>
  )
}
