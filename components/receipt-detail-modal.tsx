// // "use client"

// // import { useState } from "react"
// // import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
// // import { Button } from "@/components/ui/button"
// // import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// // import { deleteReceipt, type Receipt } from "@/services/receipt-service"
// // import { useToast } from "@/components/ui/use-toast"
// // import {
// //   AlertDialog,
// //   AlertDialogAction,
// //   AlertDialogCancel,
// //   AlertDialogContent,
// //   AlertDialogDescription,
// //   AlertDialogFooter,
// //   AlertDialogHeader,
// //   AlertDialogTitle,
// // } from "@/components/ui/alert-dialog"
// // import { X, Download, Trash2, Loader2, Calendar, Store, ShoppingBag, MapPin, CreditCard, ImageIcon } from "lucide-react"

// // interface ReceiptDetailModalProps {
// //   receipt: Receipt | null
// //   receiptImage: string | null
// //   isOpen: boolean
// //   onClose: () => void
// //   onDelete: (id: string) => void
// //   onDownloadPDF: (receipt: Receipt) => void
// // }

// // export default function ReceiptDetailModal({
// //   receipt,
// //   receiptImage,
// //   isOpen,
// //   onClose,
// //   onDelete,
// //   onDownloadPDF,
// // }: ReceiptDetailModalProps) {
// //   const [activeTab, setActiveTab] = useState("details")
// //   const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
// //   const [isDeleting, setIsDeleting] = useState(false)
// //   const { toast } = useToast()

// //   if (!receipt) return null

// //   const handleDelete = async () => {
// //     if (!receipt.id) return

// //     try {
// //       setIsDeleting(true)
// //       const response = await deleteReceipt(receipt.id)

// //       if (!response || !response.success) {
// //         throw new Error("Failed to delete receipt from server")
// //       }

// //       toast({
// //         title: "Receipt Deleted",
// //         description: "The receipt has been successfully deleted.",
// //       })

// //       onDelete(receipt.id)
// //       setDeleteConfirmOpen(false)
// //       onClose()
// //     } catch (error) {
// //       console.error("Error deleting receipt:", error)
// //       toast({
// //         title: "Error",
// //         description: error instanceof Error ? error.message : "Failed to delete receipt. Please try again.",
// //         variant: "destructive",
// //       })
// //     } finally {
// //       setIsDeleting(false)
// //     }
// //   }

// //   const formatDate = (dateString: string) => {
// //     if (!dateString) return "N/A"
// //     try {
// //       const date = new Date(dateString)
// //       return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
// //     } catch (error) {
// //       return "Invalid Date"
// //     }
// //   }

// //   return (
// //     <>
// //       <Dialog open={isOpen} onOpenChange={onClose}>
// //         <DialogContent className="sm:max-w-lg p-0 max-h-[90vh] overflow-auto">
// //           <div className="sticky top-0 z-10 bg-white p-4 border-b flex items-center justify-between">
// //             <DialogTitle className="text-xl font-semibold">Receipt Details</DialogTitle>
// //             <Button variant="ghost" size="icon" onClick={onClose}>
// //               <X className="h-4 w-4" />
// //             </Button>
// //           </div>

// //           <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab} className="w-full">
// //             <div className="px-4 pt-4">
// //               <TabsList className="grid w-full grid-cols-2">
// //                 <TabsTrigger value="details">Details</TabsTrigger>
// //                 <TabsTrigger value="image">Image</TabsTrigger>
// //               </TabsList>
// //             </div>

// //             <TabsContent value="details" className="p-4 pt-6">
// //               <div className="space-y-6">
// //                 <div className="flex items-center gap-3 justify-between">
// //                   <div className="flex items-center gap-3">
// //                     <div className="w-10 h-10 bg-[#1B9D65]/10 rounded-lg flex items-center justify-center text-[#1B9D65]">
// //                       <Store className="w-5 h-5" />
// //                     </div>
// //                     <div>
// //                       <h3 className="text-lg font-semibold">{receipt.storeName || "Unknown Store"}</h3>
// //                       <p className="text-sm text-gray-500">{receipt.category || "Uncategorized"}</p>
// //                     </div>
// //                   </div>
// //                   <div className="flex gap-2">
// //                     <Button
// //                       variant="ghost"
// //                       size="icon"
// //                       onClick={() => onDownloadPDF(receipt)}
// //                       className="text-[#1B9D65] hover:bg-[#1B9D65]/10"
// //                       title="Download PDF"
// //                     >
// //                       <Download className="w-5 h-5" />
// //                     </Button>
// //                     <Button
// //                       variant="ghost"
// //                       size="icon"
// //                       onClick={() => setDeleteConfirmOpen(true)}
// //                       className="text-red-600 hover:bg-red-50"
// //                       title="Delete Receipt"
// //                     >
// //                       <Trash2 className="w-5 h-5" />
// //                     </Button>
// //                   </div>
// //                 </div>

// //                 <div className="grid gap-4">
// //                   <div className="flex items-start gap-3">
// //                     <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 mt-1">
// //                       <ShoppingBag className="w-4 h-4" />
// //                     </div>
// //                     <div>
// //                       <p className="text-sm text-gray-500">Product Name</p>
// //                       <p className="font-medium">{receipt.productName || "No product name"}</p>
// //                     </div>
// //                   </div>

// //                   <div className="flex items-start gap-3">
// //                     <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 mt-1">
// //                       <CreditCard className="w-4 h-4" />
// //                     </div>
// //                     <div>
// //                       <p className="text-sm text-gray-500">Price</p>
// //                       <p className="font-medium text-lg">
// //                         {receipt.currency || "€"} {(receipt.price || 0).toFixed(2)}
// //                       </p>
// //                     </div>
// //                   </div>

// //                   <div className="flex items-start gap-3">
// //                     <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 mt-1">
// //                       <Calendar className="w-4 h-4" />
// //                     </div>
// //                     <div>
// //                       <p className="text-sm text-gray-500">Receipt Date</p>
// //                       <p className="font-medium">{formatDate(receipt.date)}</p>
// //                     </div>
// //                   </div>

// //                   {receipt.validUptoDate && (
// //                     <div className="flex items-start gap-3">
// //                       <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 mt-1">
// //                         <Calendar className="w-4 h-4" />
// //                       </div>
// //                       <div>
// //                         <p className="text-sm text-gray-500">Valid Until</p>
// //                         <p className="font-medium">{formatDate(receipt.validUptoDate)}</p>
// //                       </div>
// //                     </div>
// //                   )}

// //                   {receipt.storeLocation && (
// //                     <div className="flex items-start gap-3">
// //                       <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 mt-1">
// //                         <MapPin className="w-4 h-4" />
// //                       </div>
// //                       <div>
// //                         <p className="text-sm text-gray-500">Store Location</p>
// //                         <p className="font-medium">{receipt.storeLocation}</p>
// //                       </div>
// //                     </div>
// //                   )}
// //                 </div>
// //               </div>
// //             </TabsContent>

// //             <TabsContent value="image" className="p-4 pt-6">
// //               <div className="flex justify-end mb-4">
// //                 <div className="flex gap-2">
// //                   <Button
// //                     variant="ghost"
// //                     size="icon"
// //                     onClick={() => onDownloadPDF(receipt)}
// //                     className="text-[#1B9D65] hover:bg-[#1B9D65]/10"
// //                     title="Download PDF"
// //                   >
// //                     <Download className="w-5 h-5" />
// //                   </Button>
// //                   <Button
// //                     variant="ghost"
// //                     size="icon"
// //                     onClick={() => setDeleteConfirmOpen(true)}
// //                     className="text-red-600 hover:bg-red-50"
// //                     title="Delete Receipt"
// //                   >
// //                     <Trash2 className="w-5 h-5" />
// //                   </Button>
// //                 </div>
// //               </div>

// //               {receiptImage ? (
// //                 <div className="flex flex-col items-center">
// //                   <div className="relative w-full max-w-md mx-auto bg-gray-100 rounded-lg overflow-hidden">
// //                     <img
// //                       src={`data:image/jpeg;base64,${receiptImage}`}
// //                       alt="Receipt"
// //                       className="w-full object-contain max-h-[400px]"
// //                       onError={(e) => {
// //                         console.error("Image failed to load")
// //                         e.currentTarget.src = "/placeholder.svg?height=200&width=200"
// //                       }}
// //                     />
// //                   </div>
// //                   <p className="text-sm text-gray-500 mt-4">Receipt image for {receipt.storeName}</p>
// //                 </div>
// //               ) : (
// //                 <div className="flex flex-col items-center justify-center py-12">
// //                   <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
// //                     <ImageIcon className="w-8 h-8 text-gray-400" />
// //                   </div>
// //                   <h3 className="text-lg font-medium">No Image Available</h3>
// //                   <p className="text-gray-500">This receipt doesn't have an attached image.</p>
// //                 </div>
// //               )}
// //             </TabsContent>
// //           </Tabs>
// //         </DialogContent>
// //       </Dialog>

// //       {/* Delete Confirmation Dialog */}
// //       <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
// //         <AlertDialogContent>
// //           <AlertDialogHeader>
// //             <AlertDialogTitle className="flex items-center gap-2 text-red-600">
// //               <Trash2 className="h-5 w-5" />
// //               Delete Receipt
// //             </AlertDialogTitle>
// //             <AlertDialogDescription>
// //               This action cannot be undone. This will permanently delete the receipt from your account.
// //             </AlertDialogDescription>
// //           </AlertDialogHeader>
// //           <AlertDialogFooter>
// //             <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
// //             <AlertDialogAction
// //               onClick={handleDelete}
// //               disabled={isDeleting}
// //               className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
// //             >
// //               {isDeleting ? (
// //                 <>
// //                   <Loader2 className="w-4 h-4 mr-2 animate-spin" />
// //                   Deleting...
// //                 </>
// //               ) : (
// //                 "Delete"
// //               )}
// //             </AlertDialogAction>
// //           </AlertDialogFooter>
// //         </AlertDialogContent>
// //       </AlertDialog>
// //     </>
// //   )
// // }

// "use client"

// import { useState, useEffect } from "react"
// import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
// import { Button } from "@/components/ui/button"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { deleteReceipt, type Receipt } from "@/services/receipt-service"
// import { useToast } from "@/components/ui/use-toast"
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from "@/components/ui/alert-dialog"
// import { X, Download, Trash2, Loader2, Calendar, Store, ShoppingBag, MapPin, CreditCard, ImageIcon } from "lucide-react"

// // Include the getReceiptImage function in the same file
// async function getReceiptImage(receiptId: string): Promise<string> {
//   try {
//     const token = localStorage.getItem("authToken")

//     if (!token) {
//       throw new Error("Authentication required. Please log in again.")
//     }

//     console.log("Fetching image for receipt:", receiptId)

//     // Encode the receiptId for the URL
//     const encodedReceiptId = encodeURIComponent(receiptId)

//     const response = await fetch(
//       `https://services.stage.zeropaper.online/api/zpu/receipts/imageBase64?receiptId=${encodedReceiptId}`,
//       {
//         method: "GET",
//         headers: {
//           Accept: "application/json",
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//         cache: "no-store",
//       },
//     )

//     if (!response.ok) {
//       throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`)
//     }

//     const data = await response.json()
//     console.log("Image data received:", data && data.imageBase64 ? "Yes (with data)" : "Yes (but empty)")
//     return data.imageBase64 || ""
//   } catch (error) {
//     console.error("Error fetching receipt image:", error)
//     return ""
//   }
// }

// interface ReceiptDetailModalProps {
//   receipt: Receipt | null
//   isOpen: boolean
//   onClose: () => void
//   onDelete: (id: string) => void
//   onDownloadPDF: (receipt: Receipt) => void
// }

// export default function ReceiptDetailModal({
//   receipt,
//   isOpen,
//   onClose,
//   onDelete,
//   onDownloadPDF,
// }: ReceiptDetailModalProps) {
//   const [activeTab, setActiveTab] = useState("details")
//   const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
//   const [isDeleting, setIsDeleting] = useState(false)
//   const [receiptImage, setReceiptImage] = useState<string | null>(null)
//   const [isLoadingImage, setIsLoadingImage] = useState(false)
//   const { toast } = useToast()

//   useEffect(() => {
//     // Fetch the image when the receipt changes or modal opens
//     if (receipt && receipt.id && isOpen) {
//       setIsLoadingImage(true)
//       getReceiptImage(receipt.id)
//         .then(imageData => {
//           setReceiptImage(imageData)
//         })
//         .catch(error => {
//           console.error("Failed to load receipt image:", error)
//           toast({
//             title: "Image Load Error",
//             description: "Failed to load receipt image. Please try again.",
//             variant: "destructive",
//           })
//         })
//         .finally(() => {
//           setIsLoadingImage(false)
//         })
//     } else {
//       // Reset image when modal is closed or receipt changes
//       setReceiptImage(null)
//     }
//   }, [receipt, isOpen, toast])

//   if (!receipt) return null

//   const handleDelete = async () => {
//     if (!receipt.id) return

//     try {
//       setIsDeleting(true)
//       const response = await deleteReceipt(receipt.id)

//       if (!response || !response.success) {
//         throw new Error("Failed to delete receipt from server")
//       }

//       toast({
//         title: "Receipt Deleted",
//         description: "The receipt has been successfully deleted.",
//       })

//       onDelete(receipt.id)
//       setDeleteConfirmOpen(false)
//       onClose()
//     } catch (error) {
//       console.error("Error deleting receipt:", error)
//       toast({
//         title: "Error",
//         description: error instanceof Error ? error.message : "Failed to delete receipt. Please try again.",
//         variant: "destructive",
//       })
//     } finally {
//       setIsDeleting(false)
//     }
//   }

//   const formatDate = (dateString: string) => {
//     if (!dateString) return "N/A"
//     try {
//       const date = new Date(dateString)
//       return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
//     } catch (error) {
//       return "Invalid Date"
//     }
//   }

//   return (
//     <>
//       <Dialog open={isOpen} onOpenChange={onClose}>
//         <DialogContent className="sm:max-w-lg p-0 max-h-[90vh] overflow-auto">
//           <div className="sticky top-0 z-10 bg-white p-4 border-b flex items-center justify-between">
//             <DialogTitle className="text-xl font-semibold">Receipt Details</DialogTitle>
//             <Button variant="ghost" size="icon" onClick={onClose}>
//               <X className="h-4 w-4" />
//             </Button>
//           </div>

//           <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab} className="w-full">
//             <div className="px-4 pt-4">
//               <TabsList className="grid w-full grid-cols-2">
//                 <TabsTrigger value="details">Details</TabsTrigger>
//                 <TabsTrigger value="image">Image</TabsTrigger>
//               </TabsList>
//             </div>

//             <TabsContent value="details" className="p-4 pt-6">
//               <div className="space-y-6">
//                 <div className="flex items-center gap-3 justify-between">
//                   <div className="flex items-center gap-3">
//                     <div className="w-10 h-10 bg-[#1B9D65]/10 rounded-lg flex items-center justify-center text-[#1B9D65]">
//                       <Store className="w-5 h-5" />
//                     </div>
//                     <div>
//                       <h3 className="text-lg font-semibold">{receipt.storeName || "Unknown Store"}</h3>
//                       <p className="text-sm text-gray-500">{receipt.category || "Uncategorized"}</p>
//                     </div>
//                   </div>
//                   <div className="flex gap-2">
//                     <Button
//                       variant="ghost"
//                       size="icon"
//                       onClick={() => onDownloadPDF(receipt)}
//                       className="text-[#1B9D65] hover:bg-[#1B9D65]/10"
//                       title="Download PDF"
//                     >
//                       <Download className="w-5 h-5" />
//                     </Button>
//                     <Button
//                       variant="ghost"
//                       size="icon"
//                       onClick={() => setDeleteConfirmOpen(true)}
//                       className="text-red-600 hover:bg-red-50"
//                       title="Delete Receipt"
//                     >
//                       <Trash2 className="w-5 h-5" />
//                     </Button>
//                   </div>
//                 </div>

//                 <div className="grid gap-4">
//                   <div className="flex items-start gap-3">
//                     <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 mt-1">
//                       <ShoppingBag className="w-4 h-4" />
//                     </div>
//                     <div>
//                       <p className="text-sm text-gray-500">Product Name</p>
//                       <p className="font-medium">{receipt.productName || "No product name"}</p>
//                     </div>
//                   </div>

//                   <div className="flex items-start gap-3">
//                     <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 mt-1">
//                       <CreditCard className="w-4 h-4" />
//                     </div>
//                     <div>
//                       <p className="text-sm text-gray-500">Price</p>
//                       <p className="font-medium text-lg">
//                         {receipt.currency || "€"} {(receipt.price || 0).toFixed(2)}
//                       </p>
//                     </div>
//                   </div>

//                   <div className="flex items-start gap-3">
//                     <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 mt-1">
//                       <Calendar className="w-4 h-4" />
//                     </div>
//                     <div>
//                       <p className="text-sm text-gray-500">Receipt Date</p>
//                       <p className="font-medium">{formatDate(receipt.date)}</p>
//                     </div>
//                   </div>

//                   {receipt.validUptoDate && (
//                     <div className="flex items-start gap-3">
//                       <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 mt-1">
//                         <Calendar className="w-4 h-4" />
//                       </div>
//                       <div>
//                         <p className="text-sm text-gray-500">Valid Until</p>
//                         <p className="font-medium">{formatDate(receipt.validUptoDate)}</p>
//                       </div>
//                     </div>
//                   )}

//                   {receipt.storeLocation && (
//                     <div className="flex items-start gap-3">
//                       <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 mt-1">
//                         <MapPin className="w-4 h-4" />
//                       </div>
//                       <div>
//                         <p className="text-sm text-gray-500">Store Location</p>
//                         <p className="font-medium">{receipt.storeLocation}</p>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </TabsContent>

//             <TabsContent value="image" className="p-4 pt-6">
//               <div className="flex justify-end mb-4">
//                 <div className="flex gap-2">
//                   <Button
//                     variant="ghost"
//                     size="icon"
//                     onClick={() => onDownloadPDF(receipt)}
//                     className="text-[#1B9D65] hover:bg-[#1B9D65]/10"
//                     title="Download PDF"
//                   >
//                     <Download className="w-5 h-5" />
//                   </Button>
//                   <Button
//                     variant="ghost"
//                     size="icon"
//                     onClick={() => setDeleteConfirmOpen(true)}
//                     className="text-red-600 hover:bg-red-50"
//                     title="Delete Receipt"
//                   >
//                     <Trash2 className="w-5 h-5" />
//                   </Button>
//                 </div>
//               </div>

//               {isLoadingImage ? (
//                 <div className="flex flex-col items-center justify-center py-12">
//                   <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
//                   <p className="text-gray-500 mt-4">Loading receipt image...</p>
//                 </div>
//               ) : receiptImage ? (
//                 <div className="flex flex-col items-center">
//                   <div className="relative w-full max-w-md mx-auto bg-gray-100 rounded-lg overflow-hidden">
//                     <img
//                       src={`data:image/jpeg;base64,${receiptImage}`}
//                       alt="Receipt"
//                       className="w-full object-contain max-h-[400px]"
//                       onError={(e) => {
//                         console.error("Image failed to load")
//                         e.currentTarget.src = "/placeholder.svg?height=200&width=200"
//                       }}
//                     />
//                   </div>
//                   <p className="text-sm text-gray-500 mt-4">Receipt image for {receipt.storeName}</p>
//                 </div>
//               ) : (
//                 <div className="flex flex-col items-center justify-center py-12">
//                   <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
//                     <ImageIcon className="w-8 h-8 text-gray-400" />
//                   </div>
//                   <h3 className="text-lg font-medium">No Image Available</h3>
//                   <p className="text-gray-500">This receipt doesn't have an attached image.</p>
//                 </div>
//               )}
//             </TabsContent>
//           </Tabs>
//         </DialogContent>
//       </Dialog>

//       {/* Delete Confirmation Dialog */}
//       <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle className="flex items-center gap-2 text-red-600">
//               <Trash2 className="h-5 w-5" />
//               Delete Receipt
//             </AlertDialogTitle>
//             <AlertDialogDescription>
//               This action cannot be undone. This will permanently delete the receipt from your account.
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
//             <AlertDialogAction
//               onClick={handleDelete}
//               disabled={isDeleting}
//               className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
//             >
//               {isDeleting ? (
//                 <>
//                   <Loader2 className="w-4 h-4 mr-2 animate-spin" />
//                   Deleting...
//                 </>
//               ) : (
//                 "Delete"
//               )}
//             </AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
//     </>
//   )
// }
"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  X,
  Download,
  Trash2,
  Edit,
  Calendar,
  Store,
  MapPin,
  CreditCard,
  Clock,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
} from "lucide-react"
import { deleteReceipt, getReceiptImage, type Receipt } from "@/services/receipt-service"
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

interface ReceiptDetailModalProps {
  receipt: Receipt | null
  isOpen: boolean
  onClose: () => void
  onDelete: (id: string) => void
  onDownloadPDF: (receipt: Receipt) => void
  onEdit?: (receipt: Receipt) => void
}

export default function ReceiptDetailModal({
  receipt,
  isOpen,
  onClose,
  onDelete,
  onDownloadPDF,
  onEdit,
}: ReceiptDetailModalProps) {
  const [activeTab, setActiveTab] = useState("details")
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [receiptImage, setReceiptImage] = useState<string | null>(null)
  const [isLoadingImage, setIsLoadingImage] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [additionalImages, setAdditionalImages] = useState<string[]>([])
  const { toast } = useToast()

  // Calculate total images (primary + additional)
  const totalImages = (receiptImage ? 1 : 0) + additionalImages.length

  // Parse additional images if available
  useEffect(() => {
    if (receipt?.additionalImages) {
      try {
        const images = JSON.parse(receipt.additionalImages)
        if (Array.isArray(images)) {
          setAdditionalImages(images)
        }
      } catch (error) {
        console.error("Error parsing additional images:", error)
        setAdditionalImages([])
      }
    } else {
      setAdditionalImages([])
    }
  }, [receipt])

  // Fetch the image when the receipt changes or modal opens
  useEffect(() => {
    if (receipt && receipt.id && isOpen) {
      setIsLoadingImage(true)
      getReceiptImage(receipt.id)
        .then((imageData) => {
          setReceiptImage(imageData)
          setCurrentImageIndex(0) // Reset to first image when loading a new receipt
        })
        .catch((error) => {
          console.error("Failed to load receipt image:", error)
          toast({
            title: "Image Load Error",
            description: "Failed to load receipt image. Please try again.",
            variant: "destructive",
          })
        })
        .finally(() => {
          setIsLoadingImage(false)
        })
    } else {
      // Reset image when modal is closed or receipt changes
      setReceiptImage(null)
    }
  }, [receipt, isOpen, toast])

  // Handle image navigation
  const nextImage = () => {
    if (currentImageIndex < totalImages - 1) {
      setCurrentImageIndex(currentImageIndex + 1)
    }
  }

  const prevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1)
    }
  }

  // Get current image based on index
  const getCurrentImage = () => {
    if (currentImageIndex === 0) {
      return receiptImage
    } else {
      return additionalImages[currentImageIndex - 1]
    }
  }

  if (!receipt) return null

  const handleDelete = async () => {
    if (!receipt.id) return

    try {
      setIsDeleting(true)
      const response = await deleteReceipt(receipt.id)

      if (!response.success) {
        throw new Error("Failed to delete receipt from server")
      }

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
        description: error instanceof Error ? error.message : "Failed to delete receipt. Please try again.",
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

  const handleEdit = () => {
    if (onEdit && receipt) {
      onEdit(receipt)
      onClose()
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-lg p-0 max-h-[90vh] overflow-auto">
          <DialogHeader className="bg-[#1B9D65] text-white p-4 sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-bold">Receipt Details</DialogTitle>
              <button onClick={onClose} className="rounded-full p-1 hover:bg-white/10 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 p-0 bg-gray-100">
              <TabsTrigger
                value="details"
                className="py-3 data-[state=active]:bg-white data-[state=active]:shadow-none rounded-none"
              >
                Details
              </TabsTrigger>
              <TabsTrigger
                value="image"
                className="py-3 data-[state=active]:bg-white data-[state=active]:shadow-none rounded-none"
              >
                Images ({totalImages})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="p-6 space-y-6">
              <div className="bg-[#1B9D65]/5 p-4 rounded-lg border border-[#1B9D65]/20">
                <h3 className="text-lg font-bold text-[#1B9D65] mb-2">{receipt.productName || "No product name"}</h3>
                <div className="flex justify-between items-center">
                  <p className="text-xl font-bold">
                    {receipt.currency || "€"} {(receipt.price || 0).toFixed(2)}
                  </p>
                  <span className="px-3 py-1 bg-[#1B9D65]/10 text-[#1B9D65] rounded-full text-sm font-medium capitalize">
                    {receipt.category || "Uncategorized"}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Store className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Store</p>
                    <p className="font-medium">{receipt.storeName || "Unknown Store"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="font-medium">{formatDate(receipt.date || "")}</p>
                  </div>
                </div>

                {receipt.storeLocation && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-medium">{receipt.storeLocation}</p>
                    </div>
                  </div>
                )}

                {receipt.validUptoDate && (
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Valid Until</p>
                      <p className="font-medium">{formatDate(receipt.validUptoDate)}</p>
                    </div>
                  </div>
                )}

                {receipt.refundableUptoDate && (
                  <div className="flex items-start gap-3">
                    <CreditCard className="w-5 h-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Refundable Until</p>
                      <p className="font-medium">{formatDate(receipt.refundableUptoDate)}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-between pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setDeleteConfirmOpen(true)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => onDownloadPDF(receipt)}
                    className="text-[#1B9D65] hover:text-[#1B9D65] hover:bg-[#1B9D65]/10"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                  <Button variant="default" className="bg-[#1B9D65] hover:bg-[#1B9D65]/90" onClick={handleEdit}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="image" className="p-0">
              <div className="relative bg-gray-900 flex items-center justify-center min-h-[300px]">
                {isLoadingImage ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                    <p className="text-white mt-4">Loading receipt image...</p>
                  </div>
                ) : totalImages > 0 ? (
                  <>
                    {/* Image display with better MIME type handling */}
                    <img
                      src={`data:image/*;base64,${getCurrentImage()}`}
                      alt={`Receipt for ${receipt.productName}`}
                      className="max-h-[70vh] max-w-full object-contain"
                      onError={(e) => {
                        console.error("Image failed to load")
                        console.log("Image base64 length:", getCurrentImage()?.length || 0)
                        console.log("Image base64 starts with:", getCurrentImage()?.substring(0, 20) || "empty")
                        e.currentTarget.src = "/placeholder.svg?height=200&width=200"
                      }}
                    />

                    {/* Image navigation controls */}
                    {totalImages > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          disabled={currentImageIndex === 0}
                          className="absolute left-2 p-2 rounded-full bg-black/50 text-white disabled:opacity-30"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          onClick={nextImage}
                          disabled={currentImageIndex === totalImages - 1}
                          className="absolute right-2 p-2 rounded-full bg-black/50 text-white disabled:opacity-30"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                        <div className="absolute bottom-2 left-0 right-0 text-center text-white text-sm">
                          {currentImageIndex + 1} of {totalImages}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="text-center text-gray-400 p-8">
                    <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    <p>No image available for this receipt</p>
                  </div>
                )}
              </div>

              <div className="p-4 flex justify-between">
                <Button variant="outline" onClick={() => setActiveTab("details")}>
                  Back to Details
                </Button>
                {receiptImage && (
                  <Button
                    variant="default"
                    className="bg-[#1B9D65] hover:bg-[#1B9D65]/90"
                    onClick={() => onDownloadPDF(receipt)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
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
