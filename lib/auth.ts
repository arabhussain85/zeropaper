// This is a simplified auth utility for demo purposes
// In a real application, you would use a proper auth solution like NextAuth.js

// Get the current user ID
export async function getUserId(): Promise<string | null> {
    try {
      // In a real app, this would come from your auth provider
      const userId = localStorage.getItem("userId")
  
      // Return empty string if no user ID exists
      return userId || ""
    } catch (error) {
      console.error("Error getting user ID:", error)
      return null
    }
  }
  
  // Check if the user is authenticated
  export function isAuthenticated(): boolean {
    try {
      const token = localStorage.getItem("authToken")
      return !!token
    } catch (error) {
      return false
    }
  }
  
  // Set auth data after login
  export function setAuthData(userId: string, token: string): void {
    localStorage.setItem("userId", userId)
    localStorage.setItem("authToken", token)
  }
  
  // Clear auth data on logout
  export function clearAuthData(): void {
    localStorage.removeItem("userId")
    localStorage.removeItem("authToken")
  }
  
  