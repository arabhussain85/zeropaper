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
    if (!receipt) return;
  
    try {
      // Create a new PDF document
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPos = 50;
      const lineHeight = 10;
      const margin = 20;
  
      // Zero Paper color scheme - using the provided brand color
      const primaryColor = "#1B9D65"; // Brand color
      const secondaryColor = "#158a59"; // Slightly darker shade
      const lightColor = "#e8f5f0"; // Light shade for backgrounds
  
      // Add header with logo
      doc.setFillColor(primaryColor);
      doc.rect(0, 0, pageWidth, 35, "F");
      
      // Add logo - we'll add a placeholder image since we can't directly load from URL
      // In production, you would need to load and convert the logo to base64 first
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text("ZERO PAPER", margin, 22);
      
      doc.setFontSize(12);
      doc.text("Digital Receipt Management", margin, 32);
  
      // Add receipt number with decorative element
      doc.setFillColor(255, 255, 255, 0.2);
      doc.roundedRect(pageWidth - 100, 10, 80, 15, 2, 2, "F");
      doc.setFontSize(10);
      doc.text(`RECEIPT #${receipt.id.substring(0, 8)}`, pageWidth - 95, 20);
  
      // Add receipt details section with rounded corners and subtle shadow
      doc.setDrawColor(220, 220, 220);
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(margin - 10, yPos - 15, pageWidth - margin * 2 + 20, 65, 5, 5, "FD");
      
      // Add store name and date in a clean layout
      doc.setTextColor(primaryColor);
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text(`${receipt.storeName}`, margin, yPos);
  
      // Add date in a stylish box
      doc.setFillColor(lightColor);
      doc.roundedRect(pageWidth - margin - 90, yPos - 10, 80, 20, 3, 3, "F");
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(80, 80, 80);
      doc.text("RECEIPT DATE", pageWidth - margin - 85, yPos - 2);
      
      doc.setTextColor(primaryColor);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text(`${formatDate(receipt.date)}`, pageWidth - margin - 85, yPos + 7);
  
      yPos += lineHeight * 2;
  
      // Add category with emoji in a stylish badge
      doc.setFillColor(lightColor);
      const categoryText = `${getCategoryEmoji(receipt.category)} ${receipt.category.toUpperCase()}`;
      const textWidth = doc.getTextWidth(categoryText) + 10;
      doc.roundedRect(margin, yPos - 7, textWidth, 14, 7, 7, "F");
      
      doc.setTextColor(primaryColor);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text(categoryText, margin + 5, yPos);
      
      yPos += lineHeight * 3.5;
  
      // Add decorative separator line
      doc.setDrawColor(primaryColor);
      doc.setLineWidth(0.5);
      doc.line(margin, yPos - 5, pageWidth - margin, yPos - 5);
  
      // Add product details section with modern layout
      doc.setTextColor(80, 80, 80);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("PRODUCT DETAILS", margin, yPos);
      yPos += lineHeight * 1.5;
  
      // Create a product details box
      doc.setFillColor(lightColor);
      doc.roundedRect(margin - 5, yPos - 8, pageWidth - margin * 2 + 10, 40, 3, 3, "F");
      yPos += 5;
  
      // Add product name
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(60, 60, 60);
      doc.text("Product:", margin, yPos);
      
      doc.setFont("helvetica", "bold");
      doc.setTextColor(40, 40, 40);
      doc.text(`${receipt.productName}`, margin + 45, yPos);
      yPos += lineHeight * 1.3;
  
      // Add price with highlighted box
      doc.setTextColor(60, 60, 60);
      doc.setFont("helvetica", "normal");
      doc.text("Price:", margin, yPos);
      
      // Create price badge
      doc.setFillColor(primaryColor);
      doc.roundedRect(margin + 45, yPos - 8, 60, 12, 2, 2, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.text(`${getCurrencySymbol(receipt.currency)}${receipt.price.toFixed(2)}`, margin + 50, yPos);
      yPos += lineHeight * 3;
  
      // Add dates section with elegant design
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(220, 220, 220);
      doc.roundedRect(margin - 5, yPos - 8, pageWidth - margin * 2 + 10, 50, 3, 3, "FD");
      
      doc.setTextColor(80, 80, 80);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("IMPORTANT DATES", margin, yPos);
      yPos += lineHeight * 1.5;
  
      // Create a two-column layout for dates
      const col1X = margin + 5;
      const col2X = pageWidth / 2 + 10;
  
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      
      // Column 1
      doc.text("Valid Until:", col1X, yPos);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(40, 40, 40);
      doc.text(receipt.validUptoDate ? formatDate(receipt.validUptoDate) : "N/A", col1X + 60, yPos);
      
      // Column 2
      if (receipt.refundableUptoDate) {
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 100, 100);
        doc.text("Refundable Until:", col2X, yPos);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(40, 40, 40);
        doc.text(formatDate(receipt.refundableUptoDate), col2X + 65, yPos);
      }
      
      yPos += lineHeight * 2;
  
      // Add store information
      if (receipt.storeLocation) {
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 100, 100);
        doc.text("Store Location:", col1X, yPos);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(40, 40, 40);
        doc.text(receipt.storeLocation, col1X + 60, yPos);
      }
      
      yPos += lineHeight * 4;
  
      // Add receipt image if available
      if (receiptImage) {
        // Add a heading for the image section
        doc.setTextColor(80, 80, 80);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("RECEIPT IMAGE", margin, yPos);
        yPos += lineHeight;
        
        // Create an elegant frame for the image
        doc.setDrawColor(primaryColor);
        doc.setLineWidth(1);
        
        // Calculate image dimensions to fit within page width while maintaining aspect ratio
        const imgWidth = pageWidth - margin * 2;
        const imgHeight = 110; // Adjust as needed
        
        // Draw frame
        doc.roundedRect(margin - 5, yPos, imgWidth + 10, imgHeight + 10, 3, 3, "S");
        
        // Add the image
        doc.addImage(`data:image/jpeg;base64,${receiptImage}`, "JPEG", margin, yPos + 5, imgWidth, imgHeight);
        yPos += imgHeight + 15;
      }
  
      // Add a QR code placeholder (in a real app, you would generate an actual QR code)
      const qrSize = 40;
      const qrX = pageWidth - margin - qrSize;
      const qrY = pageHeight - 60;
      
      // Drawing a placeholder QR frame
      doc.setDrawColor(primaryColor);
      doc.setLineWidth(1);
      doc.rect(qrX, qrY, qrSize, qrSize);
      
      // Add lines to suggest a QR code
      doc.setLineWidth(0.5);
      doc.line(qrX + 10, qrY + 10, qrX + 30, qrY + 10);
      doc.line(qrX + 10, qrY + 20, qrX + 30, qrY + 20);
      doc.line(qrX + 10, qrY + 30, qrX + 30, qrY + 30);
      
      doc.setFontSize(8);
      doc.setTextColor(80, 80, 80);
      doc.text("Scan to verify", qrX, qrY + qrSize + 10);
  
      // Add stylish footer with brand colors
      doc.setFillColor(primaryColor);
      doc.rect(0, pageHeight - 25, pageWidth, 25, "F");
      
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "normal");
      doc.text("Zero Paper - Your Digital Receipt Manager", margin, pageHeight - 15);
      doc.setFontSize(8);
      doc.text(`Receipt ID: ${receipt.id} | Generated on: ${new Date().toLocaleDateString()}`, margin, pageHeight - 8);
  
      // Save the PDF
      doc.save(`receipt-${receipt.id}.pdf`);
  
      toast({
        title: "PDF Exported",
        description: "Receipt has been exported as PDF successfully.",
      });
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast({
        title: "Export Failed",
        description: "Failed to export receipt as PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

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

