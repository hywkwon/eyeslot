"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Calendar, Clock, MessageSquare, Store, Info, X, Star } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
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
  rating?: number
  review_text?: string
  reviewed?: boolean
}

export default function BookingLookup() {
  const { data: session } = useSession()
  const [email, setEmail] = useState("")
  const [bookings, setBookings] = useState<Booking[]>([])
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [cache, setCache] = useState<{[email: string]: {bookings: Booking[], timestamp: number}}>({})
  const CACHE_DURATION = 5 * 60 * 1000 // 5분
  
  // Review states
  const [reviewStates, setReviewStates] = useState<{[bookingId: string]: {rating: number, reviewText: string, isReviewing: boolean}}>({})

  const router = useRouter()

  // Auto-fill email from session
  useEffect(() => {
    if (session?.user?.email) {
      setEmail(session.user.email)
    }
  }, [session])

  // Debounced search effect
  useEffect(() => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) return
    
    const timeoutId = setTimeout(() => {
      handleLookup()
    }, 1500) // 1.5초 디바운스

    return () => clearTimeout(timeoutId)
  }, [email])

  // Load existing reviews for bookings
  const loadExistingReviews = async (bookingsData: Booking[]) => {
    try {
      const reviewPromises = bookingsData.map(async (booking) => {
        try {
          const res = await fetch(`/api/review?booking_id=${booking.id}`)
          if (res.ok) {
            const result = await res.json()
            if (result.data) {
              return {
                bookingId: booking.id,
                review: result.data
              }
            }
          }
        } catch (err) {
          console.error(`Failed to load review for booking ${booking.id}:`, err)
        }
        return null
      })

      const reviewResults = await Promise.all(reviewPromises)
      
      // Update bookings with review data
      setBookings(prev => prev.map(booking => {
        const reviewResult = reviewResults.find(r => r?.bookingId === booking.id)
        if (reviewResult?.review) {
          return {
            ...booking,
            rating: reviewResult.review.rating,
            review_text: reviewResult.review.review_text,
            reviewed: true
          }
        }
        return booking
      }))
    } catch (err) {
      console.error('Failed to load existing reviews:', err)
    }
  }

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
    setSearched(true)

    // 캐시 확인
    const cached = cache[email]
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('Using cached data for', email)
      setBookings(cached.bookings)
      await loadExistingReviews(cached.bookings)
      return
    }

    setIsLoading(true)

    try {
      // Use the local API route which proxies to the external API
      const res = await fetch(`/api/booking?email=${encodeURIComponent(email)}`)
      const result = await res.json()

      if (!res.ok) {
        setError(result.message || "Error fetching bookings.")
        setBookings([])
      } else if (Array.isArray(result.data)) {
        const bookingsData = result.data
        // Sort by visit_date in ascending order (earliest first)
        const sortedBookings = bookingsData.sort((a, b) => {
          const dateA = new Date(`${a.visit_date} ${a.visit_time}`)
          const dateB = new Date(`${b.visit_date} ${b.visit_time}`)
          return dateA.getTime() - dateB.getTime()
        })
        setBookings(sortedBookings)
        
        // 캐시에 저장
        setCache(prev => ({
          ...prev,
          [email]: {
            bookings: sortedBookings,
            timestamp: Date.now()
          }
        }))
        
        // Load existing reviews for each booking
        await loadExistingReviews(sortedBookings)
      } else if (Array.isArray(result)) {
        // Sort by visit_date in ascending order (earliest first)
        const sortedBookings = result.sort((a, b) => {
          const dateA = new Date(`${a.visit_date} ${a.visit_time}`)
          const dateB = new Date(`${b.visit_date} ${b.visit_time}`)
          return dateA.getTime() - dateB.getTime()
        })
        setBookings(sortedBookings)
        
        // 캐시에 저장
        setCache(prev => ({
          ...prev,
          [email]: {
            bookings: sortedBookings,
            timestamp: Date.now()
          }
        }))
        
        // Load existing reviews for each booking
        await loadExistingReviews(sortedBookings)
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
      alert("Cancellation is not permitted within 2 days of your reservation date.")
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

  const handleDelete = async (bookingId: string, visitDate: string) => {
    // Only allow deletion for past bookings that cannot be cancelled
    if (isCancellationAllowed(visitDate)) {
      alert("This reservation can still be cancelled. Please use the 'Cancel Reservation' button instead.")
      return
    }

    const confirmed = window.confirm("Are you sure you want to delete this past reservation from your list?")
    if (!confirmed) return

    try {
      // Use the same API endpoint but with a different approach for past bookings
      const res = await fetch("/api/booking", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: bookingId }),
      })

      if (!res.ok) {
        const result = await res.json()
        throw new Error(result.message || "Failed to delete reservation.")
      }

      setBookings((prev) => prev.filter((b) => b.id !== bookingId))
      alert("Past reservation deleted successfully.")
    } catch (err: any) {
      alert(err.message || "Deletion failed. Please try again.")
    }
  }

  // Review functions
  const handleStartReview = (bookingId: string) => {
    setReviewStates(prev => ({
      ...prev,
      [bookingId]: {
        rating: 0,
        reviewText: '',
        isReviewing: true
      }
    }))
  }

  const handleCancelReview = (bookingId: string) => {
    setReviewStates(prev => {
      const newState = { ...prev }
      delete newState[bookingId]
      return newState
    })
  }

  const handleRatingChange = (bookingId: string, rating: number) => {
    setReviewStates(prev => ({
      ...prev,
      [bookingId]: {
        ...prev[bookingId],
        rating
      }
    }))
  }

  const handleReviewTextChange = (bookingId: string, reviewText: string) => {
    setReviewStates(prev => ({
      ...prev,
      [bookingId]: {
        ...prev[bookingId],
        reviewText
      }
    }))
  }

  const handleSubmitReview = async (bookingId: string) => {
    const reviewState = reviewStates[bookingId]
    if (!reviewState || reviewState.rating === 0) {
      alert("Please select a rating before submitting.")
      return
    }

    console.log('Submitting review for booking:', bookingId, reviewState)

    // 옵티미스틱 UI: 즉시 리뷰가 성공적으로 제출된 것처럼 UI 업데이트
    setBookings(prev => prev.map(booking => 
      booking.id === bookingId 
        ? { ...booking, rating: reviewState.rating, review_text: reviewState.reviewText, reviewed: true }
        : booking
    ))

    // 리뷰 상태 초기화 (폼 숨기기)
    handleCancelReview(bookingId)

    try {
      // Find the booking to get the store_id
      const booking = bookings.find(b => b.id === bookingId)
      
      const requestBody = {
        booking_id: bookingId,
        rating: reviewState.rating,
        review_text: reviewState.reviewText,
        store_id: booking?.store_id
      }
      
      console.log('Review request body:', requestBody)

      const res = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })

      console.log('Review response status:', res.status)
      const result = await res.json()
      console.log('Review response data:', result)

      if (!res.ok) {
        console.error('Review submission failed:', result)
        // 실패 시 옵티미스틱 상태 롤백
        setBookings(prev => prev.map(booking => 
          booking.id === bookingId 
            ? { ...booking, rating: undefined, review_text: undefined, reviewed: false }
            : booking
        ))
        const errorMessage = result.error ? `${result.message}: ${result.error}` : result.message
        throw new Error(errorMessage || "Failed to submit review.")
      }

      // 성공 시 이미 옵티미스틱 업데이트가 적용되었으므로 추가 작업 없음
      console.log("Review submitted successfully!")
    } catch (err: any) {
      console.error('Review submission error:', err)
      // 에러 시 옵티미스틱 상태 롤백 (이미 실패 처리에서 했지만 네트워크 에러 등을 위해)
      setBookings(prev => prev.map(booking => 
        booking.id === bookingId 
          ? { ...booking, rating: undefined, review_text: undefined, reviewed: false }
          : booking
      ))
      alert(err.message || "Failed to submit review. Please try again.")
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
        <CardDescription>View and manage your reservations</CardDescription>
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

        {isLoading && searched && (
          <div className="space-y-4 mt-4">
            <Skeleton className="h-6 w-40" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-40" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-16 w-full" />
                <div className="text-right">
                  <Skeleton className="h-9 w-32 ml-auto" />
                </div>
              </div>
            ))}
          </div>
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
                <div key={booking.id} className={`border rounded-lg p-4 space-y-2 relative ${!canCancel ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-300'}`}>
                  {/* X button for past bookings that cannot be cancelled */}
                  {!canCancel && (
                    <button
                      onClick={() => handleDelete(booking.id, booking.visit_date)}
                      className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                      title="Delete past reservation"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                  
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
                      <p className="text-xs text-green-600">✓ Can be cancelled ({daysUntil} days remaining)</p>
                    ) : (
                      <p className="text-xs text-red-600">✗ Cannot be cancelled (less than 2 days remaining)</p>
                    )}
                  </div>

                  {/* Review Section - Only show for past bookings */}
                  {!canCancel && !booking.reviewed && !reviewStates[booking.id]?.isReviewing && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-md border border-blue-200">
                      <p className="text-sm text-blue-800 mb-2">How was your experience?</p>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleStartReview(booking.id)}
                        className="text-blue-600 border-blue-300 hover:bg-blue-100"
                      >
                        <Star className="h-4 w-4 mr-1" />
                        Leave a Review
                      </Button>
                    </div>
                  )}

                  {/* Review Form */}
                  {reviewStates[booking.id]?.isReviewing && (
                    <div className="mt-3 p-4 bg-white rounded-md border-2 border-blue-200">
                      <h4 className="font-medium text-sm mb-3">Rate your experience</h4>
                      
                      {/* Star Rating */}
                      <div className="flex items-center gap-1 mb-3">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => handleRatingChange(booking.id, star)}
                            className="p-1 hover:scale-110 transition-transform"
                          >
                            <Star 
                              className={`h-6 w-6 ${
                                star <= (reviewStates[booking.id]?.rating || 0)
                                  ? 'fill-yellow-400 text-yellow-400' 
                                  : 'text-gray-300'
                              }`}
                            />
                          </button>
                        ))}
                        <span className="ml-2 text-sm text-gray-600">
                          {reviewStates[booking.id]?.rating > 0 && `${reviewStates[booking.id]?.rating}/5`}
                        </span>
                      </div>

                      {/* Review Text */}
                      <div className="mb-3">
                        <textarea
                          placeholder="Share your experience (optional)"
                          value={reviewStates[booking.id]?.reviewText || ''}
                          onChange={(e) => handleReviewTextChange(booking.id, e.target.value)}
                          className="w-full p-2 border rounded-md text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          maxLength={500}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {reviewStates[booking.id]?.reviewText?.length || 0}/500 characters
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button 
                          size="sm"
                          onClick={() => handleSubmitReview(booking.id)}
                          disabled={!reviewStates[booking.id]?.rating}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          Submit Review
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleCancelReview(booking.id)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Display Existing Review */}
                  {booking.reviewed && booking.rating && (
                    <div className="mt-3 p-3 bg-green-50 rounded-md border border-green-200">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-green-800">Your Review:</span>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star 
                              key={star}
                              className={`h-4 w-4 ${
                                star <= booking.rating!
                                  ? 'fill-yellow-400 text-yellow-400' 
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                          <span className="text-sm text-green-700 ml-1">{booking.rating}/5</span>
                        </div>
                      </div>
                      {booking.review_text && (
                        <p className="text-sm text-green-700 italic">"{booking.review_text}"</p>
                      )}
                    </div>
                  )}

                  {/* Only show cancel button for future bookings */}
                  {canCancel && (
                    <div className="text-right">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleCancel(booking.id, booking.visit_date)}
                      >
                        Cancel Reservation
                      </Button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <Button variant="outline" className="w-full" onClick={() => router.push("/booking-form")}>
          Back to Booking
        </Button>
        <p className="text-sm text-muted-foreground">Need help? Contact us at +82 10-9216-4660</p>
      </CardFooter>
    </Card>
  )
}
