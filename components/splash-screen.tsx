"use client"

import { motion } from "framer-motion"
import Image from "next/image"

export default function SplashScreen() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#1B9D65] overflow-hidden">
      <div className="relative w-full h-full">
        {/* Background pattern with faint icons */}
        <div className="absolute inset-0 opacity-10 bg-pattern"></div>

        {/* Logo and text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: 0.3,
            }}
            className="relative w-full max-w-sm mx-auto"
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
              className="w-full aspect-[3/1] relative"
            >
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Zero%20paper%20user2-05%201-2MhU8cy380KtTq1agohGg6DKTIqtzS.png"
                alt="Zero Paper Logo"
                fill
                className="object-contain"
                priority
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

