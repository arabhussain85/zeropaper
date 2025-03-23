import { NextResponse } from "next/server"
// apiBaseUrl = "198.71.58.230:8787/api/zpu"

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Receipt ID is required" }, { 
  status: 400,
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  }
})
    }

    // Get auth token from request headers
    const authToken = request.headers.authorization;
    const authHeader = authToken ? `Bearer ${authToken}` : "";
    if (!authHeader) {
      return NextResponse.json({ error: "Authorization header is required" }, { 
  status: 401,
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  }
})
    }
    const token = localStorage.getItem('authToken'); 
    // Make the request to the external API from the server
    const apiBaseUrl = process.env.API_BASE_URL || "http://198.71.58.230:8787/api/zpu"
    const response = await fetch(`http://198.71.58.230:8787/api/zpu/receipt/delete?id=${id}`, {
      method: "DELETE",
      headers: {
          "Authorization": `Bearer ${token}`,
      },
  });

    // Get response as text first to handle potential non-JSON responses
    const responseText = await response.text()
    let responseData

    try {
      // Try to parse as JSON if there's content
      responseData = responseText ? JSON.parse(responseText) : {}
    } catch (e) {
      // If not valid JSON, use the text as is
      responseData = { message: responseText }
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: `API error: ${response.status}`, details: responseData },
        { 
          status: response.status,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
          }
        }
      )
    }

    return NextResponse.json(
  { success: true, data: responseData },
  {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  }
)
  } catch (error) {
    console.error("Error in receipts delete API route:", error)
    return NextResponse.json(
  { error: "Internal server error", details: (error as Error).message },
  { 
    status: 500,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  }
)
  }
}

