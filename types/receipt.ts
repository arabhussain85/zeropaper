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
    validUptoDate?: string
    refundableUptoDate?: string
    addedDate?: string
    updatedDate?: string
    receiptUpdatedDate?: string
    imageBase64?: string
  }
  
  export interface NewReceipt {
    uid: string
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
    imageBase64?: string
  }
  
  