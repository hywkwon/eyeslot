"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function UserDebug() {
  const { data: session } = useSession()
  const [supabaseUser, setSupabaseUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (session?.user?.email) {
      fetchSupabaseUser()
    }
  }, [session])

  const fetchSupabaseUser = async () => {
    if (!session?.user?.email) return

    setLoading(true)
    setError(null)

    try {
      // Check if Supabase client is available
      if (!supabase) {
        setError("Supabase client not initialized. Check your environment variables.")
        return
      }

      const { data, error } = await supabase.from("users").select("*").eq("email", session.user.email).single()

      if (error) {
        console.error("Error fetching user from Supabase:", error)
        setError(error.message)
      } else {
        setSupabaseUser(data)
      }
    } catch (error) {
      console.error("Unexpected error:", error)
      setError(error instanceof Error ? error.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  if (!session) return null

  return (
    <div className="fixed bottom-4 right-4 p-4 bg-white border rounded-lg shadow-lg max-w-sm">
      <h3 className="font-bold text-sm mb-2">User Debug Info</h3>

      <div className="text-xs space-y-1">
        <p>
          <strong>NextAuth User:</strong>
        </p>
        <p>Email: {session.user.email}</p>
        <p>Name: {session.user.name}</p>

        <p className="mt-2">
          <strong>Supabase User:</strong>
        </p>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-500">Error: {error}</p>
        ) : supabaseUser ? (
          <div>
            <p>✅ Found in Supabase</p>
            <p>ID: {supabaseUser.id}</p>
            <p>Created: {new Date(supabaseUser.created_at).toLocaleDateString()}</p>
          </div>
        ) : (
          <p>❌ Not found in Supabase</p>
        )}

        <button onClick={fetchSupabaseUser} className="mt-2 px-2 py-1 bg-blue-500 text-white text-xs rounded">
          Refresh
        </button>
      </div>
    </div>
  )
}
