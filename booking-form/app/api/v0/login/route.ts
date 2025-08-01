import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    // Safely parse the request body
    let body
    try {
      body = await request.json()
    } catch (e) {
      return NextResponse.json({ success: false, message: "Invalid JSON in request body" }, { status: 400 })
    }

    const { email, name, image } = body

    // Validate required fields
    if (!email) {
      return NextResponse.json({ success: false, message: "Email is required" }, { status: 400 })
    }

    if (!name) {
      return NextResponse.json({ success: false, message: "Name is required" }, { status: 400 })
    }

    // Here you would typically save the user data to a database
    // For now, we'll just return the data

    return NextResponse.json({
      success: true,
      message: "User data received successfully",
      user: { email, name, image: image || null },
    })
  } catch (error) {
    // Log the error for debugging
    console.error("Error in login API:", error)

    // Return a proper JSON error response
    return NextResponse.json(
      {
        success: false,
        message: "Error processing request",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// Handle other HTTP methods
export async function GET() {
  return NextResponse.json({ success: false, message: "Method not allowed. Use POST instead." }, { status: 405 })
}
