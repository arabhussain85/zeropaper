// Fallback mechanism for direct API calls if needed
import { logNetworkError } from "./network-debug"

const BASE_URL = "https://services.stage.zeropaper.online/api/zpu"

export async function directApiCall(endpoint: string, method: string, data: any) {
  try {
    console.log(`Making direct API call to ${endpoint}`, data)

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        // Add any additional headers if needed
        Accept: "application/json",
        "Cache-Control": "no-cache",
      },
      body: JSON.stringify(data),
      // These options might help with certain network issues
      mode: "cors",
      credentials: "omit",
      cache: "no-store",
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`API error (${response.status}):`, errorText)
      try {
        const errorJson = JSON.parse(errorText)
        return { success: false, message: errorJson.message || `Error ${response.status}` }
      } catch (e) {
        return { success: false, message: `Error ${response.status}: ${errorText.slice(0, 100)}` }
      }
    }

    const result = await response.json()
    return { success: true, data: result }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Network error",
      error: logNetworkError(error, `direct-api-call-${endpoint}`),
    }
  }
}

