// Mock data for testing when the real API is not available
import type { Receipt } from "./receipt-service"

// Generate a random ID
const generateId = () => Math.random().toString(36).substring(2, 15)

// Mock user data
const mockUsers = [
  {
    uid: "mock-user-1",
    email: "user@example.com",
    name: "Test User",
  },
]

// Mock receipts data
const mockReceipts: Receipt[] = [
  {
    id: "mock-receipt-1",
    uid: "mock-user-1",
    category: "business",
    price: 125.5,
    productName: "Office Supplies",
    storeName: "Office Depot",
    storeLocation: "123 Main St",
    currency: "USD",
    date: new Date().toISOString(),
    addedDate: new Date().toISOString(),
  },
  {
    id: "mock-receipt-2",
    uid: "mock-user-1",
    category: "medical",
    price: 75.2,
    productName: "Prescription",
    storeName: "City Pharmacy",
    currency: "USD",
    date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    addedDate: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "mock-receipt-3",
    uid: "mock-user-1",
    category: "personal",
    price: 45.99,
    productName: "Groceries",
    storeName: "Whole Foods",
    storeLocation: "456 Market St",
    currency: "USD",
    date: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    addedDate: new Date(Date.now() - 172800000).toISOString(),
  },
]

// Mock image data
const mockImages: Record<string, string> = {
  "mock-image-1": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=", // 1x1 transparent pixel
}

// Mock API functions
export const mockApi = {
  // Auth functions
  login: async (email: string, password: string) => {
    console.log("MOCK API: Login attempt", email)
    const user = mockUsers.find((u) => u.email === email)
    if (!user) {
      throw new Error("User not found")
    }
    return {
      token: "mock-token-" + generateId(),
      user,
    }
  },

  // Receipt functions
  getReceipts: async (uid: string) => {
    console.log("MOCK API: Getting receipts for user", uid)
    return mockReceipts.filter((r) => r.uid === uid)
  },

  getReceiptById: async (id: string) => {
    console.log("MOCK API: Getting receipt by ID", id)
    return mockReceipts.find((r) => r.id === id) || null
  },

  addReceipt: async (receipt: Omit<Receipt, "id" | "addedDate">) => {
    console.log("MOCK API: Adding receipt", receipt)
    const newReceipt: Receipt = {
      ...receipt,
      id: "mock-receipt-" + generateId(),
      addedDate: new Date().toISOString(),
    }
    mockReceipts.push(newReceipt)
    return newReceipt
  },

  updateReceipt: async (id: string, receipt: Partial<Receipt>) => {
    console.log("MOCK API: Updating receipt", id, receipt)
    const index = mockReceipts.findIndex((r) => r.id === id)
    if (index === -1) {
      throw new Error("Receipt not found")
    }

    mockReceipts[index] = {
      ...mockReceipts[index],
      ...receipt,
      updatedDate: new Date().toISOString(),
    }

    return mockReceipts[index]
  },

  deleteReceipt: async (id: string) => {
    console.log("MOCK API: Deleting receipt", id)
    const index = mockReceipts.findIndex((r) => r.id === id)
    if (index !== -1) {
      mockReceipts.splice(index, 1)
    }
    return true
  },

  // Image functions
  uploadImage: async (base64: string, fileName: string) => {
    console.log("MOCK API: Uploading image", fileName)
    const imageId = "mock-image-" + generateId()
    mockImages[imageId] = base64
    return { imageReceiptId: imageId }
  },

  getImage: async (imageId: string) => {
    console.log("MOCK API: Getting image", imageId)
    return {
      imageBase64: mockImages[imageId] || mockImages["mock-image-1"],
    }
  },
}

