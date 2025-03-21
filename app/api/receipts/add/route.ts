import { type NextRequest, NextResponse } from "next/server"

const BASE_URL = "https://services.stage.zeropaper.online/api/zpu/receipts"

export async function POST(request: NextRequest) {
    try {
      const authHeader = request.headers.get("Authorization");
      if (!authHeader) {
        return NextResponse.json({ error: "Authorization header is required" }, { status: 401 });
      }
  
      const receiptData = await request.json();
  
      if (!receiptData.uid) {
        return NextResponse.json({ error: "User ID is required" }, { status: 400 });
      }
  
      const apiUrl = `${BASE_URL}/add`;
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
          Accept: "application/json",
        },
        body: JSON.stringify(receiptData),
      });
  
      const responseText = await response.text();
  
      if (!response.ok) {
        let errorMessage = `API error: ${response.status}`;
        if (responseText) {
          try {
            const errorData = JSON.parse(responseText);
            errorMessage = errorData.error || errorMessage;
          } catch (e) {
            errorMessage = responseText || errorMessage;
          }
        }
        return NextResponse.json({ error: errorMessage }, { status: response.status });
      }
  
      if (!responseText) {
        return NextResponse.json({ success: true, message: "Receipt added successfully" });
      }
  
      try {
        const data = JSON.parse(responseText);
        return NextResponse.json(data);
      } catch (e) {
        return NextResponse.json({
          success: true,
          message: "Receipt added successfully",
          rawResponse: responseText,
        });
      }
    } catch (error) {
      return NextResponse.json(
        {
          error: error instanceof Error ? error.message : "Internal server error",
        },
        { status: 500 },
      );
    }
  }