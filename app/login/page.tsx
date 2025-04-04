"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Eye, EyeOff, ArrowRight, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { loginUser } from "@/services/api-wrapper"
import { setAuthToken } from "@/utils/auth-helpers"
import VersionDisplay from "@/components/version-display"

// Add a full-screen loader component at the top of the file, after the imports
const FullScreenLoader = () => (
  <div className="fixed inset-0 bg-[#1B9D65]/90 flex flex-col items-center justify-center z-50">
    <div className="w-24 h-24 relative mb-8">
      <Image
        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Zero%20paper%20user2-05%201-2MhU8cy380KtTq1agohGg6DKTIqtzS.png"
        alt="Zero Paper Logo"
        fill
        className="object-contain animate-pulse"
      />
    </div>
    <div className="w-48 h-1 bg-white/30 rounded-full overflow-hidden">
      <div className="h-full bg-white animate-[loader_1.5s_ease-in-out_infinite]" />
    </div>
    <p className="mt-6 text-lg font-medium text-white">Logging in...</p>
    <style jsx global>{`
      @keyframes loader {
        0% { width: 0%; margin-left: 0; }
        50% { width: 100%; margin-left: 0; }
        100% { width: 0%; margin-left: 100%; }
      }
    `}</style>
  </div>
)

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string | null>(null)
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

  // Ensure the loader appears immediately when login is attempted
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setDebugInfo(null)
    setIsLoading(true)
    document.body.style.overflow = "hidden" // Prevent scrolling while loading

    try {
      setDebugInfo("Attempting login...")

      const result = await loginUser({ email, password })
      console.log("Login result:", result) // Debug the response

      if (result.success) {
        // Use the auth helper to store token and user data
        if (result.token) {
          // Remember me is hardcoded to true for now - could be added as a checkbox option later
          const rememberMe = true
          const loginData = {
            refreshToken: result.refreshToken,
            user: result.user,
          }

          // Use the auth helper to set tokens and user data
          const tokenSet = setAuthToken(result.token, rememberMe, loginData)

          if (tokenSet) {
            setDebugInfo(`Login successful. Token received and stored. Validating token before redirect...`)

            // Validate the token is properly stored and valid
            const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
            if (token) {
              toast({
                title: "Success!",
                description: "You have successfully logged in.",
              })

              // Use a direct window location change for more reliable redirection
              setTimeout(() => {
                window.location.href = "/dashboard"
              }, 1000)
            } else {
              // If token is missing after setting, show error
              setError("Authentication failed. Token could not be stored.")
            }
          } else {
            setError("Failed to store authentication token.")
          }
        } else {
          setDebugInfo(`Login successful but no token received. This is unusual.`)
          setError("No authentication token received from server.")
        }
      } else {
        setError(result.message || "Login failed. Please check your credentials.")
        setDebugInfo("Login failed: " + result.message)
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
      // Only hide the loader on error, not on success
      // This ensures the loader stays visible during redirect
      if (error) {
        setIsLoading(false)
        document.body.style.overflow = ""
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#1B9D65] flex items-center justify-center p-4">
      {isLoading && <FullScreenLoader />}
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

          {/* Debug Info */}
          {debugInfo && (
            <Alert className="mb-6 bg-blue-50 text-blue-800 border-blue-200">
              <AlertDescription className="font-mono text-xs">{debugInfo}</AlertDescription>
            </Alert>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email ID
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Email ID"
                required
                className="h-12 bg-gray-50"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (error) setError(null)
                }}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <Link href="/forgot-password" className="text-[#1B9D65] text-sm hover:underline">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter Password"
                  required
                  className="h-12 bg-gray-50 pr-12"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (error) setError(null)
                  }}
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

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-[#1B9D65] text-white rounded-lg font-medium hover:bg-[#1B9D65]/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              LOGIN
              <ArrowRight className="w-4 h-4" />
            </Button>
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
          <VersionDisplay />
        </motion.div>
      </div>
    </div>
  )
}

