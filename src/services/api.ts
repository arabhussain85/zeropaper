import axios from "axios"

// Create an axios instance with default config
const api = axios.create({
  baseURL: "https://services.stage.zeropaper.online/api/zpu",
  headers: {
    "Content-Type": "application/json",
  },
  // Add withCredentials if the API requires cookies
  // withCredentials: true,
})

// Add request interceptor for auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle network errors
    if (error.message === "Network Error") {
      console.error("Network Error: Please check your internet connection or the API might be down.")
      return Promise.reject({
        success: false,
        message: "Network Error: Unable to connect to the server. Please check your internet connection.",
      })
    }

    // Handle API errors
    const errorResponse = error.response?.data || {
      success: false,
      message: "An unexpected error occurred",
    }

    return Promise.reject(errorResponse)
  },
)

// Function to send OTP to email
export async function sendOTP(email: string): Promise<{ success: boolean; message: string }> {
  try {
    const response = await api.post("/otp/email/send", { email })
    return { success: true, message: "OTP sent successfully" }
  } catch (error: any) {
    console.error("Error sending OTP:", error)
    return {
      success: false,
      message: error.message || "Failed to send OTP",
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
    const response = await api.post("/users/register", userData)
    return { success: true, message: "Registration successful", data: response.data }
  } catch (error: any) {
    console.error("Error registering user:", error)
    return {
      success: false,
      message: error.message || "Registration failed",
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
    const response = await api.post("/users/forgot-password", resetData)
    return { success: true, message: "Password reset successful" }
  } catch (error: any) {
    console.error("Error resetting password:", error)
    return {
      success: false,
      message: error.message || "Password reset failed",
    }
  }
}

// Function to login user
export async function loginUser(credentials: {
  email: string
  password: string
}): Promise<{ success: boolean; message: string; token?: string }> {
  try {
    const response = await api.post("/users/login", credentials)
    return {
      success: true,
      message: "Login successful",
      token: response.data.token,
    }
  } catch (error: any) {
    console.error("Error logging in:", error)
    return {
      success: false,
      message: error.message || "Login failed",
    }
  }
}

