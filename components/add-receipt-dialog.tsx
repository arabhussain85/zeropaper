"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { refreshAuthTokenIfNeeded, getAuthToken, getUserData } from "@/utils/auth-helpers"
import { fileToBase64 } from "@/services/api-wrapper"
import {
  ArrowLeft,
  Check,
  Camera,
  Calendar,
  CreditCard,
  MapPin,
  Loader2,
  AlertCircle,
  ImageIcon,
  File,
  FileText,
  Edit,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Alert, AlertDescription } from "@/components/ui/alert"
import MultiFileUpload from "@/components/multi-file-upload"

// Define the Receipt type
interface Receipt {
  id?: string
  storeName?: string
  productName?: string
  currency?: string
  price?: number
  storeLocation?: string
  date?: string
  validUptoDate?: string
  refundableUptoDate?: string
  receiptType?: string
  notes?: string
  category?: string
}

interface AddReceiptDialogProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  initialCategory?: string
  editReceipt?: Receipt | null
}

export default function AddReceiptDialog({
  isOpen,
  onClose,
  onSuccess,
  initialCategory,
  editReceipt,
}: AddReceiptDialogProps) {
  const [step, setStep] = useState(1)
  const [category, setCategory] = useState(initialCategory || "business")
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)

  // Replace single file state with multiple files state
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [imageUploaded, setImageUploaded] = useState(false)

  const [formData, setFormData] = useState({
    storeName: "",
    productName: "",
    currency: "USD",
    price: "",
    storeLocation: "",
    date: new Date().toISOString().split("T")[0],
    validUptoDate: "",
    refundableUptoDate: "",
    receiptType: "manual",
    notes: "",
  })

  const { toast } = useToast()

  // Reset form when dialog opens and handle edit mode
  useEffect(() => {
    if (isOpen) {
      // Check if we're in edit mode
      if (editReceipt) {
        setIsEditMode(true)

        // Pre-populate form with receipt data
        setFormData({
          storeName: editReceipt.storeName || "",
          productName: editReceipt.productName || "",
          currency: editReceipt.currency || "USD",
          price: editReceipt.price ? editReceipt.price.toString() : "",
          storeLocation: editReceipt.storeLocation || "",
          date: editReceipt.date
            ? new Date(editReceipt.date).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0],
          validUptoDate: editReceipt.validUptoDate
            ? new Date(editReceipt.validUptoDate).toISOString().split("T")[0]
            : "",
          refundableUptoDate: editReceipt.refundableUptoDate
            ? new Date(editReceipt.refundableUptoDate).toISOString().split("T")[0]
            : "",
          receiptType: editReceipt.receiptType || "manual",
          notes: editReceipt.notes || "",
        })

        // Set category from receipt
        setCategory(editReceipt.category || initialCategory || "business")

        // Skip to step 3 (purchase details) when editing
        setStep(3)

        // Auto-agree to terms when editing
        setAgreedToTerms(true)
      } else {
        // Reset form for new receipt
        setIsEditMode(false)
        setStep(1)
        setCategory(initialCategory || "business")
        setAgreedToTerms(false)
        setIsLoading(false)
        setError(null)
        setSuccess(false)
        setSelectedFiles([])
        setImageUploaded(false)
        setFormData({
          storeName: "",
          productName: "",
          currency: "USD",
          price: "",
          storeLocation: "",
          date: new Date().toISOString().split("T")[0],
          validUptoDate: "",
          refundableUptoDate: "",
          receiptType: "manual",
          notes: "",
        })
      }
    }
  }, [isOpen, initialCategory, editReceipt])

  const handleNext = () => {
    setError(null)
    if (step < 4) {
      setStep(step + 1)
    } else {
      handleSubmit()
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    } else {
      onClose()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    if (error) setError(null)
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value })
    if (error) setError(null)
  }

  // Update file handling to support multiple files
  const handleFilesSelected = (files: File[]) => {
    setSelectedFiles(files)
    setImageUploaded(files.length > 0)
    if (error) setError(null)
  }

  const handleSubmit = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Validate required fields
      if (
        !formData.productName ||
        !formData.storeName ||
        !formData.date ||
        !formData.price ||
        !category ||
        !formData.currency
      ) {
        setError("Please fill in all required fields")
        setIsLoading(false)
        return
      }

      // Get user ID from auth
      const userData = getUserData()
      if (!userData || !userData.uid) {
        setError("User ID not found. Please log in again.")
        window.location.href = "/login"
        return
      }

      // Refresh the auth token if needed
      const tokenRefreshed = await refreshAuthTokenIfNeeded()
      if (!tokenRefreshed) {
        setError("Your session has expired. Please log in again.")
        window.location.href = "/login"
        return
      }

      function formatDate(dateString) {
        if (!dateString) return undefined // Handle undefined dates
        const date = new Date(dateString)

        const day = String(date.getDate()).padStart(2, "0")
        const month = String(date.getMonth() + 1).padStart(2, "0") // Months are zero-based
        const year = date.getFullYear()
        const hours = String(date.getHours()).padStart(2, "0")
        const minutes = String(date.getMinutes()).padStart(2, "0")
        const seconds = String(date.getSeconds()).padStart(2, "0")

        return `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`
      }

      // Process the primary image (first image) if available
      let primaryImageBase64 = null
      if (selectedFiles.length > 0) {
        try {
          primaryImageBase64 = await fileToBase64(selectedFiles[0])
          console.log("Primary image processed")
        } catch (error) {
          console.error("Error converting primary file to base64:", error)
          setError("Failed to convert primary image to base64")
          setIsLoading(false)
          return
        }
      }

      // Prepare additional images if available
      const additionalImagesBase64 = []
      if (selectedFiles.length > 1) {
        try {
          // Process additional images (skip the first one as it's the primary)
          for (let i = 1; i < selectedFiles.length; i++) {
            const base64 = await fileToBase64(selectedFiles[i])
            additionalImagesBase64.push(base64)
          }
          console.log(`Processed ${additionalImagesBase64.length} additional images`)
        } catch (error) {
          console.error("Error converting additional files to base64:", error)
          // Continue with the primary image even if additional images fail
        }
      }

      const receiptData = {
        imageBase64: primaryImageBase64,
        additionalImages: additionalImagesBase64.length > 0 ? JSON.stringify(additionalImagesBase64) : undefined,
        price: Number.parseFloat(formData.price),
        productName: formData.productName,
        addedDate: formatDate(formData.date),
        category,
        date: formatDate(formData.date),
        refundableUptoDate: formatDate(formData.refundableUptoDate),
        storeLocation: formData.storeLocation,
        storeName: formData.storeName,
        uid: userData.uid,
        updatedDate: formatDate(formData.date),
        validUptoDate: formatDate(formData.validUptoDate),
        currency: formData.currency,
        receiptType: formData.receiptType,
        fileCount: selectedFiles.length,
        notes: formData.notes,
      }

      // If editing, add the receipt ID
      if (isEditMode && editReceipt?.id) {
        receiptData.id = editReceipt.id
      }

      // Submit receipt with image if available
      const formDataEncoded = new URLSearchParams()
      for (const [key, value] of Object.entries(receiptData)) {
        if (value !== undefined && value !== null) {
          formDataEncoded.append(key, value.toString())
        }
      }

      // Use the appropriate endpoint based on whether we're adding or updating
      const endpoint = isEditMode
        ? `https://services.stage.zeropaper.online/api/zpu/receipts/update?id=${editReceipt?.id}`
        : "https://services.stage.zeropaper.online/api/zpu/receipts/add"

      const response = await fetch(endpoint, {
        method: isEditMode ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: formDataEncoded.toString(),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to ${isEditMode ? "update" : "add"} receipt`)
      }

      const data = await response.json()
      setSuccess(true)
      toast({
        title: isEditMode ? "Receipt Updated" : "Receipt Added",
        description: `Your receipt with ${selectedFiles.length} file(s) has been ${isEditMode ? "updated" : "added"} successfully.`,
      })

      if (onSuccess) {
        setTimeout(() => {
          onSuccess()
        }, 1500)
      }

      setTimeout(() => {
        onClose()
      }, 2000)
    } catch (error) {
      setError(error instanceof Error ? error.message : `Failed to ${isEditMode ? "update" : "add"} receipt`)
      toast({
        title: "Error",
        description: `Failed to ${isEditMode ? "update" : "add"} receipt. Please try again.`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const isStepValid = () => {
    switch (step) {
      case 1:
        return category !== "" && agreedToTerms
      case 2:
        return true // Image upload is optional
      case 3:
        return formData.storeName !== "" && formData.productName !== "" && formData.price !== ""
      case 4:
        return formData.date !== ""
      default:
        return false
    }
  }

  const getStepIcon = () => {
    switch (step) {
      case 1:
        return <CreditCard className="w-6 h-6" />
      case 2:
        return <Camera className="w-6 h-6" />
      case 3:
        return <MapPin className="w-6 h-6" />
      case 4:
        return <Calendar className="w-6 h-6" />
      default:
        return <CreditCard className="w-6 h-6" />
    }
  }

  // Get file type icon
  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) {
      return <ImageIcon className="w-5 h-5 text-blue-500" />
    } else if (file.type === "application/pdf") {
      return <FileText className="w-5 h-5 text-red-500" />
    } else {
      return <File className="w-5 h-5 text-gray-500" />
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 max-h-[90vh] overflow-auto">
        <motion.div
          className="bg-[#1B9D65] text-white p-4 sticky top-0 z-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-3">
            <motion.button
              onClick={handleBack}
              className="p-1 hover:bg-white/10 rounded-full transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ArrowLeft className="w-6 h-6" />
            </motion.button>
            <DialogTitle className="flex items-center gap-2">
              <motion.div
                initial={{ rotate: -10, scale: 0.9 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                {isEditMode ? <Edit className="w-6 h-6" /> : getStepIcon()}
              </motion.div>
              {isEditMode ? "Edit Receipt" : "Add Receipt"}
            </DialogTitle>
          </div>
          {/* Progress bar - only show in add mode */}
          {!isEditMode && (
            <div className="h-1 bg-white/20 rounded-full mt-4">
              <motion.div
                className="h-full bg-white rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(step / 4) * 100}%` }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              />
            </div>
          )}
        </motion.div>

        <div className="p-6">
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Success Alert */}
          {success && (
            <Alert className="mb-6 bg-green-50 text-green-800 border-green-200">
              <Check className="h-4 w-4" />
              <AlertDescription>Receipt {isEditMode ? "updated" : "added"} successfully!</AlertDescription>
            </Alert>
          )}

          <AnimatePresence mode="wait" custom={step}>
            {step === 1 && !isEditMode && (
              <motion.div
                key="step1"
                custom={1}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="space-y-4"
              >
                <motion.h2 className="text-xl font-semibold">Select Category</motion.h2>
                <motion.div className="space-y-3">
                  {["Business", "Personal", "Medical", "Electrical", "Other"].map((cat, index) => (
                    <motion.button
                      key={cat}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => setCategory(cat.toLowerCase())}
                      className={`w-full p-4 rounded-lg border text-left transition-colors flex justify-between items-center ${
                        category === cat.toLowerCase()
                          ? "border-[#1B9D65] bg-[#1B9D65]/5 text-[#1B9D65]"
                          : "border-gray-200 hover:border-[#1B9D65]"
                      }`}
                      whileHover={{ scale: 1.02, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span>{cat}</span>
                      {category === cat.toLowerCase() && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500, damping: 15 }}
                        >
                          <Check className="w-5 h-5" />
                        </motion.div>
                      )}
                    </motion.button>
                  ))}
                </motion.div>
                <motion.div
                  className="flex items-start space-x-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Checkbox
                    id="terms"
                    checked={agreedToTerms}
                    onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                    className="data-[state=checked]:bg-[#1B9D65] data-[state=checked]:border-[#1B9D65]"
                  />
                  <label htmlFor="terms" className="text-sm text-gray-600">
                    I confirm this receipt is valid and belongs to me
                  </label>
                </motion.div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                custom={1}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="space-y-4"
              >
                <motion.h2 className="text-xl font-semibold">Upload Files (Optional)</motion.h2>
                <motion.p
                  className="text-sm text-gray-600"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  Upload images of your receipt or related documents. You can upload multiple files.
                </motion.p>

                {/* Replace the old file upload with MultiFileUpload component */}
                <MultiFileUpload
                  onFilesSelected={handleFilesSelected}
                  maxFiles={5}
                  acceptedFileTypes="image/*,application/pdf"
                  maxSizeInMB={10}
                />

                {/* Show selected files count */}
                {selectedFiles.length > 0 && (
                  <motion.div
                    className="mt-4 p-3 bg-[#1B9D65]/5 rounded-lg border border-[#1B9D65]/20"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <p className="text-sm font-medium text-[#1B9D65]">
                      {selectedFiles.length} file{selectedFiles.length !== 1 ? "s" : ""} selected
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      The first image will be used as the primary receipt image
                    </p>
                  </motion.div>
                )}
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                custom={1}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="space-y-4"
              >
                <motion.h2 className="text-xl font-semibold">Purchase Details</motion.h2>
                <motion.div className="space-y-4">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <label className="text-sm font-medium">
                      Store Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="Store Name"
                      className="mt-1"
                      name="storeName"
                      value={formData.storeName}
                      onChange={handleInputChange}
                      required
                    />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <label className="text-sm font-medium">
                      Product Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="Product Name"
                      className="mt-1"
                      name="productName"
                      value={formData.productName}
                      onChange={handleInputChange}
                      required
                    />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <label className="text-sm font-medium">
                      Select Currency <span className="text-red-500">*</span>
                    </label>
                    <Select value={formData.currency} onValueChange={(value) => handleSelectChange("currency", value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select Currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                        <SelectItem value="JPY">JPY (¥)</SelectItem>
                        <SelectItem value="INR">INR (₹)</SelectItem>
                      </SelectContent>
                    </Select>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <label className="text-sm font-medium">
                      Price <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="Price"
                      type="number"
                      step="0.01"
                      min="0"
                      className="mt-1"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                    />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <label className="text-sm font-medium">Store Location</label>
                    <Input
                      placeholder="Store Location"
                      className="mt-1"
                      name="storeLocation"
                      value={formData.storeLocation}
                      onChange={handleInputChange}
                    />
                  </motion.div>
                  {isEditMode && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      <label className="text-sm font-medium">Category</label>
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select Category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="business">Business</SelectItem>
                          <SelectItem value="personal">Personal</SelectItem>
                          <SelectItem value="medical">Medical</SelectItem>
                          <SelectItem value="electrical">Electrical</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </motion.div>
                  )}
                </motion.div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                custom={1}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="space-y-4"
              >
                <motion.h2 className="text-xl font-semibold">Date Information</motion.h2>
                <motion.div className="space-y-4">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <label className="text-sm font-medium">
                      Date <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="date"
                      className="mt-1"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      required
                    />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <label className="text-sm font-medium">Valid Until Date</label>
                    <Input
                      type="date"
                      className="mt-1"
                      name="validUptoDate"
                      value={formData.validUptoDate}
                      onChange={handleInputChange}
                    />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <label className="text-sm font-medium">Refundable Until Date</label>
                    <Input
                      type="date"
                      className="mt-1"
                      name="refundableUptoDate"
                      value={formData.refundableUptoDate}
                      onChange={handleInputChange}
                    />
                  </motion.div>
                </motion.div>
              </motion.div>
            )}

            {/* Edit mode - show all fields in one view */}
            {isEditMode && (
              <motion.div
                key="edit-dates"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="space-y-4 mt-4"
              >
                <motion.h2 className="text-xl font-semibold">Date Information</motion.h2>
                <motion.div className="space-y-4">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <label className="text-sm font-medium">
                      Date <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="date"
                      className="mt-1"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      required
                    />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <label className="text-sm font-medium">Valid Until Date</label>
                    <Input
                      type="date"
                      className="mt-1"
                      name="validUptoDate"
                      value={formData.validUptoDate}
                      onChange={handleInputChange}
                    />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <label className="text-sm font-medium">Refundable Until Date</label>
                    <Input
                      type="date"
                      className="mt-1"
                      name="refundableUptoDate"
                      value={formData.refundableUptoDate}
                      onChange={handleInputChange}
                    />
                  </motion.div>
                </motion.div>

                {/* Add file upload in edit mode */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mt-6"
                >
                  <motion.h2 className="text-xl font-semibold mb-4">Update Files (Optional)</motion.h2>
                  <MultiFileUpload
                    onFilesSelected={handleFilesSelected}
                    maxFiles={5}
                    acceptedFileTypes="image/*,application/pdf"
                    maxSizeInMB={10}
                  />
                  {selectedFiles.length > 0 && (
                    <motion.div
                      className="mt-4 p-3 bg-[#1B9D65]/5 rounded-lg border border-[#1B9D65]/20"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <p className="text-sm font-medium text-[#1B9D65]">
                        {selectedFiles.length} file{selectedFiles.length !== 1 ? "s" : ""} selected
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        The first image will be used as the primary receipt image
                      </p>
                    </motion.div>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.div
          className="p-4 border-t flex gap-3 justify-between sticky bottom-0 bg-white"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Button
            variant="outline"
            onClick={onClose}
            className="hover:bg-gray-100"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Cancel
          </Button>
          <Button
            onClick={isEditMode ? handleSubmit : handleNext}
            disabled={isEditMode ? false : !isStepValid() || isLoading || success}
            className="bg-[#1B9D65] text-white hover:bg-[#1B9D65]/90 disabled:bg-gray-300"
            whileHover={{ scale: isEditMode || (isStepValid() && !isLoading && !success) ? 1.05 : 1 }}
            whileTap={{ scale: isEditMode || (isStepValid() && !isLoading && !success) ? 0.95 : 1 }}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {isEditMode ? "Updating..." : step === 4 ? "Saving..." : "Processing..."}
              </>
            ) : isEditMode ? (
              "Update Receipt"
            ) : step === 4 ? (
              "Save"
            ) : (
              "Next"
            )}
          </Button>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}

