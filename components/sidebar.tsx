"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Settings, LogOut, Menu, X } from "lucide-react"
import { logoutUser } from "@/utils/auth-helpers"

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  // Close sidebar when route changes on mobile
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // Navigation items
  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
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
        <SidebarContent navigation={navigation} pathname={pathname} />
      </div>

      {/* Sidebar for Mobile */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsOpen(false)} />

          {/* Sidebar */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
            <SidebarContent navigation={navigation} pathname={pathname} />
          </div>
        </div>
      )}
    </>
  )
}

function SidebarContent({
  navigation,
  pathname,
}: {
  navigation: { name: string; href: string; icon: React.ElementType }[]
  pathname: string
}) {
  return (
    <>
      {/* User Info (without ZERO PAPER branding) */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white">
            <span className="text-sm font-bold">A</span>
          </div>
          <div>
            <p className="text-sm font-medium">arab hussain</p>
            <p className="text-xs text-gray-500">arabhussain403@gmail.com</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="px-3 py-6 flex-1 overflow-y-auto">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname.startsWith(item.href)
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  prefetch={true}
                  onClick={(e) => {
                    // Ensure navigation happens
                    if (item.href === "/settings") {
                      e.preventDefault()
                      window.location.href = "/settings"
                    }
                  }}
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
        <button
          onClick={logoutUser}
          className="flex items-center gap-3 px-4 py-3 w-full text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </>
  )
}

