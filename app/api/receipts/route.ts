import { type NextRequest, NextResponse } from "next/server"

const API_BASE_URL = process.env.API_BASE_URL || "http://198.71.58.230:8787/api/zpu"

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const uid = searchParams.get("uid")

    if (!uid) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Get authorization header
    const authHeader = request.headers.get("authorization")
    if (!authHeader) {
      return NextResponse.json({ error: "Authorization header is required" }, { status: 401 })
    }

    console.log(`Proxying GET request to ${API_BASE_URL}/receipt/get_by_user_id?storedUserId=${uid}`)

    // Forward the request to the actual API
    const response = await fetch(`${API_BASE_URL}/receipt/get_by_user_id?uid=${uid}`, {
      method: "GET",
      headers: {
        Authorization: authHeader,
        Accept: "application/json",
      },
      cache: "no-store",
    })

    // Log response status
    console.log(`API responded with status: ${response.status}`)

    // If the response is not OK, return the error
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`API error: ${response.status}`, errorText)

      return NextResponse.json({ error: `API error: ${response.status}` }, { status: response.status })
    }

    // Parse and return the response
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in receipts API route:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}

