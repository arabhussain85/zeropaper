"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"

export default function AuthScreen() {
  return (
    <div className="min-h-screen bg-[#1B9D65] relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10 bg-pattern"></div>

      <div className="relative w-full max-w-md mx-auto flex flex-col items-center min-h-screen px-8">
        {/* Logo Section */}
        <div className="w-full pt-16 mb-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex items-center justify-center gap-3">
              <div className="bg-white rounded-lg p-2">
                <div className="w-10 h-10 relative">
                  <Image
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Zero%20paper%20user2-05%201-2MhU8cy380KtTq1agohGg6DKTIqtzS.png"
                    alt="Zero Paper Logo"
                    fill
                    className="object-contain brightness-0"
                  />
                </div>
              </div>
              <div className="text-white text-xl font-bold">
                <div>ZERO</div>
                <div>PAPER USER</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Welcome Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-center text-white mb-8"
        >
          <h1 className="text-2xl font-bold mb-2">Welcome to ZERO Paper User</h1>
          <p className="text-white/90">Payments have gone digital, Now its time for the receipts</p>
        </motion.div>

        {/* Buttons Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="w-full space-y-3 mb-auto"
        >
          <button className="w-full py-3.5 bg-black text-white rounded-lg font-medium hover:bg-black/90 transition-colors">
            LOGIN
          </button>
          <button className="w-full py-3.5 bg-[#1B9D65] text-white rounded-lg font-medium border-2 border-white hover:bg-white/10 transition-colors">
            REGISTER
          </button>
        </motion.div>

        {/* Terms of Service */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="pb-8"
        >
          <Link href="/terms" className="text-white/90 hover:text-white text-sm transition-colors">
            Terms of Services
          </Link>
        </motion.div>
      </div>
    </div>
  )
}

