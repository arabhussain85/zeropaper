// Utility to check browser capabilities for debugging network issues

export function checkBrowserCapabilities() {
    try {
      // Check if running in browser environment
      if (typeof window === "undefined") return
  
      // Log browser capabilities for debugging
      console.log("Browser capabilities check:")
      console.log("- Online status:", navigator.onLine)
      console.log("- Service Worker support:", "serviceWorker" in navigator)
      console.log("- IndexedDB support:", "indexedDB" in window)
      console.log("- Cache API support:", "caches" in window)
      console.log("- Fetch API support:", "fetch" in window)
  
      // Check for storage persistence
      if (navigator.storage && navigator.storage.persist) {
        navigator.storage.persist().then((isPersisted) => {
          console.log("- Storage persistence:", isPersisted)
        })
      }
  
      // Check for storage quota
      if (navigator.storage && navigator.storage.estimate) {
        navigator.storage.estimate().then((estimate) => {
          console.log("- Storage quota:", estimate.quota)
          console.log("- Storage usage:", estimate.usage)
        })
      }
    } catch (error) {
      console.error("Error checking browser capabilities:", error)
    }
  }
  
  