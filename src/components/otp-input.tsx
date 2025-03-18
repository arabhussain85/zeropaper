"use client"

import type React from "react"
import { useRef, useEffect, type KeyboardEvent, type ClipboardEvent } from "react"
import { motion } from "framer-motion"

interface OTPInputProps {
  length?: number
  value: string[]
  onChange: (otp: string[]) => void
  disabled?: boolean
  autoFocus?: boolean
}

const OTPInput: React.FC<OTPInputProps> = ({ length = 4, value, onChange, disabled = false, autoFocus = true }) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Initialize refs array
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length)
  }, [length])

  // Auto focus on first input when component mounts
  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }, [autoFocus])

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value

    // Only accept single digit
    if (newValue.length > 1) {
      const digits = newValue.split("")

      // Update current and potentially next inputs
      const newOtp = [...value]

      // Fill as many inputs as we have digits (up to remaining inputs)
      for (let i = 0; i < Math.min(digits.length, length - index); i++) {
        newOtp[index + i] = digits[i]
      }

      onChange(newOtp)

      // Focus on the input after the last filled one
      const nextIndex = Math.min(index + digits.length, length - 1)
      if (inputRefs.current[nextIndex]) {
        inputRefs.current[nextIndex].focus()
      }

      return
    }

    // Handle normal single digit input
    const newOtp = [...value]
    newOtp[index] = newValue
    onChange(newOtp)

    // Auto-focus next input if we entered a digit
    if (newValue && index < length - 1 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus()
    }
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === "Backspace") {
      if (!value[index] && index > 0 && inputRefs.current[index - 1]) {
        // If current input is empty and backspace is pressed, focus previous input
        inputRefs.current[index - 1].focus()
      }
    }

    // Handle left arrow key
    if (e.key === "ArrowLeft" && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1].focus()
    }

    // Handle right arrow key
    if (e.key === "ArrowRight" && index < length - 1 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus()
    }
  }

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text/plain").trim()

    // Check if pasted content is all digits
    if (!/^\d+$/.test(pastedData)) return

    const digits = pastedData.split("").slice(0, length)
    const newOtp = [...value]

    digits.forEach((digit, idx) => {
      if (idx < length) {
        newOtp[idx] = digit
      }
    })

    onChange(newOtp)

    // Focus on the input after the last pasted digit
    const focusIndex = Math.min(digits.length, length - 1)
    if (inputRefs.current[focusIndex]) {
      inputRefs.current[focusIndex].focus()
    }
  }

  return (
    <div className="flex justify-center gap-3">
      {Array.from({ length }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: index * 0.1 }}
        >
          <input
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={value[index] || ""}
            onChange={(e) => handleChange(index, e)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={index === 0 ? handlePaste : undefined}
            disabled={disabled}
            className="h-14 w-14 text-center text-xl font-bold bg-gray-50 focus:ring-2 focus:ring-[#1B9D65] border border-gray-300 rounded-md"
            aria-label={`OTP digit ${index + 1}`}
          />
        </motion.div>
      ))}
    </div>
  )
}

export default OTPInput

