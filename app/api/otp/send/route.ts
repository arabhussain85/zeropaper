import { NextResponse } from "next/server"

const BASE_URL = "https://services.stage.zeropaper.online/api/zpu"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email } = body

    console.log("Sending OTP to:", email)

    const response = await fetch(`${BASE_URL}/otp/email/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
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

