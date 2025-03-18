"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, MoreVertical, Plus, MapPin, Filter } from "lucide-react"
import AddReceiptDialog from "@/components/add-receipt-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const receipts = [
  {
    id: 1,
    store: "Medkart Pharmacy",
    product: "Paracetamol Tablets",
    date: "20 Feb, 2023",
    validUpto: "24 Feb, 2023",
    price: "€10",
    address: "123 Main Street, Citytown, USA",
    category: "Medical",
  },
  {
    id: 2,
    store: "Tesco Pharmacy",
    product: "Paracetamol Tablets",
    date: "20 Feb, 2023",
    validUpto: "24 Feb, 2023",
    price: "€10",
    address: "123 Main Street, Citytown, USA",
    category: "Medical",
  },
  {
    id: 3,
    store: "Apple Store",
    product: "iPhone Charger",
    date: "15 Feb, 2023",
    validUpto: "15 Feb, 2024",
    price: "€25",
    address: "456 Tech Avenue, Digital City, USA",
    category: "Electrical",
  },
  {
    id: 4,
    store: "Office Supplies Inc",
    product: "Printer Paper",
    date: "10 Feb, 2023",
    validUpto: "N/A",
    price: "€8",
    address: "789 Business Blvd, Corporate Town, USA",
    category: "Business",
  },
  {
    id: 5,
    store: "Grocery Mart",
    product: "Weekly Groceries",
    date: "5 Feb, 2023",
    validUpto: "N/A",
    price: "€45",
    address: "321 Food Street, Eatville, USA",
    category: "Personal",
  },
]

export default function ReceiptsPage() {
  const [isAddReceiptOpen, setIsAddReceiptOpen] = useState(false)
  const [filter, setFilter] = useState("all")
  const [sortBy, setSortBy] = useState("date")
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoaded(true)
    }, 300)
    return () => clearTimeout(timer)
  }, [])

  const filteredReceipts = receipts
    .filter((receipt) => filter === "all" || receipt.category.toLowerCase() === filter.toLowerCase())
    .sort((a, b) => {
      if (sortBy === "date") {
        return new Date(b.date).getTime() - new Date(a.date).getTime()
      } else if (sortBy === "price") {
        return Number.parseInt(b.price.replace("€", "")) - Number.parseInt(a.price.replace("€", ""))
      }
      return 0
    })

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
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto">
          <motion.h1
            className="text-2xl font-bold mb-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Receipts
          </motion.h1>
          <motion.p
            className="text-white/80 mb-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            View and manage all your receipts
          </motion.p>
        </div>
      </motion.header>

      {/* Main Content */}
      <motion.main
        className="max-w-7xl mx-auto px-4 py-6"
        variants={containerVariants}
        initial="hidden"
        animate={isLoaded ? "visible" : "hidden"}
      >
        {/* Search and Filters */}
        <motion.div className="flex flex-col md:flex-row gap-4 mb-6" variants={itemVariants}>
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search receipts"
              className="w-full h-12 pl-12 pr-4 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1B9D65]"
            />
          </div>

          <div className="flex gap-2">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[150px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="personal">Personal</SelectItem>
                <SelectItem value="medical">Medical</SelectItem>
                <SelectItem value="electrical">Electrical</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date (Newest)</SelectItem>
                <SelectItem value="price">Price (Highest)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* Summary */}
        <motion.div className="flex justify-between items-center mb-6" variants={itemVariants}>
          <h2 className="text-xl font-semibold">{filteredReceipts.length} Receipts</h2>
          <p className="text-xl font-semibold">
            Total: €
            {filteredReceipts.reduce((sum, receipt) => sum + Number.parseInt(receipt.price.replace("€", "")), 0)}
          </p>
        </motion.div>

        {/* Receipts List */}
        <motion.div className="space-y-4" variants={containerVariants}>
          <AnimatePresence>
            {filteredReceipts.map((receipt, index) => (
              <motion.div
                key={receipt.id}
                variants={itemVariants}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl p-4 shadow-sm"
                whileHover={{ scale: 1.01, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <motion.div
                      className="w-10 h-10 bg-[#1B9D65]/10 rounded-lg flex items-center justify-center"
                      whileHover={{ scale: 1.1, backgroundColor: "rgba(27, 157, 101, 0.2)" }}
                    >
                      {receipt.category === "Medical"
                        ? "💊"
                        : receipt.category === "Electrical"
                          ? "🔌"
                          : receipt.category === "Business"
                            ? "💼"
                            : "🛒"}
                    </motion.div>
                    <div>
                      <h3 className="font-semibold">{receipt.store}</h3>
                      <p className="text-sm text-gray-500">{receipt.category}</p>
                    </div>
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
          </AnimatePresence>
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

