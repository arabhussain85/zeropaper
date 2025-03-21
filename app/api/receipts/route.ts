import { type NextRequest, NextResponse } from "next/server"

const BASE_URL = "https://services.stage.zeropaper.online/api/zpu/receipts"

export async function GET(request: NextRequest) {
  try {
    // Get the UID from the query parameters
    const uid = request.nextUrl.searchParams.get("uid")
    if (!uid) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    console.log(`Fetching receipts for user: ${uid}`)

    // Forward the request to the actual API
    const response = await fetch(`${BASE_URL}/get_by_user_id?uid=${uid}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      cache: "no-store",
    })

    // Read the response as text first
    const responseText = await response.text()

    if (!response.ok) {
      let errorMessage = `API error: ${response.status}`

      // Try to parse as JSON if possible
      try {
        const errorData = JSON.parse(responseText)
        errorMessage = errorData.error || errorMessage
      } catch (e) {
        // If not valid JSON, use the text directly
        errorMessage = responseText || errorMessage
      }

      console.error(`API error (${response.status}):`, errorMessage)
      return NextResponse.json({ error: errorMessage }, { status: response.status })
    }

    // Try to parse the response as JSON
    try {
      const data = JSON.parse(responseText)
      return NextResponse.json(data)
    } catch (e) {
      console.error("Error parsing JSON response:", e)
      return NextResponse.json({ error: "Invalid JSON response from API" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error in receipts GET API route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get("Authorization")
    if (!authHeader) {
      return NextResponse.json({ error: "Authorization header is required" }, { status: 401 })
    }

    // Get the receipt data from the request body
    const receiptData = await request.json()

    // Ensure UID is present
    if (!receiptData.uid) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    console.log("Adding new receipt:", receiptData)

    // Forward the request to the actual API
    const response = await fetch(`${BASE_URL}/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
        Accept: "application/json",
      },
      body: JSON.stringify(receiptData),
    })

    // Read the response as text first
    const responseText = await response.text()

    if (!response.ok) {
      let errorMessage = `API error: ${response.status}`

      // Try to parse as JSON if possible
      try {
        const errorData = JSON.parse(responseText)
        errorMessage = errorData.error || errorMessage
      } catch (e) {
        // If not valid JSON, use the text directly
        errorMessage = responseText || errorMessage
      }

      console.error(`API error (${response.status}):`, errorMessage)
      return NextResponse.json({ error: errorMessage }, { status: response.status })
    }

    // Try to parse the response as JSON if it's not empty
    if (!responseText) {
      return NextResponse.json({ success: true })
    }

    try {
      const data = JSON.parse(responseText)
      return NextResponse.json(data)
    } catch (e) {
      console.warn("Response is not valid JSON:", responseText)
      return NextResponse.json({
        success: true,
        message: "Receipt added successfully",
        rawResponse: responseText,
      })
    }
  } catch (error) {
    console.error("Error in receipts POST API route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Get the receipt ID from the query parameters
    const id = request.nextUrl.searchParams.get("id")
    if (!id) {
      return NextResponse.json({ error: "Receipt ID is required" }, { status: 400 })
    }

    console.log(`Deleting receipt: ${id}`)

    // Forward the request to the actual API
    const response = await fetch(`${BASE_URL}/delete?id=${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    })

    // Read the response as text first
    const responseText = await response.text()

    if (!response.ok) {
      let errorMessage = `API error: ${response.status}`

      // Try to parse as JSON if possible
      try {
        const errorData = JSON.parse(responseText)
        errorMessage = errorData.error || errorMessage
      } catch (e) {
        // If not valid JSON, use the text directly
        errorMessage = responseText || errorMessage
      }

      console.error(`API error (${response.status}):`, errorMessage)
      return NextResponse.json({ error: errorMessage }, { status: response.status })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in receipts DELETE API route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

