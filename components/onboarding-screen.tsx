"use client"

import Image from "next/image"
import { ChevronRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface OnboardingScreenProps {
  image: string
  title: string
  description: string
  currentStep: number
  totalSteps: number
  onNext: () => void
}

export default function OnboardingScreen({
  image,
  title,
  description,
  currentStep,
  totalSteps,
  onNext,
}: OnboardingScreenProps) {
  return (
    <div className="h-screen flex items-center justify-center bg-white overflow-hidden">
      <div className="w-full max-w-4xl mx-auto h-full flex flex-col items-center justify-center px-4 py-8 relative">
        {/* Image */}
        <div className="flex-1 flex items-center justify-center w-full max-h-[50vh]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
              }}
              className="relative w-full max-w-md h-full"
            >
              <motion.div
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 4,
                  ease: "easeInOut",
                  repeat: Number.POSITIVE_INFINITY,
                }}
                className="w-full h-full relative"
              >
                <Image src={image || "/placeholder.svg"} alt={title} fill className="object-contain drop-shadow-xl" />
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Text content */}
        <div className="w-full px-4 sm:px-8 mt-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={`text-${currentStep}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-center mb-8"
            >
              <h2 className="text-2xl md:text-3xl font-bold mb-4">{title}</h2>
              <p className="text-gray-600 text-base md:text-lg max-w-md mx-auto">{description}</p>
            </motion.div>
          </AnimatePresence>

          {/* Progress dots */}
          <div className="flex justify-center gap-2 mb-8">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <motion.div
                key={index}
                className={`h-2 rounded-full ${index === currentStep ? "bg-[#1B9D65] w-8" : "bg-gray-200 w-2"}`}
                initial={false}
                animate={{
                  width: index === currentStep ? 32 : 8,
                  backgroundColor: index === currentStep ? "#1B9D65" : "#e5e7eb",
                }}
                transition={{ duration: 0.3 }}
              />
            ))}
          </div>

          {/* Next button - Larger and more prominent */}
          <div className="flex justify-center">
            <motion.button
              onClick={onNext}
              className="w-16 h-16 bg-[#1B9D65] rounded-full flex items-center justify-center shadow-lg hover:bg-[#1B9D65]/90 hover:scale-105 active:scale-95 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[#1B9D65]/50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Next"
            >
              <ChevronRight className="text-white w-8 h-8" />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  )
}

