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
  X,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface AddReceiptDialogProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  initialCategory?: string
}

export default function AddReceiptDialog({ isOpen, onClose, onSuccess, initialCategory }: AddReceiptDialogProps) {
  const [step, setStep] = useState(1)
  const [category, setCategory] = useState(initialCategory || "business")
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
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
  })

  const { toast } = useToast()

  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen) {
      setStep(1)
      setCategory(initialCategory || "business")
      setAgreedToTerms(false)
      setIsLoading(false)
      setError(null)
      setSuccess(false)
      setSelectedFile(null)
      setImagePreview(null)
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
      })
    }
  }, [isOpen, initialCategory])

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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedFile(file)
      setImageUploaded(true)

      try {
        const base64 = await fileToBase64(file)
        setImagePreview(`data:${file.type};base64,${base64}`)
      } catch (err) {
        console.error("Error creating preview:", err)
      }

      if (error) setError(null)
    }
  }

  const handlePrepareImage = async () => {
    if (!selectedFile) return

    try {
      setIsLoading(true)
      setError(null)

      const base64 = await fileToBase64(selectedFile)
      setImagePreview(`data:${selectedFile.type};base64,${base64}`)
      setImageUploaded(true)

      toast({
        title: "Image Prepared",
        description: "Receipt image is ready to be uploaded with your receipt.",
      })
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to prepare image")
      toast({
        title: "Preparation Failed",
        description: "Failed to prepare receipt image.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
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
      let imageBase64 = null
      console.log("Selected File : " + selectedFile?.size)
      if (selectedFile && imageUploaded) {
        console.log("image is being uploaded")
        try {
          imageBase64 = await fileToBase64(selectedFile)
          console.log("imageBase64:", imageBase64) // Debugging line to check the output
        } catch (error) {
          console.error("Error converting file to base64:", error)
          setError("Failed to convert image to base64")
          setIsLoading(false)
          return
        }
      }

      const receiptData = {
        // formDataEncoded.append("imageBase64", 'base64,'+imageBase64);
        imageBase64: imageBase64,
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
      }

      // Submit receipt with image if available
      const formDataEncoded = new URLSearchParams()
      for (const [key, value] of Object.entries(receiptData)) {
        if (value !== undefined && value !== null) {
          formDataEncoded.append(key, value.toString())
        }
      }

      const response = await fetch("https://services.stage.zeropaper.online/api/zpu/receipts/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: formDataEncoded.toString(),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to add receipt")
      }

      const data = await response.json()
      setSuccess(true)
      toast({
        title: "Receipt Added",
        description: "Your receipt has been added successfully.",
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
      setError(error instanceof Error ? error.message : "Failed to add receipt")
      toast({
        title: "Error",
        description: "Failed to add receipt. Please try again.",
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
                {getStepIcon()}
              </motion.div>
              Add Receipt
            </DialogTitle>
          </div>
          {/* Progress bar */}
          <div className="h-1 bg-white/20 rounded-full mt-4">
            <motion.div
              className="h-full bg-white rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(step / 4) * 100}%` }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            />
          </div>
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
              <AlertDescription>Receipt added successfully!</AlertDescription>
            </Alert>
          )}

          <AnimatePresence mode="wait" custom={step}>
            {step === 1 && (
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
                <motion.h2 className="text-xl font-semibold">Upload Image (Optional)</motion.h2>
                <motion.div
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    imageUploaded ? "border-[#1B9D65] bg-[#1B9D65]/5" : "border-gray-200 hover:border-[#1B9D65]"
                  }`}
                  onClick={() => document.getElementById("receipt-image")?.click()}
                  whileHover={{ scale: 1.02, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
                  whileTap={{ scale: 0.98 }}
                >
                  <input
                    type="file"
                    id="receipt-image"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <div className="flex flex-col items-center gap-2">
                    {imagePreview ? (
                      <div className="relative w-full max-w-xs mx-auto">
                        <img
                          src={imagePreview || "/placeholder.svg"}
                          alt="Receipt preview"
                          className="max-h-48 max-w-full mx-auto rounded-lg object-contain"
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedFile(null)
                            setImagePreview(null)
                            setImageUploaded(false)
                          }}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <motion.div
                        className={`p-3 rounded-full ${imageUploaded ? "bg-[#1B9D65] text-white" : "bg-[#1B9D65]/10 text-[#1B9D65]"}`}
                        initial={{ scale: 1 }}
                        animate={{
                          scale: [1, 1.1, 1],
                          rotate: imageUploaded ? [0, 360] : 0,
                        }}
                        transition={{
                          duration: 0.5,
                          ease: "easeInOut",
                          times: [0, 0.5, 1],
                          repeat: imageUploaded ? 0 : Number.POSITIVE_INFINITY,
                          repeatDelay: 3,
                        }}
                      >
                        {imageUploaded ? <Check className="w-6 h-6" /> : <ImageIcon className="w-6 h-6" />}
                      </motion.div>
                    )}
                    <p className={imageUploaded ? "text-[#1B9D65] font-medium" : "text-gray-600"}>
                      {imageUploaded ? "Image Uploaded" : selectedFile ? "Change Image" : "Upload Image"}
                    </p>
                    {selectedFile && !imageUploaded && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-2">
                        <p className="text-sm text-gray-500 mb-2">Selected: {selectedFile.name}</p>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation()
                            handlePrepareImage()
                          }}
                          disabled={isLoading}
                          className="bg-[#1B9D65] hover:bg-[#1B9D65]/90"
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Preparing...
                            </>
                          ) : (
                            "Prepare Image"
                          )}
                        </Button>
                      </motion.div>
                    )}
                    {imageUploaded && (
                      <motion.p
                        className="text-sm text-gray-500 mt-2"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        Image ready to upload with receipt
                      </motion.p>
                    )}
                  </div>
                </motion.div>
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
            onClick={handleNext}
            disabled={!isStepValid() || isLoading || success}
            className="bg-[#1B9D65] text-white hover:bg-[#1B9D65]/90 disabled:bg-gray-300"
            whileHover={{ scale: isStepValid() && !isLoading && !success ? 1.05 : 1 }}
            whileTap={{ scale: isStepValid() && !isLoading && !success ? 0.95 : 1 }}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {step === 4 ? "Saving..." : "Processing..."}
              </>
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

