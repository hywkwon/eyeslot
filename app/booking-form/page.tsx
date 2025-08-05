"use client"
import BookingForm from "@/components/booking-form"
import { Button } from "@/components/ui/button"
import { CalendarCheck } from "lucide-react"
import { useRouter } from "next/navigation"
import AuthWrapper from "@/components/auth-wrapper"
import { SparklesText } from "@/components/ui/sparkles-text"

export default function BookingFormPage() {
  const router = useRouter()

  return (
    <AuthWrapper>
      <div className="min-h-screen bg-white py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header with reservation check button */}
          <div className="flex justify-end mb-6">
            <Button
              onClick={() => router.push("/booking-lookup")}
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
            >
              <CalendarCheck className="h-4 w-4" />
              <span>Check My Reservations</span>
            </Button>
          </div>

          <div className="text-center mb-8">
            <SparklesText 
              text="Book Your eyeslot" 
              className="text-2xl md:text-3xl font-bold text-black mb-2"
              colors={{ first: "#000000", second: "#374151" }}
              sparklesCount={8}
            />
            <p className="text-gray-600 text-sm md:text-base">Schedule your visit to one of our eyepickup locations</p>
          </div>
          <BookingForm />
        </div>
      </div>
    </AuthWrapper>
  )
}
