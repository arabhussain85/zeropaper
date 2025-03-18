"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Settings, Search, MoreVertical, Plus, MapPin } from "lucide-react"
import Image from "next/image"
import AddReceiptDialog from "@/components/add-receipt-dialog"

const categories = [
  {
    id: "business",
    name: "Business",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M20 7H16V5C16 3.9 15.1 3 14 3H10C8.9 3 8 3.9 8 5V7H4C2.9 7 2 7.9 2 9V20C2 21.1 2.9 22 4 22H20C21.1 22 22 21.1 22 20V9C22 7.9 21.1 7 20 7ZM10 5H14V7H10V5ZM20 20H4V9H20V20Z"
          fill="#23935D"
        />
      </svg>
    ),
  },
  {
    id: "personal",
    name: "Personal",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 6C13.1 6 14 6.9 14 8C14 9.1 13.1 10 12 10C10.9 10 10 9.1 10 8C10 6.9 10.9 6 12 6ZM12 13C9.33 13 4 14.34 4 17V20H20V17C20 14.34 14.67 13 12 13ZM18 18H6V17.01C6.2 16.29 9.3 15 12 15C14.7 15 17.8 16.29 18 17V18Z"
          fill="#23935D"
        />
      </svg>
    ),
  },
  {
    id: "medical",
    name: "Medical",
    icon: (
      <Image
        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/healthcare-m2Ut9vRStYr5aeL3QTbO4mSQTwwag3.png"
        alt="Medical"
        width={24}
        height={24}
      />
    ),
  },
  {
    id: "electrical",
    name: "Electrical",
    icon: (
      <Image
        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Group%201761-mxVDBkghKPyrZcjQBHq8t74R5zchzH.png"
        alt="Electrical"
        width={24}
        height={24}
      />
    ),
  },
  {
    id: "other",
    name: "Other",
    icon: (
      <svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M8.43746 1H2.81246C2.08873 1 1.5 1.58873 1.5 2.31246V5.68746C1.5 6.41132 2.08873 7.00005 2.81246 7.00005H8.43746C9.16133 7.00005 9.75006 6.41132 9.75006 5.68746V2.31246C9.75006 1.58873 9.16133 1 8.43746 1Z"
          fill="#23935D"
        />
        <path
          d="M8.43746 8.49994H2.81246C2.08873 8.49994 1.5 9.08867 1.5 9.81253V17.6875C1.5 18.4113 2.08873 19 2.81246 19H8.43746C9.16133 19 9.75006 18.4113 9.75006 17.6875V9.81253C9.75006 9.08867 9.16133 8.49994 8.43746 8.49994Z"
          fill="#23935D"
        />
        <path
          d="M18.1876 12.9999H12.5626C11.8387 12.9999 11.25 13.5887 11.25 14.3125V17.6875C11.25 18.4113 11.8387 19 12.5626 19H18.1876C18.9113 19 19.5001 18.4113 19.5001 17.6875V14.3125C19.5001 13.5887 18.9113 12.9999 18.1876 12.9999Z"
          fill="#23935D"
        />
        <path
          d="M18.1876 1H12.5626C11.8387 1 11.25 1.58873 11.25 2.31246V10.1875C11.25 10.9113 11.8387 11.5001 12.5626 11.5001H18.1876C18.9113 11.5001 19.5001 10.9113 19.5001 10.1875V2.31246C19.5001 1.58873 18.9113 1 18.1876 1Z"
          fill="#23935D"
        />
      </svg>
    ),
  },
]

const receipts = [
  {
    id: 1,
    store: "Medkart Pharmacy",
    product: "Paracetamol Tablets",
    date: "20 Feb, 2023",
    validUpto: "24 Feb, 2023",
    price: "€10",
    address: "123 Main Street ,Citytown, USA",
  },
  {
    id: 2,
    store: "Tesco Pharmacy",
    product: "Paracetamol Tablets",
    date: "20 Feb, 2023",
    validUpto: "24 Feb, 2023",
    price: "€10",
    address: "123 Main Street ,Citytown, USA",
  },
]

export default function DashboardPage() {
  const [isAddReceiptOpen, setIsAddReceiptOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState("business")
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoaded(true)
    }, 300)
    return () => clearTimeout(timer)
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <motion.header
        className="bg-[#1B9D65] text-white p-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <motion.div className="bg-white rounded-lg p-2" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <div className="w-8 h-8 relative">
                  <Image
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Zero%20paper%20user2-05%201-2MhU8cy380KtTq1agohGg6DKTIqtzS.png"
                    alt="Zero Paper Logo"
                    fill
                    className="object-contain brightness-0"
                  />
                </div>
              </motion.div>
              <div className="text-xl font-bold">
                <div>ZERO</div>
                <div>PAPER USER</div>
              </div>
            </div>
            <motion.button
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
              whileHover={{ scale: 1.1, rotate: 15 }}
              whileTap={{ scale: 0.9 }}
            >
              <Settings className="w-6 h-6" />
            </motion.button>
          </div>

          {/* Categories */}
          <motion.div
            className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {categories.map((category, index) => (
              <motion.button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  activeCategory === category.id ? "bg-black text-white" : "bg-white text-gray-900"
                }`}
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
              >
                <span>{category.icon}</span>
                <span>{category.name}</span>
              </motion.button>
            ))}
          </motion.div>
        </div>
      </motion.header>

      {/* Main Content */}
      <motion.main
        className="max-w-7xl mx-auto px-4 py-6"
        variants={containerVariants}
        initial="hidden"
        animate={isLoaded ? "visible" : "hidden"}
      >
        {/* Search */}
        <motion.div className="relative mb-6" variants={itemVariants}>
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search"
            className="w-full h-12 pl-12 pr-4 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1B9D65]"
          />
        </motion.div>

        {/* Summary */}
        <motion.div className="flex justify-between items-center mb-6" variants={itemVariants}>
          <h2 className="text-xl font-semibold">34 Receipts</h2>
          <p className="text-xl font-semibold">Total €10</p>
        </motion.div>

        {/* Receipts */}
        <motion.div className="space-y-4" variants={containerVariants}>
          {receipts.map((receipt, index) => (
            <motion.div
              key={receipt.id}
              variants={itemVariants}
              className="bg-white rounded-xl p-4 shadow-sm"
              whileHover={{ scale: 1.01, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <motion.div
                    className="w-10 h-10 bg-[#1B9D65]/10 rounded-lg flex items-center justify-center"
                    whileHover={{ scale: 1.1, backgroundColor: "rgba(27, 157, 101, 0.2)" }}
                  >
                    🏪
                  </motion.div>
                  <h3 className="font-semibold">{receipt.store}</h3>
                </div>
                <motion.button
                  className="p-1 hover:bg-gray-100 rounded-full"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <MoreVertical className="w-5 h-5 text-gray-500" />
                </motion.button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Product Name</p>
                  <p className="font-semibold">{receipt.product}</p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Receipt Date</p>
                    <p>{receipt.date}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Valid Upto</p>
                    <p>{receipt.validUpto}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Price</p>
                    <p className="font-semibold">{receipt.price}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-gray-500">
                  <MapPin className="w-4 h-4" />
                  <p className="text-sm">{receipt.address}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Add Button */}
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 300, damping: 15 }}
          whileHover={{ scale: 1.1, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsAddReceiptOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-[#1B9D65] text-white rounded-full flex items-center justify-center shadow-lg"
        >
          <Plus className="w-6 h-6" />
        </motion.button>

        <AddReceiptDialog isOpen={isAddReceiptOpen} onClose={() => setIsAddReceiptOpen(false)} />
      </motion.main>
    </div>
  )
}

