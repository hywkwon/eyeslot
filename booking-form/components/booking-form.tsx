"use client"

import type React from "react"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle, ExternalLink } from "lucide-react"
import { submitBooking } from "@/lib/actions"

interface FormData {
  user_name: string
  email: string
  phone: string
  store_id: string
  visit_date: string
  visit_time: string
  request_note: string
}

interface FormErrors {
  user_name?: string
  email?: string
  phone?: string
  visit_date?: string
  visit_time?: string
  store_id?: string
}

interface StoreMapLinks {
  googleMaps: string
  naverMaps: string
}

export default function BookingForm() {
  const [form, setForm] = useState<FormData>({
    user_name: "",
    email: "",
    phone: "",
    store_id: "viewraum", // Set default to viewraum
    visit_date: "",
    visit_time: "",
    request_note: "",
  })

  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})

  // Store map links configuration
  const storeMapLinks: Record<string, StoreMapLinks> = {
    viewraum: {
      googleMaps: "https://maps.app.goo.gl/3Z2pxvik9kzrEQtC7",
      naverMaps: "https://naver.me/FzSZ0p4u",
    },
    lacitpo: {
      googleMaps: "https://maps.app.goo.gl/u8MU7vdEnjc7A2Wt8",
      naverMaps: "https://naver.me/53lKMqVj",
    },
    eyecatcher: {
      googleMaps: "https://maps.app.goo.gl/ZVQfqPoh3K1Ekj8p7",
      naverMaps: "https://naver.me/5jJHt6Gm",
    },
    oror: {
      googleMaps: "https://maps.app.goo.gl/Jqrxswfe3JfUwrop9",
      naverMaps: "https://naver.me/FvEPfG8g",
    },
  }

  // Get today's date in YYYY-MM-DD format for min date
  const getTodayDate = () => {
    const today = new Date()
    return today.toISOString().split("T")[0]
  }

  // 기존 import 문 아래에 새로운 함수 추가
  // handleChange 함수 위에 다음 함수를 추가합니다:

  const formatPhoneNumber = (value: string): string => {
    // 숫자만 추출
    const numbers = value.replace(/\D/g, "")

    // 숫자 길이에 따라 포맷팅
    if (numbers.length <= 2) {
      return numbers
    } else if (numbers.length <= 4) {
      return `${numbers.slice(0, 2)}-${numbers.slice(2)}`
    } else if (numbers.length <= 8) {
      return `${numbers.slice(0, 2)}-${numbers.slice(2, 4)}-${numbers.slice(4)}`
    } else {
      return `${numbers.slice(0, 2)}-${numbers.slice(2, 4)}-${numbers.slice(4, 8)}-${numbers.slice(8, 12)}`
    }
  }

  // 전화번호 입력을 위한 특별한 핸들러 추가
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedPhone = formatPhoneNumber(e.target.value)
    setForm({ ...form, phone: formattedPhone })

    // 에러 상태 업데이트
    setErrors({ ...errors, phone: undefined })

    // 제출 에러 지우기
    if (submitError) {
      setSubmitError("")
    }
  }

  // 기존 handleChange 함수는 그대로 유지
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErrors({ ...errors, [e.target.name]: undefined })

    // Clear submit error when user starts typing
    if (submitError) {
      setSubmitError("")
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!form.user_name.trim()) newErrors.user_name = "Name is required"
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Valid email is required"
    }
    if (!form.phone.trim()) newErrors.phone = "Phone is required"
    if (!form.visit_date) newErrors.visit_date = "Date is required"
    if (!form.visit_time) newErrors.visit_time = "Time is required"
    if (!form.store_id) newErrors.store_id = "Store selection is required"

    // Validate future date
    if (form.visit_date) {
      const selectedDate = new Date(form.visit_date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      if (selectedDate < today) {
        newErrors.visit_date = "Please select today or a future date"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsLoading(true)
    setSubmitError("")

    try {
      const result = await submitBooking(form)

      if (result.success) {
        setSubmitted(true)
      } else {
        setSubmitError(result.message || "Submission failed. Please try again.")
      }
    } catch (err) {
      console.error("Form submission error:", err)

      // Handle different types of errors
      if (err instanceof Error) {
        if (err.message.includes("fetch") || err.message.includes("network")) {
          setSubmitError("Network error. Please check your connection and try again.")
        } else {
          setSubmitError(`Error: ${err.message}`)
        }
      } else {
        setSubmitError("Network error. Please try again later.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleNewReservation = () => {
    setSubmitted(false)
    setForm({
      user_name: "",
      email: "",
      phone: "",
      store_id: "viewraum", // Reset to default
      visit_date: "",
      visit_time: "",
      request_note: "",
    })
    setErrors({})
    setSubmitError("")
  }

  if (submitted) {
    return (
      <Card className="max-w-xl mx-auto">
        <CardContent className="py-6 text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <CardTitle className="text-xl mb-2">Reservation Complete!</CardTitle>
          <CardDescription>
            Thank you! Your booking has been submitted successfully. You will receive a confirmation email shortly.
          </CardDescription>
        </CardContent>
        <CardFooter className="justify-center">
          <Button onClick={handleNewReservation}>Make Another Reservation</Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="max-w-xl mx-auto">
      <CardHeader>
        <CardTitle>Make a Reservation</CardTitle>
        <CardDescription>Please fill out the form below to book your appointment.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {submitError && (
          <Alert variant="destructive">
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="user_name">Name *</Label>
          <Input
            id="user_name"
            name="user_name"
            value={form.user_name}
            onChange={handleChange}
            placeholder="Enter your full name"
          />
          {errors.user_name && <p className="text-sm text-red-500">{errors.user_name}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="example@email.com"
            type="email"
          />
          {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone *</Label>
          <Input
            id="phone"
            name="phone"
            value={form.phone}
            onChange={handlePhoneChange}
            placeholder="82-10-1234-5678"
            inputMode="numeric"
            maxLength={16}
          />
          {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="visit_date">Visit Date *</Label>
          <Input
            id="visit_date"
            name="visit_date"
            type="date"
            value={form.visit_date}
            onChange={handleChange}
            min={getTodayDate()}
          />
          {errors.visit_date && <p className="text-sm text-red-500">{errors.visit_date}</p>}
          <p className="text-xs text-gray-500">Please select today or a future date</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="visit_time">Visit Time *</Label>
          <select
            id="visit_time"
            name="visit_time"
            value={form.visit_time}
            onChange={handleChange}
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a time</option>
            {[...Array(10)].map((_, i) => {
              const hour = 11 + i
              return (
                <option key={hour} value={`${hour}:00`}>
                  {hour === 12 ? "12:00 PM" : hour > 12 ? `${hour - 12}:00 PM` : `${hour}:00 AM`}
                </option>
              )
            })}
          </select>
          {errors.visit_time && <p className="text-sm text-red-500">{errors.visit_time}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="store_id">Store *</Label>
          <select
            id="store_id"
            name="store_id"
            value={form.store_id}
            onChange={handleChange}
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a store</option>
            <option value="viewraum">viewraum (seoul)</option>
            <option value="lacitpo">lacitpo (seoul)</option>
            <option value="eyecatcher">eyecatcher (seoul)</option>
            <option value="oror">oror (seoul)</option>
          </select>
          {errors.store_id && <p className="text-sm text-red-500">{errors.store_id}</p>}

          {/* Map Links Section */}
          {form.store_id && storeMapLinks[form.store_id] && (
            <div className="mt-3 p-3 bg-gray-50 rounded-md border">
              <div className="flex gap-2">
                <a
                  href={storeMapLinks[form.store_id].googleMaps}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 bg-white border border-blue-200 rounded-md hover:bg-blue-50 transition-colors"
                >
                  Google Maps
                  <ExternalLink className="h-3 w-3" />
                </a>
                <a
                  href={storeMapLinks[form.store_id].naverMaps}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-green-600 bg-white border border-green-200 rounded-md hover:bg-green-50 transition-colors"
                >
                  Naver Maps
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="request_note">Special Requests</Label>
          <Textarea
            id="request_note"
            name="request_note"
            value={form.request_note}
            onChange={handleChange}
            placeholder="Any special requirements or preferences for your visit"
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSubmit} disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
            </>
          ) : (
            "Submit Reservation"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
