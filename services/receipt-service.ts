import { getAuthToken } from "@/utils/auth-helpers"

const BASE_URL = "https://services.stage.zeropaper.online/api/zpu"

export interface Receipt {
  id: string
  uid: string
  category: string
  price: number
  productName: string
  storeLocation: string
  storeName: string
  receiptType: string
  currency: string
  date: string
  validUptoDate: string
  refundableUptoDate: string
  addedDate: string
  updatedDate: string
  receiptUpdatedDate: string
}

export interface ReceiptResponse {
  success: boolean
  message: string
  data: Receipt[]
}

export interface AddReceiptPayload {
  category: string
  price: number
  productName: string
  storeLocation: string
  storeName: string
  receiptType: string
  currency: string
  date: string
  validUptoDate?: string
  refundableUptoDate?: string
}

// Get all receipts for the current user
export async function getReceipts(): Promise<Receipt[]> {
  try {
    const token = getAuthToken()
    if (!token) {
      throw new Error("Authentication required")
    }

    const response = await fetch(`${BASE_URL}/receipts/get_by_user_id`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `Error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data.data || []
  } catch (error) {
    console.error("Error fetching receipts:", error)
    throw error
  }
}

// Add a new receipt
export async function addReceipt(receiptData: AddReceiptPayload): Promise<Receipt> {
  try {
    const token = getAuthToken()
    if (!token) {
      throw new Error("Authentication required")
    }

    const response = await fetch(`${BASE_URL}/receipts/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(receiptData),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `Error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data.data
  } catch (error) {
    console.error("Error adding receipt:", error)
    throw error
  }
}

// Search receipts by query
export async function searchReceipts(query: string): Promise<Receipt[]> {
  try {
    const token = getAuthToken()
    if (!token) {
      throw new Error("Authentication required")
    }

    const response = await fetch(`${BASE_URL}/receipts/search?query=${encodeURIComponent(query)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `Error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data.data || []
  } catch (error) {
    console.error("Error searching receipts:", error)
    throw error
  }
}

// Add these functions after the searchReceipts function

// Delete a receipt
export async function deleteReceipt(receiptId: string): Promise<boolean> {
  try {
    const token = getAuthToken()
    if (!token) {
      throw new Error("Authentication required")
    }

    const response = await fetch(`${BASE_URL}/receipts/delete/${receiptId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `Error: ${response.status} ${response.statusText}`)
    }

    return true
  } catch (error) {
    console.error("Error deleting receipt:", error)
    throw error
  }
}

// Update a receipt
export async function updateReceipt(receiptId: string, receiptData: Partial<AddReceiptPayload>): Promise<Receipt> {
  try {
    const token = getAuthToken()
    if (!token) {
      throw new Error("Authentication required")
    }

    const response = await fetch(`${BASE_URL}/receipts/update/${receiptId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(receiptData),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `Error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data.data
  } catch (error) {
    console.error("Error updating receipt:", error)
    throw error
  }
}

// Upload receipt image
export async function uploadReceiptImage(receiptId: string, imageFile: File): Promise<string> {
  try {
    const token = getAuthToken()
    if (!token) {
      throw new Error("Authentication required")
    }

    const formData = new FormData()
    formData.append("image", imageFile)
    formData.append("receiptId", receiptId)

    const response = await fetch(`${BASE_URL}/receipts/upload-image`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `Error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data.imageUrl || ""
  } catch (error) {
    console.error("Error uploading receipt image:", error)
    throw error
  }
}

// Format currency based on the currency code
export function formatCurrency(amount: number, currency = "EUR"): string {
  const currencySymbols: Record<string, string> = {
    EUR: "€",
    USD: "$",
    GBP: "£",
    // Add more currencies as needed
  }

  const symbol = currencySymbols[currency] || currency
  return `${symbol}${amount.toFixed(2)}`
}

// Format date to a readable format
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  } catch (error) {
    console.error("Error formatting date:", error)
    return dateString
  }
}

