import { createErrorMessage, safeParseJSON } from "@/utils/api-helpers"
import { logNetworkError } from "@/utils/network-debug"

// Base URL for API - use environment variable if available
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://services.stage.zeropaper.online/api/zpu"

// Flag to enable mock data when API is unavailable
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_API === "true" || false

// Function to send OTP for account deletion
export async function sendDeleteAccountOTP(email: string): Promise<{ success: boolean; message: string }> {
  try {
    console.log("Sending delete account OTP to:", email)

    if (USE_MOCK_DATA) {
      console.log("Using mock data for sendDeleteAccountOTP")
      return { success: true, message: "Delete account OTP sent successfully (mock)" }
    }

    // Use our server-side API route to avoid CORS issues
    const response = await fetch(`/api/users/delete-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    })

    // First check if the response is OK
    if (!response.ok) {
      const responseText = await response.text()
      if (responseText.includes("<!DOCTYPE html>")) {
        console.error("API route not found. Check that /api/users/delete-otp route exists and is properly configured.")
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

    if (data && data.error) {
      throw new Error(data.error)
    }

    return { success: true, message: "Delete account OTP sent successfully" }
  } catch (error) {
    console.error("Error sending delete account OTP:", error)
    logNetworkError(error, "sendDeleteAccountOTP")

    if (USE_MOCK_DATA) {
      return { success: true, message: "Delete account OTP sent successfully (mock fallback)" }
    }

    return {
      success: false,
      message: createErrorMessage(error),
    }
  }
}
export async function deleteUserAccount(email: string, otp: string): Promise<{ success: boolean; message: string }> {
  try {
    console.log("Deleting account for:", email);

    if (USE_MOCK_DATA) {
      console.log("Using mock data for deleteUserAccount");
      return { success: true, message: "Account deleted successfully (mock)" };
    }

    // Retrieve auth token from local storage
    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      throw new Error("Authentication token not found. Please log in again.");
    }

    // Construct the URL with query parameters
    const apiUrl = `https://services.stage.zeropaper.online/api/zpu/users/delete?otp=${encodeURIComponent(otp)}&email=${encodeURIComponent(email)}`;

    // Make the request
    const response = await fetch(apiUrl, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${authToken}`,
      },
    });
    if (response.ok){
      logou
    }

    // Read response as text first
    const responseText = await response.text();

    // Try to parse as JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (error) {
      console.warn("Response is not valid JSON. Treating it as plain text:", responseText);
      return { success: true, message: responseText }; // Assume success if the response is a success message
    }

    // Handle API errors
    if (data && data.error) {
      throw new Error(data.error);
    }

    return { success: true, message: data?.message || "Account deleted successfully" };
  } catch (error) {
    console.error("Error deleting account:", error);
    logNetworkError(error, "deleteUserAccount");

    if (USE_MOCK_DATA) {
      return { success: true, message: "Account deleted successfully (mock fallback)" };
    }

    return {
      success: false,
      message: createErrorMessage(error),
    };
  }
}
