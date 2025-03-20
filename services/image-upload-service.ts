// services/image-upload-service.tsx

import { getAuthToken } from "@/utils/auth-helpers"

const BASE_URL = "https://services.stage.zeropaper.online/api/zpu"

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

