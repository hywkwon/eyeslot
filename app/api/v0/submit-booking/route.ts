import { NextResponse } from "next/server"

export async function POST(request: Request) {
  console.log("API endpoint hit: /api/v0/submit-booking")

  try {
    // Log request details
    console.log("Request method:", request.method)
    console.log("Request headers:", Object.fromEntries(request.headers.entries()))

    let body
    try {
      const requestText = await request.text()
      console.log("Raw request body:", requestText)

      if (!requestText) {
        console.error("Empty request body")
        return NextResponse.json(
          {
            success: false,
            message: "Request body is empty. Please provide booking data.",
          },
          { status: 400 },
        )
      }

      body = JSON.parse(requestText)
      console.log("Parsed request body:", body)
    } catch (error) {
      console.error("Error parsing request body:", error)
      return NextResponse.json(
        {
          success: false,
          message: "Invalid JSON format in request body.",
        },
        { status: 400 },
      )
    }

    // Validate required fields
    const requiredFields = ["user_name", "email", "phone", "visit_date", "visit_time", "store_id"]
    const missingFields = requiredFields.filter((field) => !body[field] || body[field].toString().trim() === "")

    if (missingFields.length > 0) {
      console.error("Missing required fields:", missingFields)
      return NextResponse.json(
        {
          success: false,
          message: `Missing required fields: ${missingFields.join(", ")}`,
        },
        { status: 400 },
      )
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email)) {
      console.error("Invalid email format:", body.email)
      return NextResponse.json(
        {
          success: false,
          message: "Please provide a valid email address",
        },
        { status: 400 },
      )
    }

    // Date validation
    const visitDate = new Date(body.visit_date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (visitDate < today) {
      console.error("Past date selected:", body.visit_date)
      return NextResponse.json(
        {
          success: false,
          message: "Please select a future date for your visit",
        },
        { status: 400 },
      )
    }

    // Store validation
    const validStores = ["viewraum"]
    if (!validStores.includes(body.store_id)) {
      console.error("Invalid store ID:", body.store_id)
      return NextResponse.json(
        {
          success: false,
          message: "Please select a valid store",
        },
        { status: 400 },
      )
    }

    // Log the booking data for debugging
    const bookingData = {
      user_name: body.user_name.trim(),
      email: body.email.trim().toLowerCase(),
      phone: body.phone.trim(),
      store_id: body.store_id,
      visit_date: body.visit_date,
      visit_time: body.visit_time,
      request_note: body.request_note ? body.request_note.trim() : "",
    }

    console.log("Processing booking with data:", bookingData)

    // Generate a unique booking ID
    const bookingId = `booking-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // Simulate processing time (remove in production)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // In a real application, you would save to a database here
    // For now, we'll simulate a successful booking
    const responseData = {
      success: true,
      message: "Booking created successfully",
      data: {
        id: bookingId,
        ...bookingData,
        created_at: new Date().toISOString(),
        status: "confirmed",
      },
    }

    console.log("Sending successful response:", responseData)

    return NextResponse.json(responseData, {
      status: 201,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
      },
    })
  } catch (error) {
    console.error("Booking submission error:", error)

    // Return a detailed error message
    const errorResponse = {
      success: false,
      message: "An unexpected error occurred while processing your booking. Please try again later.",
      error: error instanceof Error ? error.message : "Unknown error",
    }

    console.log("Sending error response:", errorResponse)

    return NextResponse.json(errorResponse, {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
      },
    })
  }
}

// Handle other HTTP methods
export async function GET() {
  console.log("GET request to /api/v0/submit-booking")
  return NextResponse.json(
    {
      success: false,
      message: "Method not allowed. Use POST to submit a booking.",
      endpoint: "/api/v0/submit-booking",
      methods: ["POST"],
    },
    { status: 405 },
  )
}

export async function OPTIONS() {
  console.log("OPTIONS request to /api/v0/submit-booking")
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Accept",
    },
  })
}
