"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, MoreVertical, Plus, MapPin, Filter, Loader2, AlertCircle, Trash2, Receipt } from "lucide-react"
import AddReceiptDialog from "@/components/add-receipt-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getReceiptsByUserId, deleteReceipt, type Receipt as ReceiptType } from "@/services/receipt-service"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
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

export default function ReceiptsPage() {
  const [isAddReceiptOpen, setIsAddReceiptOpen] = useState(false)
  const [filter, setFilter] = useState("all")
  const [sortBy, setSortBy] = useState("date")
  const [isLoaded, setIsLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [receipts, setReceipts] = useState<ReceiptType[]>([])
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [receiptToDelete, setReceiptToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  // Fetch receipts
  const fetchReceipts = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await getReceiptsByUserId()
      setReceipts(data)
    } catch (error) {
      console.error("Error fetching receipts:", error)
      setError(error instanceof Error ? error.message : "Failed to load receipts. Please try again.")
    } finally {
      setIsLoading(false)
      setIsLoaded(true)
    }
  }

  // Initial load
  useEffect(() => {
    fetchReceipts()
  }, [])

  // Handle delete receipt
  const handleDeleteReceipt = async () => {
    if (!receiptToDelete) return

    try {
      setIsDeleting(true)
      await deleteReceipt(receiptToDelete)

      // Update local state
      setReceipts(receipts.filter((receipt) => receipt.id !== receiptToDelete))

      toast({
        title: "Receipt Deleted",
        description: "The receipt has been successfully deleted.",
      })
    } catch (error) {
      console.error("Error deleting receipt:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete receipt. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDeleteConfirmOpen(false)
      setReceiptToDelete(null)
    }
  }

  // Confirm delete
  const confirmDelete = (id: string) => {
    setReceiptToDelete(id)
    setDeleteConfirmOpen(true)
  }

  // Filter and sort receipts
  const filteredReceipts = receipts
    .filter((receipt) => {
      // Category filter
      if (filter !== "all" && receipt.category.toLowerCase() !== filter.toLowerCase()) {
        return false
      }

      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase()
        return (
          receipt.storeName.toLowerCase().includes(search) ||
          receipt.productName.toLowerCase().includes(search) ||
          receipt.storeLocation.toLowerCase().includes(search)
        )
      }

      return true
    })
    .sort((a, b) => {
      if (sortBy === "date") {
        return new Date(b.date).getTime() - new Date(a.date).getTime()
      } else if (sortBy === "price") {
        return b.price - a.price
      }
      return 0
    })

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
  }

  // Get category emoji
  const getCategoryEmoji = (category: string) => {
    switch (category.toLowerCase()) {
      case "medical":
        return "💊"
      case "electrical":
        return "🔌"
      case "business":
        return "💼"
      case "personal":
        return "🛒"
      default:
        return "📝"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <motion.header
        className="bg-[#1B9D65] text-white p-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto">
          <motion.h1
            className="text-2xl font-bold mb-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Receipts
          </motion.h1>
          <motion.p
            className="text-white/80 mb-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            View and manage all your receipts
          </motion.p>
        </div>
      </motion.header>

      {/* Main Content */}
      <motion.main
        className="max-w-7xl mx-auto px-4 py-6"
        variants={containerVariants}
        initial="hidden"
        animate={isLoaded ? "visible" : "hidden"}
      >
        {/* Search */}
        <motion.div className="relative mb-6" variants={itemVariants}>
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search receipts"
            className="w-full h-12 pl-12 pr-4 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1B9D65]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </motion.div>

        {/* Filters */}
        <motion.div className="flex flex-col md:flex-row gap-4 mb-6" variants={itemVariants}>
          <div className="flex gap-2">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[150px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="personal">Personal</SelectItem>
                <SelectItem value="medical">Medical</SelectItem>
                <SelectItem value="electrical">Electrical</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date (Newest)</SelectItem>
                <SelectItem value="price">Price (Highest)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* Error message */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 text-[#1B9D65] animate-spin" />
            <span className="ml-2 text-lg">Loading receipts...</span>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && filteredReceipts.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Receipt className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium mb-2">No receipts found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || filter !== "all"
                ? "Try changing your search or filter criteria"
                : "Add your first receipt to get started"}
            </p>
            <button
              onClick={() => setIsAddReceiptOpen(true)}
              className="inline-flex items-center px-4 py-2 bg-[#1B9D65] text-white rounded-md hover:bg-[#1B9D65]/90"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Receipt
            </button>
          </div>
        )}

        {/* Summary */}
        {!isLoading && filteredReceipts.length > 0 && (
          <motion.div className="flex justify-between items-center mb-6" variants={itemVariants}>
            <h2 className="text-xl font-semibold">{filteredReceipts.length} Receipts</h2>
            <p className="text-xl font-semibold">
              Total: {filteredReceipts[0]?.currency || "€"}
              {filteredReceipts.reduce((sum, receipt) => sum + receipt.price, 0).toFixed(2)}
            </p>
          </motion.div>
        )}

        {/* Receipts List */}
        <motion.div className="space-y-4" variants={containerVariants}>
          <AnimatePresence>
            {filteredReceipts.map((receipt, index) => (
              <motion.div
                key={receipt.id}
                variants={itemVariants}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl p-4 shadow-sm"
                whileHover={{ scale: 1.01, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <motion.div
                      className="w-10 h-10 bg-[#1B9D65]/10 rounded-lg flex items-center justify-center"
                      whileHover={{ scale: 1.1, backgroundColor: "rgba(27, 157, 101, 0.2)" }}
                    >
                      {getCategoryEmoji(receipt.category)}
                    </motion.div>
                    <div>
                      <h3 className="font-semibold">{receipt.storeName}</h3>
                      <p className="text-sm text-gray-500">{receipt.category}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <motion.button
                        className="p-1 hover:bg-gray-100 rounded-full"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <MoreVertical className="w-5 h-5 text-gray-500" />
                      </motion.button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        className="text-red-600 cursor-pointer"
                        onClick={() => confirmDelete(receipt.id || "")}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Receipt
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Product Name</p>
                    <p className="font-semibold">{receipt.productName}</p>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Receipt Date</p>
                      <p>{formatDate(receipt.date)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Valid Until</p>
                      <p>{receipt.validUptoDate ? formatDate(receipt.validUptoDate) : "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Price</p>
                      <p className="font-semibold">
                        {receipt.currency} {receipt.price.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-gray-500">
                    <MapPin className="w-4 h-4" />
                    <p className="text-sm">{receipt.storeLocation}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Add Button */}
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 300, damping: 15 }}
          whileHover={{ scale: 1.1, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsAddReceiptOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-[#1B9D65] text-white rounded-full flex items-center justify-center shadow-lg"
        >
          <Plus className="w-6 h-6" />
        </motion.button>

        {/* Add Receipt Dialog */}
        <AddReceiptDialog
          isOpen={isAddReceiptOpen}
          onClose={() => setIsAddReceiptOpen(false)}
          onSuccess={fetchReceipts}
        />

        {/* Delete Confirmation Dialog */}
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
                onClick={handleDeleteReceipt}
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
      </motion.main>
    </div>
  )
}

