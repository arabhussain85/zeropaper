"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Plus,
  Loader2,
  AlertCircle,
  RefreshCw,
  Download,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  getReceiptsByUserId,
  deleteReceipt,
  getReceiptImage,
  type Receipt,
} from "@/services/receipt-service";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import AddReceiptDialog from "@/components/add-receipt-dialog";
import ReceiptDetailModal from "@/components/receipt-detail-modal";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import Sidebar from "@/components/sidebar";
import VersionDisplay from "@/components/version-display";

// Improved full-screen loader component with animation
const FullScreenLoader = () => (
  <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-50">
    <div className="w-24 h-24 relative mb-8">
      <Image
        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Zero%20paper%20user2-05%201-2MhU8cy380KtTq1agohGg6DKTIqtzS.png"
        alt="Zero Paper Logo"
        fill
        className="object-contain animate-pulse"
      />
    </div>
    <div className="w-48 h-1 bg-gray-200 rounded-full overflow-hidden">
      <div className="h-full bg-[#1B9D65] animate-[loader_1.5s_ease-in-out_infinite]" />
    </div>
    <p className="mt-6 text-lg font-medium text-gray-600">
      Loading your receipts...
    </p>
    <style jsx global>{`
      @keyframes loader {
        0% {
          width: 0%;
          margin-left: 0;
        }
        50% {
          width: 100%;
          margin-left: 0;
        }
        100% {
          width: 0%;
          margin-left: 100%;
        }
      }
    `}</style>
  </div>
);

// Auth helper functions implemented directly in the dashboard page
function getUserId(): string {
  if (typeof window === "undefined") return "";

  // Try to get user data from localStorage
  const userData = localStorage.getItem("userData");
  if (!userData) {
    console.error("No user data found in localStorage");
    return "";
  }

  try {
    const user = JSON.parse(userData);
    if (!user.uid) {
      console.error("User ID not found in user data:", user);
      return "";
    }
    console.log("Retrieved user ID:", user.uid);
    return user.uid;
  } catch (error) {
    console.error("Error parsing user data:", error);
    return "";
  }
}

function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  const token =
    localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
  if (token) {
    console.log(
      "Retrieved auth token:",
      token.substring(0, 10) + "..." + token.substring(token.length - 5)
    );
  } else {
    console.error("No auth token found");
  }
  return token;
}

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
];

// Replace the existing handleDownloadReceiptsZip function with this implementation
// that uses the service function from receipt-service.tsx

export default function DashboardPage() {
  // State for initial page load - show loader immediately
  const [pageLoading, setPageLoading] = useState(true);
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
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [receiptImages, setReceiptImages] = useState<Record<string, string>>(
    {}
  );
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const { toast } = useToast();
  const router = useRouter();
  const [editingReceipt, setEditingReceipt] = useState<Receipt | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Show spinner while view is being rendered
  // Add loading overlay component
  // Replace the LoadingOverlay component with our new FullScreenLoader
  const LoadingOverlay = () => <FullScreenLoader />;

  // Check authentication - simplified to prevent logout loop
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

        // Skip token validation for dashboard to prevent logout loops
        console.log("Auth token exists, continuing without validation");
      } catch (error) {
        console.error("Auth error:", error);
      }
    }

    verifyAuth();
  }, []);

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

  // Set default date range (last 30 days)
  useEffect(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    setToDate(today.toISOString().split("T")[0]);
    setFromDate(thirtyDaysAgo.toISOString().split("T")[0]);
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
        .filter((receipt) => receipt.id) // Use receipt.id instead of imageReceiptId
        .map(async (receipt) => {
          try {
            if (receipt.id) {
              console.log(`Fetching image for receipt ID: ${receipt.id}`);
              const imageBase64 = await getReceiptImage(receipt.id);
              if (imageBase64) {
                console.log(
                  `Successfully fetched image for receipt ID: ${receipt.id}`
                );
                return { id: receipt.id, base64: imageBase64 };
              } else {
                console.log(
                  `No image data returned for receipt ID: ${receipt.id}`
                );
              }
            }
            return null;
          } catch (error) {
            console.error(
              `Error fetching image for receipt ${receipt.id}:`,
              error
            );
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

      console.log(`Loaded ${Object.keys(imageMap).length} receipt images`);
      setReceiptImages(imageMap);
    } catch (error) {
      console.error("Error fetching receipts:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load receipts. Please try again."
      );
    } finally {
      setIsLoading(false);
      setIsLoaded(true);
      setIsRefreshing(false);
      // Remove the page loading state after data is loaded
      setPageLoading(false);
    }
  };

  // Initial load - show loader immediately
  useEffect(() => {
    // Set loading state immediately to show loader
    setPageLoading(true);
    setIsLoading(true);
    setIsLoaded(false);

    // Simulate a minimum loading time to ensure loader is visible
    const minLoadTime = setTimeout(() => {
      fetchReceipts();
    }, 500); // Small delay to ensure loader is shown

    return () => clearTimeout(minLoadTime);
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
      const response = await deleteReceipt(receiptToDelete);

      if (!response || !response.success) {
        throw new Error("Failed to delete receipt from server");
      }

      // Update local state
      setReceipts(receipts.filter((receipt) => receipt.id !== receiptToDelete));

      toast({
        title: "Receipt Deleted",
        description: "The receipt has been successfully deleted.",
      });

      // Close the modal if it was opened from there
      if (isDetailModalOpen && selectedReceipt?.id === receiptToDelete) {
        setIsDetailModalOpen(false);
        setSelectedReceipt(null);
      }
    } catch (error) {
      console.error("Error deleting receipt:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to delete receipt. Please try again.",
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
  const handleOpenReceiptDetail = async (receipt: Receipt) => {
    setSelectedReceipt(receipt);

    // Fetch the image if we don't have it yet
    if (receipt.id && !receiptImages[receipt.id]) {
      try {
        console.log(
          `Fetching image for receipt ID: ${receipt.id} before opening modal`
        );
        const imageBase64 = await getReceiptImage(receipt.id);
        if (imageBase64) {
          console.log(
            `Successfully fetched image for receipt ID: ${receipt.id}`
          );
          setReceiptImages((prev) => ({
            ...prev,
            [receipt.id!]: imageBase64,
          }));
        } else {
          console.log(`No image data returned for receipt ID: ${receipt.id}`);
        }
      } catch (error) {
        console.error(`Error fetching image for receipt ${receipt.id}:`, error);
      }
    } else if (receipt.id) {
      console.log(`Using cached image for receipt ID: ${receipt.id}`);
    }

    setIsDetailModalOpen(true);
  };

  // Handle closing receipt detail modal
  const handleCloseReceiptDetail = () => {
    setIsDetailModalOpen(false);
    setSelectedReceipt(null);
  };

  // Handle download receipt as PDF
  const handleDownloadReceiptPDF = (receipt: Receipt) => {
    try {
      const doc = new jsPDF();

      // Define brand colors and styling variables
      const primaryColor = "#1B9D65";
      const secondaryColor = "#F0F0F0";
      const accentColor = "#0F6A47";
      const textColor = "#333333";
      const lightGray = "#F9F9F9";
      const darkGray = "#555555";
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Set white background
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, pageWidth, pageHeight, "F");

      // Add decorative corner elements
      doc.setFillColor(primaryColor);
      doc.circle(15, 15, 8, "F");
      doc.circle(pageWidth - 15, 15, 8, "F");
      doc.circle(15, pageHeight - 15, 8, "F");
      doc.circle(pageWidth - 15, pageHeight - 15, 8, "F");

      // Add a subtle border
      doc.setDrawColor(accentColor);
      doc.setLineWidth(0.5);
      doc.roundedRect(10, 10, pageWidth - 20, pageHeight - 20, 3, 3, "S");

      // Add logo with shadow effect
      const logoUrl =
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Zero%20paper%20user2-05%201-2MhU8cy380KtTq1agohGg6DKTIqtzS.png";
      // Shadow effect (slightly offset darker rectangle)
      doc.setFillColor(0, 0, 0, 0.1);
      doc.roundedRect(77, 17, 60, 20, 2, 2, "F");
      // Actual logo
      doc.addImage(logoUrl, "PNG", 75, 15, 60, 20);

      // Add a stylish header
      doc.setFillColor(primaryColor);
      doc.roundedRect(10, 40, pageWidth - 20, 15, 2, 2, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("RECEIPT DETAILS", pageWidth / 2, 50, { align: "center" });

      // Add receipt number and date in a stylish box
      doc.setFillColor(lightGray);
      doc.roundedRect(pageWidth - 80, 60, 70, 25, 2, 2, "F");
      doc.setTextColor(primaryColor);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("RECEIPT #", pageWidth - 75, 68);
      doc.text("DATE", pageWidth - 75, 78);
      doc.setTextColor(darkGray);
      doc.setFont("helvetica", "normal");
      doc.text(receipt.id?.substring(0, 8) || "N/A", pageWidth - 45, 68);
      doc.text(formatDate(receipt.date), pageWidth - 45, 78);

      // Add store info in a highlighted box
      doc.setFillColor(lightGray);
      doc.roundedRect(20, 60, pageWidth - 110, 25, 2, 2, "F");
      doc.setTextColor(primaryColor);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(receipt.storeName || "Unknown Store", 25, 70);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(darkGray);
      doc.text(receipt.category || "Uncategorized", 25, 78);

      // Add a divider
      doc.setDrawColor(primaryColor);
      doc.setLineWidth(0.5);
      doc.line(20, 90, pageWidth - 20, 90);

      // Receipt Content in a clean, modern layout
      doc.setTextColor(textColor);
      doc.setFontSize(12);
      let yPosition = 100;
      const lineSpacing = 12;

      // Product details section
      doc.setFillColor(lightGray);
      doc.roundedRect(20, yPosition, pageWidth - 40, 30, 2, 2, "F");

      doc.setFont("helvetica", "bold");
      doc.setTextColor(primaryColor);
      doc.text("Product Details", 25, yPosition + 10);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(darkGray);
      doc.text(
        `Product Name: ${receipt.productName || "No product name"}`,
        25,
        yPosition + 20
      );

      yPosition += 40;

      // Price section with highlighted box
      doc.setFillColor(lightGray);
      doc.roundedRect(20, yPosition, pageWidth - 40, 25, 2, 2, "F");

      doc.setFont("helvetica", "bold");
      doc.setTextColor(primaryColor);
      doc.text("Price Information", 25, yPosition + 10);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(darkGray);
      doc.text(
        `Amount: ${receipt.currency || "€"} ${(receipt.price || 0).toFixed(2)}`,
        25,
        yPosition + 20
      );

      yPosition += 35;

      // Additional details section
      doc.setFillColor(lightGray);
      doc.roundedRect(20, yPosition, pageWidth - 40, 50, 2, 2, "F");

      doc.setFont("helvetica", "bold");
      doc.setTextColor(primaryColor);
      doc.text("Additional Information", 25, yPosition + 10);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(darkGray);
      let detailsY = yPosition + 20;

      if (receipt.storeLocation) {
        doc.text(`Store Location: ${receipt.storeLocation}`, 25, detailsY);
        detailsY += lineSpacing;
      }

      if (receipt.validUptoDate) {
        doc.text(
          `Valid Until: ${formatDate(receipt.validUptoDate)}`,
          25,
          detailsY
        );
        detailsY += lineSpacing;
      }

      if (receipt.refundableUptoDate) {
        doc.text(
          `Refundable Until: ${formatDate(receipt.refundableUptoDate)}`,
          25,
          detailsY
        );
        detailsY += lineSpacing;
      }

      // Add a QR code for digital verification (simulated)
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(pageWidth - 60, yPosition + 5, 40, 40, 2, 2, "F");
      doc.setDrawColor(darkGray);
      doc.setLineWidth(0.2);
      doc.roundedRect(pageWidth - 60, yPosition + 5, 40, 40, 2, 2, "S");

      // Create a simple QR code pattern (just for visual effect)
      doc.setFillColor(0, 0, 0);
      const qrX = pageWidth - 55;
      const qrY = yPosition + 10;
      const qrSize = 30;
      const cellSize = 2;

      for (let i = 0; i < 15; i++) {
        for (let j = 0; j < 15; j++) {
          if (Math.random() > 0.6) {
            doc.rect(
              qrX + i * cellSize,
              qrY + j * cellSize,
              cellSize,
              cellSize,
              "F"
            );
          }
        }
      }

      // Add a footer
      yPosition = pageHeight - 30;
      doc.setFillColor(primaryColor);
      doc.rect(0, yPosition, pageWidth, 30, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.text(
        "Generated by Zero Paper - Your Digital Receipt Solution",
        pageWidth / 2,
        yPosition + 10,
        {
          align: "center",
        }
      );
      doc.setFontSize(8);
      doc.text(
        `Document generated on ${new Date().toLocaleString()}`,
        pageWidth / 2,
        yPosition + 20,
        {
          align: "center",
        }
      );

      // Add receipt image if available on a new page with elegant styling
      if (receipt.id && receiptImages[receipt.id]) {
        try {
          const imgData = `data:image/jpeg;base64,${receiptImages[receipt.id]}`;
          doc.addPage();

          // Set white background for the image page
          doc.setFillColor(255, 255, 255);
          doc.rect(0, 0, pageWidth, pageHeight, "F");

          // Add decorative corner elements
          doc.setFillColor(primaryColor);
          doc.circle(15, 15, 8, "F");
          doc.circle(pageWidth - 15, 15, 8, "F");
          doc.circle(15, pageHeight - 15, 8, "F");
          doc.circle(pageWidth - 15, pageHeight - 15, 8, "F");

          // Add a subtle border
          doc.setDrawColor(accentColor);
          doc.setLineWidth(0.5);
          doc.roundedRect(10, 10, pageWidth - 20, pageHeight - 20, 3, 3, "S");

          // Add a stylish header for the image page
          doc.setFillColor(primaryColor);
          doc.roundedRect(10, 20, pageWidth - 20, 15, 2, 2, "F");
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(16);
          doc.setFont("helvetica", "bold");
          doc.text("RECEIPT IMAGE", pageWidth / 2, 30, { align: "center" });

          // Add a frame for the image
          doc.setFillColor(255, 255, 255);
          doc.roundedRect(20, 45, pageWidth - 40, pageHeight - 90, 3, 3, "F");
          doc.setDrawColor(primaryColor);
          doc.setLineWidth(1);
          doc.roundedRect(20, 45, pageWidth - 40, pageHeight - 90, 3, 3, "S");

          // Add the image with proper positioning and sizing
          doc.addImage(
            imgData,
            "JPEG",
            25,
            50,
            pageWidth - 50,
            pageHeight - 100
          );

          // Add a caption
          doc.setTextColor(darkGray);
          doc.setFontSize(10);
          doc.setFont("helvetica", "italic");
          doc.text(
            `Original receipt from ${receipt.storeName}`,
            pageWidth / 2,
            pageHeight - 35,
            { align: "center" }
          );

          // Add the same footer as the first page
          yPosition = pageHeight - 30;
          doc.setFillColor(primaryColor);
          doc.rect(0, yPosition, pageWidth, 30, "F");
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(10);
          doc.text(
            "Generated by Zero Paper - Your Digital Receipt Solution",
            pageWidth / 2,
            yPosition + 10,
            {
              align: "center",
            }
          );
          doc.setFontSize(8);
          doc.text(
            `Document generated on ${new Date().toLocaleString()}`,
            pageWidth / 2,
            yPosition + 20,
            {
              align: "center",
            }
          );
        } catch (imgError) {
          console.error("Error adding image to PDF:", imgError);
        }
      }

      // Add a subtle watermark
      doc.setTextColor(0, 0, 0, 0.03);
      doc.setFontSize(60);
      doc.setFont("helvetica", "bold");
      doc.text("ZERO PAPER", pageWidth / 2, pageHeight / 2, {
        align: "center",
        angle: 45,
      });

      // Save PDF with a descriptive filename
      const storeName =
        receipt.storeName?.replace(/\s+/g, "-").toLowerCase() || "unknown";
      const timestamp = new Date().toISOString().split("T")[0];
      const filename = `receipt-${storeName}-${timestamp}.pdf`;
      doc.save(filename);

      toast({
        title: "Receipt Downloaded",
        description: "Your receipt has been downloaded as a PDF.",
        variant: "success",
      });
    } catch (error) {
      console.error("Error downloading receipt as PDF:", error);
      toast({
        title: "Download Failed",
        description: "Failed to download receipt as PDF. Please try again.",
        variant: "destructive",
      });
    }
  };
  const handleDownloadReceiptsZip = async () => {
    try {
      if (!fromDate || !toDate) {
        toast({
          title: "Date Range Required",
          description: "Please select both start and end dates.",
          variant: "destructive",
        });
        return;
      }

      // Check if a specific category is selected
      if (activeCategory === "all") {
        toast({
          title: "Category Selection Required",
          description:
            "Please select a specific category to download receipts.",
          variant: "destructive",
        });
        return;
      }

      setIsDownloadingZip(true);

      // Get user ID from localStorage using the getUserId helper
      const uid = getUserId();
      if (!uid) {
        toast({
          title: "User ID Not Found",
          description: "Please log in again to download receipts.",
          variant: "destructive",
        });
        return;
      }

      // Get auth token
      const token = getAuthToken();
      if (!token) {
        toast({
          title: "Authentication Required",
          description: "Please log in again to download receipts.",
          variant: "destructive",
        });
        return;
      }

      // Use the selected category for the API
      const categoryParam = activeCategory;

      // Format dates properly for the API (DD.MM.YYYY HH:MM:SS)
      const formatDateForApi = (dateStr: string) => {
        try {
          const date = new Date(dateStr);
          if (isNaN(date.getTime())) {
            throw new Error("Invalid date");
          }

          const day = date.getDate().toString().padStart(2, "0");
          const month = (date.getMonth() + 1).toString().padStart(2, "0");
          const year = date.getFullYear();
          const hours = date.getHours().toString().padStart(2, "0");
          const minutes = date.getMinutes().toString().padStart(2, "0");
          const seconds = date.getSeconds().toString().padStart(2, "0");

          return `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`;
        } catch (e) {
          console.error("Error formatting date:", e);
          return "";
        }
      };

      // Create properly formatted date strings
      const formattedFromDate = formatDateForApi(fromDate);
      const formattedToDate = formatDateForApi(toDate);

      if (!formattedFromDate || !formattedToDate) {
        throw new Error("Invalid date format");
      }

      // Build URL with URLSearchParams to properly encode parameters
      const params = new URLSearchParams();
      params.append("uid", uid);
      params.append("category", categoryParam);
      params.append("fromDate", formattedFromDate);
      params.append("toDate", formattedToDate);

      const apiUrl = `https://services.stage.zeropaper.online/api/zpu/receipts/zip?${params.toString()}`;

      console.log("Downloading receipts ZIP from:", apiUrl);

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/zip",
        },
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error");
        throw new Error(
          `Download failed with status: ${response.status}. ${errorText}`
        );
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `receipts-${activeCategory}-${fromDate}-to-${toDate}.zip`;
      document.body.appendChild(a);
      a.click();

      // Clean up
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Receipts Downloaded",
        description: `Your ${activeCategory} receipts have been downloaded as a ZIP file.`,
      });
    } catch (error) {
      console.error("Error downloading receipts ZIP:", error);
      toast({
        title: "Download Failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to download receipts. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDownloadingZip(false);
    }
  };
  // Handle add receipt with pre-selected category
  const handleAddReceipt = () => {
    setEditingReceipt(null);
    setShowReceiptForm(true);
  };

  // Toggle sort order
  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
  };

  // Add a handler to apply date filters when the date inputs change
  const handleDateFilterChange = () => {
    console.log(`Filtering receipts from ${fromDate} to ${toDate}`);
    // The filtering is handled automatically in the filteredReceipts variable
  };

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of table when changing pages
    const tableElement = document.getElementById("receipts-table");
    if (tableElement) {
      tableElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  // Filter and sort receipts
  const filteredReceipts = receipts
    .filter((receipt) => {
      // Category filter
      if (
        activeCategory !== "all" &&
        receipt.category?.toLowerCase() !== activeCategory.toLowerCase()
      ) {
        return false;
      }

      // Date range filter
      if (fromDate && toDate && receipt.date) {
        const receiptDate = new Date(receipt.date);
        const fromDateObj = new Date(fromDate);
        const toDateObj = new Date(toDate);

        // Set time to beginning and end of day for proper comparison
        fromDateObj.setHours(0, 0, 0, 0);
        toDateObj.setHours(23, 59, 59, 999);

        if (receiptDate < fromDateObj || receiptDate > toDateObj) {
          return false;
        }
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
      const multiplier = sortOrder === "asc" ? 1 : -1;

      if (sortBy === "date") {
        return (
          multiplier *
          (new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime())
        );
      } else if (sortBy === "price") {
        return multiplier * ((a.price || 0) - (b.price || 0));
      } else if (sortBy === "product") {
        return (
          multiplier * (a.productName || "").localeCompare(b.productName || "")
        );
      } else if (sortBy === "store") {
        return (
          multiplier * (a.storeName || "").localeCompare(b.storeName || "")
        );
      }
      return 0;
    });

  // Calculate pagination
  const totalPages = Math.ceil(filteredReceipts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredReceipts.length);
  const paginatedReceipts = filteredReceipts.slice(startIndex, endIndex);

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
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
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

  // Calculate totals by currency
  const totalsByCurrency = filteredReceipts.reduce((acc, receipt) => {
    const currency = receipt.currency || "€";
    if (!acc[currency]) {
      acc[currency] = 0;
    }
    acc[currency] += receipt.price || 0;
    return acc;
  }, {} as Record<string, number>);

  // Format the totals by currency for display
  const formattedTotalsByCurrency = Object.entries(totalsByCurrency).map(
    ([currency, total]) => {
      return { currency, total: total.toFixed(2) };
    }
  );

  // Update the handleOpenReceiptDetail function to also handle editing
  const handleEditReceipt = (e: React.MouseEvent, receipt: Receipt) => {
    e.stopPropagation(); // Prevent opening the detail modal
    setEditingReceipt(receipt);
    setShowReceiptForm(true);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Show loader when page is initially loading */}
      {pageLoading && <FullScreenLoader />}

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

              {/* Remove the WiFi status indicator from the navbar */}
              {/* And replace with an empty div: */}
              <div></div>
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
            <Alert
              variant="warning"
              className="mb-6 bg-amber-50 border-amber-200"
            >
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                You're currently offline. Some features may be limited.
              </AlertDescription>
            </Alert>
          )}

          {/* Filters Section */}
          <motion.div
            className="bg-white p-4 rounded-lg shadow-sm mb-6"
            variants={itemVariants}
          >
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="w-full md:w-auto">
                <Label
                  htmlFor="category-select"
                  className="text-sm font-medium mb-2 block"
                >
                  Select Category:
                </Label>
                <Select
                  value={activeCategory}
                  onValueChange={setActiveCategory}
                >
                  <SelectTrigger
                    id="category-select"
                    className="w-full md:w-[200px]"
                  >
                    <div className="flex items-center gap-2">
                      <span>{getCategoryEmoji(activeCategory)}</span>
                      <span>
                        {categories.find((c) => c.id === activeCategory)?.name}
                      </span>
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
                <Label
                  htmlFor="search-input"
                  className="text-sm font-medium mb-2 block"
                >
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
                  <Label
                    htmlFor="from-date"
                    className="text-sm font-medium mb-2 block"
                  >
                    From Date:
                  </Label>
                  <Input
                    id="from-date"
                    type="date"
                    value={fromDate}
                    onChange={(e) => {
                      setFromDate(e.target.value);
                      handleDateFilterChange();
                    }}
                    className="w-full md:w-[160px]"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="to-date"
                    className="text-sm font-medium mb-2 block"
                  >
                    To Date:
                  </Label>
                  <Input
                    id="to-date"
                    type="date"
                    value={toDate}
                    onChange={(e) => {
                      setToDate(e.target.value);
                      handleDateFilterChange();
                    }}
                    className="w-full md:w-[160px]"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    // Reset date filters to default (last 30 days)
                    const today = new Date();
                    const thirtyDaysAgo = new Date();
                    thirtyDaysAgo.setDate(today.getDate() - 30);

                    setToDate(today.toISOString().split("T")[0]);
                    setFromDate(thirtyDaysAgo.toISOString().split("T")[0]);
                  }}
                  className="h-10 ml-1"
                >
                  Reset Dates
                </Button>

                <Button
                  variant="outline"
                  onClick={handleDownloadReceiptsZip}
                  disabled={
                    isDownloadingZip ||
                    !isOnline ||
                    !fromDate ||
                    !toDate ||
                    activeCategory === "all"
                  }
                  className="h-10 ml-1"
                  title={
                    activeCategory === "all"
                      ? "Please select a specific category to download receipts"
                      : ""
                  }
                >
                  {isDownloadingZip ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4 mr-2" />
                  )}
                  {isDownloadingZip ? "Downloading..." : "Download ZIP"}
                </Button>

                {activeCategory === "all" && (
                  <div className="text-xs text-amber-600 mt-1 ml-1">
                    Select a specific category to enable download
                  </div>
                )}

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
                <Image
                  src="/placeholder.svg?height=40&width=40"
                  alt="No receipts"
                  width={40}
                  height={40}
                />
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

          {/* Update the Add Receipt button to be next to the receipt count */}
          <motion.div
            className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4"
            variants={itemVariants}
          >
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold">
                {filteredReceipts.length} Receipts
              </h2>
              <Button
                variant="default"
                size="sm"
                onClick={() => {
                  setEditingReceipt(null);
                  setShowReceiptForm(true);
                }}
                className="bg-[#1B9D65] hover:bg-[#1B9D65]/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Receipt
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex flex-col gap-1">
                {formattedTotalsByCurrency.map(({ currency, total }) => (
                  <p key={currency} className="text-lg font-semibold">
                    Total {currency}: {total}
                  </p>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Receipts Table with Pagination */}
          {!isLoading && filteredReceipts.length > 0 && (
            <motion.div
              className="bg-white rounded-lg shadow overflow-hidden"
              variants={itemVariants}
            >
              {/* Items per page selector */}
              <div className="p-4 border-b flex justify-end items-center">
                <div className="flex items-center gap-2">
                  <Label
                    htmlFor="items-per-page"
                    className="text-sm whitespace-nowrap"
                  >
                    Items per page:
                  </Label>
                  <Select
                    value={itemsPerPage.toString()}
                    onValueChange={handleItemsPerPageChange}
                  >
                    <SelectTrigger id="items-per-page" className="w-[80px]">
                      <SelectValue placeholder="10" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="overflow-x-auto" id="receipts-table">
                <table className="w-full">
                  {/* Modify the receipts table to make product column second and bold */}
                  {/* Find the table header section and reorder the columns: */}
                  <thead className="bg-white border-b text-black">
                    <tr>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort("id")}
                      >
                        <div className="flex items-center gap-1">
                          Receipt #
                          {sortBy === "id" && (
                            <ArrowUpDown className="w-4 h-4" />
                          )}
                        </div>
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort("product")}
                      >
                        <div className="flex items-center gap-1">
                          Product
                          {sortBy === "product" && (
                            <ArrowUpDown className="w-4 h-4" />
                          )}
                        </div>
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort("store")}
                      >
                        <div className="flex items-center gap-1">
                          Store
                          {sortBy === "store" && (
                            <ArrowUpDown className="w-4 h-4" />
                          )}
                        </div>
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort("date")}
                      >
                        <div className="flex items-center gap-1">
                          Date
                          {sortBy === "date" && (
                            <ArrowUpDown className="w-4 h-4" />
                          )}
                        </div>
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort("price")}
                      >
                        <div className="flex items-center gap-1">
                          Price
                          {sortBy === "price" && (
                            <ArrowUpDown className="w-4 h-4" />
                          )}
                        </div>
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  {/* And update the table body to match the new column order and make product bold: */}
                  <tbody className="bg-white divide-y divide-gray-100">
                    {paginatedReceipts.map((receipt, index) => (
                      <tr
                        key={receipt.id || index}
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleOpenReceiptDetail(receipt)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black">
                          #{startIndex + index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-black">
                          {receipt.productName || "No product name"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                          <div className="flex items-center gap-2">
                            <span>{receipt.storeName || "Unknown Store"}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                          {formatDate(receipt.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black">
                          {receipt.currency || "€"}{" "}
                          {(receipt.price || 0).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleEditReceipt(e, receipt)}
                            className="text-gray-500 hover:text-[#1B9D65]"
                          >
                            Edit
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t">
                  <div className="text-sm text-gray-700">
                    Showing{" "}
                    <span className="font-medium">{startIndex + 1}</span> to{" "}
                    <span className="font-medium">{endIndex}</span> of{" "}
                    <span className="font-medium">
                      {filteredReceipts.length}
                    </span>{" "}
                    receipts
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span className="sr-only">Previous Page</span>
                    </Button>

                    {/* Page number buttons */}
                    <div className="hidden md:flex space-x-1">
                      {Array.from(
                        { length: Math.min(5, totalPages) },
                        (_, i) => {
                          // Show first page, last page, current page, and pages around current
                          let pageToShow: number | null = null;

                          if (totalPages <= 5) {
                            // If 5 or fewer pages, show all pages
                            pageToShow = i + 1;
                          } else if (currentPage <= 3) {
                            // If near start, show first 5 pages
                            pageToShow = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            // If near end, show last 5 pages
                            pageToShow = totalPages - 4 + i;
                          } else {
                            // Show current page and 2 pages on each side
                            pageToShow = currentPage - 2 + i;
                          }

                          if (pageToShow) {
                            return (
                              <Button
                                key={pageToShow}
                                variant={
                                  currentPage === pageToShow
                                    ? "default"
                                    : "outline"
                                }
                                size="sm"
                                onClick={() => handlePageChange(pageToShow!)}
                                className={
                                  currentPage === pageToShow
                                    ? "bg-[#1B9D65] hover:bg-[#1B9D65]/90"
                                    : ""
                                }
                              >
                                {pageToShow}
                              </Button>
                            );
                          }
                          return null;
                        }
                      )}
                    </div>

                    {/* Mobile page indicator */}
                    <div className="md:hidden text-sm">
                      Page {currentPage} of {totalPages}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                      <span className="sr-only">Next Page</span>
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Add Button (Mobile) */}
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              delay: 0.5,
              type: "spring",
              stiffness: 300,
              damping: 15,
            }}
            whileHover={{
              scale: 1.1,
              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
            }}
            whileTap={{ scale: 0.9 }}
            onClick={handleAddReceipt}
            className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-[#1B9D65] text-white rounded-full flex items-center justify-center shadow-lg"
          >
            <Plus className="w-6 h-6" />
          </motion.button>

          {/* Update the AddReceiptDialog to handle editing */}
          {showReceiptForm && (
            <AddReceiptDialog
              isOpen={showReceiptForm}
              onClose={() => {
                setShowReceiptForm(false);
                setEditingReceipt(null);
              }}
              onSuccess={() => {
                setShowReceiptForm(false);
                setEditingReceipt(null);
                fetchReceipts();
              }}
              initialCategory={
                activeCategory !== "all" ? activeCategory : undefined
              }
              editReceipt={editingReceipt}
            />
          )}

          {/* Delete Confirmation Dialog */}
          <AlertDialog
            open={deleteConfirmOpen}
            onOpenChange={setDeleteConfirmOpen}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  receipt from your account.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>
                  Cancel
                </AlertDialogCancel>
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
            receiptImage={
              selectedReceipt?.id ? receiptImages[selectedReceipt.id] : null
            }
            isOpen={isDetailModalOpen}
            onClose={handleCloseReceiptDetail}
            onDelete={(id) => {
              setReceipts(receipts.filter((receipt) => receipt.id !== id));
              toast({
                title: "Receipt Deleted",
                description: "The receipt has been successfully deleted.",
              });
            }}
            onDownloadPDF={handleDownloadReceiptPDF}
          />
        </motion.main>
        <div className="mt-8 text-center">
          <VersionDisplay />
        </div>
      </div>
    </div>
  );
}
