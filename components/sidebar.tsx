"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Receipt, BarChart2, Settings, Menu, X, LogOut } from "lucide-react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  // Close sidebar when route changes on mobile
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Analytics",
      href: "/analytics",
      icon: BarChart2,
    },
    {
      name: "Receipts",
      href: "/receipts",
      icon: Receipt,
    },
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
    },
  ]

  const sidebarVariants = {
    open: { x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
    closed: { x: "-100%", transition: { type: "spring", stiffness: 300, damping: 30 } },
  }

  const menuItemVariants = {
    open: {
      y: 0,
      opacity: 1,
      transition: {
        y: { stiffness: 1000, velocity: -100 },
      },
    },
    closed: {
      y: 20,
      opacity: 0,
      transition: {
        y: { stiffness: 1000 },
      },
    },
  }

  const menuIconVariants = {
    open: { rotate: 0 },
    closed: { rotate: 180 },
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <motion.div
        className="fixed top-4 left-4 z-50 lg:hidden"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 bg-white rounded-lg shadow-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          animate={isOpen ? "open" : "closed"}
          variants={menuIconVariants}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </motion.button>
      </motion.div>

      {/* Sidebar */}
      <AnimatePresence>
        <motion.div
          className="fixed inset-y-0 left-0 z-40 w-64 bg-white border-r shadow-lg lg:translate-x-0"
          initial={false}
          animate={isOpen ? "open" : "closed"}
          variants={sidebarVariants}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {/* Logo */}
          <motion.div
            className="p-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Link href="/dashboard" className="flex items-center gap-3">
              <motion.div
                className="bg-[#1B9D65] rounded-lg p-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="w-8 h-8 relative">
                  <Image
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Zero%20paper%20user2-05%201-2MhU8cy380KtTq1agohGg6DKTIqtzS.png"
                    alt="Zero Paper Logo"
                    fill
                    className="object-contain"
                  />
                </div>
              </motion.div>
              <div className="text-xl font-bold">
                <div>ZERO</div>
                <div>PAPER USER</div>
              </div>
            </Link>
          </motion.div>

          {/* Navigation */}
          <nav className="px-3 py-4">
            <ul className="space-y-1">
              {navigation.map((item, i) => {
                const isActive = pathname === item.href
                return (
                  <motion.li
                    key={item.name}
                    variants={menuItemVariants}
                    custom={i}
                    initial="closed"
                    animate="open"
                    transition={{ delay: 0.1 * i }}
                  >
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive ? "bg-[#1B9D65] text-white" : "hover:bg-gray-100"
                      }`}
                    >
                      <motion.div
                        initial={{ scale: 1 }}
                        animate={{ scale: isActive ? 1.1 : 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 10 }}
                      >
                        <item.icon className="w-5 h-5" />
                      </motion.div>
                      <span>{item.name}</span>
                      {isActive && (
                        <motion.div
                          className="absolute right-3 w-1.5 h-1.5 rounded-full bg-white"
                          layoutId="activeIndicator"
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        />
                      )}
                    </Link>
                  </motion.li>
                )
              })}
            </ul>
          </nav>

          {/* Logout Button */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <motion.button
              className="flex items-center gap-3 px-4 py-3 w-full text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </motion.button>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            onClick={() => setIsOpen(false)}
            className="lg:hidden fixed inset-0 z-30 bg-black/20 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </AnimatePresence>
    </>
  )
}

