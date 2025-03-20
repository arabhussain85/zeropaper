// app/api/receipts/delete/route.ts
import { type NextRequest, NextResponse } from "next/server"

const BASE_URL = "https://services.stage.zeropaper.online/api/zpu/receipts"

export async function DELETE(request: NextRequest) {
  try {
    // Get the receipt ID from the query parameters
    const id = request.nextUrl.searchParams.get("id")
    if (!id) {
      return NextResponse.json({ error: "Receipt ID is required" }, { status: 400 })
    }
    
    // Get the authorization header
    const authHeader = request.headers.get("Authorization")
    if (!authHeader) {
      return NextResponse.json({ error: "Authorization header is required" }, { status: 401 })
    }
    
    console.log(`Proxying DELETE request to ${BASE_URL}/delete?id=${id}`)
    
    // Forward the request to the actual API
    const response = await fetch(`${BASE_URL}/delete?id=${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      cache: "no-store",
      next: { revalidate: 0 },
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`API error (${response.status}):`, errorText)
      return NextResponse.json(
        { error: `Error from API: ${response.status} ${response.statusText}` },
        { status: response.status },
      )
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in receipts/delete API route:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unknown error occurred" },
      { status: 500 },
    )
  }
}