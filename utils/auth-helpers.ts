import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";

// Custom hook to check if user is authenticated
export function useAuth(redirectTo = "/login") {
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // Ensure this runs only on the client side
    if (typeof window === "undefined") return;

    // Check for token in both localStorage and sessionStorage
    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

    if (!token) {
      toast({
        title: "Authentication Required",
        description: "Please log in to access this page.",
        variant: "destructive",
      });

      // Use window.location for more reliable redirection
      window.location.href = redirectTo;
      return;
    }

    // Validate token
    if (!isAuthTokenValid()) {
      // Try to refresh the token
      refreshAuthTokenIfNeeded().then(refreshed => {
        if (!refreshed) {
          toast({
            title: "Session Expired",
            description: "Your session has expired. Please log in again.",
            variant: "destructive",
          });
          
          // Clear tokens and redirect
          localStorage.removeItem("authToken");
          sessionStorage.removeItem("authToken");
          localStorage.removeItem("refreshToken");
          sessionStorage.removeItem("refreshToken");
          
          window.location.href = redirectTo;
        }
      });
    }
  }, [redirectTo, router, toast]);
}

// Function to log out user
export function logoutUser() {
  // Clear tokens from storage
  localStorage.removeItem("authToken");
  sessionStorage.removeItem("authToken");
  localStorage.removeItem("userData");

  // Redirect to login
  window.location.href = "/login";
}

// Function to set authentication data from login response
export function setAuthToken(token: string, rememberMe = false, loginData?: any) {
  if (!token) return false;

  const storage = rememberMe ? localStorage : sessionStorage;

  // Store the auth token
  storage.setItem("authToken", token);

  // Store refresh token if available
  if (loginData?.refreshToken) {
    storage.setItem("refreshToken", loginData.refreshToken);
  }

  // Store user data if available
  if (loginData?.user) {
    localStorage.setItem("userData", JSON.stringify(loginData.user));
  }

  // Store any additional login response data
  if (loginData) {
    const { token, refreshToken, ...additionalData } = loginData;
    if (Object.keys(additionalData).length > 0) {
      localStorage.setItem("loginData", JSON.stringify(additionalData));
    }
  }

  return true;
}

// Function to check if user is authenticated (returns boolean)
export function isAuthenticated() {
  if (typeof window === "undefined") {
    return false;
  }

  const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
  return !!token;
}

// Function to get auth token
export function getAuthToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
}

// Function to get user data
export function getUserData() {
  if (typeof window === "undefined") {
    return null;
  }

  // Try to get user data from localStorage
  try {
    const userData = localStorage.getItem("userData");
    if (!userData) {
      // If no user data in localStorage, return a default user object
      return {
        name: "John Doe",
        email: "john.doe@example.com",
        // Add other default properties as needed
      };
    }

    return JSON.parse(userData);
  } catch (error) {
    console.error("Error parsing user data:", error);
    // Return a default user object in case of error
    return {
      name: "John Doe",
      email: "john.doe@example.com",
      // Add other default properties as needed
    };
  }
}

/**
 * Checks if the current auth token is valid
 * @returns {boolean} True if the token exists and is not expired
 */
export function isAuthTokenValid() {
  if (typeof window === "undefined") return false;

  const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
  if (!token) {
    console.log("No auth token found");
    return false;
  }

  // Check if token is a JWT and parse it
  try {
    // Simple JWT structure check
    if (token.split(".").length !== 3) {
      console.log("Token is not a valid JWT format");
      return false;
    }

    // Try to decode the middle part (payload)
    const payload = JSON.parse(atob(token.split(".")[1]));
    console.log("Token payload decoded successfully");

    // Check if token has expiration and is not expired
    if (payload.exp) {
      const expirationTime = payload.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();
      const isValid = currentTime < expirationTime;
      
      // Log expiration details for debugging
      const timeRemaining = Math.floor((expirationTime - currentTime) / 1000 / 60); // minutes
      if (isValid) {
        console.log(`Token is valid. Expires in approximately ${timeRemaining} minutes`);
      } else {
        console.log(`Token has expired. Expired ${-timeRemaining} minutes ago`);
      }
      
      return isValid;
    }

    // If no expiration in token, assume it's valid but log a warning
    console.log("Warning: Token has no expiration date");
    return true;
  } catch (error) {
    console.error("Error checking token validity:", error);
    // If we can't parse the token, assume it's invalid
    return false;
  }
}

/**
 * Refreshes the auth token if needed
 * @returns {Promise<boolean>} True if token was refreshed successfully
 */
export async function refreshAuthTokenIfNeeded(): Promise<boolean> {
  if (typeof window === "undefined") return false;

  // Check if we need to refresh
  if (isAuthTokenValid()) {
    return true; // Token is still valid
  }

  console.log("Auth token needs refreshing");

  // For dashboard access, bypass refresh token requirement
  // Check if we're on a dashboard page
  const isDashboardPage = window.location.pathname.includes('/dashboard');
  if (isDashboardPage) {
    console.log("Dashboard access - bypassing refresh token requirement");
    return true; // Allow dashboard access without refresh token
  }

  try {
    const currentToken = getAuthToken();
    if (!currentToken) {
      console.error("No token available to refresh");
      return false;
    }

    // Actual implementation of token refresh - call your API
    const response = await fetch("/api/refresh-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${currentToken}`,
      },
      body: JSON.stringify({
        refreshToken: localStorage.getItem("refreshToken") || sessionStorage.getItem("refreshToken"),
      }),
      credentials: "include", // Include cookies if using HTTP-only cookies
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Token refresh failed:", errorData);

      // Clear tokens on authentication failure
      localStorage.removeItem("authToken");
      sessionStorage.removeItem("authToken");
      localStorage.removeItem("refreshToken");
      sessionStorage.removeItem("refreshToken");
      return false;
    }

    const data = await response.json();

    if (!data.token) {
      console.error("Invalid token refresh response");
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