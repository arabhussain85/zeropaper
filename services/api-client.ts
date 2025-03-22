// A robust API client with multiple fallback strategies

import { logNetworkError } from "@/utils/network-debug"

// Base URL for API
const BASE_URL = "https://services.stage.zeropaper.online/api/zpu/receipts"

// Fallback options
const FALLBACK_OPTIONS = {
  useLocalProxy: true, // Use Next.js API routes as proxy
  useDirectApi: true, // Try direct API calls
  retryCount: 2, // Number of retries for each method
  retryDelay: 1000, // Delay between retries in ms
}

// Generic fetch function with retries and fallbacks
export async function fetchWithFallback<T>(
  endpoint: string,
  options: RequestInit,
  mockData?: T,
  context = "api-call",
): Promise<T> {
  let lastError: Error | null = null

  // Try local proxy first (to avoid CORS)
  if (FALLBACK_OPTIONS.useLocalProxy) {
    for (let i = 0; i <= FALLBACK_OPTIONS.retryCount; i++) {
      try {
        // Determine if this is a proxy endpoint or a direct endpoint
        const isProxyEndpoint = endpoint.startsWith("/api/")
        const proxyUrl = isProxyEndpoint ? endpoint : `/api${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`

        console.log(`[Attempt ${i + 1}] Trying local proxy: ${proxyUrl}`)

        const response = await fetch(proxyUrl, {
          ...options,
          headers: {
            ...options.headers,
            "X-Requested-With": "XMLHttpRequest", // Help identify AJAX requests
          },
          // Ensure we're not using cached responses
          cache: "no-store",
        })

        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`API error (${response.status}): ${errorText}`)
        }

        const data = await response.json()
        console.log(`Local proxy success: ${proxyUrl}`)
        return data as T
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))
        console.error(`Local proxy attempt ${i + 1} failed:`, error)

        if (i < FALLBACK_OPTIONS.retryCount) {
          console.log(`Retrying local proxy in ${FALLBACK_OPTIONS.retryDelay}ms...`)
          await new Promise((resolve) => setTimeout(resolve, FALLBACK_OPTIONS.retryDelay))
        }
      }
    }
  }

  // Try direct API call if local proxy failed
  if (FALLBACK_OPTIONS.useDirectApi) {
    for (let i = 0; i <= FALLBACK_OPTIONS.retryCount; i++) {
      try {
        const directUrl = endpoint.startsWith("/") ? `${BASE_URL}${endpoint}` : `${BASE_URL}/${endpoint}`

        console.log(`[Attempt ${i + 1}] Trying direct API: ${directUrl}`)

        const response = await fetch(directUrl, {
          ...options,
          headers: {
            ...options.headers,
            Accept: "application/json",
          },
          // Try with CORS mode
          mode: "cors",
          // Ensure we're not using cached responses
          cache: "no-store",
        })

        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`Direct API error (${response.status}): ${errorText}`)
        }

        const data = await response.json()
        console.log(`Direct API success: ${directUrl}`)
        return data as T
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))
        console.error(`Direct API attempt ${i + 1} failed:`, error)

        if (i < FALLBACK_OPTIONS.retryCount) {
          console.log(`Retrying direct API in ${FALLBACK_OPTIONS.retryDelay}ms...`)
          await new Promise((resolve) => setTimeout(resolve, FALLBACK_OPTIONS.retryDelay))
        }
      }
    }
  }

  // If all methods failed, throw error
  console.log(`All API attempts failed for ${context}`)

  // If we got here, all methods failed and we have no mock data
  logNetworkError(lastError, context)
  throw lastError || new Error(`Failed to fetch data from ${endpoint}`)
}

// Function to get auth token
export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
}

// Function to get user ID
export function getUserId(): string {
  if (typeof window === "undefined") return ""

  try {
    const userData = localStorage.getItem("userData")
    if (!userData) return ""

    const user = JSON.parse(userData)
    return user.uid || ""
  } catch (error) {
    console.error("Error getting user ID:", error)
    return ""
  }
}

