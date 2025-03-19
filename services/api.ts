import { type NextRequest, NextResponse } from "next/server"

const BASE_URL = "https://services.stage.zeropaper.online/api/zpu"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, ...data } = body

    let endpoint = ""
    let requestBody = null
    let queryParams = ""

    // Determine which endpoint to call based on the action
    switch (action) {
      case "sendOTP":
        endpoint = `/otp/email/send`
        queryParams = `?email=${encodeURIComponent(data.email)}`
        break
      case "register":
        endpoint = "/users/register"
        // Format the request body exactly as the API expects
        requestBody = JSON.stringify({
          email: data.email,
          phoneCountryCode: data.phoneCountryCode,
          phoneNumber: data.phoneNumber,
          country: data.country,
          name: data.name,
          password: data.password,
          otp: data.otp,
        })
        break
      case "login":
        endpoint = "/users/login"
        queryParams = `?email=${encodeURIComponent(data.email)}&password=${encodeURIComponent(data.password)}`
        break
      case "resetPassword":
        endpoint = "/users/forgot-password"
        requestBody = JSON.stringify(data)
        break
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    // Log the request (without sensitive data)
    const logUrl = `${BASE_URL}${endpoint}${queryParams ? queryParams.replace(/password=[^&]+/, "password=***") : ""}`
    console.log(`Proxying ${action} request to ${logUrl}`)

    if (requestBody) {
      console.log(`Request body: ${requestBody.replace(/"password":"[^"]+"/g, '"password":"***"')}`)
    }

    // Forward the request to the actual API
    const response = await fetch(`${BASE_URL}${endpoint}${queryParams}`, {
      method: "POST",
      headers: {
        ...(requestBody ? { "Content-Type": "application/json" } : {}),
        Accept: "*/*",
      },
      body: requestBody,
    })

    // Get the response as text first
    const responseText = await response.text()
    console.log(`${action} response status:`, response.status)
    console.log(`${action} response body:`, responseText)

    // Try to parse as JSON
    let responseData
    try {
      responseData = responseText ? JSON.parse(responseText) : {}
    } catch (error) {
      console.error("Error parsing response as JSON:", error)
      responseData = { message: responseText || "No response data" }
    }

    // Return the API response
    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: responseData.message || `Error: ${response.status} ${response.statusText}`,
          status: response.status,
        },
        { status: response.status },
      )
    }

    return NextResponse.json({
      success: true,
      ...responseData,
    })
  } catch (error) {
    console.error("API route error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    )
  }
}


