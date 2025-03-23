"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Eye, EyeOff, ArrowRight, Check, User, Mail, Phone, Lock, KeyRound, Loader2, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import OTPInput from "@/components/otp-input"
import { sendOTP, registerUser } from "@/services/api-wrapper"
import { countries } from "@/utils/country-data"

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSendingOTP, setIsSendingOTP] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState(Array(4).fill(""))
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneCountryCode: "+353",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  })
  const { toast } = useToast()
  const router = useRouter()

  // Clear debug info after 10 seconds
  useEffect(() => {
    if (debugInfo) {
      const timer = setTimeout(() => {
        setDebugInfo(null)
      }, 10000)
      return () => clearTimeout(timer)
    }
  }, [debugInfo])

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

    // Clear error when user starts typing again
    if (error) setError(null)
  }

  const handleSendOTP = async (e: React.MouseEvent) => {
    e.preventDefault()
    setError(null)
    setDebugInfo(null)

    // Validate email
    if (!formData.email) {
      setError("Please enter your email address to receive the OTP.")
      return
    }

    setIsSendingOTP(true)

    try {
      setDebugInfo("Sending OTP request...")

      // Send OTP to email
      const result = await sendOTP(formData.email)

      if (result.success) {
        setOtpSent(true)
        toast({
          title: "OTP Sent!",
          description: "Please check your email for the verification code.",
        })
        setDebugInfo("OTP sent successfully")
      } else {
        setError(result.message || "Failed to send OTP. Please try again.")
        setDebugInfo("OTP sending failed: " + result.message)
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
        setDebugInfo("Error: " + error.message)
      } else {
        setError("An unexpected error occurred. Please try again.")
        setDebugInfo("Unknown error occurred")
      }
    } finally {
      setIsSendingOTP(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setDebugInfo(null)

    // Validate form
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match. Please make sure your passwords match.")
      return
    }

    if (!otpSent) {
      setError("Please request and enter the OTP before registering.")
      return
    }

    if (otp.some((digit) => !digit)) {
      setError("Please enter the complete 4-digit verification code.")
      return
    }

    setIsRegistering(true)

    try {
      // Log the registration attempt
      setDebugInfo("Attempting registration...")

      // Register the user with OTP
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
          title: "Registration Successful!",
          description: "Your account has been created. Redirecting to login page...",
        })

        // We don't store the token after registration anymore
        // Instead, we redirect to login page for proper authentication flow
        setDebugInfo(`Registration successful. Redirecting to login page...`)

        // Redirect to login page after successful registration
        setTimeout(() => {
          window.location.href = "/login"
        }, 1500)
      } else {
        setError(result.message || "Registration failed. Please try again.")
        setDebugInfo("Registration failed: " + result.message)
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
        setDebugInfo("Error: " + error.message)
      } else {
        setError("An unexpected error occurred. Please try again.")
        setDebugInfo("Unknown error occurred")
      }
    } finally {
      setIsRegistering(false)
    }
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
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Zero%20paper%20user2-05%201-2MhU8cy380KtTq1agohGg6DKTIqtzS.png"
                  alt="Zero Paper Logo"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
            <div className="text-xl font-bold">
              <div>ZERO</div>
              <div>PAPER USER</div>
            </div>
          </div>

          {/* Welcome Text */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-1">Welcome!</h1>
            <p className="text-gray-600">Create your account</p>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Debug Info */}
          {debugInfo && (
            <Alert className="mb-6 bg-blue-50 text-blue-800 border-blue-200">
              <AlertDescription className="font-mono text-xs">{debugInfo}</AlertDescription>
            </Alert>
          )}

          {/* Form */}
          <form onSubmit={handleRegister} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="fullName" className="text-sm font-medium flex items-center gap-2">
                <User className="w-4 h-4 text-[#1B9D65]" />
                Full Name
              </label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="Full Name"
                required
                className="h-12 bg-gray-50"
                value={formData.fullName}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#1B9D65]" />
                Email ID
              </label>
              <div className="flex gap-2">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Email ID"
                  required
                  className="h-12 bg-gray-50"
                  value={formData.email}
                  onChange={handleInputChange}
                />
                <Button type="button" onClick={handleSendOTP} disabled={isSendingOTP} className="whitespace-nowrap">
                  {isSendingOTP ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send OTP"
                  )}
                </Button>
              </div>
            </div>

            {/* OTP Input - Always visible */}
            <div className="space-y-2">
              <label htmlFor="otp" className="text-sm font-medium flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-[#1B9D65]" />
                Verification Code
              </label>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <OTPInput length={4} value={otp} onChange={setOtp} />
                {otpSent && (
                  <p className="text-xs text-green-600 mt-2 text-center">
                    <Check className="w-3 h-3 inline mr-1" />
                    OTP sent to your email
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="phoneNumber" className="text-sm font-medium flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#1B9D65]" />
                Phone Number
              </label>
              <div className="flex gap-2">
                <select
                  className="h-12 bg-gray-50 rounded-lg border border-input px-3 w-24"
                  name="phoneCountryCode"
                  value={formData.phoneCountryCode}
                  onChange={handleInputChange}
                >
                  {countries.map((country) => (
                    <option key={country.code} value={country.dialCode}>
                      {country.flag} {country.dialCode}
                    </option>
                  ))}
                </select>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  placeholder="Phone Number"
                  required
                  className="h-12 bg-gray-50 flex-1"
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
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter Password"
                  required
                  className="h-12 bg-gray-50 pr-12"
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
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  required
                  className="h-12 bg-gray-50 pr-12"
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
              <Checkbox
                id="agreeToTerms"
                name="agreeToTerms"
                required
                checked={formData.agreeToTerms}
                onCheckedChange={(checked) => setFormData({ ...formData, agreeToTerms: checked as boolean })}
              />
              <label htmlFor="agreeToTerms" className="text-sm text-gray-600">
                Agree with{" "}
                <Link href="/terms" className="text-[#1B9D65] hover:underline">
                  terms & conditions
                </Link>
              </label>
            </div>

            <motion.button
              type="submit"
              disabled={isRegistering}
              className="w-full h-12 bg-[#1B9D65] text-white rounded-lg font-medium hover:bg-[#1B9D65]/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isRegistering ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Registering...
                </>
              ) : (
                <>
                  REGISTER
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </form>

          {/* Login Link */}
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link href="/login" className="text-[#1B9D65] font-medium hover:underline">
                LOGIN
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

