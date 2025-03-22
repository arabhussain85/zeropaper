import { type NextRequest, NextResponse } from "next/server"
import { parse, format } from "date-fns"

const API_BASE_URL = process.env.API_BASE_URL || "https://services.stage.zeropaper.online/api/zpu"

// Function to validate and parse European date format (DD.MM.YYYY HH:MM)
function parseEuropeanDate(dateString: string): string {
  try {
    // Parse the European format date
    const parsedDate = parse(dateString, "dd.MM.yyyy HH:mm", new Date())
    
    // Format it to ISO format for the API
    return format(parsedDate, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
  } catch (error) {
    console.error("Error parsing date:", error)
    throw new Error(`Invalid date format: ${dateString}. Expected format: DD.MM.YYYY HH:MM`)
  }
}

// Function to validate required fields
function validateReceiptData(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  const requiredFields = [
    "imageBase64",
    "price",
    "productName",
    "category",
    "date",
    "storeName",
    "uid",
    "currency"
  ]

  // Check required fields
  for (const field of requiredFields) {
    if (!data[field]) {
      errors.push(`${field} is required`)
    }
  }

  // Validate price is a number
  if (data.price && isNaN(Number(data.price))) {
    errors.push("price must be a valid number")
  }

  // Validate image is base64
  if (data.imageBase64 && !data.imageBase64.match(/^[A-Za-z0-9+/=]+$/)) {
    errors.push("imageBase64 must be a valid base64 string")
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Valid Bearer token is required" }, { status: 401 })
    }

    // Parse form data
    const formData = await request.formData()
    const receiptData: Record<string, any> = {}

    // Extract all form fields
    for (const [key, value] of formData.entries()) {
      receiptData[key] = value
    }

    // Validate the receipt data
    const validation = validateReceiptData(receiptData)
    if (!validation.valid) {
      return NextResponse.json({ error: "Validation failed", details: validation.errors }, { status: 400 })
    }

    // Process dates - convert from European format to ISO
    try {
      if (receiptData.date) {
        receiptData.date = parseEuropeanDate(receiptData.date)
      }
      if (receiptData.addedDate) {
        receiptData.addedDate = parseEuropeanDate(receiptData.addedDate)
      }
      if (receiptData.updatedDate) {
        receiptData.updatedDate = parseEuropeanDate(receiptData.updatedDate)
      }
      if (receiptData.validUptoDate) {
        receiptData.validUptoDate = parseEuropeanDate(receiptData.validUptoDate)
      }
      if (receiptData.refundableUptoDate) {
        receiptData.refundableUptoDate = parseEuropeanDate(receiptData.refundableUptoDate)
      }
    } catch (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : "Date format error" }, { status: 400 })
    }

    console.log(`Processing receipt data for user ${receiptData.uid}`)

    // Forward the request to the actual API
    const response = await fetch(`${API_BASE_URL}/receipt/process`, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(receiptData),
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
    console.error("Error in process receipt API route:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}