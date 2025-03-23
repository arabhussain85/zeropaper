"use client"

import { useState } from "react"
import Image from "next/image"
import { QrCode, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { getUserData } from "@/utils/auth-helpers"

export function UserProfileQR() {
  const [isDownloading, setIsDownloading] = useState(false)
  const userData = getUserData()
  const userId = userData?.uid || "zero-paper-user"
  const userName = userData?.name || "User"

  // QR code URL using a free QR code generation service
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(userId)}`

  const handleDownload = async () => {
    try {
      setIsDownloading(true)

      // Fetch the image
      const response = await fetch(qrCodeUrl)
      const blob = await response.blob()

      // Create a download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `zero-paper-qr-${userId}.png`

      // Trigger download
      document.body.appendChild(link)
      link.click()

      // Clean up
      window.URL.revokeObjectURL(url)
      document.body.removeChild(link)
    } catch (error) {
      console.error("Error downloading QR code:", error)
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          Your Profile QR Code
        </CardTitle>
        <CardDescription>Scan this QR code to quickly access your Zero Paper profile</CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <Image
            src={qrCodeUrl || "/placeholder.svg"}
            alt="User QR Code"
            width={250}
            height={250}
            className="object-contain"
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <p className="text-sm text-muted-foreground">ID: {userId.substring(0, 8)}...</p>
        <Button variant="outline" size="sm" onClick={handleDownload} disabled={isDownloading}>
          {isDownloading ? (
            <>Downloading...</>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Download
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

