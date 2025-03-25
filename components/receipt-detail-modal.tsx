"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2, Download, Trash2, X, ImageIcon, MapPin, Calendar, CreditCard, Check, FileText } from "lucide-react"
import type { Receipt } from "@/services/api-wrapper"
import { formatDate } from "@/utils/date-helpers"
import { deleteReceipt } from "@/services/api-wrapper"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import jsPDF from "jspdf"

interface ReceiptDetailModalProps {
  receipt: Receipt | null
  receiptImage: string | null
  isOpen: boolean
  onClose: () => void
  onDelete: (id: string) => void
}

export default function ReceiptDetailModal({
  receipt,
  receiptImage,
  isOpen,
  onClose,
  onDelete,
}: ReceiptDetailModalProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Reset states when a new receipt is opened
    setSuccess(false)
    setError(null)
    setIsDeleting(false)
  }, [receipt?.id])

  const getCategoryEmoji = (category: string) => {
    switch (category) {
      case "business":
        return "💼"
      case "personal":
        return "🛒"
      case "medical":
        return "💊"
      case "electrical":
        return "🔌"
      default:
        return "📄"
    }
  }

  const getCurrencySymbol = (currency: string) => {
    switch (currency) {
      case "USD":
        return "$"
      case "EUR":
        return "€"
      case "GBP":
        return "£"
      default:
        return currency
    }
  }
  const handleDelete = async () => {
    if (!receipt) {
      setError("No receipt data available")
      return
    }

    if (!receipt.id) {
      setError("Receipt ID is undefined or missing")
      return
    }

    try {
      setIsDeleting(true)
      setError(null)

      const success = await deleteReceipt(receipt.id)

      if (success) {
        setSuccess(true)
        toast({
          title: "Receipt Deleted",
          description: "The receipt has been successfully deleted.",
        })
        // Call the onDelete callback to update the parent component
        onDelete(receipt.id)
        // Close the modal after a short delay
        setTimeout(() => {
          onClose()
        }, 1500)
      } else {
        throw new Error("Failed to delete receipt")
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to delete receipt")
      toast({
        title: "Error",
        description: "Failed to delete receipt. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }
  const handleDownloadImage = () => {
    if (!receiptImage || !receipt) return

    // Create a temporary link element
    const link = document.createElement("a")
    link.href = `data:image/jpeg;base64,${receiptImage}`
    link.download = `receipt-${receipt.id}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Image Downloaded",
      description: "Receipt image has been downloaded successfully.",
    })
  }

  const handleExportPDF = () => {
    if (!receipt) return

    try {
      // Create a new PDF document
      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.getWidth()
      let yPos = 20
      const lineHeight = 10
      const margin = 20

      // Zero Paper color scheme
      const primaryColor = "#1a5fb4"
      const secondaryColor = "#3584e4"
      const accentColor = "#62a0ea"

      // Add logo/header
      doc.setFillColor(primaryColor)
      doc.rect(0, 0, pageWidth, 40, "F")

      // Add title
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(22)
      doc.setFont("helvetica", "bold")
      doc.text("ZERO PAPER", margin, 25)

      doc.setFontSize(12)
      doc.text("Digital Receipt Management", margin, 35)

      yPos = 60

      // Add receipt details section
      doc.setFillColor(245, 245, 245)
      doc.roundedRect(margin - 10, yPos - 15, pageWidth - margin * 2 + 20, 40, 3, 3, "F")

      // Add store name and date
      doc.setTextColor(0, 0, 0)
      doc.setFontSize(16)
      doc.setFont("helvetica", "bold")
      doc.text(`${receipt.storeName}`, margin, yPos)

      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(100, 100, 100)
      doc.text(`Receipt Date: ${formatDate(receipt.date)}`, pageWidth - margin - 80, yPos)

      yPos += lineHeight * 2

      // Add category with emoji
      doc.setTextColor(secondaryColor)
      doc.setFontSize(12)
      doc.text(`${getCategoryEmoji(receipt.category)} ${receipt.category.toUpperCase()}`, margin, yPos)
      yPos += lineHeight * 2

      // Add product details section
      doc.setTextColor(0, 0, 0)
      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.text("Product Details", margin, yPos)
      yPos += lineHeight * 1.5

      // Add product name
      doc.setFontSize(12)
      doc.setFont("helvetica", "normal")
      doc.text(`Product: ${receipt.productName}`, margin, yPos)
      yPos += lineHeight

      // Add price with highlighted box
      doc.setFillColor(accentColor)
      doc.roundedRect(margin - 5, yPos - 8, 80, 12, 2, 2, "F")
      doc.setTextColor(255, 255, 255)
      doc.setFont("helvetica", "bold")
      doc.text(`Price: ${getCurrencySymbol(receipt.currency)}${receipt.price.toFixed(2)}`, margin, yPos)
      yPos += lineHeight * 2

      // Add dates section
      doc.setTextColor(0, 0, 0)
      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.text("Important Dates", margin, yPos)
      yPos += lineHeight * 1.5

      doc.setFontSize(12)
      doc.setFont("helvetica", "normal")

      if (receipt.validUptoDate) {
        doc.text(`Valid Until: ${formatDate(receipt.validUptoDate)}`, margin, yPos)
        yPos += lineHeight
      }

      if (receipt.refundableUptoDate) {
        doc.text(`Refundable Until: ${formatDate(receipt.refundableUptoDate)}`, margin, yPos)
        yPos += lineHeight
      }

      // Add store location if available
      if (receipt.storeLocation) {
        yPos += lineHeight
        doc.setFontSize(14)
        doc.setFont("helvetica", "bold")
        doc.text("Store Information", margin, yPos)
        yPos += lineHeight * 1.5

        doc.setFontSize(12)
        doc.setFont("helvetica", "normal")
        doc.text(`Location: ${receipt.storeLocation}`, margin, yPos)
        yPos += lineHeight
      }

      // Add receipt image if available
      if (receiptImage) {
        yPos += lineHeight * 2
        doc.setFontSize(14)
        doc.setFont("helvetica", "bold")
        doc.text("Receipt Image", margin, yPos)
        yPos += lineHeight * 1.5

        // Calculate image dimensions to fit within page width while maintaining aspect ratio
        const imgWidth = pageWidth - margin * 2
        const imgHeight = 120 // Adjust as needed

        // Add the image
        doc.addImage(`data:image/jpeg;base64,${receiptImage}`, "JPEG", margin, yPos, imgWidth, imgHeight)
        yPos += imgHeight + lineHeight
      }

      // Add footer
      const footerPosition = doc.internal.pageSize.getHeight() - 20
      doc.setFontSize(10)
      doc.setTextColor(100, 100, 100)
      doc.text("Generated with Zero Paper - Your Digital Receipt Manager", margin, footerPosition)
      doc.text(`Receipt ID: ${receipt.id}`, margin, footerPosition + 7)

      // Save the PDF
      doc.save(`receipt-${receipt.id}.pdf`)

      toast({
        title: "PDF Exported",
        description: "Receipt has been exported as PDF successfully.",
      })
    } catch (error) {
      console.error("Error exporting PDF:", error)
      toast({
        title: "Export Failed",
        description: "Failed to export receipt as PDF. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (!receipt) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl mr-2">{getCategoryEmoji(receipt.category)}</span>
            <span>{receipt.storeName}</span>
          </DialogTitle>
        </DialogHeader>

        {/* Success message */}
        {success && (
          <Alert className="bg-green-50 text-green-800 mb-4">
            <AlertDescription className="flex items-center">
              <Check className="w-4 h-4 mr-2" />
              Receipt deleted successfully!
            </AlertDescription>
          </Alert>
        )}

        {/* Error message */}
        {error && (
          <Alert className="bg-red-50 text-red-800 mb-4">
            <AlertDescription className="flex items-center">
              <X className="w-4 h-4 mr-2" />
              {error}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          {/* Receipt Image */}
          {receiptImage ? (
            <div className="mb-4">
              <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={`data:image/jpeg;base64,${receiptImage}`}
                  alt="Receipt"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    console.error("Error loading receipt image")
                    e.currentTarget.src = "/placeholder.jpg"
                  }}
                />
                <div className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-md text-xs flex items-center">
                  <ImageIcon className="w-3 h-3 mr-1" />
                  Receipt Image
                </div>
              </div>
              <div className="flex gap-2 mt-2">
                <Button variant="outline" size="sm" onClick={handleDownloadImage}>
                  <Download className="w-4 h-4 mr-2" />
                  Download Image
                </Button>
                <Button variant="outline" size="sm" onClick={handleExportPDF}>
                  <FileText className="w-4 h-4 mr-2" />
                  Export PDF
                </Button>
              </div>
            </div>
          ) : (
            <div className="mb-4 flex items-center justify-center h-32 bg-gray-100 rounded-lg">
              <div className="text-center text-gray-500">
                <ImageIcon className="w-8 h-8 mx-auto mb-2" />
                <p>No receipt image available</p>
              </div>
            </div>
          )}

          {/* Receipt Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Product Name</p>
              <p className="font-semibold">{receipt.productName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Category</p>
              <p className="font-semibold capitalize">{receipt.category}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Receipt Date</p>
                <p>{formatDate(receipt.date)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Valid Until</p>
                <p>{receipt.validUptoDate ? formatDate(receipt.validUptoDate) : "N/A"}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Price</p>
                <p className="font-semibold">
                  {getCurrencySymbol(receipt.currency)}
                  {receipt.price.toFixed(2)}
                </p>
              </div>
            </div>
            {receipt.refundableUptoDate && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Refundable Until</p>
                  <p>{formatDate(receipt.refundableUptoDate)}</p>
                </div>
              </div>
            )}
          </div>

          {receipt.storeLocation && (
            <div className="flex items-center gap-2 text-gray-500">
              <MapPin className="w-4 h-4" />
              <div>
                <p className="text-sm text-gray-500">Store Location</p>
                <p>{receipt.storeLocation}</p>
              </div>
            </div>
          )}

          {receipt.receiptType && (
            <div>
              <p className="text-sm text-gray-500">Receipt Type</p>
              <p className="capitalize">{receipt.receiptType}</p>
            </div>
          )}

          {receipt.addedDate && (
            <div>
              <p className="text-sm text-gray-500">Added On</p>
              <p>{formatDate(receipt.addedDate)}</p>
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between items-center mt-6">
          <div className="flex gap-2">
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className={success ? "opacity-50 cursor-not-allowed" : ""}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Receipt
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleExportPDF}
              disabled={isDeleting}
              className={success ? "opacity-50 cursor-not-allowed" : ""}
            >
              <FileText className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
          </div>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

