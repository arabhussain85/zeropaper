import { getAuthToken, getUserData, refreshAuthTokenIfNeeded } from "@/utils/auth-helpers"
import { Receipt, NewReceipt } from "@/types/receipt"

// Use environment variable for API base URL if available, otherwise use the default
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://services.stage.zeropaper.online/api/zpu"

// Function to process a receipt with form data
export async function processReceiptWithFormData(formData: FormData): Promise<Receipt> {
  try {
    // Check if token is valid
    const isValid = await refreshAuthTokenIfNeeded()
    if (!isValid) {
      throw new Error("Authentication failed. Please log in again.")
    }

    const token = getAuthToken()
    if (!token) {
      throw new Error("Authentication required")
    }

    // Get user ID from auth data
    const userData = getUserData()
    if (!userData || !userData.uid) {
      throw new Error("User ID not found")
    }

    // Add user ID to form data if not already present
    if (!formData.has('uid')) {
      formData.append('uid', userData.uid)
    }

    console.log("Processing receipt with form data")

    // Send the form data to our API endpoint
    const response = await fetch(`/api/receipts/process`, {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    })

    // Handle response
    if (!response.ok) {
      let errorMessage = `Error: ${response.status} ${response.statusText}`

      try {
        // Try to get more detailed error information from the response
        const errorData = await response.json()
        errorMessage = errorData.message || errorData.error || errorMessage
        
        // If we have detailed validation errors, include them
        if (errorData.details && Array.isArray(errorData.details)) {
          errorMessage += ": " + errorData.details.join(", ")
        }
      } catch (e) {
        // If we can't parse the error as JSON, just use the status text
        console.log("Could not parse error response as JSON")
      }

      // Check for authentication errors
      if (response.status === 401 || response.status === 403) {
        throw new Error("Authentication failed. Please log in again.")
      }

      // Log the error for debugging
      console.error("API error:", errorMessage)

      // Throw an error with the message
      throw new Error(errorMessage)
    }

    // Parse and return the response data
    const data = await response.json()
    return data as Receipt
  } catch (error) {
    console.error("Error processing receipt:", error)
    throw error
  }
}

// Function to add a receipt with form data
export async function addReceiptWithFormData(formData: FormData): Promise<Receipt> {
  try {
    // Check if token is valid
    const isValid = await refreshAuthTokenIfNeeded()
    if (!isValid) {
      throw new Error("Authentication failed. Please log in again.")
    }

    const token = getAuthToken()
    if (!token) {
      throw new Error("Authentication required")
    }

    // Get user ID from auth data
    const userData = getUserData()
    if (!userData || !userData.uid) {
      throw new Error("User ID not found")
    }

    // Add user ID to form data if not already present
    if (!formData.has('uid')) {
      formData.append('uid', userData.uid)
    }

    console.log("Adding receipt with form data")

    // Send the form data to our API endpoint
    const response = await fetch(`/api/receipts/add`, {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    })

    // Handle response
    if (!response.ok) {
      let errorMessage = `Error: ${response.status} ${response.statusText}`

      try {
        // Try to get more detailed error information from the response
        const errorData = await response.json()
        errorMessage = errorData.message || errorData.error || errorMessage
        
        // If we have detailed validation errors, include them
        if (errorData.details && Array.isArray(errorData.details)) {
          errorMessage += ": " + errorData.details.join(", ")
        }
      } catch (e) {
        // If we can't parse the error as JSON, just use the status text
        console.log("Could not parse error response as JSON")
      }

      // Check for authentication errors
      if (response.status === 401 || response.status === 403) {
        throw new Error("Authentication failed. Please log in again.")
      }

      // Log the error for debugging
      console.error("API error:", errorMessage)

      // Throw an error with the message
      throw new Error(errorMessage)
    }

    // Parse and return the response data
    const data = await response.json()
    return data as Receipt
  } catch (error) {
    console.error("Error adding receipt:", error)
    throw error
  }
}

// Function to convert File to base64
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      // The result includes the data URL prefix (e.g., "data:image/jpeg;base64,"),
      // so we need to remove that prefix to get just the base64 string
      const base64String = reader.result as string
      const base64Content = base64String.split(",")[1]
      resolve(base64Content)
    }
    reader.onerror = (error) => reject(error)
  })
}

export async function createReceiptFormData(formData: any, file: File): Promise<FormData> {
  const data = new FormData()

  // Convert file to base64
  const imageBase64 = await fileToBase64(file)
  
  // Required fields
  const requiredFields = {
    imageBase64,
    price: formData.price.toString(),
    productName: formData.productName,
    category: formData.category,
    date: new Date(formData.date).toISOString(),
    storeLocation: formData.storeLocation,
    storeName: formData.storeName,
    currency: formData.currency,
    uid: getUserData()?.uid || ''
  }

  // Add required fields
  Object.entries(requiredFields).forEach(([key, value]) => {
    if (!value) {
      throw new Error(`Missing required field: ${key}`)
    }
    data.append(key, value.toString())
  })

  // Optional date fields
  if (formData.validUptoDate) {
    data.append('validUptoDate', new Date(formData.validUptoDate).toISOString())
  }
  if (formData.refundableUptoDate) {
    data.append('refundableUptoDate', new Date(formData.refundableUptoDate).toISOString())
  }

  return data
}