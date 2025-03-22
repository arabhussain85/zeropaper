'use client'

import { useAuth } from '@/utils/auth-helpers'
import { ReceiptUploadForm } from '@/components/receipt-upload-form'

export default function ReceiptUploadPage() {
  // Ensure user is authenticated
  useAuth()

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Upload & Process Receipt</h1>
      <p className="text-gray-500 mb-8">
        Upload your receipt image and provide details to process it automatically.
        The system will extract information from your receipt and store it securely.
      </p>
      <ReceiptUploadForm />
    </div>
  )
}