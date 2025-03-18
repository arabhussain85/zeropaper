// Mock API service for Zero Paper User

// Function to send OTP to email
export async function sendOTP(email: string): Promise<{ success: boolean; message: string }> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Always succeed in mock mode
  return { success: true, message: "OTP sent successfully" }
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
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1500))

  // Validate OTP (in mock mode, we accept any 4-digit OTP)
  if (userData.otp.length !== 4) {
    return { success: false, message: "Invalid OTP. Please try again." }
  }

  // Mock successful registration
  return {
    success: true,
    message: "Registration successful",
    data: {
      userId: "mock-user-id-" + Math.random().toString(36).substring(2, 10),
      email: userData.email,
      name: userData.name,
    },
  }
}

// Function to reset password
export async function resetPassword(resetData: {
  email: string
  password: string
  otp: string
}): Promise<{ success: boolean; message: string }> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1200))

  // Validate OTP (in mock mode, we accept any 4-digit OTP)
  if (resetData.otp.length !== 4) {
    return { success: false, message: "Invalid OTP. Please try again." }
  }

  // Mock successful password reset
  return { success: true, message: "Password reset successful" }
}

// Function to login user
export async function loginUser(credentials: {
  email: string
  password: string
}): Promise<{ success: boolean; message: string; token?: string }> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800))

  // Mock successful login
  return {
    success: true,
    message: "Login successful",
    token: "mock-token-" + Math.random().toString(36).substring(2, 15),
  }
}

