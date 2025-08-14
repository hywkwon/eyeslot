"use server"

interface PrescriptionData {
  rightEye: {
    spherical: string
    cylindrical: string
    axis: string
  }
  leftEye: {
    spherical: string
    cylindrical: string
    axis: string
  }
}

interface SavedPrescription {
  id: string
  name: string
  powerType: string
  prescription: PrescriptionData
  savedDate: string
}

interface BookingData {
  user_name: string
  email: string
  phone: string
  store_id: string
  visit_date: string
  visit_time: string
  request_note: string
  prescription?: PrescriptionData
  selectedPrescription?: SavedPrescription
}

interface BookingResponse {
  success: boolean
  message?: string
  data?: any
}

export async function submitBooking(form: BookingData): Promise<BookingResponse> {
  console.log("=== FRONTEND: submitBooking called ===")
  console.log("Form data being sent:", form)
  console.log("🔍 Prescription data:", form.prescription)
  console.log("🔍 Selected prescription:", form.selectedPrescription)

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

    console.log("=== SENDING REQUEST TO LOCAL API ===")
    console.log("API URL: /api/booking")

    const res = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3001'}/api/booking`, {
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
    console.error("Error type:", typeof err)
    console.error("Error stack:", err instanceof Error ? err.stack : "No stack trace")

    const errorMessage = err instanceof Error ? err.message : "Unknown error occurred"

    return {
      success: false,
      message: `Failed to submit booking: ${errorMessage}`,
    }
  }
}
