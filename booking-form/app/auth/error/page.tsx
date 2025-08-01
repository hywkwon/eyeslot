"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

export default function AuthErrorPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [errorMessage, setErrorMessage] = useState<string>("An authentication error occurred")

  useEffect(() => {
    const error = searchParams?.get("error")
    if (error) {
      switch (error) {
        case "Configuration":
          setErrorMessage("There is a problem with the server configuration.")
          break
        case "AccessDenied":
          setErrorMessage("You do not have permission to sign in.")
          break
        case "Verification":
          setErrorMessage("The verification link is invalid or has expired.")
          break
        case "OAuthSignin":
          setErrorMessage("Error in the OAuth sign-in process.")
          break
        case "OAuthCallback":
          setErrorMessage("Error in the OAuth callback process.")
          break
        case "OAuthCreateAccount":
          setErrorMessage("Could not create OAuth provider user in the database.")
          break
        case "EmailCreateAccount":
          setErrorMessage("Could not create email provider user in the database.")
          break
        case "Callback":
          setErrorMessage("Error in the OAuth callback handler.")
          break
        case "OAuthAccountNotLinked":
          setErrorMessage("Email already in use with a different provider.")
          break
        case "EmailSignin":
          setErrorMessage("The email could not be sent.")
          break
        case "CredentialsSignin":
          setErrorMessage("The credentials you provided were invalid.")
          break
        case "SessionRequired":
          setErrorMessage("You must be signed in to access this page.")
          break
        default:
          setErrorMessage(`An authentication error occurred: ${error}`)
      }
    }
  }, [searchParams])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
      <div className="w-full max-w-md space-y-6">
        <Alert variant="destructive">
          <AlertTitle>Authentication Error</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>

        <div className="flex flex-col space-y-4">
          <Button onClick={() => router.push("/login")} className="w-full">
            Return to Login
          </Button>
          <Button variant="outline" onClick={() => router.push("/")} className="w-full">
            Go to Home
          </Button>
        </div>
      </div>
    </div>
  )
}
