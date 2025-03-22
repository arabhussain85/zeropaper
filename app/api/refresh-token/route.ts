import { NextResponse } from "next/server"
import { type NextRequest } from "next/server"

const BASE_URL = "https://services.stage.zeropaper.online/api/zpu"

export async function POST(request: NextRequest) {
  try {
    // Extract the authorization token from the request headers
    const authHeader = request.headers.get("Authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Invalid authorization header" }, { status: 401 })
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix
    
    // Get refresh token from request body
    const body = await request.json()
    const { refreshToken } = body
    
    if (!refreshToken) {
      return NextResponse.json({ error: "Refresh token is required" }, { status: 400 })
    }
    
    console.log("Attempting to refresh token")
    
    // Forward the request to the actual API
    const response = await fetch(`${BASE_URL}/users/refresh-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
      next: { revalidate: 0 }
    })
    
    // For debugging
    console.log("Token refresh API response status:", response.status)
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("Token refresh failed:", errorData)
      return NextResponse.json(
        { error: errorData.message || `Error: ${response.status} ${response.statusText}` },
        { status: response.status }
      )
    }
    
    const data = await response.json()
    
    // Return the new token
    return NextResponse.json({
      token: data.token,
      refreshToken: data.refreshToken || refreshToken, // Use new refresh token if provided, otherwise keep the old one
      message: "Token refreshed successfully"
    })
  } catch (error) {
    console.error("Error in refresh token API route:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Token refresh failed" },
      { status: 500 }
    )
  }
}