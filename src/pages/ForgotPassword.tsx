"use client"

import type React from "react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, ArrowRight, Check, Mail, KeyRound, Lock, Eye, EyeOff } from "lucide-react"
import { useNavigate, Link } from "react-router-dom"
import { toast } from "../components/ui/use-toast"
import OTPInput from "../components/otp-input"
import { sendOTP, resetPassword } from "../services/api"

const ForgotPassword: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1) // 1: Email, 2: OTP, 3: New Password, 4: Success
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState(Array(4).fill(""))
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const navigate = useNavigate()

  const handleSubmitEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Send OTP to email
      const result = await sendOTP(email)

      if (result.success) {
        setStep(2)
        toast({
          title: "OTP Sent!",
          description: "Check your email for the verification code.",
        })
      } else {
        toast({
          title: "Failed to send OTP",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOtp = () => {
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      setStep(3)
      toast({
        title: "OTP Verified!",
        description: "Please set your new password.",
      })
    }, 1500)
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate passwords
    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Reset password with OTP
      const result = await resetPassword({
        email,
        password,
        otp: otp.join(""),
      })

      if (result.success) {
        setStep(4)
        toast({
          title: "Success!",
          description: "Your password has been reset successfully.",
        })
      } else {
        toast({
          title: "Password Reset Failed",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOtp = async () => {
    try {
      setIsLoading(true)
      const result = await sendOTP(email)

      if (result.success) {
        toast({
          title: "OTP Resent!",
          description: "Please check your email for the new verification code.",
        })
      } else {
        toast({
          title: "Failed to resend OTP",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
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

  return (
    <div className="min-h-screen bg-[#1B9D65] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-8 shadow-xl"
        >
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-[#1B9D65] rounded-lg p-2">
              <div className="w-8 h-8 relative">
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Zero%20paper%20user2-05%201-2MhU8cy380KtTq1agohGg6DKTIqtzS.png"
                  alt="Zero Paper Logo"
                  className="object-contain"
                />
              </div>
            </div>
            <div className="text-xl font-bold">
              <div>ZERO</div>
              <div>PAPER USER</div>
            </div>
          </div>

          <AnimatePresence mode="wait" custom={step}>
            {step === 1 && (
              <motion.div
                key="email-step"
                custom={1}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                {/* Header */}
                <div className="mb-8">
                  <h1 className="text-2xl font-bold mb-1">Forgot Password?</h1>
                  <p className="text-gray-600">
                    Enter your email address and we'll send you a verification code to reset your password.
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmitEmail} className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                      <Mail className="w-4 h-4 text-[#1B9D65]" />
                      Email ID
                    </label>
                    <input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      required
                      className="h-12 bg-gray-50 w-full px-3 rounded-lg border border-gray-300"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 bg-[#1B9D65] text-white rounded-lg font-medium hover:bg-[#1B9D65]/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isLoading ? "Sending..." : "Send Verification Code"}
                    {!isLoading && <ArrowRight className="w-4 h-4" />}
                  </motion.button>
                </form>

                {/* Back to Login */}
                <div className="mt-8 text-center">
                  <Link
                    to="/login"
                    className="text-[#1B9D65] font-medium hover:underline flex items-center justify-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Login
                  </Link>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="otp-step"
                custom={1}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="space-y-6"
              >
                {/* OTP Verification Header */}
                <div className="text-center mb-6">
                  <motion.div
                    className="w-16 h-16 bg-[#1B9D65]/10 rounded-full flex items-center justify-center mx-auto mb-4"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  >
                    <KeyRound className="w-8 h-8 text-[#1B9D65]" />
                  </motion.div>
                  <h1 className="text-2xl font-bold mb-2">Verification Code</h1>
                  <p className="text-gray-600">
                    We've sent a verification code to <span className="font-medium">{email}</span>. Please enter it
                    below.
                  </p>
                </div>

                {/* OTP Input */}
                <OTPInput length={4} value={otp} onChange={setOtp} disabled={isLoading} />

                {/* Resend Code */}
                <div className="text-center">
                  <p className="text-gray-600 text-sm">
                    Didn't receive the code?{" "}
                    <button
                      className="text-[#1B9D65] font-medium hover:underline"
                      onClick={handleResendOtp}
                      disabled={isLoading}
                    >
                      Resend
                    </button>
                  </p>
                </div>

                {/* Verify Button */}
                <div className="flex flex-col gap-3">
                  <motion.button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={isLoading || otp.some((digit) => !digit)}
                    className="w-full h-12 bg-[#1B9D65] text-white rounded-lg font-medium hover:bg-[#1B9D65]/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isLoading ? "Verifying..." : "Verify"}
                    {!isLoading && <Check className="w-4 h-4" />}
                  </motion.button>

                  <motion.button
                    type="button"
                    onClick={() => setStep(1)}
                    disabled={isLoading}
                    className="w-full h-12 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </motion.button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="new-password-step"
                custom={1}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                {/* New Password Header */}
                <div className="mb-8">
                  <h1 className="text-2xl font-bold mb-1">Reset Password</h1>
                  <p className="text-gray-600">Create a new password for your account.</p>
                </div>

                {/* Form */}
                <form onSubmit={handleResetPassword} className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="new-password" className="text-sm font-medium flex items-center gap-2">
                      <Lock className="w-4 h-4 text-[#1B9D65]" />
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        id="new-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter new password"
                        required
                        className="h-12 bg-gray-50 pr-12 w-full px-3 rounded-lg border border-gray-300"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="confirm-password" className="text-sm font-medium flex items-center gap-2">
                      <Lock className="w-4 h-4 text-[#1B9D65]" />
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        id="confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm new password"
                        required
                        className="h-12 bg-gray-50 pr-12 w-full px-3 rounded-lg border border-gray-300"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 bg-[#1B9D65] text-white rounded-lg font-medium hover:bg-[#1B9D65]/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isLoading ? "Resetting..." : "Reset Password"}
                    {!isLoading && <Check className="w-4 h-4" />}
                  </motion.button>
                </form>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="success-step"
                custom={1}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="text-center space-y-6"
              >
                <motion.div
                  className="w-20 h-20 bg-[#1B9D65]/10 rounded-full flex items-center justify-center mx-auto"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                >
                  <Check className="w-10 h-10 text-[#1B9D65]" />
                </motion.div>

                <div>
                  <h1 className="text-2xl font-bold mb-2">Password Reset Successful!</h1>
                  <p className="text-gray-600">
                    Your password has been reset successfully. You can now login with your new password.
                  </p>
                </div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    to="/login"
                    className="w-full h-12 bg-[#1B9D65] text-white rounded-lg font-medium hover:bg-[#1B9D65]/90 transition-colors flex items-center justify-center gap-2 mt-4"
                  >
                    Go to Login
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}

export default ForgotPassword

