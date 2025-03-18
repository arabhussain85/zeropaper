"use client"

import type React from "react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Eye, EyeOff, ArrowLeft, ArrowRight, Check, User, Mail, Phone, Lock, KeyRound } from "lucide-react"
import { useNavigate, Link } from "react-router-dom"
import { toast } from "../components/ui/use-toast"
import OTPInput from "../components/otp-input"
import { sendOTP, registerUser } from "../services/api"

const Signup: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1) // 1: Form, 2: OTP Verification
  const [otp, setOtp] = useState(Array(4).fill(""))
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneCountryCode: "+353",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  })

  const navigate = useNavigate()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement

    if (type === "checkbox") {
      setFormData({
        ...formData,
        [name]: (e.target as HTMLInputElement).checked,
      })
    } else {
      setFormData({
        ...formData,
        [name]: value,
      })
    }
  }

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Send OTP to email
      const result = await sendOTP(formData.email)

      if (result.success) {
        setStep(2)
        toast({
          title: "OTP Sent!",
          description: "Please check your email for the verification code.",
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

  const handleVerifyOtp = async () => {
    setIsLoading(true)

    try {
      // Register user with OTP
      const result = await registerUser({
        email: formData.email,
        phoneCountryCode: formData.phoneCountryCode,
        phoneNumber: formData.phoneNumber,
        country: "Ireland", // Default country or get from form
        name: formData.fullName,
        password: formData.password,
        otp: otp.join(""),
      })

      if (result.success) {
        toast({
          title: "Success!",
          description: "Your account has been created successfully.",
        })
        // Redirect to login
        navigate("/login")
      } else {
        toast({
          title: "Registration Failed",
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
      const result = await sendOTP(formData.email)

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
                key="signup-form"
                custom={1}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                {/* Welcome Text */}
                <div className="mb-8">
                  <h1 className="text-2xl font-bold mb-1">Welcome!</h1>
                  <p className="text-gray-600">Create your account</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmitForm} className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="fullName" className="text-sm font-medium flex items-center gap-2">
                      <User className="w-4 h-4 text-[#1B9D65]" />
                      Full Name
                    </label>
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      placeholder="Full Name"
                      required
                      className="h-12 bg-gray-50 w-full px-3 rounded-lg border border-gray-300"
                      value={formData.fullName}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                      <Mail className="w-4 h-4 text-[#1B9D65]" />
                      Email ID
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Email ID"
                      required
                      className="h-12 bg-gray-50 w-full px-3 rounded-lg border border-gray-300"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="phoneNumber" className="text-sm font-medium flex items-center gap-2">
                      <Phone className="w-4 h-4 text-[#1B9D65]" />
                      Phone Number
                    </label>
                    <div className="flex gap-2">
                      <select
                        className="h-12 bg-gray-50 rounded-lg border border-gray-300 px-3 w-24"
                        name="phoneCountryCode"
                        value={formData.phoneCountryCode}
                        onChange={handleInputChange}
                      >
                        <option value="+353">🇮🇪 +353</option>
                        <option value="+44">🇬🇧 +44</option>
                        <option value="+1">🇺🇸 +1</option>
                      </select>
                      <input
                        id="phoneNumber"
                        name="phoneNumber"
                        type="tel"
                        placeholder="Phone Number"
                        required
                        className="h-12 bg-gray-50 flex-1 px-3 rounded-lg border border-gray-300"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium flex items-center gap-2">
                      <Lock className="w-4 h-4 text-[#1B9D65]" />
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter Password"
                        required
                        className="h-12 bg-gray-50 pr-12 w-full px-3 rounded-lg border border-gray-300"
                        value={formData.password}
                        onChange={handleInputChange}
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
                    <label htmlFor="confirmPassword" className="text-sm font-medium flex items-center gap-2">
                      <Lock className="w-4 h-4 text-[#1B9D65]" />
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm Password"
                        required
                        className="h-12 bg-gray-50 pr-12 w-full px-3 rounded-lg border border-gray-300"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
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

                  <div className="flex items-center gap-2">
                    <input
                      id="agreeToTerms"
                      name="agreeToTerms"
                      type="checkbox"
                      required
                      checked={formData.agreeToTerms}
                      onChange={handleInputChange}
                      className="h-4 w-4 rounded border-gray-300 text-[#1B9D65] focus:ring-[#1B9D65]"
                    />
                    <label htmlFor="agreeToTerms" className="text-sm text-gray-600">
                      Agree with{" "}
                      <Link to="/terms" className="text-[#1B9D65] hover:underline">
                        terms & conditions
                      </Link>
                    </label>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 bg-[#1B9D65] text-white rounded-lg font-medium hover:bg-[#1B9D65]/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isLoading ? "Processing..." : "REGISTER"}
                    {!isLoading && <ArrowRight className="w-4 h-4" />}
                  </motion.button>
                </form>

                {/* Login Link */}
                <div className="mt-8 text-center">
                  <p className="text-gray-600">
                    Already have an account?{" "}
                    <Link to="/login" className="text-[#1B9D65] font-medium hover:underline">
                      LOGIN
                    </Link>
                  </p>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="otp-verification"
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
                    We've sent a verification code to <span className="font-medium">{formData.email}</span>. Please
                    enter it below.
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
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}

export default Signup

