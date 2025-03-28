"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Search,
  MoreVertical,
  Plus,
  Loader2,
  AlertCircle,
  RefreshCw,
  Wifi,
  WifiOff,
  Download,
  Trash,
  FileText,
  ArrowUpDown,
} from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  getReceiptsByUserId,
  deleteReceipt,
  getReceiptImage,
  getUserId,
  getAuthToken,
  type Receipt,
} from "@/services/receipt-service"
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
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import AddReceiptDialog from "@/components/add-receipt-dialog"
import ReceiptDetailModal from "@/components/receipt-detail-modal"
import { jsPDF } from "jspdf"
import "jspdf-autotable"
import Sidebar from "@/components/sidebar"

const categories = [
  {
    id: "all",
    name: "All",
  },
  {
    id: "business",
    name: "Business",
  },
  {
    id: "personal",
    name: "Personal",
  },
  {
    id: "medical",
    name: "Medical",
  },
  {
    id: "electrical",
    name: "Electrical",
  },
  {
    id: "other",
    name: "Other",
  },
]

export default function DashboardPage() {
  const [showReceiptForm, setShowReceiptForm] = useState(false)
  const [activeCategory, setActiveCategory] = useState("all")
  const [isLoaded, setIsLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [receipts, setReceipts] = useState<Receipt[]>([])
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [receiptToDelete, setReceiptToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [sortBy, setSortBy] = useState("date")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [receiptImages, setReceiptImages] = useState<Record<string, string>>({})
  const [isDownloadingAll, setIsDownloadingAll] = useState(false)
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const [isDownloadingZip, setIsDownloadingZip] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  // Check authentication - simplified to prevent logout loop
  useEffect(() => {
    async function verifyAuth() {
      try {
        // First check if token exists
        const token = getAuthToken()
        if (!token) {
          console.log("No auth token found, redirecting to login")
          window.location.href = "/login"
          return
        }

        // Skip token validation for dashboard to prevent logout loops
        console.log("Auth token exists, continuing without validation")
      } catch (error) {
        console.error("Auth error:", error)
      }
    }

    verifyAuth()
  }, [])

  // Check online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    // Set initial status
    setIsOnline(navigator.onLine)

    // Add event listeners
    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  // Set default date range (last 30 days)
  useEffect(() => {
    const today = new Date()
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(today.getDate() - 30)

    setToDate(today.toISOString().split("T")[0])
    setFromDate(thirtyDaysAgo.toISOString().split("T")[0])
  }, [])

  // Fetch receipts
  const fetchReceipts = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Show offline toast if not online
      if (!navigator.onLine) {
        toast({
          title: "You're offline",
          description: "Showing cached receipts. Some features may be limited.",
          variant: "destructive",
        })
      }

      const data = await getReceiptsByUserId()
      setReceipts(data)
      console.log("Fetched receipts:", data)

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
      console.error("Error fetching receipts:", error)
      setError(error instanceof Error ? error.message : "Failed to load receipts. Please try again.")
    } finally {
      setIsLoading(false)
      setIsLoaded(true)
      setIsRefreshing(false)
    }
  }

  // Initial load
  useEffect(() => {
    fetchReceipts()
  }, [])

  // Handle refresh
  const handleRefresh = () => {
    setIsRefreshing(true)
    fetchReceipts()
  }

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

  // Handle opening receipt detail modal
  const handleOpenReceiptDetail = (receipt: Receipt) => {
    setSelectedReceipt(receipt)
    setIsDetailModalOpen(true)
  }

  // Handle closing receipt detail modal
  const handleCloseReceiptDetail = () => {
    setIsDetailModalOpen(false)
    setSelectedReceipt(null)
  }

  // Handle download receipt as PDF
  const handleDownloadReceiptPDF = (receipt: Receipt) => {
    try {
      const doc = new jsPDF()
      doc.setFontSize(20)
      doc.text("Receipt Details", 105, 15, { align: "center" })
      doc.setFontSize(12)
      doc.text(`Store: ${receipt.storeName || "N/A"}`, 20, 30)
      doc.text(`Product: ${receipt.productName || "N/A"}`, 20, 40)
      doc.text(`Category: ${receipt.category || "N/A"}`, 20, 50)
      doc.text(`Price: ${receipt.currency || "€"} ${(receipt.price || 0).toFixed(2)}`, 20, 60)
      doc.text(`Date: ${formatDate(receipt.date)}`, 20, 70)

      if (receipt.validUptoDate) {
        doc.text(`Valid Until: ${formatDate(receipt.validUptoDate)}`, 20, 80)
      }

      if (receipt.storeLocation) {
        doc.text(`Location: ${receipt.storeLocation}`, 20, 90)
      }

      if (receipt.imageReceiptId && receiptImages[receipt.imageReceiptId]) {
        try {
          const imgData = `data:image/jpeg;base64,${receiptImages[receipt.imageReceiptId]}`
          doc.addPage()
          doc.text("Receipt Image", 105, 15, { align: "center" })
          doc.addImage(imgData, "JPEG", 20, 30, 170, 200)
        } catch (imgError) {
          console.error("Error adding image to PDF:", imgError)
        }
      }

      const filename = `receipt-${receipt.id || receipt.storeName}-${new Date().toISOString().split("T")[0]}.pdf`
      doc.save(filename)

      toast({
        title: "Receipt Downloaded",
        description: "The receipt has been downloaded as PDF.",
      })
    } catch (error) {
      console.error("Error downloading receipt as PDF:", error)
      toast({
        title: "Download Failed",
        description: "Failed to download receipt as PDF. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Handle download all receipts as PDF
  const handleDownloadAllPDF = async () => {
    try {
      setIsDownloadingAll(true)
      const doc = new jsPDF()
      doc.setFontSize(20)
      doc.text("All Receipts", 105, 15, { align: "center" })
      doc.setFontSize(10)
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 22, { align: "center" })

      const tableColumn = ["Receipt #", "Store", "Product", "Category", "Price", "Date"]
      const tableRows = filteredReceipts.map((receipt, index) => [
        `#${index + 1}`,
        receipt.storeName || "N/A",
        receipt.productName || "N/A",
        receipt.category || "N/A",
        `${receipt.currency || "€"} ${(receipt.price || 0).toFixed(2)}`,
        formatDate(receipt.date),
      ])

      // @ts-ignore - jsPDF-AutoTable types are not properly recognized
      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 30,
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: { fillColor: [27, 157, 101] },
      })

      const totalValue = filteredReceipts.reduce((sum, receipt) => sum + (receipt.price || 0), 0).toFixed(2)
      const currency = filteredReceipts.length > 0 ? filteredReceipts[0]?.currency || "€" : "€"

      // @ts-ignore - jsPDF-AutoTable types are not properly recognized
      const finalY = (doc as any).lastAutoTable.finalY || 30
      doc.setFontSize(12)
      doc.text(`Total: ${currency} ${totalValue}`, 195, finalY + 10, { align: "right" })

      doc.save(`all-receipts-${new Date().toISOString().split("T")[0]}.pdf`)

      toast({
        title: "All Receipts Downloaded",
        description: "All receipts have been downloaded as PDF.",
      })
    } catch (error) {
      console.error("Error downloading all receipts as PDF:", error)
      toast({
        title: "Download Failed",
        description: "Failed to download all receipts as PDF. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDownloadingAll(false)
    }
  }

  // Handle download receipts as ZIP
  const handleDownloadReceiptsZip = async () => {
    try {
      if (!fromDate || !toDate) {
        toast({
          title: "Date Range Required",
          description: "Please select both start and end dates.",
          variant: "destructive",
        })
        return
      }

      setIsDownloadingZip(true)

      const uid = getUserId()
      if (!uid) {
        toast({
          title: "User ID Not Found",
          description: "Please log in again to download receipts.",
          variant: "destructive",
        })
        return
      }

      const token = getAuthToken()
      if (!token) {
        toast({
          title: "Authentication Required",
          description: "Please log in again to download receipts.",
          variant: "destructive",
        })
        return
      }

      // Use the correct category parameter format
      const category = activeCategory === "all" ? "" : activeCategory

      // Format dates as required by the API
      const formattedFromDate = fromDate // Already in YYYY-MM-DD format
      const formattedToDate = toDate // Already in YYYY-MM-DD format

      // Use the correct endpoint
      const apiUrl = `https://services.stage.zeropaper.online/api/zpu/receipts/zip?uid=${uid}&category=${category}&fromDate=${formattedFromDate}&toDate=${formattedToDate}`

      console.log("Downloading receipts ZIP from:", apiUrl)

      // Create a fetch request with the appropriate headers
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/zip",
        },
      })

      if (!response.ok) {
        throw new Error(`Download failed with status: ${response.status}`)
      }

      // Get the response as a blob
      const blob = await response.blob()

      // Create a download link and trigger it
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `receipts-${fromDate}-to-${toDate}.zip`
      document.body.appendChild(a)
      a.click()

      // Clean up
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: "Receipts Downloaded",
        description: "Your receipts have been downloaded as a ZIP file.",
      })
    } catch (error) {
      console.error("Error downloading receipts ZIP:", error)
      toast({
        title: "Download Failed",
        description: error instanceof Error ? error.message : "Failed to download receipts. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDownloadingZip(false)
    }
  }

  // Handle add receipt with pre-selected category
  const handleAddReceipt = () => {
    setShowReceiptForm(true)
  }

  // Toggle sort order
  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      setSortOrder("desc")
    }
  }

  // Add a handler to apply date filters when the date inputs change
  const handleDateFilterChange = () => {
    console.log(`Filtering receipts from ${fromDate} to ${toDate}`)
    // The filtering is handled automatically in the filteredReceipts variable
  }

  // Filter and sort receipts
  const filteredReceipts = receipts
    .filter((receipt) => {
      // Category filter
      if (activeCategory !== "all" && receipt.category?.toLowerCase() !== activeCategory.toLowerCase()) {
        return false
      }

      // Date range filter
      if (fromDate && toDate && receipt.date) {
        const receiptDate = new Date(receipt.date)
        const fromDateObj = new Date(fromDate)
        const toDateObj = new Date(toDate)

        // Set time to beginning and end of day for proper comparison
        fromDateObj.setHours(0, 0, 0, 0)
        toDateObj.setHours(23, 59, 59, 999)

        if (receiptDate < fromDateObj || receiptDate > toDateObj) {
          return false
        }
      }

      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase()
        return (
          receipt.storeName?.toLowerCase().includes(search) ||
          receipt.productName?.toLowerCase().includes(search) ||
          receipt.storeLocation?.toLowerCase().includes(search)
        )
      }

      return true
    })
    .sort((a, b) => {
      const multiplier = sortOrder === "asc" ? 1 : -1

      if (sortBy === "date") {
        return multiplier * (new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime())
      } else if (sortBy === "price") {
        return multiplier * ((a.price || 0) - (b.price || 0))
      } else if (sortBy === "product") {
        return multiplier * (a.productName || "").localeCompare(b.productName || "")
      } else if (sortBy === "store") {
        return multiplier * (a.storeName || "").localeCompare(b.storeName || "")
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
    if (!dateString) return "N/A"
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
    } catch (error) {
      console.error("Error formatting date:", error)
      return "Invalid Date"
    }
  }

  // Get category emoji
  const getCategoryEmoji = (category = "") => {
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

  // Calculate total value of filtered receipts
  const totalValue = filteredReceipts.reduce((sum, receipt) => sum + (receipt.price || 0), 0).toFixed(2)
  const currency = filteredReceipts.length > 0 ? filteredReceipts[0]?.currency || "€" : "€"

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      <div className="flex-1 lg:ml-16">
        {/* Navbar */}
        <div className="bg-white border-b sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h1 className="text-xl font-bold">Receipt Dashboard</h1>
              </div>

              <div className="flex items-center gap-3">
                {isOnline ? <Wifi className="w-5 h-5 text-gray-500" /> : <WifiOff className="w-5 h-5 text-gray-500" />}

                <Button
                  variant="default"
                  size="sm"
                  onClick={handleAddReceipt}
                  className="bg-[#1B9D65] hover:bg-[#1B9D65]/90"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Receipt
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <motion.main
          className="max-w-7xl mx-auto px-4 py-6"
          variants={containerVariants}
          initial="hidden"
          animate={isLoaded ? "visible" : "hidden"}
        >
          {/* Network Status Banner */}
          {!isOnline && (
            <Alert variant="warning" className="mb-6 bg-amber-50 border-amber-200">
              <WifiOff className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                You're currently offline. Some features may be limited.
              </AlertDescription>
            </Alert>
          )}

          {/* Filters Section */}
          <motion.div className="bg-white p-4 rounded-lg shadow-sm mb-6" variants={itemVariants}>
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="w-full md:w-auto">
                <Label htmlFor="category-select" className="text-sm font-medium mb-2 block">
                  Select Category:
                </Label>
                <Select value={activeCategory} onValueChange={setActiveCategory}>
                  <SelectTrigger id="category-select" className="w-full md:w-[200px]">
                    <div className="flex items-center gap-2">
                      <span>{getCategoryEmoji(activeCategory)}</span>
                      <span>{categories.find((c) => c.id === activeCategory)?.name}</span>
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center gap-2">
                          <span>{getCategoryEmoji(category.id)}</span>
                          <span>{category.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-grow">
                <Label htmlFor="search-input" className="text-sm font-medium mb-2 block">
                  Search:
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="search-input"
                    type="text"
                    placeholder="Search receipts by name, store, or location"
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex items-end gap-2 flex-wrap md:flex-nowrap">
                <div>
                  <Label htmlFor="from-date" className="text-sm font-medium mb-2 block">
                    From Date:
                  </Label>
                  <Input
                    id="from-date"
                    type="date"
                    value={fromDate}
                    onChange={(e) => {
                      setFromDate(e.target.value)
                      handleDateFilterChange()
                    }}
                    className="w-full md:w-[160px]"
                  />
                </div>
                <div>
                  <Label htmlFor="to-date" className="text-sm font-medium mb-2 block">
                    To Date:
                  </Label>
                  <Input
                    id="to-date"
                    type="date"
                    value={toDate}
                    onChange={(e) => {
                      setToDate(e.target.value)
                      handleDateFilterChange()
                    }}
                    className="w-full md:w-[160px]"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    // Reset date filters to default (last 30 days)
                    const today = new Date()
                    const thirtyDaysAgo = new Date()
                    thirtyDaysAgo.setDate(today.getDate() - 30)

                    setToDate(today.toISOString().split("T")[0])
                    setFromDate(thirtyDaysAgo.toISOString().split("T")[0])
                  }}
                  className="h-10 ml-1"
                >
                  Reset Dates
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDownloadReceiptsZip}
                  disabled={isDownloadingZip || !isOnline || !fromDate || !toDate}
                  className="h-10 ml-1"
                >
                  {isDownloadingZip ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4 mr-2" />
                  )}
                  {isDownloadingZip ? "Downloading..." : "Download ZIP"}
                </Button>

                <Button
                  variant="outline"
                  onClick={handleRefresh}
                  disabled={isRefreshing || !isOnline}
                  className="h-10 ml-auto"
                >
                  {isRefreshing ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4 mr-2" />
                  )}
                  Refresh
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Error Alert */}
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
                <Image src="/placeholder.svg?height=40&width=40" alt="No receipts" width={40} height={40} />
              </div>
              <h3 className="text-lg font-medium mb-2">No receipts found</h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || activeCategory !== "all"
                  ? "Try changing your search or filter criteria"
                  : "Add your first receipt to get started"}
              </p>
              <button
                onClick={handleAddReceipt}
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
              <div className="flex items-center gap-3">
                <p className="text-xl font-semibold">
                  Total: {currency}
                  {totalValue}
                </p>
                <Button variant="outline" size="sm" onClick={handleDownloadAllPDF} disabled={isDownloadingAll}>
                  {isDownloadingAll ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <FileText className="w-4 h-4 mr-2" />
                  )}
                  {isDownloadingAll ? "Generating..." : "Download PDF"}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Receipts Table */}
          {!isLoading && filteredReceipts.length > 0 && (
            <motion.div className="bg-white rounded-lg shadow overflow-hidden" variants={itemVariants}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 text-gray-700">
                    <tr>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort("id")}
                      >
                        <div className="flex items-center gap-1">
                          Receipt #{sortBy === "id" && <ArrowUpDown className="w-4 h-4" />}
                        </div>
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort("store")}
                      >
                        <div className="flex items-center gap-1">
                          Store
                          {sortBy === "store" && <ArrowUpDown className="w-4 h-4" />}
                        </div>
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort("product")}
                      >
                        <div className="flex items-center gap-1">
                          Product
                          {sortBy === "product" && <ArrowUpDown className="w-4 h-4" />}
                        </div>
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort("date")}
                      >
                        <div className="flex items-center gap-1">
                          Date
                          {sortBy === "date" && <ArrowUpDown className="w-4 h-4" />}
                        </div>
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort("price")}
                      >
                        <div className="flex items-center gap-1">
                          Price
                          {sortBy === "price" && <ArrowUpDown className="w-4 h-4" />}
                        </div>
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredReceipts.map((receipt, index) => (
                      <tr
                        key={receipt.id || index}
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleOpenReceiptDetail(receipt)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{index + 1}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 flex items-center justify-center rounded-full bg-[#1B9D65]/10 text-[#1B9D65]">
                              {getCategoryEmoji(receipt.category)}
                            </span>
                            <span>{receipt.storeName || "Unknown Store"}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {receipt.productName || "No product name"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(receipt.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {receipt.currency || "€"} {(receipt.price || 0).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <span className="sr-only">Open menu</span>
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDownloadReceiptPDF(receipt)
                                }}
                              >
                                <FileText className="mr-2 h-4 w-4" />
                                <span>Download PDF</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation()
                                  confirmDelete(receipt.id || "")
                                }}
                                className="text-red-600"
                              >
                                <Trash className="mr-2 h-4 w-4" />
                                <span>Delete</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* Add Button (Mobile) */}
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 300, damping: 15 }}
            whileHover={{ scale: 1.1, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
            whileTap={{ scale: 0.9 }}
            onClick={handleAddReceipt}
            className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-[#1B9D65] text-white rounded-full flex items-center justify-center shadow-lg"
          >
            <Plus className="w-6 h-6" />
          </motion.button>

          {/* Receipt Upload Form Modal */}
          {showReceiptForm && (
            <AddReceiptDialog
              isOpen={showReceiptForm}
              onClose={() => setShowReceiptForm(false)}
              onSuccess={() => {
                setShowReceiptForm(false)
                fetchReceipts()
              }}
              initialCategory={activeCategory !== "all" ? activeCategory : undefined}
            />
          )}

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

          {/* Receipt Detail Modal */}
          <ReceiptDetailModal
            receipt={selectedReceipt}
            receiptImage={selectedReceipt?.imageReceiptId ? receiptImages[selectedReceipt.imageReceiptId] : null}
            isOpen={isDetailModalOpen}
            onClose={handleCloseReceiptDetail}
            onDelete={(id) => {
              setReceipts(receipts.filter((receipt) => receipt.id !== id))
              toast({
                title: "Receipt Deleted",
                description: "The receipt has been successfully deleted.",
              })
            }}
            onDownloadPDF={handleDownloadReceiptPDF}
          />
        </motion.main>
      </div>
    </div>
  )
}

