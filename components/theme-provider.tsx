"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  // Force client-side only rendering to avoid hydration mismatch
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Use a div with visibility:hidden to prevent content flash
  // This ensures the DOM structure is the same during server rendering
  if (!mounted) {
    return (
      <div style={{ visibility: "hidden" }} suppressHydrationWarning>
        {children}
      </div>
    )
  }

  return (
    <NextThemesProvider {...props} enableSystem={false} defaultTheme="light">
      {children}
    </NextThemesProvider>
  )
}

