import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/components/session-provider"
import HeaderSection from "@/components/header-section"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "eyeslot - Book high-quality eyewear services in Korea",
  description: "Book high-quality eyewear services in Korea",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" style={{ colorScheme: "light" }}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      <body
        className={inter.className}
        style={{
          backgroundColor: "white",
          color: "black",
          colorScheme: "light",
        }}
      >
        <AuthProvider>
          <HeaderSection />
          <main className="container mx-auto py-8 px-4" style={{ backgroundColor: "white", color: "black" }}>
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  )
}
