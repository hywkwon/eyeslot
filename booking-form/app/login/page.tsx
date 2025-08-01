"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { TestimonialsSection } from "@/components/ui/testimonials-with-marquee"
import { motion } from "framer-motion"
import { StarBorder } from "@/components/ui/star-border"
import AnimatedTextCycle from "@/components/ui/animated-text-cycle"
import { signIn, useSession } from "next-auth/react"
import { FcGoogle } from "react-icons/fc"
import { Alert, AlertDescription } from "@/components/ui/alert"
import UserSaveBackup from "@/components/user-save-backup"
import UserSaveDebug from "@/components/user-save-debug"
// 파일 상단에 import 추가
import SupabaseDebugTester from "@/components/supabase-debug-tester"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()
  const [isLoginLoading, setIsLoginLoading] = useState(false)
  const [isSignupLoading, setIsSignupLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Redirect if already logged in
  useEffect(() => {
    if (status === "authenticated" && session) {
      router.push("/booking-form")
    }
  }, [session, status, router])

  // Check for error in URL
  useEffect(() => {
    const errorParam = searchParams?.get("error")
    if (errorParam) {
      setError("Authentication failed. Please try again.")
      console.error("Auth error from URL:", errorParam)
    }
  }, [searchParams])

  const handleGoogleLogin = async () => {
    try {
      setIsLoginLoading(true)
      setError(null)

      const result = await signIn("google", {
        callbackUrl: "/booking-form",
        redirect: false,
      })

      if (result?.error) {
        setError(`Authentication failed: ${result.error}`)
        console.error("Sign in error:", result.error)
      } else if (result?.url) {
        router.push(result.url)
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("Authentication failed. Please try again.")
    } finally {
      setIsLoginLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
    try {
      setIsSignupLoading(true)
      setError(null)

      const result = await signIn("google", {
        callbackUrl: "/booking-form",
        redirect: false,
      })

      if (result?.error) {
        setError(`Authentication failed: ${result.error}`)
        console.error("Sign in error:", result.error)
      } else if (result?.url) {
        router.push(result.url)
      }
    } catch (error) {
      console.error("Signup error:", error)
      setError("Authentication failed. Please try again.")
    } finally {
      setIsSignupLoading(false)
    }
  }

  // Testimonials data
  const testimonials = [
    {
      author: {
        name: "Anna R.",
        handle: "Germany",
        avatar: "/german-blonde-woman.png",
      },
      text: "Quick, high-quality lenses and perfect fitting. Highly recommend Viewraum!",
    },
    {
      author: {
        name: "James L.",
        handle: "Canada",
        avatar: "/canadian-bearded-man.png",
      },
      text: "Better than any place I've visited in North America. Professional and friendly.",
    },
    {
      author: {
        name: "Yuki T.",
        handle: "Japan",
        avatar: "/japanese-man-casual.png",
      },
      text: "Beautiful design, fast service, and the Google Maps directions made it easy.",
    },
    {
      author: {
        name: "Lucas B.",
        handle: "Brazil",
        avatar: "/brazilian-man-curly-hair.png",
      },
      text: "Incredible service and communication. Everything was smooth and quick.",
    },
    {
      author: {
        name: "Sophia M.",
        handle: "France",
        avatar: "/elegant-french-woman.png",
      },
      text: "Fantastic staff. Got my glasses ready within the same day.",
    },
    {
      author: {
        name: "Eric D.",
        handle: "USA",
        avatar: "/american-man-casual.png",
      },
      text: "Very fast response and quality eyewear. Would use again.",
    },
    {
      author: {
        name: "Chen W.",
        handle: "Taiwan",
        avatar: "/taiwanese-man-glasses.png",
      },
      text: "Their customized fitting really made a difference for my comfort.",
    },
    {
      author: {
        name: "Isabel C.",
        handle: "Spain",
        avatar: "/spanish-woman-dark-hair.png",
      },
      text: "No hidden fees, transparent pricing, and very foreigner-friendly.",
    },
    {
      author: {
        name: "Michael K.",
        handle: "Australia",
        avatar: "/australian-man-sunglasses.png",
      },
      text: "As a tourist, I was worried about language barriers, but the staff was incredibly helpful.",
    },
    {
      author: {
        name: "Olivia P.",
        handle: "UK",
        avatar: "/british-redhead.png",
      },
      text: "The quality of lenses is exceptional. I can see clearly now and the frames are stylish!",
    },
    {
      author: {
        name: "Raj S.",
        handle: "India",
        avatar: "/indian-professional-man.png",
      },
      text: "I was able to get my prescription glasses in just a few hours. Amazing service!",
    },
    {
      author: {
        name: "Nina L.",
        handle: "Sweden",
        avatar: "/swedish-blonde-woman.png",
      },
      text: "The eye exam was thorough and the staff took time to explain everything to me.",
    },
    {
      author: {
        name: "Tomas H.",
        handle: "Czech Republic",
        avatar: "/czech-man-casual.png",
      },
      text: "Found exactly what I was looking for at a reasonable price. Very satisfied!",
    },
    {
      author: {
        name: "Mei L.",
        handle: "China",
        avatar: "/modern-chinese-woman.png",
      },
      text: "The staff helped me choose frames that perfectly suit my face shape. Very professional!",
    },
    {
      author: {
        name: "Ahmed K.",
        handle: "Egypt",
        avatar: "/egyptian-man-formal.png",
      },
      text: "I was impressed by how quickly they made my glasses. Great service for travelers!",
    },
  ]

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  }

  const logoVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 10,
        duration: 0.8,
      },
    },
  }

  return (
    <motion.div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "white", color: "black" }}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Main content */}
      <div className="flex-1 flex flex-col relative z-10" style={{ backgroundColor: "white" }}>
        {/* Hero section */}
        <div
          className="flex flex-col items-center justify-center min-h-[60vh] py-16 px-4"
          style={{ backgroundColor: "white" }}
        >
          <motion.div className="w-full max-w-md mx-auto space-y-8">
            <motion.header className="text-center space-y-6" variants={itemVariants}>
              <motion.h1
                className="text-7xl font-bold tracking-tight"
                style={{ color: "black" }}
                variants={logoVariants}
              >
                eyeslot
              </motion.h1>
              <motion.p
                className="text-xl font-medium tracking-tight"
                style={{ color: "#374151" }}
                variants={itemVariants}
              >
                Reserve high-quality lens & eyewear in Korea.
              </motion.p>
            </motion.header>

            {error && (
              <Alert variant="destructive" style={{ backgroundColor: "#fef2f2", borderColor: "#fecaca" }}>
                <AlertDescription style={{ color: "#991b1b" }}>{error}</AlertDescription>
              </Alert>
            )}

            <motion.div className="flex flex-col sm:flex-row justify-center gap-4 w-full" variants={itemVariants}>
              {status === "authenticated" ? (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full">
                  <StarBorder
                    as="button"
                    onClick={() => router.push("/booking-form")}
                    className="w-full"
                    color="#000000"
                    speed="5s"
                  >
                    <span style={{ color: "black" }}>Booking</span>
                  </StarBorder>
                </motion.div>
              ) : (
                <>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <div className="relative inline-block py-[1px] overflow-hidden rounded-[20px] w-full sm:w-auto">
                      <div
                        className="relative z-1 border text-center text-base py-4 px-6 rounded-[20px] transition-colors"
                        style={{
                          backgroundColor: "black",
                          color: "white",
                          borderColor: "black",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#374151"
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "black"
                        }}
                      >
                        <button
                          onClick={handleGoogleLogin}
                          disabled={isLoginLoading || isSignupLoading || status === "loading"}
                          className="w-full h-full flex items-center justify-center gap-2"
                          style={{ backgroundColor: "transparent", border: "none", color: "inherit" }}
                        >
                          <FcGoogle className="w-5 h-5" />
                          <span>{isLoginLoading ? "Logging in..." : "Login"}</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <StarBorder
                      as="button"
                      onClick={handleGoogleSignup}
                      disabled={isLoginLoading || isSignupLoading || status === "loading"}
                      className="w-full sm:w-auto"
                      color="#000000"
                      speed="5s"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <FcGoogle className="w-5 h-5" />
                        <span style={{ color: "black" }}>{isSignupLoading ? "Signing up..." : "Sign up"}</span>
                      </div>
                    </StarBorder>
                  </motion.div>
                </>
              )}
            </motion.div>
          </motion.div>
        </div>

        {/* Testimonials section */}
        <motion.div
          style={{ backgroundColor: "white" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          {/* Custom title section */}
          <div
            className="mx-auto flex max-w-container flex-col items-center gap-4 text-center sm:gap-8 py-8"
            style={{ backgroundColor: "white" }}
          >
            <div className="flex flex-col items-center gap-2 px-4 sm:gap-4">
              <h2
                className="max-w-[720px] text-2xl font-semibold leading-tight sm:text-3xl sm:leading-tight"
                style={{ color: "#374151" }}
              >
                Trusted for our{" "}
                <AnimatedTextCycle
                  words={["speed", "precision", "quality", "convenience", "care"]}
                  interval={3000}
                  className="font-semibold text-2xl sm:text-3xl"
                  style={{ color: "black" }}
                />{" "}
                by travelers worldwide
              </h2>
              <p className="text-sm max-w-[600px] font-medium sm:text-base" style={{ color: "#6b7280" }}>
                Join thousands of travelers who have experienced premium eyewear service in Korea
              </p>
            </div>
          </div>

          {/* Testimonials */}
          <TestimonialsSection title="" description="" testimonials={testimonials} className="py-0 sm:py-4 md:py-8" />
        </motion.div>
        {/* 사용자 저장 백업 컴포넌트 */}
        <UserSaveBackup />
        {/* 디버그 도구 - 개발 환경에서만 표시 */}
        {process.env.NODE_ENV === "development" && <SupabaseDebugTester />}
        {process.env.NODE_ENV === "development" && <UserSaveDebug />}
      </div>

      <motion.footer
        className="py-4 text-center text-sm"
        style={{ color: "#6b7280", backgroundColor: "white" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        Stay tuned for more premium eyewear spots in Korea.
      </motion.footer>
    </motion.div>
  )
}
