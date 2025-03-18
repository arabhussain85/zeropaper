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

