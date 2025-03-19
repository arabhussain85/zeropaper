// API service for Zero Paper User
import { createErrorMessage, safeParseJSON } from "@/utils/api-helpers"

// Function to send OTP to email
export async function sendOTP(email: string): Promise<{ success: boolean; message: string }> {
  try {
    console.log("Sending OTP to:", email)

    // Use our server-side API route to avoid CORS issues
    const response = await fetch("/api/auth", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "sendOTP",
        email,
      }),
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
    const response = await fetch("/api/auth", {
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
    return {
      success: false,
      message: createErrorMessage(error),
    }
  }
}// services/api-wrapper.ts

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
    // Direct request to our API route, focusing only on login
    const response = await fetch('/api/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password
      }),
    })

    // For debugging
    console.log("Login API status:", response.status)
    
    if (!response.ok) {
      const errorData = await response.json()
      console.error("Login API error:", errorData)
      throw new Error(errorData.error || `Error: ${response.status}`)
    }

    const data = await response.json()
    console.log("Login API success data:", data)

    // Ensure token exists
    if (!data.token) {
      throw new Error("Token missing in response")
    }

    return {
      success: true,
      message: data.message || "Login successful",
      token: data.token,
      user: data.user || {
        uid: data.uid,
        name: data.name,
        email: data.email,
        country: data.country,
        phoneNumber: data.phoneNumber,
        phoneCountryCode: data.phoneCountryCode,
      },
    }
  } catch (error) {
    console.error("Login Error:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "An unknown error occurred"
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

    // Use our server-side API route to avoid CORS issues
    const response = await fetch("/api/auth", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
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
    return {
      success: false,
      message: createErrorMessage(error),
    }
  }
}

