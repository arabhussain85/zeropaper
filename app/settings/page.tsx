"use client"

import type React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import { User, Mail, QrCode, Loader2, Trash2, AlertTriangle } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"
import { getUserData, logoutUser } from "@/utils/auth-helpers"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import Sidebar from "@/components/sidebar"
import { useRouter } from "next/navigation"
import OTPInput from "@/components/otp-input"
import { sendOTP } from "@/services/api-wrapper"
import VersionDisplay from "@/components/version-display"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile")
  const [isDeleting, setIsDeleting] = useState(false)
  const [showQrCode, setShowQrCode] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showOtpInput, setShowOtpInput] = useState(false)
  const [otpValue, setOtpValue] = useState<string[]>(Array(4).fill(""))
  const [isSendingOtp, setIsSendingOtp] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  // Get user data
  const userData = getUserData()
  const [formData, setFormData] = useState({
    name: userData?.name || "",
    email: userData?.email || "",
    phone: userData?.phone || "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSendOTP = async () => {
    if (!formData.email) {
      toast({
        title: "Email Required",
        description: "Your email is required to send the verification code.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSendingOtp(true)
      const result = await sendOTP(formData.email)

      if (result.success) {
        toast({
          title: "Verification Code Sent",
          description: "Please check your email for the verification code.",
        })
        setShowOtpInput(true)
      } else {
        toast({
          title: "Failed to Send Code",
          description: result.message || "Please try again later.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error sending OTP:", error)
      toast({
        title: "Error",
        description: "Failed to send verification code. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSendingOtp(false)
    }
  }

  // Update the handleDeleteAccount function to properly send the OTP to the backend
  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true)

      // Get the OTP from the input
      const otp = otpValue.join("")

      if (otp.length !== 4) {
        toast({
          title: "Invalid Code",
          description: "Please enter the complete verification code.",
          variant: "destructive",
        })
        setIsDeleting(false)
        return
      }

      // Get user ID from local storage
      const userData = getUserData()
      const userId = userData?.uid

      if (!userId) {
        toast({
          title: "Authentication Error",
          description: "User ID not found. Please log in again.",
          variant: "destructive",
        })
        setIsDeleting(false)
        return
      }

      // Call the delete account API with OTP
      const response = await fetch(`https://services.stage.zeropaper.online/api/zpu/users/delete?otp=${otp}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete account. Invalid verification code.")
      }

      toast({
        title: "Account Deleted",
        description: "Your account has been successfully deleted.",
      })

      // Redirect to login page after deletion
      setTimeout(() => {
        logoutUser()
        router.push("/login")
      }, 1500)
    } catch (error) {
      console.error("Error deleting account:", error)
      toast({
        title: "Deletion Failed",
        description: error instanceof Error ? error.message : "Failed to delete account. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setShowOtpInput(false)
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
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      <div className="flex-1 lg:ml-16">
        {/* Header */}
        <div className="bg-white border-b">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <h1 className="text-2xl font-bold">Settings</h1>
          </div>
        </div>

        {/* Main Content */}
        <motion.main
          className="max-w-4xl mx-auto px-4 py-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-1 mb-8">
              <TabsTrigger value="profile">Profile</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>View your account profile information and contact details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 bg-[#1B9D65] rounded-full flex items-center justify-center text-white">
                        <User className="w-8 h-8" />
                      </div>
                      <div>
                        <h3 className="font-medium">{formData.name || "User"}</h3>
                        <p className="text-sm text-gray-500">{formData.email || "user@example.com"}</p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowQrCode(true)}
                        className="ml-auto"
                      >
                        <QrCode className="w-4 h-4 mr-2" />
                        Show QR Code
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="pl-10"
                          placeholder="Your full name"
                          readOnly
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="pl-10"
                          placeholder="Your email address"
                          readOnly
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants} className="mt-8">
                <Card className="border-red-100">
                  <CardHeader>
                    <CardTitle className="text-red-600">Danger Zone</CardTitle>
                    <CardDescription>Permanently delete your account and all associated data</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800">
                      <AlertDescription>
                        This action cannot be undone. All your data will be permanently removed.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                  <CardFooter>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="bg-red-600 hover:bg-red-700">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Account
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                            <AlertTriangle className="h-5 w-5" />
                            Delete Your Account
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your account and remove your data
                            from our servers.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="p-4 bg-red-50 rounded-md border border-red-200 mb-4">
                          <p className="text-red-800 text-sm">
                            All your receipts, payment information, and personal data will be permanently deleted.
                          </p>
                        </div>

                        {!showOtpInput ? (
                          <AlertDialogFooter>
                            <AlertDialogCancel disabled={isSendingOtp}>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleSendOTP}
                              disabled={isSendingOtp}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              {isSendingOtp ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Sending Code...
                                </>
                              ) : (
                                "Send Verification Code"
                              )}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        ) : (
                          <div className="space-y-4">
                            <div className="text-center">
                              <p className="text-sm text-gray-600 mb-4">
                                Enter the verification code sent to your email
                              </p>
                              <OTPInput length={4} onChange={setOtpValue} value={otpValue} disabled={isDeleting} />
                            </div>
                            <AlertDialogFooter>
                              <AlertDialogCancel
                                disabled={isDeleting}
                                onClick={() => {
                                  setShowOtpInput(false)
                                  setOtpValue(Array(4).fill(""))
                                }}
                              >
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={handleDeleteAccount}
                                disabled={isDeleting || otpValue.join("").length !== 4}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                {isDeleting ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Deleting...
                                  </>
                                ) : (
                                  "Delete Account"
                                )}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </div>
                        )}
                      </AlertDialogContent>
                    </AlertDialog>
                  </CardFooter>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
          <div className="mt-8">
            <VersionDisplay />
          </div>
        </motion.main>
      </div>

      {/* QR Code Dialog */}
      <Dialog open={showQrCode} onOpenChange={setShowQrCode}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Your Profile QR Code</DialogTitle>
            <DialogDescription>
              Scan this QR code to quickly access your profile or share with others.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center p-6">
            <div className="w-64 h-64 bg-white p-4 rounded-lg shadow-md flex items-center justify-center">
              <Image
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(userData?.uid || "zero-paper-user")}`}
                alt="User QR Code"
                width={200}
                height={200}
                className="object-contain"
              />
            </div>
          </div>
          <DialogFooter className="sm:justify-center">
            <Button type="button" variant="secondary" onClick={() => setShowQrCode(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

