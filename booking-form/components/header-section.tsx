"use client"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogIn, LogOut } from "lucide-react"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"

export default function HeaderSection() {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session, status } = useSession()

  // Check if it's the login page
  const isLoginPage = pathname === "/login"

  // Login button click handler
  const handleLoginClick = () => {
    router.push("/login")
  }

  // Logout handler
  const handleLogout = async () => {
    try {
      await signOut({
        callbackUrl: "/login",
        redirect: true,
      })
    } catch (error) {
      console.error("Logout error:", error)
      router.push("/login")
    }
  }

  // Don't render the header on login page
  if (isLoginPage) {
    return null
  }

  return (
    <header className="border-b" style={{ backgroundColor: "white", borderColor: "#e5e7eb" }}>
      <div
        className="container mx-auto h-16 px-4 flex justify-between items-center"
        style={{ backgroundColor: "white" }}
      >
        {/* Logo */}
        <Link
          href="/booking-form"
          className="text-2xl font-bold cursor-pointer"
          style={{ color: "black" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#374151"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "black"
          }}
        >
          eyeslot
        </Link>

        {/* Login/Logout button */}
        <div className="flex items-center gap-4">
          {status === "loading" ? (
            <div className="w-20 h-8 bg-gray-200 animate-pulse rounded"></div>
          ) : session ? (
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
              onClick={handleLogout}
              style={{
                borderColor: "black",
                color: "black",
                backgroundColor: "white",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#f3f4f6"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "white"
              }}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
              onClick={handleLoginClick}
              style={{
                borderColor: "black",
                color: "black",
                backgroundColor: "white",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#f3f4f6"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "white"
              }}
            >
              <LogIn className="h-4 w-4" />
              Login
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
