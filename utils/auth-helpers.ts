import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

// Custom hook to check if user is authenticated
export function useAuth(redirectTo = "/login") {
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Check for token in both localStorage and sessionStorage
    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")

    if (!token) {
      toast({
        title: "Authentication Required",
        description: "Please log in to access this page.",
        variant: "destructive",
      })

      // Use window.location for more reliable redirection
      window.location.href = redirectTo
    }
  }, [redirectTo, router, toast])
}

// Function to log out user
export function logoutUser() {
  // Clear tokens from storage
  localStorage.removeItem("authToken")
  sessionStorage.removeItem("authToken")
  localStorage.removeItem("userData")

  // Redirect to login
  window.location.href = "/login"
}

// Function to set authentication token (new function)
export function setAuthToken(token: string, rememberMe = false) {
  if (!token) return false
  
  // Store in the appropriate storage based on "remember me" preference
  if (rememberMe) {
    localStorage.setItem("authToken", token)
  } else {
    sessionStorage.setItem("authToken", token)
  }
  
  return true
}

// Function to check if user is authenticated (returns boolean)
export function isAuthenticated() {
  if (typeof window === "undefined") {
    return false
  }

  const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
  return !!token
}

// Function to get auth token
export function getAuthToken() {
  if (typeof window === "undefined") {
    return null
  }

  return localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
}

// Function to get user data
export function getUserData() {
  if (typeof window === "undefined") {
    return null
  }

  // Try to get user data from localStorage
  try {
    const userData = localStorage.getItem("userData")
    if (!userData) {
      // If no user data in localStorage, return a default user object
      return {
        name: "John Doe",
        email: "john.doe@example.com",
        // Add other default properties as needed
      }
    }

    return JSON.parse(userData)
  } catch (error) {
    console.error("Error parsing user data:", error)
    // Return a default user object in case of error
    return {
      name: "John Doe",
      email: "john.doe@example.com",
      // Add other default properties as needed
    }
  }
}

/**
 * Checks if the current auth token is valid
 * @returns {boolean} True if the token exists and is not expired
 */
export function isAuthTokenValid() {
  if (typeof window === "undefined") return false

  const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
  if (!token) return false

  // Check if token is a JWT and parse it
  try {
    // Simple JWT structure check
    if (token.split(".").length !== 3) {
      return false
    }

    // Try to decode the middle part (payload)
    const payload = JSON.parse(atob(token.split(".")[1]))

    // Check if token has expiration and is not expired
    if (payload.exp) {
      const expirationTime = payload.exp * 1000 // Convert to milliseconds
      return Date.now() < expirationTime
    }

    // If no expiration in token, assume it's valid
    return true
  } catch (error) {
    console.error("Error checking token validity:", error)
    // If we can't parse the token, assume it's invalid
    return false
  }
}

/**
 * Refreshes the auth token if needed
 * @returns {Promise<boolean>} True if token was refreshed successfully
 */
export async function refreshAuthTokenIfNeeded() {
  if (typeof window === "undefined") return false;

  // Check if we need to refresh
  if (isAuthTokenValid()) {
    return true; // Token is still valid
  }

  console.log("Auth token needs refreshing");

  try {
    const currentToken = getAuthToken();
    // Actual implementation of token refresh - call your API
    const response = await fetch('/api/refresh-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentToken}`,
      },
      body: JSON.stringify({
        refreshToken: localStorage.getItem("refreshToken") || sessionStorage.getItem("refreshToken")
      }),
      credentials: 'include', // Include cookies if using HTTP-only cookies
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Token refresh failed:', errorData);

      // Clear tokens on authentication failure
      localStorage.removeItem("authToken");
      sessionStorage.removeItem("authToken");
      localStorage.removeItem("refreshToken");
      sessionStorage.removeItem("refreshToken");
      return false;
    }

    const data = await response.json();
    
    if (!data.token) {
      console.error('Invalid token refresh response');
      return false;
    }

    // Store the new token in the same storage that had the old token
    const storage = localStorage.getItem("authToken") ? localStorage : sessionStorage;
    storage.setItem("authToken", data.token);
    if (data.refreshToken) {
      storage.setItem("refreshToken", data.refreshToken);
    }
    
    return true;
    
  } catch (error) {
    console.error("Error refreshing token:", error);
    
    // Clear tokens on error
    localStorage.removeItem("authToken");
    sessionStorage.removeItem("authToken");
    localStorage.removeItem("refreshToken");
    sessionStorage.removeItem("refreshToken");

    return false;
  }
}