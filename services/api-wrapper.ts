// API wrapper to handle mock data or real API calls

import * as realApi from "./api"
import * as mockApi from "./mock-api"

// Check if we should use mock API
const useMockApi = process.env.NEXT_PUBLIC_USE_MOCK_API === "true"

// Export all API functions, using either real or mock implementations
export const sendOTP = useMockApi ? mockApi.sendOTP : realApi.sendOTP
export const registerUser = useMockApi ? mockApi.registerUser : realApi.registerUser
export const resetPassword = useMockApi ? mockApi.resetPassword : realApi.resetPassword
export const loginUser = useMockApi ? mockApi.loginUser : realApi.loginUser

