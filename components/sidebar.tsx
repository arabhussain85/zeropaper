"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Receipt, BarChart2, Settings, Menu, X, LogOut, Zap, CreditCard } from "lucide-react"
import Image from "next/image"

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
      name: "Electricity",
      href: "/electricity",
      icon: Zap,
    },
    {
      name: "Zero Paper Pay",
      href: "/zero-paper-pay",
      icon: CreditCard,
    },
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
    },
  ]

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="fixed top-4 left-4 z-50 lg:hidden">
        <button onClick={() => setIsOpen(!isOpen)} className="p-2 bg-white rounded-lg shadow-lg">
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar for Desktop */}
      <div className="hidden lg:block fixed inset-y-0 left-0 z-40 w-64 bg-white border-r shadow-lg">
        <SidebarContent pathname={pathname} />
      </div>

      {/* Sidebar for Mobile */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsOpen(false)} />

          {/* Sidebar */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
            <SidebarContent pathname={pathname} />
          </div>
        </div>
      )}
    </>
  )
}

function SidebarContent({ pathname }: { pathname: string }) {
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
      name: "Electricity",
      href: "/electricity",
      icon: Zap,
    },
    {
      name: "Zero Paper Pay",
      href: "/zero-paper-pay",
      icon: CreditCard,
    },
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
    },
  ]

  return (
    <>
      {/* Logo */}
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="bg-[#1B9D65] rounded-lg p-2">
            <div className="w-8 h-8 relative">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Zero%20paper%20user2-05%201-2MhU8cy380KtTq1agohGg6DKTIqtzS.png"
                alt="Zero Paper Logo"
                fill
                className="object-contain"
              />
            </div>
          </div>
          <div className="text-xl font-bold">
            <div>ZERO</div>
            <div>PAPER USER</div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="px-3 py-4 flex-1 overflow-y-auto">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive ? "bg-[#1B9D65] text-white" : "hover:bg-gray-100"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                  {isActive && <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-white" />}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="p-6 border-t">
        <button className="flex items-center gap-3 px-4 py-3 w-full text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </>
  )
}

