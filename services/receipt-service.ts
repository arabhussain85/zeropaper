import { getAuthToken, getUserData, refreshAuthTokenIfNeeded } from "@/utils/auth-helpers"

// Types for our receipts based on the provided schema
export interface Receipt {
  id?: string
  uid: string
  category: string
  price: number
  productName: string
  storeLocation?: string
  storeName: string
  receiptType?: string
  currency: string
  date: string
  validUptoDate?: string
  refundableUptoDate?: string
  addedDate?: string
  updatedDate?: string
  receiptUpdatedDate?: string
  imageReceiptId?: string
}

// Use environment variable for API base URL if available, otherwise use the default
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://services.stage.zeropaper.online/api/zpu"

// Helper function to handle API responses
async function handleResponse(response: Response) {
  // First check if the response is OK
  if (!response.ok) {
    let errorMessage = `Error: ${response.status} ${response.statusText}`

    try {
      // Try to get more detailed error information from the response
      const errorData = await response.json()
      errorMessage = errorData.message || errorData.error || errorMessage
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

  // If the response is OK, parse and return the JSON data
  const text = await response.text()
  return text ? JSON.parse(text) : {}
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

// Check if we should use mock API
const useMockApi = process.env.NEXT_PUBLIC_USE_MOCK_API === "true"

// Function to make an authenticated API request
async function authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
  if (typeof window === "undefined") {
    throw new Error("Cannot make authenticated requests server-side")
  }

  // Get the current token first
  let token = getAuthToken()
  
  // If no token found, try to refresh
  if (!token) {
    const refreshed = await refreshAuthTokenIfNeeded()
    if (!refreshed) {
      throw new Error("Authentication required")
    }
    token = getAuthToken()
  }

  // Verify we have a token after potential refresh
  if (!token) {
    throw new Error("Authentication required")
  }

  // Add authorization header
  const authOptions = {
    ...options,
    mode: 'cors',
    credentials: 'include',
    headers: {
      ...options.headers,
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'Access-Control-Allow-Origin': '*',
    },
  }

  // Make the request
  const response = await fetch(url, authOptions)

  // Handle authentication errors
  if (response.status === 401 || response.status === 403) {
    // Try refreshing token on auth errors
    const refreshed = await refreshAuthTokenIfNeeded()
    if (refreshed) {
      // Retry request with new token
      const newToken = getAuthToken()
      authOptions.headers['Authorization'] = `Bearer ${newToken}`
      return fetch(url, authOptions)
    }
    
    // If refresh failed, clear tokens and throw error
    localStorage.removeItem("authToken")
    sessionStorage.removeItem("authToken")
    throw new Error("Authentication failed. Please log in again.")
  }

  return response
}

// Function to add a new receipt
export async function addReceipt(receipt: Omit<Receipt, "uid">): Promise<Receipt> {
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

    // Add user ID to receipt data
    const receiptWithUid = {
      ...receipt,
      uid: userData.uid,
    }

    console.log("Adding receipt:", JSON.stringify(receiptWithUid, null, 2))



    const response = await authenticatedFetch(`${API_BASE_URL}/receipt/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(receiptWithUid),
      cache: "no-store",
    })

    const data = await handleResponse(response)
    return data
  } catch (error) {
    console.error("Error adding receipt:", error)
    throw error
  }
}

// Function to get all receipts for the current user
export async function getReceipts(): Promise<Receipt[]> {
  return getReceiptsByUserId()
}

// Function to get all receipts for the current user
export async function getReceiptsByUserId(): Promise<Receipt[]> {
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



    console.log("Fetching receipts for user:", userData.uid)

    const response = await authenticatedFetch(`${API_BASE_URL}/receipt/get_by_user_id?uid=${userData.uid}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    })

    const data = await handleResponse(response)
    console.log("Receipts data:", data)
    return Array.isArray(data) ? data : []
  } catch (error) {
    console.error("Error fetching receipts:", error)
    return []
  }
}

// Function to get a receipt by ID
export async function getReceiptById(id: string): Promise<Receipt | null> {
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



    const response = await authenticatedFetch(`${API_BASE_URL}/receipt/${id}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    })

    const data = await handleResponse(response)
    return data
  } catch (error) {
    console.error("Error fetching receipt:", error)
    return null
  }
}

// Function to update a receipt
export async function updateReceipt(id: string, receipt: Partial<Receipt>): Promise<Receipt> {
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



    const response = await authenticatedFetch(`${API_BASE_URL}/receipt/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(receipt),
      cache: "no-store",
    })

    const data = await handleResponse(response)
    return data
  } catch (error) {
    console.error("Error updating receipt:", error)
    throw error
  }
}

// Function to delete a receipt
export async function deleteReceipt(id: string): Promise<boolean> {
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



    const response = await authenticatedFetch(`${API_BASE_URL}/receipt/delete?id=${id}`, {
      method: "DELETE",
      cache: "no-store",
    })

    await handleResponse(response)
    return true
  } catch (error) {
    console.error("Error deleting receipt:", error)
    return false
  }
}

// Function to upload receipt image as base64
export async function uploadReceiptImage(file: File): Promise<string> {
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

    // Convert file to base64
    const base64Data = await fileToBase64(file)



    // Create payload with base64 data
    const payload = {
      imageBase64: base64Data,
      fileName: file.name,
      contentType: file.type,
    }

    console.log("Uploading image:", file.name, file.type, "size:", file.size)

    const response = await authenticatedFetch(`${API_BASE_URL}/receipt/upload`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    const data = await handleResponse(response)
    console.log("Upload response:", data)
    return data.imageReceiptId || ""
  } catch (error) {
    console.error("Error uploading receipt image:", error)
    throw error
  }
}

// Function to get receipt image as base64
export async function getReceiptImage(imageReceiptId: string): Promise<string> {
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



    console.log("Fetching image:", imageReceiptId)

    const response = await authenticatedFetch(`${API_BASE_URL}/receipt/imageBase64?imageReceiptId=${imageReceiptId}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    })

    const data = await handleResponse(response)
    return data.imageBase64 || ""
  } catch (error) {
    console.error("Error fetching receipt image:", error)
    return ""
  }
}

