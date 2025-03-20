"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ArrowLeft,
  Upload,
  Check,
  Camera,
  Calendar,
  CreditCard,
  MapPin,
  Loader2,
  AlertCircle,
  Trash2,
  WifiOff,
} from "lucide-react"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { addReceipt, fileToBase64, getUserId } from "@/services/receipt-service"

interface AddReceiptDialogProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export default function AddReceiptDialog({ isOpen, onClose, onSuccess }: AddReceiptDialogProps) {
  const [step, setStep] = useState(1)
  const [category, setCategory] = useState("")
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [formData, setFormData] = useState({
    storeName: "",
    productName: "",
    currency: "EUR",
    price: "",
    storeLocation: "",
    date: new Date().toISOString().split('T')[0], // Current date in YYYY-MM-DD format
    refundableUptoDate: "",
    validUptoDate: "",
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const [isOnline, setIsOnline] = useState(true)

  // Check online status
  useEffect(() => {
    setIsOnline(navigator.onLine)
    
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  const handleNext = () => {
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
      handleClose()
    }
  }

  const handleClose = () => {
    // Reset form state
    setStep(1)
    setCategory("")
    setAgreedToTerms(false)
    setFormData({
      storeName: "",
      productName: "",
      currency: "EUR",
      price: "",
      storeLocation: "",
      date: new Date().toISOString().split('T')[0],
      refundableUptoDate: "",
      validUptoDate: "",
    })
    setImageFile(null)
    setImagePreview(null)
    setError(null)
    onClose()
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const file = files[0]

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should be less than 5MB")
        return
      }

      // Check file type
      if (!file.type.startsWith("image/")) {
        setError("Please upload an image file")
        return
      }

      setImageFile(file)

      // Create preview
      const reader = new FileReader()
      reader.onload = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)

      setError(null)
    }
  }

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Show offline warning if needed
      if (!isOnline) {
        toast({
          title: "You're offline",
          description: "Your receipt will be saved locally and synced when you're back online.",
          variant: "warning",
        })
      }

      // Convert image to base64 if available
      let imageBase64 = ""
      if (imageFile) {
        imageBase64 = await fileToBase64(imageFile)
      }

      // Format dates to ISO strings
      const formatDate = (dateStr: string) => {
        if (!dateStr) return undefined
        return new Date(dateStr).toISOString()
      }

      // Get user ID
      const uid = getUserId()
      if (!uid && isOnline) {
        throw new Error("User ID not found. Please log in again.")
      }

      // Prepare receipt data
      const receiptData = {
        uid: uid || "temp-user-id", // Use a temporary ID if not found
        category,
        price: Number.parseFloat(formData.price) || 0,
        productName: formData.productName,
        storeLocation: formData.storeLocation,
        storeName: formData.storeName,
        currency: formData.currency,
        date: formatDate(formData.date) || new Date().toISOString(),
        validUptoDate: formData.validUptoDate ? formatDate(formData.validUptoDate) : undefined,
        refundableUptoDate: formData.refundableUptoDate ? formatDate(formData.refundableUptoDate) : undefined,
        imageBase64,
      }

      console.log("Submitting receipt data:", { ...receiptData, imageBase64: imageBase64 ? "[BASE64 DATA]" : "none" })

      // Add receipt
      const result = await addReceipt(receiptData)
      
      if (!result.success) {
        throw new Error(result.message || "Failed to add receipt")
      }

      // Show success message
      toast({
        title: "Receipt Added",
        description: isOnline
          ? "Your receipt has been successfully added."
          : "Your receipt has been saved locally and will sync when you're back online.",
        duration: 3000,
      })

      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess()
      }

      // Close dialog and reset form
      handleClose()
    } catch (error) {
      console.error("Error adding receipt:", error)
      setError(error instanceof Error ? error.message : "Failed to add receipt. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const isStepValid = () => {
    switch (step) {
      case 1:
        return category !== "" && agreedToTerms
      case 2:
        return true // Image is optional
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
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md p-0 max-h-[90vh] overflow-auto">
        <div className="bg-[#1B9D65] text-white p-4 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button onClick={handleBack} className="p-1 hover:bg-white/10 rounded-full transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <DialogTitle className="flex items-center gap-2">
              {getStepIcon()}
              Add Receipt
            </DialogTitle>
          </div>
          {/* Progress bar */}
          <div className="h-1 bg-white/20 rounded-full mt-4">
            <div
              className="h-full bg-white rounded-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Offline warning */}
        {!isOnline && (
          <Alert variant="warning" className="m-4 bg-amber-50 border-amber-200">
            <WifiOff className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              You're currently offline. Your receipt will be saved locally and synced when you're back online.
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="m-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="p-6">
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Select Category</h2>
              <div className="space-y-3">
                {["Business", "Personal", "Medical", "Electrical", "Other"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`w-full p-4 rounded-lg border text-left transition-colors flex justify-between items-center ${
                      category === cat
                        ? "border-[#1B9D65] bg-[#1B9D65]/5 text-[#1B9D65]"
                        : "border-gray-200 hover:border-[#1B9D65]"
                    }`}
                  >
                    <span>{cat}</span>
                    {category === cat && <Check className="w-5 h-5" />}
                  </button>
                ))}
              </div>
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={agreedToTerms}
                  onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                  className="data-[state=checked]:bg-[#1B9D65] data-[state=checked]:border-[#1B9D65]"
                />
                <label htmlFor="terms" className="text-sm text-gray-600">
                  Agree with{" "}
                  <Link href="/terms" className="text-[#1B9D65] hover:underline">
                    terms & conditions
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-[#1B9D65] hover:underline">
                    Privacy Policy
                  </Link>
                </label>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Upload Image</h2>

              <input type="file" ref={fileInputRef} accept="image/*" onChange={handleImageUpload} className="hidden" />

              {!imagePreview ? (
                <div
                  className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors hover:border-[#1B9D65] hover:bg-[#1B9D65]/5"
                  onClick={triggerFileInput}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="p-3 rounded-full bg-[#1B9D65]/10 text-[#1B9D65]">
                      <Upload className="w-6 h-6" />
                    </div>
                    <p className="text-gray-600">Click to upload receipt image</p>
                    <p className="text-xs text-gray-500">JPG, PNG or GIF (max. 5MB)</p>
                  </div>
                </div>
              ) : (
                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium">Receipt Image</h3>
                    <button onClick={removeImage} className="text-red-500 hover:text-red-700 p-1">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="relative aspect-[3/4] w-full max-w-xs mx-auto">
                    <img
                      src={imagePreview || "/placeholder.svg"}
                      alt="Receipt preview"
                      className="w-full h-full object-contain rounded-md"
                    />
                  </div>
                </div>
              )}

              <p className="text-sm text-gray-500 text-center">
                Image is optional. You can proceed without uploading an image.
              </p>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Purchase Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Store Name*</label>
                  <Input
                    placeholder="Store Name"
                    className="mt-1"
                    name="storeName"
                    value={formData.storeName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Product Name*</label>
                  <Input
                    placeholder="Product Name"
                    className="mt-1"
                    name="productName"
                    value={formData.productName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Currency*</label>
                  <Select value={formData.currency} onValueChange={(value) => handleSelectChange("currency", value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select Currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Price*</label>
                  <Input
                    placeholder="Price"
                    type="number"
                    step="0.01"
                    className="mt-1"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Store Location*</label>
                  <Input
                    placeholder="Store Location"
                    className="mt-1"
                    name="storeLocation"
                    value={formData.storeLocation}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Date Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Purchase Date*</label>
                  <Input
                    type="date"
                    className="mt-1"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Refundable Until (Optional)</label>
                  <Input
                    type="date"
                    className="mt-1"
                    name="refundableUptoDate"
                    value={formData.refundableUptoDate}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Valid Until (Optional)</label>
                  <Input
                    type="date"
                    className="mt-1"
                    name="validUptoDate"
                    value={formData.validUptoDate}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t flex gap-3 justify-between sticky bottom-0 bg-white">
          <Button variant="outline" onClick={handleClose} className="hover:bg-gray-100">
            Cancel
          </Button>
          <Button
            onClick={handleNext}
            disabled={!isStepValid() || isLoading}
            className="bg-[#1B9D65] text-white hover:bg-[#1B9D65]/90 disabled:bg-gray-300"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {step === 4 ? "Saving..." : "Processing..."}
              </>
            ) : step === 4 ? (
              "Save Receipt"
            ) : (
              "Next"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}