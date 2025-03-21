import { type NextRequest, NextResponse } from "next/server"

const API_BASE_URL = process.env.API_BASE_URL || "https://services.stage.zeropaper.online/api/zpu"

export async function DELETE(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Receipt ID is required" }, { status: 400 })
    }

    // Get authorization header
    const authHeader = request.headers.get("authorization")
    if (!authHeader) {
      return NextResponse.json({ error: "Authorization header is required" }, { status: 401 })
    }

    console.log(`Proxying DELETE request to ${API_BASE_URL}/receipt/delete?id=${id}`)

    // Forward the request to the actual API
    const response = await fetch(`${API_BASE_URL}/receipt/delete?id=${id}`, {
      method: "DELETE",
      headers: {
        Authorization: authHeader,
        Accept: "application/json",
      },
    })

    // Log response status
    console.log(`API responded with status: ${response.status}`)

    // If the response is not OK, return the error
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`API error: ${response.status}`, errorText)

      return NextResponse.json({ error: `API error: ${response.status}` }, { status: response.status })
    }

    // Return success
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in delete receipt API route:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}

