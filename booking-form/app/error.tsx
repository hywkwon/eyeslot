"use client"

import { useEffect } from "react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <h1 className="text-4xl font-bold mb-4">Something went wrong</h1>
      <p className="text-lg text-gray-600 mb-8">An error occurred. Please try again later.</p>
      <button
        onClick={() => reset()}
        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors"
      >
        Try again
      </button>
    </div>
  )
}
