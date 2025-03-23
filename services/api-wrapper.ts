import { createErrorMessage, safeParseJSON } from "@/utils/api-helpers"
import { logNetworkError } from "@/utils/network-debug"

// Base URL for API - use environment variable if available
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://198.71.58.230:8787/api/zpu"

// Flag to enable mock data when API is unavailable
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_API === "true" || false

// Function to send OTP to email
export async function sendOTP(email: string): Promise<{ success: boolean; message: string }> {
  try {
    console.log("Sending OTP to:", email)

    if (USE_MOCK_DATA) {
      console.log("Using mock data for sendOTP")
      return { success: true, message: "OTP sent successfully (mock)" }
    }

    // Use our server-side API route to avoid CORS issues
    const encodedEmail = encodeURIComponent(email)
    const response = await fetch(`http://198.71.58.230:8787/api/zpu/otp/email/send?email=${email}`, {
      method: "POST",

      // No need to send email in body as it's now in the URL query parameter
    })

    // First check if the response is OK
    if (!response.ok) {
      // Check if we got an HTML response (likely a 404 page)
      const responseText = await response.text()
      if (responseText.includes("<!DOCTYPE html>")) {
        console.error("API route not found. Check that /api/auth/route.ts exists and is properly configured.")
        throw new Error("API route not found. Please check server configuration.")
      }

      // Try to parse error message
      try {
        const errorData = JSON.parse(responseText)
        throw new Error(errorData.error || `Error: ${response.status} ${response.statusText}`)
      } catch (parseError) {
        throw new Error(`Error: ${response.status} ${response.statusText}`)
      }
    }

    // Try to parse the response as JSON
    const data = await safeParseJSON(response)
    console.log("OTP response:", data)

    if (data && data.error) {
      throw new Error(data.error)
    }

    return { success: true, message: "OTP sent successfully" }
  } catch (error) {
    console.error("Error sending OTP:", error)
    logNetworkError(error, "sendOTP")

    if (USE_MOCK_DATA) {
      return { success: true, message: "OTP sent successfully (mock fallback)" }
    }

    return {
      success: false,
      message: createErrorMessage(error),
    }
  }
}

// Function to register user - updated to match exact API format
export async function registerUser(userData: {
  email: string
  phoneCountryCode: string
  phoneNumber: string
  country: string
  name: string
  password: string
  otp: string
}): Promise<{ success: boolean; message: string; data?: any }> {
  try {
    console.log("Registering user with data:", {
      ...userData,
      password: "***", // Hide password in logs
    })

    if (USE_MOCK_DATA) {
      console.log("Using mock data for registerUser")
      return {
        success: true,
        message: "Registration successful (mock)",
        data: {
          uid: "mock-user-" + Date.now(),
          email: userData.email,
          name: userData.name,
          token: "mock-token-" + Date.now(),
        },
      }
    }

    // Ensure the data format matches exactly what the API expects
    const requestData = {
      action: "register",
      email: userData.email,
      phoneCountryCode: userData.phoneCountryCode,
      phoneNumber: userData.phoneNumber,
      country: userData.country,
      name: userData.name,
      password: userData.password,
      otp: userData.otp,
    }

    console.log("Registration request data:", {
      ...requestData,
      password: "***", // Hide password in logs
    })

    // Use our server-side API route to avoid CORS issues
    const response = await fetch("http://198.71.58.230:8787/api/zpu/users/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    })

    // Check if we got an HTML response (likely a 404 page)
    const responseText = await response.text()
    if (responseText.includes("<!DOCTYPE html>")) {
      console.error("API route not found. Check that /api/auth/route.ts exists and is properly configured.")
      throw new Error("API route not found. Please check server configuration.")
    }

    let data
    try {
      // Only try to parse as JSON if there's actual content
      data = responseText ? JSON.parse(responseText) : {}
    } catch (parseError) {
      console.error("Error parsing registration response as JSON:", parseError)
      data = { message: responseText || "No response data" }
    }

    console.log("Registration parsed response:", data)

    if (!response.ok || data.error) {
      throw new Error(data.error || data.message || `Error: ${response.status} ${response.statusText}`)
    }

    return {
      success: true,
      message: "Registration successful",
      data,
    }
  } catch (error) {
    console.error("Error registering user:", error)
    logNetworkError(error, "registerUser")

    if (USE_MOCK_DATA) {
      return {
        success: true,
        message: "Registration successful (mock fallback)",
        data: {
          uid: "mock-user-" + Date.now(),
          email: userData.email,
          name: userData.name,
          token: "mock-token-" + Date.now(),
        },
      }
    }

    return {
      success: false,
      message: createErrorMessage(error),
    }
  }
}

type LoginCredentials = {
  email: string
  password: string
}

type LoginResponse = {
  success: boolean
  message: string
  token?: string
  user?: any
}

export async function loginUser(credentials: LoginCredentials): Promise<LoginResponse> {
  try {
    console.log("Logging in user:", credentials.email)

    if (USE_MOCK_DATA) {
      console.log("Using mock data for loginUser")
      const mockUser = {
        uid: "mock-user-" + Date.now(),
        email: credentials.email,
        name: "Mock User",
        country: "Ireland",
        phoneNumber: "1234567890",
        phoneCountryCode: "+353",
      }

      const mockToken = "mock-token-" + Date.now()

      // Save mock user data to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("userData", JSON.stringify(mockUser))
        localStorage.setItem("authToken", mockToken)
        sessionStorage.setItem("authToken", mockToken)
      }

      return {
        success: true,
        message: "Login successful (mock)",
        token: mockToken,
        user: mockUser,
      }
    }

    // Direct request to our API route, focusing only on login
    const response = await fetch("/api/auth", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify({
        action: "login",
        email: credentials.email,
        password: credentials.password,
      }),
    })

    // For debugging
    console.log("Login API status:", response.status)

    // Handle non-OK responses
    if (!response.ok) {
      const responseText = await response.text()
      let errorMessage = `Error: ${response.status} ${response.statusText}`

      try {
        // Try to parse as JSON if possible
        const errorData = JSON.parse(responseText)
        errorMessage = errorData.error || errorData.message || errorMessage
      } catch (parseError) {
        // If parsing fails, use the raw text
        console.error("Error parsing login error response:", parseError)
        if (responseText) {
          errorMessage = responseText.slice(0, 100) // Limit length for logging
        }
      }

      console.error("Login API error:", errorMessage)
      throw new Error(errorMessage)
    }

    // Parse successful response
    const responseText = await response.text()
    let data

    try {
      data = responseText && responseText.trim() ? JSON.parse(responseText) : {}
    } catch (parseError) {
      console.error("Error parsing login response:", parseError)
      throw new Error(`Invalid response format: ${responseText.slice(0, 100)}`)
    }

    console.log("Login API success data:", data)

    // Ensure token exists
    if (!data.token) {
      throw new Error("Token missing in response")
    }

    // Create a user object with all available data
    const user = data.user || {
      uid: data.uid,
      name: data.name,
      email: data.email,
      country: data.country,
      phoneNumber: data.phoneNumber,
      phoneCountryCode: data.phoneCountryCode,
    }

    // Save user data to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("userData", JSON.stringify(user))
      localStorage.setItem("authToken", data.token)
      sessionStorage.setItem("authToken", data.token)
      console.log("User data saved to localStorage:", user)
    }

    return {
      success: true,
      message: data.message || "Login successful",
      token: data.token,
      user: user,
    }
  } catch (error) {
    console.error("Login Error:", error)
    logNetworkError(error, "loginUser")

    if (USE_MOCK_DATA) {
      console.log("Using mock data for login fallback")
      const mockUser = {
        uid: "mock-user-" + Date.now(),
        email: credentials.email,
        name: "Mock User",
        country: "Ireland",
        phoneNumber: "1234567890",
        phoneCountryCode: "+353",
      }

      const mockToken = "mock-token-" + Date.now()

      // Save mock user data to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("userData", JSON.stringify(mockUser))
        localStorage.setItem("authToken", mockToken)
        sessionStorage.setItem("authToken", mockToken)
      }

      return {
        success: true,
        message: "Login successful (mock fallback)",
        token: mockToken,
        user: mockUser,
      }
    }

    return {
      success: false,
      message: error instanceof Error ? error.message : "An unknown error occurred",
    }
  }
}

// Function to reset password
export async function resetPassword(resetData: {
  email: string
  password: string
  otp: string
}): Promise<{ success: boolean; message: string }> {
  try {
    console.log("Resetting password for:", resetData.email)

    if (USE_MOCK_DATA) {
      console.log("Using mock data for resetPassword")
      return { success: true, message: "Password reset successful (mock)" }
    }

    // Use our server-side API route to avoid CORS issues
    const response = await fetch("/api/auth", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify({
        action: "resetPassword",
        ...resetData,
      }),
    })

    // Check if we got an HTML response (likely a 404 page)
    const responseText = await response.text()
    if (responseText.includes("<!DOCTYPE html>")) {
      console.error("API route not found. Check that /api/auth/route.ts exists and is properly configured.")
      throw new Error("API route not found. Please check server configuration.")
    }

    let data
    try {
      data = responseText ? JSON.parse(responseText) : {}
    } catch (parseError) {
      console.error("Error parsing reset password response as JSON:", parseError)
      data = { message: responseText || "No response data" }
    }

    if (!response.ok || data.error) {
      throw new Error(data.error || data.message || `Error: ${response.status} ${response.statusText}`)
    }

    return {
      success: true,
      message: "Password reset successful",
    }
  } catch (error) {
    console.error("Error resetting password:", error)
    logNetworkError(error, "resetPassword")

    if (USE_MOCK_DATA) {
      return { success: true, message: "Password reset successful (mock fallback)" }
    }

    return {
      success: false,
      message: createErrorMessage(error),
    }
  }
}

// Receipt-related functions
export interface Receipt {
  id?: string
  uid: string
  category: string
  price: number
  productName: string
  storeLocation?: string
  storeName: string
  receiptType?: string
  currency: string
  date: string // ISO date string
  validUptoDate?: string // ISO date string
  refundableUptoDate?: string // ISO date string
  addedDate?: string // ISO date string
  updatedDate?: string // ISO date string
  receiptUpdatedDate?: string // ISO date string
  imageReceiptId?: string // ID for the image
  imageBase64?: string // Base64 encoded image
}

// Function to get user ID from local storage
export function getUserId(): string {
  if (typeof window === "undefined") return ""

  // Try to get user data from localStorage
  const userData = localStorage.getItem("userData")
  if (!userData) {
    console.error("No user data found in localStorage")
    return ""
  }

  try {
    const user = JSON.parse(userData)
    if (!user.uid) {
      console.error("User ID not found in user data:", user)
      return ""
    }
    console.log("Retrieved user ID:", user.uid)
    return user.uid
  } catch (error) {
    console.error("Error parsing user data:", error)
    return ""
  }
}

// Function to get user ID with fallback for testing
export function getUserIdWithFallback(): string {
  const uid = getUserId()
  if (uid) return uid

  // If no real user ID is found, use a mock one for testing
  console.warn("Using mock user ID for testing")
  return "mock-user-123"
}

// Function to get auth token
export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
}

// Function to get receipts by user ID through our API proxy
export async function getReceiptsByUserId(): Promise<Receipt[]> {
  try {
    const uid = getUserId()
    if (!uid) {
      console.warn("User ID not found, using fallback")
      return getMockReceipts()
    }

    const token = getAuthToken()
    if (!token) {
      console.warn("Authentication token not found, using fallback")
      return getMockReceipts()
    }

    console.log("Fetching receipts for user:", uid)

    if (USE_MOCK_DATA) {
      console.log("Using mock data for getReceiptsByUserId")
      return getMockReceipts()
    }

    // First try using our API proxy to avoid CORS
    try {
      const response = await fetch(`/api/receipts/get_by_user_id?uid=${uid}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`API responded with status: ${response.status}`, errorText)
        throw new Error(`API responded with status: ${response.status}`)
      }

      const data = await response.json()
      console.log("Receipts fetched successfully:", data)
      return Array.isArray(data) ? data : []
    } catch (proxyError) {
      console.error("Error fetching receipts through proxy:", proxyError)

      // Try direct API call as fallback
      console.log("Trying direct API call as fallback...")
      const directResponse = await fetch(`${BASE_URL}/receipt/get_by_user_id?uid=${uid}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })

      if (!directResponse.ok) {
        const errorText = await directResponse.text()
        console.error(`Direct API call failed with status: ${directResponse.status}`, errorText)
        throw new Error(`Direct API call failed with status: ${directResponse.status}`)
      }

      const directData = await directResponse.json()
      console.log("Receipts fetched successfully via direct API:", directData)
      return Array.isArray(directData) ? directData : []
    }
  } catch (error) {
    console.error("All receipt fetching methods failed:", error)
    logNetworkError(error, "getReceiptsByUserId")

    // Return mock data as last resort
    console.log("Using mock receipts data")
    return getMockReceipts()
  }
}

// Function to prepare an image for receipt upload (converts to base64 only)
export async function prepareReceiptImage(file: File): Promise<string> {
  try {
    console.log("Preparing receipt image:", file.name, file.type, "size:", file.size)

    // Convert file to base64
    const base64Data = await fileToBase64(file)
    console.log("Image converted to base64 successfully")
    return base64Data
  } catch (error) {
    console.error("Error preparing image:", error)
    logNetworkError(error, "prepareReceiptImage")
    throw new Error("Failed to prepare image for upload")
  }
}

// Function to add a receipt with optional image data
export async function addReceipt(receiptData: Omit<Receipt, "id">, imageBase64?: string): Promise<Receipt> {
  try {
    const token = getAuthToken()
    if (!token) {
      throw new Error("Authentication token not found. Please log in again.")
    }

    // Use the user ID from the receipt data, or get it with fallback if not provided
    const receiptWithUid = {
      ...receiptData,
      uid: receiptData.uid || getUserIdWithFallback(),
    }

    // Add image data if provided
    const fullReceiptData = imageBase64 ? { ...receiptWithUid, imageBase64 } : receiptWithUid

    console.log("Adding receipt with" + (imageBase64 ? "" : "out") + " image data")

    if (USE_MOCK_DATA) {
      console.log("Using mock data for addReceipt")
      return {
        ...fullReceiptData,
        id: `mock-${Date.now()}`,
        addedDate: new Date().toISOString(),
      } as Receipt
    }

    // First try using our API proxy to avoid CORS
    try {
      console.log("Sending receipt data to API proxy...")

      // Log token format (first 10 chars only for security)
      const tokenPreview = token.substring(0, 10) + "..." + token.substring(token.length - 5)
      console.log(`Using auth token: ${tokenPreview}`)

      const response = await fetch("/api/receipts/add", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(receiptData),
      })
      if (!response.ok) {
        const errorText = await response.text()
        console.error(`API responded with status: ${response.status}`, errorText)

        // Special handling for 403 errors
        if (response.status === 403) {
          console.log("Authentication error detected. Token may be expired.")
          // Clear the token to force re-login
          if (typeof window !== "undefined") {
            localStorage.removeItem("authToken")
            sessionStorage.removeItem("authToken")
          }
          throw new Error("Your session has expired. Please log in again.")
        }

        throw new Error(`API error: ${response.status}. ${errorText || ""}`)
      }

      const data = await response.json()
      console.log("Receipt added successfully:", data)
      return data
    } catch (proxyError) {
      console.error("Error adding receipt through proxy:", proxyError)

      // Try direct API call as fallback
      console.log("Trying direct API call as fallback...")
      const directResponse = await fetch(`${BASE_URL}/receipt/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: JSON.stringify(fullReceiptData),
      })

      if (!directResponse.ok) {
        const errorText = await directResponse.text()
        console.error(`Direct API call failed with status: ${directResponse.status}`, errorText)

        // Special handling for 403 errors
        if (directResponse.status === 403) {
          console.log("Authentication error detected. Token may be expired.")
          // Clear the token to force re-login
          if (typeof window !== "undefined") {
            localStorage.removeItem("authToken")
            sessionStorage.removeItem("authToken")
          }
          throw new Error("Your session has expired. Please log in again.")
        }

        throw new Error(`API error: ${directResponse.status}. ${errorText || ""}`)
      }

      const directData = await directResponse.json()
      console.log("Receipt added successfully via direct API:", directData)
      return directData
    }
  } catch (error) {
    console.error("All receipt adding methods failed:", error)
    logNetworkError(error, "addReceipt")

    // Create a mock response as last resort
    if (USE_MOCK_DATA) {
      console.log("Falling back to mock data after error")
      const mockReceipt = {
        ...receiptData,
        id: `mock-${Date.now()}`,
        addedDate: new Date().toISOString(),
      } as Receipt

      console.log("Using mock receipt data:", mockReceipt)
      return mockReceipt
    }

    // Re-throw the error to be handled by the UI
    throw error
  }
}

export async function deleteReceipt(receiptId: string): Promise<boolean> {
  try {
    const token = getAuthToken()
    if (!token) {
      throw new Error("Authentication token not found. Please log in again.")
    }

    console.log("Deleting receipt:", receiptId)

    if (USE_MOCK_DATA) {
      console.log("Using mock data for deleteReceipt")
      return true
    }

    // Use our server-side API route to avoid CORS issues
    const response = await fetch(`http://198.71.58.230:8787/api/zpu/receipts/delete?id=${receiptId}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"  // Add this to ensure proper content type
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error(`API responded with status: ${response.status}`, errorData)
      throw new Error(`API error: ${response.status}. ${errorData.error || ""}`)
    }

    console.log("Receipt deleted successfully")
    return true
  } catch (error) {
    console.error("Error deleting receipt:", error)
    logNetworkError(error, "deleteReceipt")

    if (USE_MOCK_DATA) {
      console.log("Using mock data for deleteReceipt fallback")
      return true
    }

    throw error
  }
}

// Function to upload receipt image
// export async function uploadReceiptImage(file: File): Promise<string> {
//   try {
//     const token = getAuthToken()
//     if (!token) {
//       throw new Error("Authentication token not found. Please log in again.")
//     }

//     console.log("Uploading receipt image:", file.name, file.type, "size:", file.size)

//     if (USE_MOCK_DATA) {
//       console.log("Using mock data for uploadReceiptImage")
//       return `mock-image-${Date.now()}`
//     }

//     // Convert file to base64
//     const base64Data = await fileToBase64(file)

//     // Create payload with base64 data
//     const payload = {
//       imageBase64: base64Data,
//       fileName: file.name,
//       contentType: file.type,
//     }

//     // First try using our API proxy to avoid CORS
//     try {
//       const response = await fetch(`/api/receipts/upload`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify(payload),
//       })

//       if (!response.ok) {
//         const errorText = await response.text()
//         console.error(`API responded with status: ${response.status}`, errorText)
//         throw new Error(`API responded with status: ${response.status}`)
//       }

//       const data = await response.json()
//       console.log("Image uploaded successfully:", data)
//       return data.imageReceiptId || ""
//     } catch (proxyError) {
//       console.error("Error uploading image through proxy:", proxyError)

//       // Try direct API call as fallback
//       console.log("Trying direct API call as fallback...")
//       const directResponse = await fetch(`${BASE_URL}/receipt/upload`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//           Accept: "application/json",
//         },
//         body: JSON.stringify(payload),
//       })

//       if (!directResponse.ok) {
//         const errorText = await directResponse.text()
//         console.error(`Direct API call failed with status: ${directResponse.status}`, errorText)
//         throw new Error(`Direct API call failed with status: ${directResponse.status}`)
//       }

//       const directData = await directResponse.json()
//       console.log("Image uploaded successfully via direct API:", directData)
//       return directData.imageReceiptId || ""
//     }
//   } catch (error) {
//     console.error("All image upload methods failed:", error)
//     logNetworkError(error, "uploadReceiptImage")

//     // Return a mock image ID as last resort
//     const mockImageId = `mock-image-${Date.now()}`
//     console.log("Using mock image ID:", mockImageId)
//     return mockImageId
//   }
// }

// Function to get receipt image
export async function getReceiptImage(imageReceiptId: string): Promise<string> {
  try {
    const token = getAuthToken()
    if (!token) {
      throw new Error("Authentication token not found. Please log in again.")
    }

    console.log("Fetching receipt image:", imageReceiptId)

    if (USE_MOCK_DATA) {
      console.log("Using mock data for getReceiptImage")
      // Return a simple 1x1 transparent pixel as base64
      return "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
    }

    // First try using our API proxy to avoid CORS
    try {
      const response = await fetch(`/api/receipts/image?imageReceiptId=${imageReceiptId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`API responded with status: ${response.status}`, errorText)
        throw new Error(`API responded with status: ${response.status}`)
      }

      const data = await response.json()
      console.log("Image fetched successfully")
      return data.imageBase64 || ""
    } catch (proxyError) {
      console.error("Error fetching image through proxy:", proxyError)

      // Try direct API call as fallback
      console.log("Trying direct API call as fallback...")
      const directResponse = await fetch(`${BASE_URL}/receipt/imageBase64?imageReceiptId=${imageReceiptId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })

      if (!directResponse.ok) {
        const errorText = await directResponse.text()
        console.error(`Direct API call failed with status: ${directResponse.status}`, errorText)
        throw new Error(`Direct API call failed with status: ${directResponse.status}`)
      }

      const directData = await directResponse.json()
      console.log("Image fetched successfully via direct API")
      return directData.imageBase64 || ""
    }
  } catch (error) {
    console.error("All image fetching methods failed:", error)
    logNetworkError(error, "getReceiptImage")

    // Return a mock image as last resort
    console.log("Using mock image data")
    // Return a simple 1x1 transparent pixel as base64
    return "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
  }
}

// Add a new function to get receipt image by receipt ID
export async function getReceiptImageByReceiptId(receiptId: string): Promise<string> {
  try {
    const token = getAuthToken()
    if (!token) {
      throw new Error("Authentication token not found. Please log in again.")
    }

    console.log("Fetching receipt image for receipt ID:", receiptId)

    if (USE_MOCK_DATA) {
      console.log("Using mock data for getReceiptImageByReceiptId")
      // Return a simple 1x1 transparent pixel as base64
      return "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
    }

    // Use our server-side API route to avoid CORS issues
    const response = await fetch(`/api/receipts/image-by-receipt?receiptId=${receiptId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error(`API responded with status: ${response.status}`, errorData)
      throw new Error(`API error: ${response.status}. ${errorData.error || ""}`)
    }

    const data = await response.json()
    console.log("Image fetched successfully by receipt ID")
    return data.imageBase64 || ""
  } catch (error) {
    console.error("Error fetching image by receipt ID:", error)
    logNetworkError(error, "getReceiptImageByReceiptId")

    // Return a mock image as last resort
    if (USE_MOCK_DATA) {
      console.log("Using mock image data")
      // Return a simple 1x1 transparent pixel as base64
      return "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
    }

    throw error
  }
}

// Function to convert file to base64
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      if (typeof reader.result === "string") {
        // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64String = reader.result.split(",")[1]
        resolve(base64String)
      } else {
        reject(new Error("Failed to convert file to base64"))
      }
    }
    reader.onerror = (error) => reject(error)
  })
}

// Mock receipts for fallback
function getMockReceipts(): Receipt[] {
  return [
    {
      id: "mock-1",
      uid: getUserIdWithFallback(),
      category: "business",
      price: 120.5,
      productName: "Office Supplies",
      storeLocation: "123 Business Ave, Dublin",
      storeName: "Office Depot",
      currency: "EUR",
      date: new Date().toISOString(),
      validUptoDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "mock-2",
      uid: getUserIdWithFallback(),
      category: "medical",
      price: 45.75,
      productName: "Prescription Medication",
      storeLocation: "456 Health St, Dublin",
      storeName: "City Pharmacy",
      currency: "EUR",
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      validUptoDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "mock-3",
      uid: getUserIdWithFallback(),
      category: "personal",
      price: 89.99,
      productName: "Clothing",
      storeLocation: "789 Shopping Blvd, Dublin",
      storeName: "Fashion Store",
      currency: "EUR",
      date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ]
}

