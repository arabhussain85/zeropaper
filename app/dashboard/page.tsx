"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Settings,
  Search,
  MoreVertical,
  Plus,
  MapPin,
  Loader2,
  AlertCircle,
  Filter,
  RefreshCw,
  Wifi,
  WifiOff,
  X,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getReceiptsByUserId, deleteReceipt, getReceiptImage, type Receipt } from "@/services/receipt-service";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { refreshAuthTokenIfNeeded,getAuthToken } from "@/utils/auth-helpers";
import AddReceiptDialog from "@/components/add-receipt-dialog";
import ReceiptDetailModal from "@/components/receipt-detail-modal";



const categories = [
  {
    id: "all",
    name: "All",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M4 6H20M4 12H20M4 18H20"
          stroke="#23935D"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: "business",
    name: "Business",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M20 7H16V5C16 3.9 15.1 3 14 3H10C8.9 3 8 3.9 8 5V7H4C2.9 7 2 7.9 2 9V20C2 21.1 2.9 22 4 22H20C21.1 22 22 21.1 22 20V9C22 7.9 21.1 7 20 7ZM10 5H14V7H10V5ZM20 20H4V9H20V20Z"
          fill="#23935D"
        />
      </svg>
    ),
  },
  {
    id: "personal",
    name: "Personal",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 6C13.1 6 14 6.9 14 8C14 9.1 13.1 10 12 10C10.9 10 10 9.1 10 8C10 6.9 10.9 6 12 6ZM12 13C9.33 13 4 14.34 4 17V20H20V17C20 14.34 14.67 13 12 13ZM18 18H6V17.01C6.2 16.29 9.3 15 12 15C14.7 15 17.8 16.29 18 17V18Z"
          fill="#23935D"
        />
      </svg>
    ),
  },
  {
    id: "medical",
    name: "Medical",
    icon: (
      <Image
        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/healthcare-m2Ut9vRStYr5aeL3QTbO4mSQTwwag3.png"
        alt="Medical"
        width={24}
        height={24}
      />
    ),
  },
  {
    id: "electrical",
    name: "Electrical",
    icon: (
      <Image
        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Group%201761-mxVDBkghKPyrZcjQBHq8t74R5zchzH.png"
        alt="Electrical"
        width={24}
        height={24}
      />
    ),
  },
  {
    id: "other",
    name: "Other",
    icon: (
      <svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M8.43746 1H2.81246C2.08873 1 1.5 1.58873 1.5 2.31246V5.68746C1.5 6.41132 2.08873 7.00005 2.81246 7.00005H8.43746C9.16133 7.00005 9.75006 6.41132 9.75006 5.68746V2.31246C9.75006 1.58873 9.16133 1 8.43746 1Z"
          fill="#23935D"
        />
        <path
          d="M8.43746 8.49994H2.81246C2.08873 8.49994 1.5 9.08867 1.5 9.81253V17.6875C1.5 18.4113 2.08873 19 2.81246 19H8.43746C9.16133 19 9.75006 18.4113 9.75006 17.6875V9.81253C9.75006 9.08867 9.16133 8.49994 8.43746 8.49994Z"
          fill="#23935D"
        />
        <path
          d="M18.1876 12.9999H12.5626C11.8387 12.9999 11.25 13.5887 11.25 14.3125V17.6875C11.25 18.4113 11.8387 19 12.5626 19H18.1876C18.9113 19 19.5001 18.4113 19.5001 17.6875V14.3125C19.5001 13.5887 18.9113 12.9999 18.1876 12.9999Z"
          fill="#23935D"
        />
        <path
          d="M18.1876 1H12.5626C11.8387 1 11.25 1.58873 11.25 2.31246V10.1875C11.25 10.9113 11.8387 11.5001 12.5626 11.5001H18.1876C18.9113 11.5001 19.5001 10.9113 19.5001 10.1875V2.31246C19.5001 1.58873 18.9113 1 18.1876 1Z"
          fill="#23935D"
        />
      </svg>
    ),
  },
];

export default function DashboardPage() {
  const [showReceiptForm, setShowReceiptForm] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [receiptToDelete, setReceiptToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [sortBy, setSortBy] = useState("date");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [receiptImages, setReceiptImages] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const router = useRouter();

  // Check authentication
  useEffect(() => {
    async function verifyAuth() {
      try {
        // First check if token exists
        const token = getAuthToken();
        if (!token) {
          console.log("No auth token found, redirecting to login");
          window.location.href = "/login";
          return;
        }
        
        // Then check if token is valid or can be refreshed
        const isValid = await refreshAuthTokenIfNeeded();
        if (!isValid) {
          console.log("Token invalid and refresh failed, redirecting to login");
          // Clear tokens
          localStorage.removeItem("authToken");
          sessionStorage.removeItem("authToken");
          localStorage.removeItem("refreshToken");
          sessionStorage.removeItem("refreshToken");
          
          window.location.href = "/login";
        }
      } catch (error) {
        console.error("Auth error:", error);
        window.location.href = "/login";
      }
    }

    verifyAuth();
  }, [router]);

  // Check online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    // Set initial status
    setIsOnline(navigator.onLine);

    // Add event listeners
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Fetch receipts
  const fetchReceipts = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Show offline toast if not online
      if (!navigator.onLine) {
        toast({
          title: "You're offline",
          description: "Showing cached receipts. Some features may be limited.",
          variant: "destructive",
        });
      }

      const data = await getReceiptsByUserId();
      setReceipts(data);
      console.log("Fetched receipts:", data);
      
      // Fetch images for receipts that have imageReceiptId
      const imagePromises = data
        .filter((receipt) => receipt.imageReceiptId)
        .map(async (receipt) => {
          try {
            if (receipt.imageReceiptId) {
              const imageBase64 = await getReceiptImage(receipt.imageReceiptId);
              if (imageBase64) {
                return { id: receipt.imageReceiptId, base64: imageBase64 };
              }
            }
            return null;
          } catch (error) {
            console.error(`Error fetching image for receipt ${receipt.id}:`, error);
            return null;
          }
        });

      const images = await Promise.all(imagePromises);
      const imageMap: Record<string, string> = {};

      images.forEach((img) => {
        if (img && img.id && img.base64) {
          imageMap[img.id] = img.base64;
        }
      });

      setReceiptImages(imageMap);
    } catch (error) {
      console.error("Error fetching receipts:", error);
      setError(error instanceof Error ? error.message : "Failed to load receipts. Please try again.");
    } finally {
      setIsLoading(false);
      setIsLoaded(true);
      setIsRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchReceipts();
  }, []);

  // Handle refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchReceipts();
  };

  // Handle delete receipt
  const handleDeleteReceipt = async () => {
    if (!receiptToDelete) return;

    try {
      setIsDeleting(true);
      await deleteReceipt(receiptToDelete);

      // Update local state
      setReceipts(receipts.filter((receipt) => receipt.id !== receiptToDelete));

      toast({
        title: "Receipt Deleted",
        description: "The receipt has been successfully deleted.",
      });
    } catch (error) {
      console.error("Error deleting receipt:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete receipt. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeleteConfirmOpen(false);
      setReceiptToDelete(null);
    }
  };

  // Confirm delete
  const confirmDelete = (id: string) => {
    setReceiptToDelete(id);
    setDeleteConfirmOpen(true);
  };
  
  // Handle opening receipt detail modal
  const handleOpenReceiptDetail = (receipt: Receipt) => {
    setSelectedReceipt(receipt);
    setIsDetailModalOpen(true);
  };

  // Handle closing receipt detail modal
  const handleCloseReceiptDetail = () => {
    setIsDetailModalOpen(false);
    setSelectedReceipt(null);
  };

  // Filter and sort receipts
  const filteredReceipts = receipts
    .filter((receipt) => {
      // Category filter
      if (activeCategory !== "all" && receipt.category?.toLowerCase() !== activeCategory.toLowerCase()) {
        return false;
      }

      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        return (
          receipt.storeName?.toLowerCase().includes(search) ||
          receipt.productName?.toLowerCase().includes(search) ||
          receipt.storeLocation?.toLowerCase().includes(search)
        );
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === "date") {
        return new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime();
      } else if (sortBy === "price") {
        return (b.price || 0) - (a.price || 0);
      }
      return 0;
    });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  };

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid Date";
    }
  };

  // Get category emoji
  const getCategoryEmoji = (category = "") => {
    switch (category.toLowerCase()) {
      case "medical":
        return "💊";
      case "electrical":
        return "🔌";
      case "business":
        return "💼";
      case "personal":
        return "🛒";
      default:
        return "📝";
    }
  };

  // Calculate total value of filtered receipts
  const totalValue = filteredReceipts.reduce((sum, receipt) => sum + (receipt.price || 0), 0).toFixed(2);
  const currency = filteredReceipts.length > 0 ? filteredReceipts[0]?.currency || "€" : "€";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <motion.header
        className="bg-[#1B9D65] text-white p-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <motion.div className="bg-white rounded-lg p-2" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <div className="w-8 h-8 relative">
                  <Image
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Zero%20paper%20user2-05%201-2MhU8cy380KtTq1agohGg6DKTIqtzS.png"
                    alt="Zero Paper Logo"
                    fill
                    className="object-contain brightness-0"
                  />
                </div>
              </motion.div>
              <div className="text-xl font-bold">
                <div>ZERO</div>
                <div>PAPER USER</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isOnline ? <Wifi className="w-5 h-5 text-white" /> : <WifiOff className="w-5 h-5 text-white" />}
              <motion.button
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                whileHover={{ scale: 1.1, rotate: 15 }}
                whileTap={{ scale: 0.9 }}
              >
                <Settings className="w-6 h-6" />
              </motion.button>
            </div>
          </div>

          {/* Categories */}
          <motion.div
            className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {categories.map((category, index) => (
              <motion.button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  activeCategory === category.id ? "bg-black text-white" : "bg-white text-gray-900"
                }`}
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
              >
                <span>{category.icon}</span>
                <span>{category.name}</span>
              </motion.button>
            ))}
          </motion.div>
        </div>
      </motion.header>

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

        {/* Search and Filters */}
        <motion.div className="flex flex-col md:flex-row gap-4 mb-6" variants={itemVariants}>
          <div className="relative flex-grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search receipts by name, store, or location"
              className="w-full h-12 pl-12 pr-4 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1B9D65]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px] h-12">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  <SelectValue placeholder="Sort by" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date (Newest)</SelectItem>
                <SelectItem value="price">Price (Highest)</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              className="h-12 px-4"
              onClick={handleRefresh}
              disabled={isRefreshing || !isOnline}
            >
              {isRefreshing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Refresh
            </Button>
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
              onClick={() => setShowReceiptForm(true)}
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
              Total: {currency}
              {totalValue}
            </p>
          </motion.div>
        )}

        {/* Receipts */}
        <motion.div className="space-y-4" variants={containerVariants}>
          {filteredReceipts.map((receipt, index) => (
            <motion.div
              key={receipt.id || index}
              variants={itemVariants}
              className="bg-white rounded-xl p-4 shadow-sm cursor-pointer"
              whileHover={{ scale: 1.01, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
              transition={{ delay: index * 0.1 }}
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
                    <h3 className="font-semibold">{receipt.storeName || "Unknown Store"}</h3>
                    <p className="text-sm text-gray-500">{receipt.category || "Uncategorized"}</p>
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
                      Delete Receipt
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Product Name</p>
                  <p className="font-semibold">{receipt.productName || "No product name"}</p>
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
                      {receipt.currency || "€"} {(receipt.price || 0).toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-gray-500">
                  <MapPin className="w-4 h-4" />
                  <p className="text-sm">{receipt.storeLocation || "No location"}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Add Button */}
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 300, damping: 15 }}
          whileHover={{ scale: 1.1, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowReceiptForm(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-[#1B9D65] text-white rounded-full flex items-center justify-center shadow-lg"
        >
          <Plus className="w-6 h-6" />
        </motion.button>

        {/* Receipt Upload Form Modal */}
        {showReceiptForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-4 flex justify-between items-center border-b">
                <h2 className="text-lg font-semibold">Add New Receipt</h2>
                <button
                  onClick={() => setShowReceiptForm(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-4">
                <AddReceiptDialog isOpen={showReceiptForm} onClose={() => setShowReceiptForm(false)} onSuccess={() => {
                  setShowReceiptForm(false);
                  fetchReceipts();
                }}/>
              </div>
            </div>
          </div>
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
            setReceipts(receipts.filter(receipt => receipt.id !== id));
            toast({
              title: "Receipt Deleted",
              description: "The receipt has been successfully deleted.",
            });
          }}
        />
      </motion.main>
    </div>
  );
}