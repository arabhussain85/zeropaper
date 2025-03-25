import { NextResponse } from "next/server"

const BASE_URL = "https://services.stage.zeropaper.online/api/zpu"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email } = body

    console.log("Sending delete account OTP to:", email)

    const encodedEmail = encodeURIComponent(email)
    // Reusing the existing OTP endpoint but with a different purpose parameter
    const response = await fetch(`${BASE_URL}/otp/email/send?email=${encodedEmail}&purpose=account_deletion`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
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
    return NextResponse.json({ success: true, message: "Delete account OTP sent successfully", data })
  } catch (error) {
    console.error("Error in delete account OTP send API route:", error)
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Failed to send delete account OTP" },
      { status: 500 },
    )
  }
}