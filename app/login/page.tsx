"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Eye, EyeOff, ArrowRight, Loader2, AlertCircle } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { loginUser } from "@/services/api-wrapper"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const { toast } = useToast()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
    // Clear error when user starts typing again
    if (error) setError(null)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validate form
    if (!formData.email || !formData.password) {
      setError("Please enter both email and password.")
      return
    }

    setIsLoggingIn(true)

    try {
      // Login the user
      const result = await loginUser({
        email: formData.email,
        password: formData.password,
      })

      if (result.success) {
        toast({
          title: "Login Successful!",
          description: "Welcome back! Redirecting to dashboard...",
        })

        // Store the token in both localStorage and sessionStorage
        if (result.token) {
          localStorage.setItem("authToken", result.token)
          sessionStorage.setItem("authToken", result.token)

          console.log("Token stored successfully:", result.token.substring(0, 10) + "...")
        } else {
          console.warn("No token received from login API")
        }

        console.log("Login successful, redirecting to dashboard...")

        // Use direct window location change for more reliable redirection
        window.location.href = "/dashboard"
      } else {
        setError(result.message || "Invalid email or password.")
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError("An unexpected error occurred. Please try again.")
      }
    } finally {
      setIsLoggingIn(false)
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
            <h1 className="text-2xl font-bold mb-1">Welcome Back!</h1>
            <p className="text-gray-600">Login to your account</p>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email ID
              </label>
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
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <Link href="/forgot-password" className="text-sm text-[#1B9D65] hover:underline">
                  Forgot Password?
                </Link>
              </div>
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

            <motion.button
              type="submit"
              disabled={isLoggingIn}
              className="w-full h-12 bg-[#1B9D65] text-white rounded-lg font-medium hover:bg-[#1B9D65]/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                <>
                  LOGIN
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Don't have an account?{" "}
              <Link href="/signup" className="text-[#1B9D65] font-medium hover:underline">
                SIGN UP
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

