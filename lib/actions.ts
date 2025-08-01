"use server"

interface BookingData {
  user_name: string
  email: string
  phone: string
  store_id: string
  visit_date: string
  visit_time: string
  request_note: string
}

interface BookingResponse {
  success: boolean
  message?: string
  data?: any
}

export async function submitBooking(form: BookingData): Promise<BookingResponse> {
  console.log("=== FRONTEND: submitBooking called ===")
  console.log("Form data being sent:", form)

  try {
    // Validate input data first
    if (!form.user_name || !form.email || !form.phone || !form.store_id || !form.visit_date || !form.visit_time) {
      console.log("Validation failed: Missing required fields")
      return {
        success: false,
        message: "Please fill in all required fields.",
      }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(form.email)) {
      console.log("Validation failed: Invalid email format")
      return {
        success: false,
        message: "Please provide a valid email address",
      }
    }

    // Date validation
    const visitDate = new Date(form.visit_date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (visitDate < today) {
      console.log("Validation failed: Past date selected")
      return {
        success: false,
        message: "Please select a future date for your visit",
      }
    }

    console.log("=== SENDING REQUEST TO EXTERNAL API ===")
    console.log("API URL: https://lens-api-liart.vercel.app/api/booking")

    const res = await fetch("https://lens-api-liart.vercel.app/api/booking", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    })

    console.log("=== API RESPONSE RECEIVED ===")
    console.log("Response status:", res.status)
    console.log("Response ok:", res.ok)

    if (!res.ok) {
      const errorText = await res.text()
      console.error("API Error Response:", errorText)
      throw new Error(`API Error: ${res.status} - ${errorText}`)
    }

    const result = await res.json()
    console.log("API Success Response:", result)

    return {
      success: true,
      message: result.message || "Booking created successfully!",
      data: result.data,
    }
  } catch (err) {
    console.error("=== SUBMIT BOOKING ERROR ===")
    console.error("Error details:", err)

    const errorMessage = err instanceof Error ? err.message : "Unknown error occurred"

    return {
      success: false,
      message: `Failed to submit booking: ${errorMessage}`,
    }
  }
}
