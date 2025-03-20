// Enhanced network debugging utility

// Function to log detailed network error information
export function logNetworkError(error: unknown, context: string) {
  console.error(`Network error in ${context}:`, error)

  // Check if it's a fetch error
  if (error instanceof TypeError && error.message.includes("fetch")) {
    console.error("This appears to be a fetch-related error. Possible causes:")
    console.error("- Network connectivity issues")
    console.error("- CORS policy restrictions")
    console.error("- The server is down or unreachable")
    console.error("- Invalid URL or endpoint")
  }

  // Check if it's a CORS error
  if (error instanceof DOMException && error.name === "NetworkError") {
    console.error("This appears to be a CORS-related error.")
    console.error("The server may not allow requests from this origin.")
  }

  return error
}

// Function to test network connectivity to a specific endpoint
export async function testEndpoint(url: string): Promise<{
  success: boolean
  status?: number
  message: string
}> {
  try {
    console.log(`Testing endpoint connectivity: ${url}`)

    // First try with no-cors mode to check if the server is reachable at all
    const noCorsResponse = await fetch(url, {
      method: "HEAD",
      mode: "no-cors",
      cache: "no-store",
    })

    console.log(`No-CORS response received:`, noCorsResponse)

    // Now try with regular mode to check actual API access
    const response = await fetch(url, {
      method: "HEAD",
      cache: "no-store",
    })

    return {
      success: true,
      status: response.status,
      message: `Endpoint is reachable. Status: ${response.status}`,
    }
  } catch (error) {
    console.error(`Endpoint test failed for ${url}:`, error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

// Function to check browser capabilities
export function checkBrowserCapabilities() {
  const report = {
    fetch: typeof fetch !== "undefined",
    localStorage: typeof localStorage !== "undefined",
    sessionStorage: typeof sessionStorage !== "undefined",
    cors: "fetch" in window && "credentials" in Request.prototype,
    serviceWorker: "serviceWorker" in navigator,
    online: navigator.onLine,
  }

  console.log("Browser capabilities:", report)
  return report
}

