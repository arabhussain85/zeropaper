import { type NextRequest, NextResponse } from "next/server"

const BASE_URL = "https://services.stage.zeropaper.online/api/zpu"

// This route handler will help avoid CORS issues by proxying requests to the API
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, ...data } = body

    let endpoint = ""

    // Determine which endpoint to call based on the action
    switch (action) {
      case "sendOTP":
        endpoint = `/otp/email/send?email=${encodeURIComponent(data.email)}`
        break
      case "register":
        endpoint = "/users/register"
        break
      case "login":
        endpoint = "/users/login"
        break
      case "resetPassword":
        endpoint = "/users/forgot-password"
        break
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    // Forward the request to the actual API
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: action === "sendOTP" ? null : JSON.stringify(data),
    })

    // Get the response data
    const responseData = await response.json().catch(() => ({}))

    // Return the API response
    if (!response.ok) {
      return NextResponse.json({ error: responseData.message || "An error occurred" }, { status: response.status })
    }

    return NextResponse.json(responseData)
  } catch (error) {
    console.error("API route error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

