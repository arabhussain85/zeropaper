import { NextResponse } from "next/server"

const BASE_URL = "http://198.71.58.230:8787/api/zpu"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email } = body

    console.log("Sending OTP to:", email)

    const encodedEmail = encodeURIComponent(email)
    const response = await fetch(`${BASE_URL}/otp/email/send?email=${encodedEmail}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // No need to send email in body as it's now in the URL query parameter
      // Add these options to help with potential issues
      cache: "no-store",
      next: { revalidate: 0 },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("API error response:", errorData)
      return NextResponse.json(
        { success: false, message: errorData.message || `Error: ${response.status} ${response.statusText}` },
        { status: response.status },
      )
    }

    const data = await response.json()
    return NextResponse.json({ success: true, message: "OTP sent successfully", data })
  } catch (error) {
    console.error("Error in OTP send API route:", error)
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Failed to send OTP" },
      { status: 500 },
    )
  }
}

