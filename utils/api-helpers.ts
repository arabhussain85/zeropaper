// API helper functions

/**
 * Safely parses JSON from a response, with fallback for invalid JSON
 */
export async function safeParseJSON(response: Response): Promise<any> {
  try {
    return await response.json()
  } catch (e) {
    console.warn("Failed to parse JSON response:", e)
    return null
  }
}

/**
 * Extracts error message from a response
 */
export async function getErrorMessage(response: Response): Promise<string> {
  const data = await safeParseJSON(response)
  return data?.message || data?.error || `Server responded with status: ${response.status}`
}

/**
 * Checks if the error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  return (
    error instanceof TypeError &&
    (error.message.includes("fetch") || error.message.includes("network") || error.message.includes("Failed to fetch"))
  )
}

/**
 * Creates a user-friendly error message
 */
export function createErrorMessage(error: unknown): string {
  if (isNetworkError(error)) {
    return "Network error: Please check your internet connection or try again later."
  }

  if (error instanceof Error) {
    return error.message
  }

  return "An unexpected error occurred. Please try again."
}

