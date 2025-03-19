import { type NextRequest, NextResponse } from "next/server"

const BASE_URL = "https://services.stage.zeropaper.online/api/zpu"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body
    
    // For debugging
    console.log("Request body received:", body)
    
    // Direct login implementation without action parameter
    // Since we're getting 400 errors, let's simplify and focus just on login
    
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }
    
    // Construct the URL with query parameters for login
    const queryParams = new URLSearchParams({
      email: email,
      password: password
    }).toString()
    
    const loginUrl = `${BASE_URL}/users/login?${queryParams}`
    console.log("Sending request to:", loginUrl)
    
    // Forward the request to the actual API
    const response = await fetch(loginUrl, {
      method: "POST",
      headers: {
        "Accept": "*/*"
      }
      // No body since we're using query parameters
    })
    
    // For debugging
    console.log("API response status:", response.status)
    
    // Handle the response
    const responseText = await response.text()
    console.log("API response text:", responseText)
    
    let responseData
    try {
      responseData = responseText && responseText.trim() ? JSON.parse(responseText) : {}
    } catch (parseError) {
      console.error("Invalid JSON Response:", responseText)
      return NextResponse.json(
        { error: `Unexpected response format: ${responseText.slice(0, 100)}` }, 
        { status: 500 }
      )
    }
    
    // Return the API response
    if (!response.ok) {
      return NextResponse.json(
        { error: responseData.message || responseData.error || "An error occurred" }, 
        { status: response.status }
      )
    }
    
    return NextResponse.json(responseData)
  } catch (error) {
    console.error("API route error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}