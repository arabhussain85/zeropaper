"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { deleteReceipt, type Receipt } from "@/services/receipt-service"
import { useToast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { X, Download, Trash2, Loader2, Calendar, Store, ShoppingBag, MapPin, CreditCard, ImageIcon } from "lucide-react"

interface ReceiptDetailModalProps {
  receipt: Receipt | null
  receiptImage: string | null
  isOpen: boolean
  onClose: () => void
  onDelete: (id: string) => void
  onDownloadPDF: (receipt: Receipt) => void
}

export default function ReceiptDetailModal({
  receipt,
  receiptImage,
  isOpen,
  onClose,
  onDelete,
  onDownloadPDF,
}: ReceiptDetailModalProps) {
  const [activeTab, setActiveTab] = useState("details")
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  if (!receipt) return null

  const handleDelete = async () => {
    if (!receipt.id) return

    try {
      setIsDeleting(true)
      await deleteReceipt(receipt.id)

      toast({
        title: "Receipt Deleted",
        description: "The receipt has been successfully deleted.",
      })

      onDelete(receipt.id)
      setDeleteConfirmOpen(false)
      onClose()
    } catch (error) {
      console.error("Error deleting receipt:", error)
      toast({
        title: "Error",
        description: "Failed to delete receipt. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    } catch (error) {
      return "Invalid Date"
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-lg p-0 max-h-[90vh] overflow-auto">
          <div className="sticky top-0 z-10 bg-white p-4 border-b flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">Receipt Details</DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="px-4 pt-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="image">Image</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="details" className="p-4 pt-6">
              <div className="space-y-6">
                <div className="flex items-center gap-3 justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#1B9D65]/10 rounded-lg flex items-center justify-center text-[#1B9D65]">
                      <Store className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{receipt.storeName || "Unknown Store"}</h3>
                      <p className="text-sm text-gray-500">{receipt.category || "Uncategorized"}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDownloadPDF(receipt)}
                      className="text-[#1B9D65] hover:bg-[#1B9D65]/10"
                      title="Download PDF"
                    >
                      <Download className="w-5 h-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteConfirmOpen(true)}
                      className="text-red-600 hover:bg-red-50"
                      title="Delete Receipt"
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                <div className="grid gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 mt-1">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Product Name</p>
                      <p className="font-medium">{receipt.productName || "No product name"}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 mt-1">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Price</p>
                      <p className="font-medium text-lg">
                        {receipt.currency || "€"} {(receipt.price || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 mt-1">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Receipt Date</p>
                      <p className="font-medium">{formatDate(receipt.date)}</p>
                    </div>
                  </div>

                  {receipt.validUptoDate && (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 mt-1">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Valid Until</p>
                        <p className="font-medium">{formatDate(receipt.validUptoDate)}</p>
                      </div>
                    </div>
                  )}

                  {receipt.storeLocation && (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 mt-1">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Store Location</p>
                        <p className="font-medium">{receipt.storeLocation}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="image" className="p-4 pt-6">
              <div className="flex justify-end mb-4">
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDownloadPDF(receipt)}
                    className="text-[#1B9D65] hover:bg-[#1B9D65]/10"
                    title="Download PDF"
                  >
                    <Download className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteConfirmOpen(true)}
                    className="text-red-600 hover:bg-red-50"
                    title="Delete Receipt"
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {receipt.imageBase64 || receiptImage ? (
                <div className="flex flex-col items-center">
                  <div className="relative w-full max-w-md mx-auto bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={`data:image/jpeg;base64,${receipt.imageBase64 || receiptImage}`}
                      alt="Receipt"
                      className="w-full object-contain max-h-[400px]"
                      onError={(e) => {
                        console.error("Image failed to load:", e)
                        e.currentTarget.src = "/placeholder.svg?height=200&width=200"
                      }}
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-4">Receipt image for {receipt.storeName}</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <ImageIcon className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium">No Image Available</h3>
                  <p className="text-gray-500">This receipt doesn't have an attached image.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Delete Receipt
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the receipt from your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

