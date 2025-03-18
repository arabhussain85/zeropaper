"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowUpRight, TrendingUp, Receipt, Euro, CreditCard, Calendar } from "lucide-react"

// Update the colors to use the app's green theme
const chartColors = {
  primary: "#1B9D65",
  secondary: "#23935D",
  accent: "#34D399",
  muted: "#E5E7EB",
}

const monthlyData = [
  { name: "Jan", business: 4000, medical: 2400, personal: 2400 },
  { name: "Feb", business: 3000, medical: 1398, personal: 2210 },
  { name: "Mar", business: 2000, medical: 9800, personal: 2290 },
  { name: "Apr", business: 2780, medical: 3908, personal: 2000 },
  { name: "May", business: 1890, medical: 4800, personal: 2181 },
  { name: "Jun", business: 2390, medical: 3800, personal: 2500 },
]

const categoryData = [
  { name: "Business", value: 400, color: "#0088FE" },
  { name: "Medical", value: 300, color: "#00C49F" },
  { name: "Personal", value: 300, color: "#FFBB28" },
  { name: "Electrical", value: 200, color: "#FF8042" },
]

const trendData = [
  { name: "Week 1", amount: 400 },
  { name: "Week 2", amount: 300 },
  { name: "Week 3", amount: 600 },
  { name: "Week 4", amount: 800 },
]

// Summary data
const summaryData = {
  totalReceipts: 34,
  totalValue: "€2,100",
  averageValue: "€61.76",
  businessReceipts: 15,
  medicalReceipts: 8,
  personalReceipts: 7,
  electricalReceipts: 4,
  businessValue: "€950",
  medicalValue: "€480",
  personalValue: "€420",
  electricalValue: "€250",
  monthlyGrowth: "+12%",
  mostExpensiveMonth: "March",
}

export default function AnalyticsPage() {
  const [timeframe, setTimeframe] = useState("monthly")
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
            Analytics Overview
          </motion.h1>
          <motion.p
            className="text-white/80"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Track and analyze your receipt data
          </motion.p>
        </div>
      </motion.header>
      <motion.div
        className="p-6 max-w-7xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate={isLoaded ? "visible" : "hidden"}
      >
        <motion.div className="flex justify-end mb-6" variants={itemVariants}>
          <Select value={timeframe} onValueChange={(value) => setTimeframe(value)}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        {/* Summary Cards */}
        <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6" variants={containerVariants}>
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.03, y: -5 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Receipts</p>
                    <h3 className="text-2xl font-bold mt-1">{summaryData.totalReceipts}</h3>
                    <p className="text-sm text-green-600 flex items-center mt-1">
                      <ArrowUpRight className="w-3 h-3 mr-1" />
                      {summaryData.monthlyGrowth} from last month
                    </p>
                  </div>
                  <motion.div
                    className="bg-[#1B9D65]/10 p-3 rounded-full"
                    whileHover={{ scale: 1.1, backgroundColor: "rgba(27, 157, 101, 0.2)" }}
                  >
                    <Receipt className="w-5 h-5 text-[#1B9D65]" />
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
                    <p className="text-sm font-medium text-gray-500">Total Value</p>
                    <h3 className="text-2xl font-bold mt-1">{summaryData.totalValue}</h3>
                    <p className="text-sm text-gray-500 mt-1">Avg: {summaryData.averageValue}</p>
                  </div>
                  <motion.div
                    className="bg-[#1B9D65]/10 p-3 rounded-full"
                    whileHover={{ scale: 1.1, backgroundColor: "rgba(27, 157, 101, 0.2)" }}
                  >
                    <Euro className="w-5 h-5 text-[#1B9D65]" />
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
                    <p className="text-sm font-medium text-gray-500">Business Receipts</p>
                    <h3 className="text-2xl font-bold mt-1">{summaryData.businessReceipts}</h3>
                    <p className="text-sm text-gray-500 mt-1">Value: {summaryData.businessValue}</p>
                  </div>
                  <motion.div
                    className="bg-[#1B9D65]/10 p-3 rounded-full"
                    whileHover={{ scale: 1.1, backgroundColor: "rgba(27, 157, 101, 0.2)" }}
                  >
                    <CreditCard className="w-5 h-5 text-[#1B9D65]" />
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
                    <p className="text-sm font-medium text-gray-500">Medical Receipts</p>
                    <h3 className="text-2xl font-bold mt-1">{summaryData.medicalReceipts}</h3>
                    <p className="text-sm text-gray-500 mt-1">Value: {summaryData.medicalValue}</p>
                  </div>
                  <motion.div
                    className="bg-[#1B9D65]/10 p-3 rounded-full"
                    whileHover={{ scale: 1.1, backgroundColor: "rgba(27, 157, 101, 0.2)" }}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="text-[#1B9D65]"
                    >
                      <path
                        d="M12 2L4 6V12C4 15.31 7.58 20 12 20C16.42 20 20 15.31 20 12V6L12 2ZM18 12C18 14.61 15.03 18 12 18C8.97 18 6 14.61 6 12V7.17L12 4.17L18 7.17V12ZM11 7H13V11H17V13H13V17H11V13H7V11H11V7Z"
                        fill="currentColor"
                      />
                    </svg>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Tabs defaultValue="charts" className="mb-6">
            <TabsList className="mb-4 bg-[#1B9D65]/10">
              <TabsTrigger value="charts" className="data-[state=active]:bg-[#1B9D65] data-[state=active]:text-white">
                Charts
              </TabsTrigger>
              <TabsTrigger
                value="breakdown"
                className="data-[state=active]:bg-[#1B9D65] data-[state=active]:text-white"
              >
                Detailed Breakdown
              </TabsTrigger>
            </TabsList>

            <TabsContent value="charts">
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {/* Spending by Category */}
                <motion.div
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Spending by Category</CardTitle>
                      <CardDescription>Monthly breakdown of spending across categories</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={monthlyData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="business" fill={chartColors.primary} />
                            <Bar dataKey="medical" fill={chartColors.secondary} />
                            <Bar dataKey="personal" fill={chartColors.accent} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Category Distribution */}
                <motion.div
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Category Distribution</CardTitle>
                      <CardDescription>Percentage breakdown by receipt category</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={categoryData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {categoryData.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={
                                    index === 0
                                      ? chartColors.primary
                                      : index === 1
                                        ? chartColors.secondary
                                        : index === 2
                                          ? chartColors.accent
                                          : "#FF8042"
                                  }
                                />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Spending Trends */}
                <motion.div
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Spending Trends</CardTitle>
                      <CardDescription>Weekly spending patterns over time</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={trendData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="amount" stroke={chartColors.primary} strokeWidth={2} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Receipt Volume */}
                <motion.div
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Receipt Volume</CardTitle>
                      <CardDescription>Number of receipts collected over time</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={monthlyData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Area
                              type="monotone"
                              dataKey="business"
                              stackId="1"
                              stroke={chartColors.primary}
                              fill={chartColors.primary}
                            />
                            <Area
                              type="monotone"
                              dataKey="medical"
                              stackId="1"
                              stroke={chartColors.secondary}
                              fill={chartColors.secondary}
                            />
                            <Area
                              type="monotone"
                              dataKey="personal"
                              stackId="1"
                              stroke={chartColors.accent}
                              fill={chartColors.accent}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            </TabsContent>

            <TabsContent value="breakdown">
              <motion.div
                className="grid grid-cols-1 gap-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <motion.div
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Detailed Category Breakdown</CardTitle>
                      <CardDescription>Complete analysis of your receipts by category</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-3 px-4">Category</th>
                              <th className="text-left py-3 px-4">Receipts</th>
                              <th className="text-left py-3 px-4">Total Value</th>
                              <th className="text-left py-3 px-4">Average Value</th>
                              <th className="text-left py-3 px-4">% of Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b">
                              <td className="py-3 px-4">Business</td>
                              <td className="py-3 px-4">{summaryData.businessReceipts}</td>
                              <td className="py-3 px-4">{summaryData.businessValue}</td>
                              <td className="py-3 px-4">€63.33</td>
                              <td className="py-3 px-4">45.2%</td>
                            </tr>
                            <tr className="border-b">
                              <td className="py-3 px-4">Medical</td>
                              <td className="py-3 px-4">{summaryData.medicalReceipts}</td>
                              <td className="py-3 px-4">{summaryData.medicalValue}</td>
                              <td className="py-3 px-4">€60.00</td>
                              <td className="py-3 px-4">22.9%</td>
                            </tr>
                            <tr className="border-b">
                              <td className="py-3 px-4">Personal</td>
                              <td className="py-3 px-4">{summaryData.personalReceipts}</td>
                              <td className="py-3 px-4">{summaryData.personalValue}</td>
                              <td className="py-3 px-4">€60.00</td>
                              <td className="py-3 px-4">20.0%</td>
                            </tr>
                            <tr className="border-b">
                              <td className="py-3 px-4">Electrical</td>
                              <td className="py-3 px-4">{summaryData.electricalReceipts}</td>
                              <td className="py-3 px-4">{summaryData.electricalValue}</td>
                              <td className="py-3 px-4">€62.50</td>
                              <td className="py-3 px-4">11.9%</td>
                            </tr>
                            <tr>
                              <td className="py-3 px-4 font-bold">Total</td>
                              <td className="py-3 px-4 font-bold">{summaryData.totalReceipts}</td>
                              <td className="py-3 px-4 font-bold">{summaryData.totalValue}</td>
                              <td className="py-3 px-4 font-bold">{summaryData.averageValue}</td>
                              <td className="py-3 px-4 font-bold">100%</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Monthly Insights</CardTitle>
                      <CardDescription>Key metrics and trends from your receipt data</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <motion.div
                          className="bg-gray-50 p-4 rounded-lg"
                          whileHover={{ scale: 1.05, backgroundColor: "rgba(27, 157, 101, 0.05)" }}
                        >
                          <div className="flex items-center gap-2 text-gray-500 mb-2">
                            <TrendingUp className="w-4 h-4" />
                            <span className="text-sm">Growth Trend</span>
                          </div>
                          <p className="text-lg font-semibold">{summaryData.monthlyGrowth} month-over-month</p>
                          <p className="text-sm text-gray-500 mt-1">Based on receipt count</p>
                        </motion.div>

                        <motion.div
                          className="bg-gray-50 p-4 rounded-lg"
                          whileHover={{ scale: 1.05, backgroundColor: "rgba(27, 157, 101, 0.05)" }}
                        >
                          <div className="flex items-center gap-2 text-gray-500 mb-2">
                            <Calendar className="w-4 h-4" />
                            <span className="text-sm">Highest Month</span>
                          </div>
                          <p className="text-lg font-semibold">{summaryData.mostExpensiveMonth}</p>
                          <p className="text-sm text-gray-500 mt-1">€980 total spending</p>
                        </motion.div>

                        <motion.div
                          className="bg-gray-50 p-4 rounded-lg"
                          whileHover={{ scale: 1.05, backgroundColor: "rgba(27, 157, 101, 0.05)" }}
                        >
                          <div className="flex items-center gap-2 text-gray-500 mb-2">
                            <CreditCard className="w-4 h-4" />
                            <span className="text-sm">Most Common</span>
                          </div>
                          <p className="text-lg font-semibold">Business Receipts</p>
                          <p className="text-sm text-gray-500 mt-1">44% of all receipts</p>
                        </motion.div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>
    </div>
  )
}

