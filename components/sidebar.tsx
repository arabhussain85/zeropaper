"use client"

// Update the imports to include the new components we'll need
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Receipt,
  BarChart2,
  Settings,
  Menu,
  X,
  LogOut,
  Zap,
  CreditCard,
  User,
  QrCode,
  Trash2,
} from "lucide-react"
import DeleteAccountModal from "@/components/delete-account-modal"
import Image from "next/image"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { getUserData, logoutUser } from "@/utils/auth-helpers"

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const [showQrCode, setShowQrCode] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const pathname = usePathname()
  const userData = getUserData()

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
        <SidebarContent
          pathname={pathname}
          showQrCode={showQrCode}
          setShowQrCode={setShowQrCode}
          showDeleteConfirm={showDeleteConfirm}
          setShowDeleteConfirm={setShowDeleteConfirm}
        />
      </div>

      {/* Sidebar for Mobile */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsOpen(false)} />

          {/* Sidebar */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
            <SidebarContent
              pathname={pathname}
              showQrCode={showQrCode}
              setShowQrCode={setShowQrCode}
              showDeleteConfirm={showDeleteConfirm}
              setShowDeleteConfirm={setShowDeleteConfirm}
            />
          </div>
        </div>
      )}

      {/* QR Code Dialog */}
      <Dialog open={showQrCode} onOpenChange={setShowQrCode}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Your Profile QR Code</DialogTitle>
            <DialogDescription>
              Scan this QR code to quickly access your profile or share with others.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center p-6">
            <div className="w-64 h-64 bg-white p-4 rounded-lg shadow-md flex items-center justify-center">
              <Image
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(userData?.uid || "zero-paper-user")}`}
                alt="User QR Code"
                width={200}
                height={200}
                className="object-contain"
              />
            </div>
          </div>
          <DialogFooter className="sm:justify-center">
            <Button type="button" variant="secondary" onClick={() => setShowQrCode(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Account Modal with OTP Verification */}
      <DeleteAccountModal 
        isOpen={showDeleteConfirm} 
        onClose={() => setShowDeleteConfirm(false)} 
        onSuccess={() => {
          // Logout user after successful account deletion
          logoutUser()
        }} 
      />
    </>
  )
}

function SidebarContent({
  pathname,
  showQrCode,
  setShowQrCode,
  showDeleteConfirm,
  setShowDeleteConfirm,
}: {
  pathname: string
  showQrCode: boolean
  setShowQrCode: (show: boolean) => void
  showDeleteConfirm: boolean
  setShowDeleteConfirm: (show: boolean) => void
}) {
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

  // Get user data from auth helpers
  const userData = getUserData()
  const userName = userData?.name || "User"
  const userEmail = userData?.email || "user@example.com"

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

      {/* User Profile Section */}
      <div className="px-6 py-4 border-b">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-[#1B9D65] rounded-full flex items-center justify-center text-white">
            <User className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium truncate">{userName}</h3>
            <p className="text-xs text-gray-500 truncate">{userEmail}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1 hover:bg-gray-100 rounded-full">
                <svg width="16" height="4" viewBox="0 0 16 4" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M8 0C9.10457 0 10 0.895431 10 2C10 3.10457 9.10457 4 8 4C6.89543 4 6 3.10457 6 2C6 0.895431 6.89543 0 8 0Z"
                    fill="#6B7280"
                  />
                  <path
                    d="M2 0C3.10457 0 4 0.895431 4 2C4 3.10457 3.10457 4 2 4C0.895431 4 0 3.10457 0 2C0 0.895431 0.895431 0 2 0Z"
                    fill="#6B7280"
                  />
                  <path
                    d="M14 0C15.1046 0 16 0.895431 16 2C16 3.10457 15.1046 4 14 4C12.8954 4 12 3.10457 12 2C12 0.895431 12.8954 0 14 0Z"
                    fill="#6B7280"
                  />
                </svg>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowQrCode(true)}>
                  <QrCode className="mr-2 h-4 w-4" />
                  <span>Show QR Code</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowDeleteConfirm(true)} className="text-red-600">
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Delete Account</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
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

