import BookingLookup from "@/components/booking-lookup"
import AuthWrapper from "@/components/auth-wrapper"

export default function BookingLookupPage() {
  return (
    <AuthWrapper>
      <div className="max-w-xl mx-auto">
        <BookingLookup />
      </div>
    </AuthWrapper>
  )
}
