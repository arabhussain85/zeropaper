import { getAuthToken, getUserData } from "@/utils/auth-helpers"

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

const API_BASE_URL = "https://services.stage.zeropaper.online/api/zpu"

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

// Function to add a new receipt
export async function addReceipt(receipt: Omit<Receipt, "uid">): Promise<Receipt> {
  try {
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

    const response = await fetch(`${API_BASE_URL}/receipt`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
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
  try {
    const token = getAuthToken()

    if (!token) {
      throw new Error("Authentication required")
    }

    // Get user ID from auth data
    const userData = getUserData()
    if (!userData || !userData.uid) {
      throw new Error("User ID not found")
    }

    const response = await fetch(`${API_BASE_URL}/receipt/get_by_user_id?uid=${userData.uid}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    })

    const data = await handleResponse(response)
    return Array.isArray(data) ? data : []
  } catch (error) {
    console.error("Error fetching receipts:", error)
    return []
  }
}

// Function to get a receipt by ID
export async function getReceiptById(id: string): Promise<Receipt | null> {
  try {
    const token = getAuthToken()

    if (!token) {
      throw new Error("Authentication required")
    }

    const response = await fetch(`${API_BASE_URL}/receipt/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
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
    const token = getAuthToken()

    if (!token) {
      throw new Error("Authentication required")
    }

    const response = await fetch(`${API_BASE_URL}/receipt/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
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
    const token = getAuthToken()

    if (!token) {
      throw new Error("Authentication required")
    }

    const response = await fetch(`${API_BASE_URL}/receipt/delete?id=${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
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

    const response = await fetch(`${API_BASE_URL}/receipt/upload`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })

    const data = await handleResponse(response)
    return data.imageReceiptId || ""
  } catch (error) {
    console.error("Error uploading receipt image:", error)
    throw error
  }
}

// Function to get receipt image as base64
export async function getReceiptImage(imageReceiptId: string): Promise<string> {
  try {
    const token = getAuthToken()

    if (!token) {
      throw new Error("Authentication required")
    }

    const response = await fetch(`${API_BASE_URL}/receipts/imageBase64?imageReceiptId=${imageReceiptId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
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

