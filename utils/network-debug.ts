// Network debugging utility

// Function to log network errors with detailed information
export function logNetworkError(error: unknown, functionName: string): void {
  console.error(`Network Error in ${functionName}:`, error)

  // Log additional information if it's an Error object
  if (error instanceof Error) {
    console.error(`Error name: ${error.name}`)
    console.error(`Error message: ${error.message}`)
    console.error(`Error stack: ${error.stack}`)
  }

  // Log browser information
  if (typeof navigator !== "undefined") {
    console.error(`User Agent: ${navigator.userAgent}`)
    console.error(`Platform: ${navigator.platform}`)
    console.error(`Online status: ${navigator.onLine ? "online" : "offline"}`)
  }

  // Log current URL if available
  if (typeof window !== "undefined") {
    console.error(`Current URL: ${window.location.href}`)
  }

  // Log timestamp
  console.error(`Timestamp: ${new Date().toISOString()}`)
}

// Function to test API connectivity
export async function testApiConnectivity(apiUrl: string): Promise<boolean> {
  try {
    console.log(`Testing connectivity to: ${apiUrl}`)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

    const response = await fetch(apiUrl, {
      method: "HEAD",
      signal: controller.signal,
      cache: "no-store",
    })

    clearTimeout(timeoutId)

    console.log(`API connectivity test result: ${response.ok ? "Success" : "Failed"}`)
    return response.ok
  } catch (error) {
    console.error("API connectivity test failed:", error)
    return false
  }
}

// Function to log request details
export function logApiRequest(url: string, method: string, headers: Record<string, string>, body?: any): void {
  console.group(`API Request: ${method} ${url}`)
  console.log("Headers:", headers)
  if (body) {
    console.log("Body:", typeof body === "string" ? body : JSON.stringify(body))
  }
  console.groupEnd()
}

// Function to log response details
export function logApiResponse(url: string, status: number, headers: Headers, body?: any): void {
  console.group(`API Response: ${status} ${url}`)
  console.log("Status:", status)

  const headersObj: Record<string, string> = {}
  headers.forEach((value, key) => {
    headersObj[key] = value
  })
  console.log("Headers:", headersObj)

  if (body) {
    console.log("Body:", typeof body === "string" ? body : JSON.stringify(body))
  }
  console.groupEnd()
}

