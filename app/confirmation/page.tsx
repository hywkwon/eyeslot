"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Calendar, ArrowLeft } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import { Globe } from "@/components/ui/globe"

export default function ConfirmationPage() {
  const router = useRouter()
  const [showDialog, setShowDialog] = useState(false)

  // Auto-show the dialog when component mounts
  useEffect(() => {
    setShowDialog(true)
  }, [])

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: "white", color: "black" }}>
      <AnimatePresence>
        {showDialog && (
          <>
            {/* Background Globe Animation */}
            <motion.div
              className="fixed inset-0 z-10 flex items-end justify-center pb-20"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 0.4, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <Globe className="w-[700px] h-[700px]" />
            </motion.div>

            {/* Main Content */}
            <div className="min-h-screen flex items-center justify-center p-4 relative z-20">
              <motion.div
                initial={{ 
                  opacity: 0, 
                  y: 100,
                  rotateX: -5,
                  skewY: -1.5,
                  scaleY: 2,
                  scaleX: 0.4,
                }}
                animate={{ 
                  opacity: 1, 
                  y: 0,
                  rotateX: 0,
                  skewY: 0,
                  scaleY: 1,
                  scaleX: 1,
                  transition: {
                    duration: 0.6,
                    ease: [0.59, 0, 0.35, 1],
                    y: { type: "spring", visualDuration: 0.8, bounce: 0.2 },
                  }
                }}
                style={{
                  transformPerspective: 1000,
                  originX: 0.5,
                  originY: 0,
                }}
                className="w-full max-w-md"
              >
                <Card
                  style={{
                    backgroundColor: "white",
                    borderColor: "#e5e7eb",
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                  }}
                >
                  <CardHeader className="text-center pb-4">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                    >
                      <CheckCircle className="h-16 w-16 mx-auto mb-4" style={{ color: "#10b981" }} />
                    </motion.div>
                    <CardTitle className="text-2xl font-bold" style={{ color: "black" }}>
                      Reservation Confirmed!
                    </CardTitle>
                    <CardDescription style={{ color: "#6b7280" }}>
                      Your booking has been successfully submitted. Thank you for choosing our service.
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="text-center space-y-4">
                    <div className="rounded-lg p-4" style={{ backgroundColor: "#f9fafb" }}>
                      <h3 className="font-semibold mb-2" style={{ color: "black" }}>
                        What's Next?
                      </h3>
                      <ul className="text-sm space-y-1 text-left" style={{ color: "#6b7280" }}>
                        <li>• Our team will contact you to confirm your reservation</li>
                        <li>• Please arrive 10 minutes early for your visit</li>
                        <li>• Bring your current prescription if you have one</li>
                      </ul>
                    </div>

                    <div className="text-sm" style={{ color: "#9ca3af" }}>
                      <p>Need to make changes? Contact us at:</p>
                      <p className="font-medium" style={{ color: "black" }}>
                        +82 10-9216-4660
                      </p>
                    </div>
                  </CardContent>

                  <CardFooter className="flex flex-col gap-3">
                    <Button
                      onClick={() => router.push("/booking-form")}
                      className="w-full"
                      style={{
                        backgroundColor: "black",
                        color: "white",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#374151"
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "black"
                      }}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Make Another Reservation
                    </Button>

                    <Button
                      onClick={() => router.push("/booking-lookup")}
                      variant="outline"
                      className="w-full"
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
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      View My Reservations
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
