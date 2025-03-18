"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { FileText, CreditCard, QrCode, History, ArrowRight } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export default function ZeroPaperPayPage() {
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

  const transactions = [
    { id: 1, merchant: "Tesco", amount: "€45.20", date: "May 2, 2023", category: "Groceries" },
    { id: 2, merchant: "Apple Store", amount: "€129.99", date: "Apr 28, 2023", category: "Electronics" },
    { id: 3, merchant: "Starbucks", amount: "€4.75", date: "Apr 25, 2023", category: "Food & Drink" },
    { id: 4, merchant: "Amazon", amount: "€67.50", date: "Apr 20, 2023", category: "Shopping" },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <motion.header
        className="bg-[#1B9D65] text-white p-4 mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto">
          <motion.h1
            className="text-2xl font-bold"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Zero Paper Pay
          </motion.h1>
          <motion.p
            className="text-white/80"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Manage your digital payments and receipts
          </motion.p>
        </div>
      </motion.header>

      <motion.div
        className="p-6 max-w-7xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate={isLoaded ? "visible" : "hidden"}
      >
        <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8" variants={containerVariants}>
          <motion.div
            variants={itemVariants}
            className="md:col-span-2"
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Your Digital Wallet</CardTitle>
                <CardDescription>Manage your payment methods and digital receipts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-6">
                  <motion.div
                    className="bg-gradient-to-r from-[#1B9D65] to-[#23935D] rounded-xl p-6 text-white w-full md:w-72 h-44 relative overflow-hidden"
                    whileHover={{ scale: 1.02, rotate: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-10 -mb-10" />

                    <div className="flex flex-col h-full justify-between">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm text-white/80">Balance</p>
                          <h3 className="text-2xl font-bold">€1,250.00</h3>
                        </div>
                        <CreditCard className="w-6 h-6" />
                      </div>

                      <div>
                        <p className="text-sm text-white/80 mb-1">Zero Paper Pay</p>
                        <p className="font-medium">**** **** **** 4589</p>
                      </div>
                    </div>
                  </motion.div>

                  <div className="flex flex-col justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Quick Actions</h3>
                      <div className="grid grid-cols-2 gap-3">
                        <motion.button
                          className="flex flex-col items-center justify-center p-4 bg-gray-100 rounded-lg hover:bg-[#1B9D65]/10"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <QrCode className="w-6 h-6 text-[#1B9D65] mb-2" />
                          <span className="text-sm">Scan QR</span>
                        </motion.button>

                        <motion.button
                          className="flex flex-col items-center justify-center p-4 bg-gray-100 rounded-lg hover:bg-[#1B9D65]/10"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <FileText className="w-6 h-6 text-[#1B9D65] mb-2" />
                          <span className="text-sm">View Receipts</span>
                        </motion.button>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">Connected Accounts</h3>
                      <div className="flex gap-3">
                        <motion.div
                          className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center"
                          whileHover={{ scale: 1.1 }}
                        >
                          <Image src="/placeholder.svg?height=40&width=40" alt="Bank" width={24} height={24} />
                        </motion.div>

                        <motion.div
                          className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center"
                          whileHover={{ scale: 1.1 }}
                        >
                          <Image src="/placeholder.svg?height=40&width=40" alt="Card" width={24} height={24} />
                        </motion.div>

                        <motion.button
                          className="w-10 h-10 bg-[#1B9D65]/10 rounded-full flex items-center justify-center"
                          whileHover={{ scale: 1.1 }}
                        >
                          <ArrowRight className="w-5 h-5 text-[#1B9D65]" />
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transactions.slice(0, 3).map((transaction, index) => (
                    <motion.div
                      key={transaction.id}
                      className="flex items-start gap-3"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ x: 5 }}
                    >
                      <div className="bg-[#1B9D65]/10 p-2 rounded-full">
                        <History className="w-4 h-4 text-[#1B9D65]" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <p className="font-medium">{transaction.merchant}</p>
                          <p className="font-semibold">{transaction.amount}</p>
                        </div>
                        <div className="flex justify-between text-sm text-gray-500">
                          <span>{transaction.date}</span>
                          <span>{transaction.category}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <motion.button
                  className="w-full mt-4 text-[#1B9D65] text-sm font-medium flex items-center justify-center gap-1"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  View All Transactions
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        <Tabs defaultValue="receipts" className="mb-6">
          <TabsList className="mb-4 bg-[#1B9D65]/10">
            <TabsTrigger value="receipts" className="data-[state=active]:bg-[#1B9D65] data-[state=active]:text-white">
              Digital Receipts
            </TabsTrigger>
            <TabsTrigger value="payments" className="data-[state=active]:bg-[#1B9D65] data-[state=active]:text-white">
              Payment Methods
            </TabsTrigger>
            <TabsTrigger value="merchants" className="data-[state=active]:bg-[#1B9D65] data-[state=active]:text-white">
              Merchants
            </TabsTrigger>
          </TabsList>

          <TabsContent value="receipts">
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle>Digital Receipts</CardTitle>
                  <CardDescription>All your paperless receipts in one place</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-60 flex items-center justify-center">
                    <p className="text-gray-500">Your digital receipts will be displayed here</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="payments">
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle>Payment Methods</CardTitle>
                  <CardDescription>Manage your payment methods</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-60 flex items-center justify-center">
                    <p className="text-gray-500">Your payment methods will be displayed here</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="merchants">
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle>Connected Merchants</CardTitle>
                  <CardDescription>Merchants that support Zero Paper Pay</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-60 flex items-center justify-center">
                    <p className="text-gray-500">Connected merchants will be displayed here</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>

        <motion.div className="flex justify-center mt-8" variants={itemVariants}>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button className="bg-[#1B9D65] hover:bg-[#1B9D65]/90">Connect New Account</Button>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}

