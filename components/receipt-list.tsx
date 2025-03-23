"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Search, Filter, Plus, MapPin, MoreVertical, Receipt, ImageIcon, Check } from "lucide-react"
import { getReceipts, getReceiptImage, type Receipt as ReceiptType } from "@/services/receipt-service"
import { formatDate } from "@/utils/date-helpers"
import ReceiptDetailModal from "./receipt-detail-modal"
import { useToast } from "@/components/ui/use-toast"

export default function ReceiptsList() {
  const [receipts, setReceipts] = useState<ReceiptType[]>([])
  const [filteredReceipts, setFilteredReceipts] = useState<ReceiptType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [sortBy, setSortBy] = useState("date")
  const [receiptImages, setReceiptImages] = useState<Record<string, string>>({})
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptType | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    fetchReceipts()
  }, [])

  useEffect(() => {
    // Apply filters and sorting whenever receipts, searchTerm, categoryFilter, or sortBy changes
    filterAndSortReceipts()
  }, [receipts, searchTerm, categoryFilter, sortBy])

  const fetchReceipts = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const data = await getReceipts()
      setReceipts(data)

      // Fetch images for receipts that have imageReceiptId
      const imagePromises = data
        .filter((receipt) => receipt.imageReceiptId)
        .map(async (receipt) => {
          try {
            if (receipt.imageReceiptId) {
              const imageBase64 = await getReceiptImage(receipt.imageReceiptId)
              if (imageBase64) {
                return { id: receipt.imageReceiptId, base64: imageBase64 }
              }
            }
            return null
          } catch (error) {
            console.error(`Error fetching image for receipt ${receipt.id}:`, error)
            return null
          }
        })

      const images = await Promise.all(imagePromises)
      const imageMap: Record<string, string> = {}

      images.forEach((img) => {
        if (img && img.id && img.base64) {
          imageMap[img.id] = img.base64
        }
      })

      setReceiptImages(imageMap)
    } catch (error) {
      setError("Failed to fetch receipts. Please try again.")
      console.error("Error fetching receipts:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterAndSortReceipts = () => {
    let filtered = [...receipts]

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (receipt) =>
          receipt.storeName?.toLowerCase().includes(term) ||
          receipt.productName?.toLowerCase().includes(term) ||
          receipt.storeLocation?.toLowerCase().includes(term),
      )
    }

    // Apply category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter((receipt) => receipt.category === categoryFilter)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === "date") {
        return new Date(b.date).getTime() - new Date(a.date).getTime()
      } else if (sortBy === "price") {
        return b.price - a.price
      }
      return 0
    })

    setFilteredReceipts(filtered)
  }

  const handleAddReceipt = () => {
    router.push("/receipts/add")
  }

  const handleOpenReceiptDetail = (receipt: ReceiptType) => {
    setSelectedReceipt(receipt)
    setIsDetailModalOpen(true)
  }

  const handleCloseReceiptDetail = () => {
    setIsDetailModalOpen(false)
    setSelectedReceipt(null)
  }

  const handleDeleteReceipt = (id: string) => {
    setReceipts(receipts.filter(receipt => receipt.id !== id))
    toast({
      title: "Receipt Deleted",
      description: "The receipt has been successfully deleted.",
    })
  }

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

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      {/* Search and Filters */}
      <motion.div
        className="flex flex-col md:flex-row gap-4 mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search receipts"
            className="pl-12 pr-4"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
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
              <SelectItem value="other">Other</SelectItem>
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

      {/* Summary */}
      <motion.div
        className="flex justify-between items-center mb-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h2 className="text-xl font-semibold">{filteredReceipts.length} Receipts</h2>
        <p className="text-xl font-semibold">
          Total: {getCurrencySymbol(filteredReceipts[0]?.currency || "USD")}
          {filteredReceipts.reduce((sum, receipt) => sum + receipt.price, 0).toFixed(2)}
        </p>
      </motion.div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[#1B9D65]" />
          <span className="ml-2 text-lg">Loading receipts...</span>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="bg-red-50 text-red-800 p-4 rounded-lg mb-6">
          <p>{error}</p>
          <Button onClick={fetchReceipts} variant="outline" className="mt-2">
            Try Again
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && filteredReceipts.length === 0 && (
        <motion.div
          className="text-center py-12 bg-gray-50 rounded-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Receipt className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Receipts Found</h3>
          <p className="text-gray-500 mb-6">
            {searchTerm || categoryFilter !== "all"
              ? "Try adjusting your search or filters"
              : "Add your first receipt to get started"}
          </p>
          <Button onClick={handleAddReceipt} className="bg-[#1B9D65] hover:bg-[#1B9D65]/90">
            <Plus className="w-4 h-4 mr-2" />
            Add Receipt
          </Button>
        </motion.div>
      )}

      {/* Receipts List */}
      {!isLoading && !error && filteredReceipts.length > 0 && (
        <motion.div className="space-y-4" variants={containerVariants} initial="hidden" animate="visible">
          <AnimatePresence>
            {filteredReceipts.map((receipt, index) => (
              <motion.div
                key={receipt.id || index}
                variants={itemVariants}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl p-4 shadow-sm cursor-pointer"
                whileHover={{ scale: 1.01, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
                onClick={() => handleOpenReceiptDetail(receipt)}
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
                  <motion.button
                    className="p-1 hover:bg-gray-100 rounded-full"
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <MoreVertical className="w-5 h-5 text-gray-500" />
                  </motion.button>
                </div>

                {/* Receipt Image (if available) */}
                {receipt.imageReceiptId && receiptImages[receipt.imageReceiptId] && (
                  <div className="mb-4">
                    <div className="relative w-full h-40 bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={`data:image/jpeg;base64,${receiptImages[receipt.imageReceiptId]}`}
                        alt="Receipt"
                        className="w-full h-full object-contain"
                      />
                      <div className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-md text-xs flex items-center">
                        <ImageIcon className="w-3 h-3 mr-1" />
                        Receipt Image
                      </div>
                    </div>
                  </div>
                )}

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
                        {getCurrencySymbol(receipt.currency)}
                        {receipt.price.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {receipt.storeLocation && (
                    <div className="flex items-center gap-2 text-gray-500">
                      <MapPin className="w-4 h-4" />
                      <p className="text-sm">{receipt.storeLocation}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Add Button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 300, damping: 15 }}
        whileHover={{ scale: 1.1, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
        whileTap={{ scale: 0.9 }}
        onClick={handleAddReceipt}
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#1B9D65] text-white rounded-full flex items-center justify-center shadow-lg"
      >
        <Plus className="w-6 h-6" />
      </motion.button>

      {/* Receipt Detail Modal */}
      <ReceiptDetailModal
        receipt={selectedReceipt}
        receiptImage={selectedReceipt?.imageReceiptId ? receiptImages[selectedReceipt.imageReceiptId] : null}
        isOpen={isDetailModalOpen}
        onClose={handleCloseReceiptDetail}
        onDelete={handleDeleteReceipt}
      />
    </div>
  )
}

