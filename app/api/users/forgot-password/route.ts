import { NextResponse } from "next/server"

const BASE_URL = "https://services.stage.zeropaper.online/api/zpu"

export async function POST(request: Request) {
  try {
    const resetData = await request.json()

    console.log("Resetting password for:", resetData.email)

    const response = await fetch(`${BASE_URL}/users/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(resetData),
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
    return NextResponse.json({ success: true, message: "Password reset successful", data })
  } catch (error) {
    console.error("Error in forgot-password API route:", error)
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Password reset failed" },
      { status: 500 },
    )
  }
}

