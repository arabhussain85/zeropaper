import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const receiptId = searchParams.get("receiptId")

    if (!receiptId) {
      return NextResponse.json({ error: "Receipt ID is required" }, { status: 400 })
    }

    // Get auth token from request headers
    const authHeader = request.headers.get("Authorization")
    if (!authHeader) {
      return NextResponse.json({ error: "Authorization header is required" }, { status: 401 })
    }

    // Make the request to the external API from the server
    const apiBaseUrl = process.env.API_BASE_URL || "http://198.71.58.230:8787/api/zpu"
    const response = await fetch(`${apiBaseUrl}/receipts/imageBase64?receiptId=${receiptId}`, {
      method: "GET",
      headers: {
        Authorization: authHeader,
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        { error: `API error: ${response.status}`, details: errorText },
        { status: response.status },
      )
    }

    // Parse the response
    const data = await response.json()

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in receipts image API route:", error)
    return NextResponse.json({ error: "Internal server error", details: (error as Error).message }, { status: 500 })
  }
}

