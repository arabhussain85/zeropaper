"use client"

import { useState, useEffect } from "react"
import { Info } from "lucide-react"

export default function VersionDisplay() {
  const [appVersion, setAppVersion] = useState("1.0.0")
  const [backendVersion, setBackendVersion] = useState("1.0.0")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchVersions() {
      try {
        // Fetch backend version from API
        const response = await fetch("https://services.stage.zeropaper.online/api/version")
        if (response.ok) {
          const data = await response.json()
          setBackendVersion(data.version || "1.0.0")
        }
      } catch (error) {
        console.error("Error fetching backend version:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchVersions()
  }, [])

  return (
    <div className="text-center mt-4 text-xs text-gray-500 flex items-center justify-center gap-1">
      <Info className="w-3 h-3" />
      <span>
        App v{appVersion} | Backend v{isLoading ? "Loading..." : backendVersion}
      </span>
    </div>
  )
}

