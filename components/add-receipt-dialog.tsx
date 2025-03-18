"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Upload, Check, Camera, Calendar, CreditCard, MapPin } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"

interface AddReceiptDialogProps {
  isOpen: boolean
  onClose: () => void
}

export default function AddReceiptDialog({ isOpen, onClose }: AddReceiptDialogProps) {
  const [step, setStep] = useState(1)
  const [category, setCategory] = useState("")
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [formData, setFormData] = useState({
    storeName: "",
    productName: "",
    currency: "EUR",
    price: "",
    location: "",
    date: "",
    refundableDate: "",
    validDate: "",
  })
  const [imageUploaded, setImageUploaded] = useState(false)
  const { toast } = useToast()

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1)
    } else {
      // Handle form submission
      toast({
        title: "Receipt Added",
        description: "Your receipt has been successfully added.",
        duration: 3000,
      })
      onClose()
      // Reset form
      setStep(1)
      setCategory("")
      setAgreedToTerms(false)
      setFormData({
        storeName: "",
        productName: "",
        currency: "EUR",
        price: "",
        location: "",
        date: "",
        refundableDate: "",
        validDate: "",
      })
      setImageUploaded(false)
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

  const simulateImageUpload = () => {
    // Simulate image upload
    setImageUploaded(true)
    toast({
      title: "Image Uploaded",
      description: "Your receipt image has been uploaded successfully.",
      duration: 2000,
    })
  }

  const isStepValid = () => {
    switch (step) {
      case 1:
        return category !== "" && agreedToTerms
      case 2:
        return imageUploaded
      case 3:
        return formData.storeName !== "" && formData.productName !== "" && formData.price !== ""
      case 4:
        return formData.date !== ""
      default:
        return false
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

  const slideVariants = {
    enter: (direction: number) => {
      return {
        x: direction > 0 ? 500 : -500,
        opacity: 0,
      }
    },
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => {
      return {
        x: direction < 0 ? 500 : -500,
        opacity: 0,
      }
    },
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
              while
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
          <AnimatePresence mode="wait" custom={step}>
            {step === 1 && (
              <motion.div
                key="step1"
                custom={1}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="space-y-4"
              >
                <motion.h2 className="text-xl font-semibold" variants={itemVariants}>
                  Select Category
                </motion.h2>
                <motion.div className="space-y-3" variants={containerVariants} initial="hidden" animate="visible">
                  {["Business", "Personal", "Medical", "Electrical", "Other"].map((cat, index) => (
                    <motion.button
                      key={cat}
                      variants={itemVariants}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => setCategory(cat)}
                      className={`w-full p-4 rounded-lg border text-left transition-colors flex justify-between items-center ${
                        category === cat
                          ? "border-[#1B9D65] bg-[#1B9D65]/5 text-[#1B9D65]"
                          : "border-gray-200 hover:border-[#1B9D65]"
                      }`}
                      whileHover={{ scale: 1.02, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span>{cat}</span>
                      {category === cat && (
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
                <motion.div className="flex items-start space-x-2" variants={itemVariants}>
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
                </motion.div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                custom={1}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="space-y-4"
              >
                <motion.h2 className="text-xl font-semibold" variants={itemVariants}>
                  Upload Image
                </motion.h2>
                <motion.div
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    imageUploaded ? "border-[#1B9D65] bg-[#1B9D65]/5" : "border-gray-200 hover:border-[#1B9D65]"
                  }`}
                  onClick={simulateImageUpload}
                  whileHover={{ scale: 1.02, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex flex-col items-center gap-2">
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
                      {imageUploaded ? <Check className="w-6 h-6" /> : <Upload className="w-6 h-6" />}
                    </motion.div>
                    <p className={imageUploaded ? "text-[#1B9D65] font-medium" : "text-gray-600"}>
                      {imageUploaded ? "Image Uploaded" : "Upload Image"}
                    </p>
                    {imageUploaded && (
                      <motion.p
                        className="text-sm text-gray-500 mt-2"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        receipt_image.jpg
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
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="space-y-4"
              >
                <motion.h2 className="text-xl font-semibold" variants={itemVariants}>
                  Purchase Details
                </motion.h2>
                <motion.div className="space-y-4" variants={containerVariants} initial="hidden" animate="visible">
                  <motion.div variants={itemVariants}>
                    <label className="text-sm font-medium">Store Name</label>
                    <Input
                      placeholder="Store Name"
                      className="mt-1"
                      name="storeName"
                      value={formData.storeName}
                      onChange={handleInputChange}
                    />
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <label className="text-sm font-medium">Product Name</label>
                    <Input
                      placeholder="Product Name"
                      className="mt-1"
                      name="productName"
                      value={formData.productName}
                      onChange={handleInputChange}
                    />
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <label className="text-sm font-medium">Select Currency</label>
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
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <label className="text-sm font-medium">Price</label>
                    <Input
                      placeholder="Price"
                      type="number"
                      className="mt-1"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                    />
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <label className="text-sm font-medium">Store Location</label>
                    <Input
                      placeholder="Store Location"
                      className="mt-1"
                      name="location"
                      value={formData.location}
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
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="space-y-4"
              >
                <motion.h2 className="text-xl font-semibold" variants={itemVariants}>
                  Date & Currency
                </motion.h2>
                <motion.div className="space-y-4" variants={containerVariants} initial="hidden" animate="visible">
                  <motion.div variants={itemVariants}>
                    <label className="text-sm font-medium">Date</label>
                    <Input
                      type="date"
                      className="mt-1"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                    />
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <label className="text-sm font-medium">Refundable Date</label>
                    <Input
                      type="date"
                      className="mt-1"
                      name="refundableDate"
                      value={formData.refundableDate}
                      onChange={handleInputChange}
                    />
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <label className="text-sm font-medium">Valid Date</label>
                    <Input
                      type="date"
                      className="mt-1"
                      name="validDate"
                      value={formData.validDate}
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
            disabled={!isStepValid()}
            className="bg-[#1B9D65] text-white hover:bg-[#1B9D65]/90 disabled:bg-gray-300"
            whileHover={{ scale: isStepValid() ? 1.05 : 1 }}
            whileTap={{ scale: isStepValid() ? 0.95 : 1 }}
          >
            {step === 4 ? "Save" : "Next"}
          </Button>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}

