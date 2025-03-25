import { NextResponse } from "next/server"

const BASE_URL = "https://services.stage.zeropaper.online/api/zpu"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, otp } = body

    if (!email || !otp) {
      return NextResponse.json(
        { success: false, message: "Email and OTP are required" },
        { status: 400 }
      )
    }

    console.log("Deleting account for:", email)

    // Call the backend API to delete the user account
    const response = await fetch(`${BASE_URL}/users/delete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, otp }),
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
    return NextResponse.json({ success: true, message: "Account deleted successfully", data })
  } catch (error) {
    console.error("Error in delete account API route:", error)
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Failed to delete account" },
      { status: 500 },
    )
  }
}