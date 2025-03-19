// Helper functions for API calls

export async function getErrorMessage(response: Response): Promise<string> {
  try {
    const text = await response.text()
    if (!text || text.trim() === "") {
      return `Error: ${response.status} ${response.statusText}`
    }

    try {
      const data = JSON.parse(text)
      return data.message || data.error || `Error: ${response.status} ${response.statusText}`
    } catch (parseError) {
      // If we can't parse as JSON, return the text
      return text || `Error: ${response.status} ${response.statusText}`
    }
  } catch (error) {
    return `Error: ${response.status} ${response.statusText}`
  }
}

export function createErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    if (error.message === "Failed to fetch") {
      return "Network error: Unable to connect to the server. Please check your internet connection and try again."
    }
    return error.message
  }
  return String(error)
}

export async function safeParseJSON(response: Response) {
  try {
    const text = await response.text()
    if (!text || text.trim() === "") {
      return null
    }
    return JSON.parse(text)
  } catch (error) {
    console.error("Error parsing JSON:", error)
    return null
  }
}

// Function to handle network errors with more specific messages
export function handleNetworkError(error: unknown): string {
  if (error instanceof TypeError && error.message === "Failed to fetch") {
    return "Network error: Unable to connect to the server. Please check your internet connection and try again."
  }

  if (error instanceof Error) {
    return error.message
  }

  return String(error)
}

