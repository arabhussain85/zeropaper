"use client"

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

