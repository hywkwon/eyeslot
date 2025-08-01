"use client"

import type React from "react"

// Simplified component that just passes through children
// No theme switching functionality
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
