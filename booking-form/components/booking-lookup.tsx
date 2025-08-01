"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Calendar, Clock, MessageSquare, Store, Info } from "lucide-react"
import { useRouter } from "next/navigation"

interface Booking {
  id: string
  user_name: string
  email: string
  phone: string
  visit_date: string
  visit_time: string
  store_id: string
  request_note?: string
  status?: string
}

export default function BookingLookup() {
  const [email, setEmail] = useState("")
  const [bookings, setBookings] = useState<Booking[]>([])
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const router = useRouter()

  // Check if cancellation is allowed (at least 2 days before reservation)
  const isCancellationAllowed = (visitDate: string): boolean => {
    const reservationDate = new Date(visitDate)
    const today = new Date()
    const twoDaysFromNow = new Date(today)
    twoDaysFromNow.setDate(today.getDate() + 2)

    return reservationDate >= twoDaysFromNow
  }

  // Get days remaining until reservation
  const getDaysUntilReservation = (visitDate: string): number => {
    const reservationDate = new Date(visitDate)
    const today = new Date()
    const timeDiff = reservationDate.getTime() - today.getTime()
    return Math.ceil(timeDiff / (1000 * 3600 * 24))
  }

  const handleLookup = async () => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address")
      return
    }

    setError("")
    setIsLoading(true)
    setSearched(true)

    try {
      // Use the local API route which proxies to the external API
      const res = await fetch(`/api/booking?email=${encodeURIComponent(email)}`)
      const result = await res.json()

      if (!res.ok) {
        setError(result.message || "Error fetching bookings.")
        setBookings([])
      } else if (Array.isArray(result.data)) {
        setBookings(result.data)
      } else if (Array.isArray(result)) {
        setBookings(result)
      } else {
        setBookings([])
        setError("No reservations found.")
      }
    } catch (err) {
      setError("Failed to fetch bookings. Please try again later.")
      setBookings([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = async (bookingId: string, visitDate: string) => {
    if (!isCancellationAllowed(visitDate)) {
      alert("Cancellation is not allowed within 2 days of your reservation date.")
      return
    }

    console.log("Cancellation request ID:", bookingId)
    const confirmed = window.confirm("Are you sure you want to cancel this reservation?")
    if (!confirmed) return

    try {
      // Use the local API route which proxies to the external API
      const res = await fetch("/api/booking", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: bookingId }),
      })

      if (!res.ok) {
        const result = await res.json()
        throw new Error(result.message || "Failed to cancel reservation.")
      }

      setBookings((prev) => prev.filter((b) => b.id !== bookingId))
      alert("Reservation cancelled successfully.")
    } catch (err: any) {
      alert(err.message || "Cancellation failed. Please try again.")
    }
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A"
    try {
      const date = new Date(dateStr)
      return new Intl.DateTimeFormat("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(date)
    } catch (e) {
      return dateStr
    }
  }

  const getStoreName = (id: string) => {
    switch (id) {
      case "viewraum":
        return "viewraum (seoul)"
      case "lacitpo":
        return "lacitpo (seoul)"
      case "eyecatcher":
        return "eyecatcher (seoul)"
      case "oror":
        return "oror (seoul)"
      case "muelstore":
        return "muelstore (seoul)"
      default:
        return id
    }
  }

  return (
    <Card className="max-w-xl mx-auto">
      <CardHeader>
        <CardTitle>My Reservations</CardTitle>
        <CardDescription>Check your upcoming appointments</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Cancellation Policy Notice */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Cancellation Policy:</strong> Reservations can only be cancelled up to 2 days before your
            appointment date.
          </AlertDescription>
        </Alert>

        <div className="flex space-x-2">
          <Input
            placeholder="Enter your email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1"
          />
          <Button onClick={handleLookup} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading...
              </>
            ) : (
              "Search"
            )}
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {searched && bookings.length === 0 && !error && !isLoading && (
          <Alert>
            <AlertDescription>No reservations found for this email address.</AlertDescription>
          </Alert>
        )}

        {bookings.length > 0 && (
          <div className="space-y-4 mt-4">
            <h3 className="font-medium text-lg">Your Reservations</h3>
            {bookings.map((booking) => {
              const canCancel = isCancellationAllowed(booking.visit_date)
              const daysUntil = getDaysUntilReservation(booking.visit_date)

              return (
                <div key={booking.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Date:</span>
                    <span className="text-sm">{formatDate(booking.visit_date)}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Store className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Store:</span>
                    <span className="text-sm">{getStoreName(booking.store_id)}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Time:</span>
                    <span className="text-sm">{booking.visit_time}</span>
                  </div>

                  {booking.request_note && (
                    <div className="flex items-start gap-2">
                      <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <span className="text-sm font-medium">Note:</span>
                      <span className="text-sm">{booking.request_note}</span>
                    </div>
                  )}

                  {/* Cancellation Status */}
                  <div className="mt-3 p-2 bg-gray-50 rounded-md">
                    {canCancel ? (
                      <p className="text-xs text-green-600">✓ Cancellation allowed ({daysUntil} days remaining)</p>
                    ) : (
                      <p className="text-xs text-red-600">✗ Cancellation not allowed (less than 2 days remaining)</p>
                    )}
                  </div>

                  <div className="text-right">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleCancel(booking.id, booking.visit_date)}
                      disabled={!canCancel}
                      className={!canCancel ? "opacity-50 cursor-not-allowed" : ""}
                    >
                      {canCancel ? "Cancel Reservation" : "Cannot Cancel"}
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <Button variant="outline" className="w-full" onClick={() => router.push("/booking-form")}>
          Back to Service Home
        </Button>
        <p className="text-sm text-muted-foreground">Need help? Contact us at +82 10-9216-4660</p>
      </CardFooter>
    </Card>
  )
}
