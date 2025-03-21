import { type NextRequest, NextResponse } from "next/server"

const API_BASE_URL = process.env.API_BASE_URL || "https://services.stage.zeropaper.online/api/zpu"

export async function POST(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get("authorization")
    if (!authHeader) {
      return NextResponse.json({ error: "Authorization header is required" }, { status: 401 })
    }

    // Get request body
    const body = await request.json()

    console.log(`Proxying POST request to ${API_BASE_URL}/receipt with${body.imageBase64 ? "" : "out"} image data`)

    // Forward the request to the actual API
    const response = await fetch(`${API_BASE_URL}/receipt`, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    })

    // Log response status
    console.log(`API responded with status: ${response.status}`)

    // If the response is not OK, return the error
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`API error: ${response.status}`, errorText)

      let errorMessage = `API error: ${response.status}`

      // Try to parse the error response if possible
      try {
        const errorData = JSON.parse(errorText)
        if (errorData.message || errorData.error) {
          errorMessage = errorData.message || errorData.error
        }
      } catch (parseError) {
        // If we can't parse as JSON, use the raw text if it's not too long
        if (errorText && errorText.length < 200) {
          errorMessage += ` - ${errorText}`
        }
      }

      // Special handling for common error codes
      if (response.status === 403) {
        errorMessage = "Authentication failed. Your session may have expired. Please log in again."
      } else if (response.status === 401) {
        errorMessage = "Unauthorized. Please log in to continue."
      } else if (response.status === 400) {
        errorMessage = "Invalid request data. Please check your input and try again."
      } else if (response.status === 404) {
        errorMessage = "Resource not found. The API endpoint may have changed."
      } else if (response.status === 500) {
        errorMessage = "Server error. Please try again later."
      }

      return NextResponse.json({ error: errorMessage }, { status: response.status })
    }

    // Parse and return the response
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in add receipt API route:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}

