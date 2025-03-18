"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Zap, Lightbulb, BarChart, Clock, Calendar } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"

export default function ElectricityPage() {
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
            Electricity Management
          </motion.h1>
          <motion.p
            className="text-white/80"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Monitor and manage your electricity usage
          </motion.p>
        </div>
      </motion.header>

      <motion.div
        className="p-6 max-w-7xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate={isLoaded ? "visible" : "hidden"}
      >
        <Tabs defaultValue="overview" className="mb-6">
          <TabsList className="mb-4 bg-[#1B9D65]/10">
            <TabsTrigger value="overview" className="data-[state=active]:bg-[#1B9D65] data-[state=active]:text-white">
              Overview
            </TabsTrigger>
            <TabsTrigger value="usage" className="data-[state=active]:bg-[#1B9D65] data-[state=active]:text-white">
              Usage History
            </TabsTrigger>
            <TabsTrigger value="bills" className="data-[state=active]:bg-[#1B9D65] data-[state=active]:text-white">
              Bills
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
              variants={containerVariants}
            >
              <motion.div
                variants={itemVariants}
                whileHover={{ scale: 1.03, y: -5 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Current Usage</p>
                        <h3 className="text-2xl font-bold mt-1">245 kWh</h3>
                        <p className="text-sm text-green-600 mt-1">12% less than last month</p>
                      </div>
                      <motion.div
                        className="bg-[#1B9D65]/10 p-3 rounded-full"
                        whileHover={{ scale: 1.1, backgroundColor: "rgba(27, 157, 101, 0.2)" }}
                      >
                        <Zap className="w-5 h-5 text-[#1B9D65]" />
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                variants={itemVariants}
                whileHover={{ scale: 1.03, y: -5 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Current Bill</p>
                        <h3 className="text-2xl font-bold mt-1">€78.50</h3>
                        <p className="text-sm text-gray-500 mt-1">Due in 15 days</p>
                      </div>
                      <motion.div
                        className="bg-[#1B9D65]/10 p-3 rounded-full"
                        whileHover={{ scale: 1.1, backgroundColor: "rgba(27, 157, 101, 0.2)" }}
                      >
                        <BarChart className="w-5 h-5 text-[#1B9D65]" />
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                variants={itemVariants}
                whileHover={{ scale: 1.03, y: -5 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Active Devices</p>
                        <h3 className="text-2xl font-bold mt-1">8 Devices</h3>
                        <p className="text-sm text-gray-500 mt-1">3 high consumption</p>
                      </div>
                      <motion.div
                        className="bg-[#1B9D65]/10 p-3 rounded-full"
                        whileHover={{ scale: 1.1, backgroundColor: "rgba(27, 157, 101, 0.2)" }}
                      >
                        <Lightbulb className="w-5 h-5 text-[#1B9D65]" />
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                variants={itemVariants}
                whileHover={{ scale: 1.03, y: -5 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Next Reading</p>
                        <h3 className="text-2xl font-bold mt-1">May 15</h3>
                        <p className="text-sm text-gray-500 mt-1">In 12 days</p>
                      </div>
                      <motion.div
                        className="bg-[#1B9D65]/10 p-3 rounded-full"
                        whileHover={{ scale: 1.1, backgroundColor: "rgba(27, 157, 101, 0.2)" }}
                      >
                        <Calendar className="w-5 h-5 text-[#1B9D65]" />
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Energy Saving Tips</CardTitle>
                  <CardDescription>Ways to reduce your electricity consumption</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <div className="bg-[#1B9D65]/10 p-2 rounded-full mt-1">
                        <Lightbulb className="w-4 h-4 text-[#1B9D65]" />
                      </div>
                      <div>
                        <p className="font-medium">Switch to LED bulbs</p>
                        <p className="text-sm text-gray-500">
                          LED bulbs use up to 90% less energy than incandescent bulbs.
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="bg-[#1B9D65]/10 p-2 rounded-full mt-1">
                        <Clock className="w-4 h-4 text-[#1B9D65]" />
                      </div>
                      <div>
                        <p className="font-medium">Use timers for appliances</p>
                        <p className="text-sm text-gray-500">Set timers to turn off appliances when not in use.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="bg-[#1B9D65]/10 p-2 rounded-full mt-1">
                        <Zap className="w-4 h-4 text-[#1B9D65]" />
                      </div>
                      <div>
                        <p className="font-medium">Unplug idle electronics</p>
                        <p className="text-sm text-gray-500">
                          Even when turned off, many electronics use standby power.
                        </p>
                      </div>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="usage">
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle>Usage History</CardTitle>
                  <CardDescription>Your electricity consumption over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80 flex items-center justify-center">
                    <p className="text-gray-500">Usage history chart will be displayed here</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="bills">
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle>Billing History</CardTitle>
                  <CardDescription>Your electricity bills and payment history</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80 flex items-center justify-center">
                    <p className="text-gray-500">Billing history will be displayed here</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>

        <motion.div className="flex justify-center mt-8" variants={itemVariants}>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button className="bg-[#1B9D65] hover:bg-[#1B9D65]/90">Connect Smart Meter</Button>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}

