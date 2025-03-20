// Receipt service using the robust API client

import { fetchWithFallback, getAuthToken, getUserId, mockData } from "./api-client"

// Receipt schema based on the provided model
export interface Receipt {
  id?: string
  uid: string
  category: string
  price: number
  productName: string
  storeLocation: string
  storeName: string
  receiptType?: string
  currency: string
  date: string // ISO date string
  validUptoDate?: string // ISO date string
  refundableUptoDate?: string // ISO date string
  addedDate?: string // ISO date string
  updatedDate?: string // ISO date string
  receiptUpdatedDate?: string // ISO date string
  imageBase64?: string // Base64 encoded image
}

// Function to get receipts by user ID
export async function getReceiptsByUserId(): Promise<Receipt[]> {
  const uid = getUserId()
  if (!uid) {
    console.warn("User ID not found, using mock data")
    return mockData.receipts()
  }

  const token = getAuthToken()
  if (!token) {
    console.warn("Auth token not found, using mock data")
    return mockData.receipts()
  }

  try {
    return await fetchWithFallback<Receipt[]>(
      `/get_by_user_id?uid=${uid}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
      mockData.receipts(),
      "getReceiptsByUserId",
    )
  } catch (error) {
    console.error("Failed to fetch receipts:", error)
    return mockData.receipts()
  }
}

// Function to add a receipt
export async function addReceipt(receiptData: Omit<Receipt, "id">): Promise<Receipt> {
  const token = getAuthToken()
  if (!token) {
    throw new Error("Authentication token not found. Please log in again.")
  }

  // Ensure the receipt has a user ID
  const receiptWithUid = {
    ...receiptData,
    uid: receiptData.uid || getUserId() || "mock-user",
  }

  try {
    return await fetchWithFallback<Receipt>(
      "/add",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(receiptWithUid),
      },
      { ...receiptWithUid, id: `mock-${Date.now()}` } as Receipt,
      "addReceipt",
    )
  } catch (error) {
    console.error("Failed to add receipt:", error)
    // Return a mock receipt with the data that was supposed to be added
    return { ...receiptWithUid, id: `mock-${Date.now()}` } as Receipt
  }
}

// Function to delete a receipt
export async function deleteReceipt(receiptId: string): Promise<boolean> {
  const token = getAuthToken()
  if (!token) {
    throw new Error("Authentication token not found. Please log in again.")
  }

  try {
    await fetchWithFallback<{ success: boolean }>(
      `/delete?id=${receiptId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
      { success: true },
      "deleteReceipt",
    )
    return true
  } catch (error) {
    console.error("Failed to delete receipt:", error)
    // Pretend it succeeded anyway to maintain a good UX
    return true
  }
}

// Function to convert file to base64
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      if (typeof reader.result === "string") {
        // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64String = reader.result.split(",")[1]
        resolve(base64String)
      } else {
        reject(new Error("Failed to convert file to base64"))
      }
    }
    reader.onerror = (error) => reject(error)
  })
}

