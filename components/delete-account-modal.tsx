"use client"

import { useState, useEffect } from "react"
import { AlertTriangle, X } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import OTPInput from "@/components/otp-input"
import { sendDeleteAccountOTP, deleteUserAccount } from "@/services/user-service"
import { getUserData, logoutUser } from "@/utils/auth-helpers"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

interface DeleteAccountModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function DeleteAccountModal({ isOpen, onClose, onSuccess }: DeleteAccountModalProps) {
  const [step, setStep] = useState(1) // 1: Confirm, 2: OTP, 3: Processing
  const [otp, setOtp] = useState(Array(4).fill(""))
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const userData = getUserData()

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setStep(1)
      setOtp(Array(4).fill(""))
      setIsLoading(false)
      setError(null)
    }
  }, [isOpen])

  const handleSendOTP = async () => {
    if (!userData?.email) {
      setError("Unable to retrieve your email. Please try again later.")
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const result = await sendDeleteAccountOTP(userData.email)

      if (result.success) {
        setStep(2)
        toast({
          title: "OTP Sent",
          description: "A verification code has been sent to your email.",
        })
      } else {
        setError(result.message || "Failed to send verification code. Please try again.")
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again.")
      console.error("Error sending OTP:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const router = useRouter()
  const handleDeleteAccount = async () => {
    if (!userData?.email) {
      setError("Unable to retrieve your email. Please try again later.");
      return;
    }
  
    if (otp.some((digit) => !digit)) {
      setError("Please enter the complete verification code.");
      return;
    }
  
    try {
      setIsLoading(true);
      setError(null);
      setStep(3);
  
      const result = await deleteUserAccount(userData.email, otp.join(""));
  
      let successMessage = "Account deleted successfully";
      
      // Check if the response is JSON or plain text
      if (typeof result === "string") {
        // Handle plain text response
        successMessage = result;
      } else if (result?.message) {
        // Handle JSON response
        successMessage = result.message;
      }
  
      if (result.success) {
        toast({
          title: "Account Deleted",
          description: successMessage,
        });
  
        // Ensure session is cleared before redirecting
        logoutUser();  
        router.push("/login"); // Immediately redirect to login page
  
        return; // Stop further execution
      } else {
        setStep(2);
        setError(result.message || "Failed to delete account. Please try again.");
      }
    } catch (error) {
      setStep(2);
      setError("An unexpected error occurred. Please try again.");
      console.error("Error deleting account:", error);
    } finally {
      setIsLoading(false);
    }
  };
  

  const handleResendOTP = async () => {
    if (!userData?.email) {
      setError("Unable to retrieve your email. Please try again later.")
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const result = await sendDeleteAccountOTP(userData.email)

      if (result.success) {
        toast({
          title: "OTP Resent",
          description: "A new verification code has been sent to your email.",
        })
      } else {
        setError(result.message || "Failed to resend verification code. Please try again.")
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again.")
      console.error("Error resending OTP:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            {step === 1 && "Delete Your Account"}
            {step === 2 && "Verify Your Identity"}
            {step === 3 && "Deleting Account..."}
          </DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4"
            onClick={onClose}
            disabled={isLoading}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        {error && <div className="bg-red-50 p-3 rounded-md text-red-600 text-sm mb-4">{error}</div>}

        {step === 1 && (
          <div className="space-y-4">
            <div className="p-4 bg-red-50 rounded-md border border-red-200">
              <p className="text-red-800 text-sm">
                This action cannot be undone. This will permanently delete your account and remove all your data from
                our servers.
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">The following data will be permanently deleted:</p>
              <ul className="text-sm text-gray-500 list-disc pl-5 space-y-1">
                <li>All your receipts and transaction history</li>
                <li>Your payment information</li>
                <li>Your personal profile and preferences</li>
                <li>Any saved payment methods</li>
              </ul>
            </div>
            <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2">
              <Button variant="outline" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleSendOTP}
                disabled={isLoading}
                className="sm:w-auto w-full"
              >
                {isLoading ? "Processing..." : "Continue"}
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              For security, please enter the verification code sent to your email to confirm account deletion.
            </p>

            <div className="py-4">
              <OTPInput length={4} value={otp} onChange={setOtp} disabled={isLoading} />
            </div>

            <div className="text-center">
              <button
                onClick={handleResendOTP}
                disabled={isLoading}
                className="text-sm text-[#1B9D65] hover:underline"
              >
                Resend code
              </button>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2">
              <Button variant="outline" onClick={() => setStep(1)} disabled={isLoading}>
                Back
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteAccount}
                disabled={isLoading || otp.some((digit) => !digit)}
                className="sm:w-auto w-full"
              >
                {isLoading ? "Processing..." : "Delete Account"}
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === 3 && (
          <div className="py-8 text-center space-y-4">
            <div className="animate-pulse flex justify-center">
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <p className="text-gray-500">Deleting your account and all associated data...</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}