// API service for Zero Paper User

import { safeParseJSON, getErrorMessage, createErrorMessage } from "@/utils/api-helpers"

const BASE_URL = "https://services.stage.zeropaper.online/api/zpu"

// Function to send OTP to email - updated to use query parameter
export async function sendOTP(email: string): Promise<{ success: boolean; message: string }> {
  try {
    console.log("Sending OTP to:", email)

    // Using the correct endpoint format with query parameter
    const response = await fetch(`${BASE_URL}/otp/email/send?email=${encodeURIComponent(email)}`, {
      method: "POST",
      headers: {
        accept: "*/*"
      }
    });
    

    if (!response.ok) {
      const errorMessage = await getErrorMessage(response)
      throw new Error(errorMessage)
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

// Function to register user
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
    const response = await fetch(`${BASE_URL}/users/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(userData),
    })

    if (!response.ok) {
      const errorMessage = await getErrorMessage(response)
      throw new Error(errorMessage)
    }

    const data = await safeParseJSON(response)
    return { success: true, message: "Registration successful", data }
  } catch (error) {
    console.error("Error registering user:", error)
    return {
      success: false,
      message: createErrorMessage(error),
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
    const response = await fetch(`${BASE_URL}/users/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(resetData),
    })

    if (!response.ok) {
      const errorMessage = await getErrorMessage(response)
      throw new Error(errorMessage)
    }

    await safeParseJSON(response)
    return { success: true, message: "Password reset successful" }
  } catch (error) {
    console.error("Error resetting password:", error)
    return {
      success: false,
      message: createErrorMessage(error),
    }
  }
}

// Function to login user
export async function loginUser(credentials: {
  email: string
  password: string
}): Promise<{ success: boolean; message: string; token?: string }> {
  try {
    const response = await fetch(`${BASE_URL}/users/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(credentials),
    })

    if (!response.ok) {
      const errorMessage = await getErrorMessage(response)
      throw new Error(errorMessage)
    }

    const data = await safeParseJSON(response)
    return {
      success: true,
      message: "Login successful",
      token: data?.token,
    }
  } catch (error) {
    console.error("Error logging in:", error)
    return {
      success: false,
      message: createErrorMessage(error),
    }
  }
}

