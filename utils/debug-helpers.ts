// Debug helpers for troubleshooting

// Function to check and log user data in localStorage
export function checkUserData(): { found: boolean; data: any } {
    if (typeof window === "undefined") {
      return { found: false, data: null }
    }
  
    try {
      const userData = localStorage.getItem("userData")
      if (!userData) {
        console.warn("No user data found in localStorage")
        return { found: false, data: null }
      }
  
      const parsedData = JSON.parse(userData)
      console.log("User data found in localStorage:", parsedData)
  
      if (!parsedData.uid) {
        console.warn("User data exists but no UID found:", parsedData)
      }
  
      return { found: true, data: parsedData }
    } catch (error) {
      console.error("Error checking user data:", error)
      return { found: false, data: null }
    }
  }
  
  // Function to check auth token
  export function checkAuthToken(): { found: boolean; token: string | null } {
    if (typeof window === "undefined") {
      return { found: false, token: null }
    }
  
    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
    if (!token) {
      console.warn("No auth token found")
      return { found: false, token: null }
    }
  
    console.log("Auth token found:", token.substring(0, 10) + "...")
    return { found: true, token }
  }
  
  // Function to debug all storage
  export function debugStorage(): void {
    if (typeof window === "undefined") {
      console.log("Running on server, no localStorage available")
      return
    }
  
    console.group("LocalStorage Debug")
  
    try {
      // Check user data
      const userData = checkUserData()
      console.log("User data check:", userData.found ? "Found" : "Not found")
  
      // Check auth token
      const tokenData = checkAuthToken()
      console.log("Auth token check:", tokenData.found ? "Found" : "Not found")
  
      // List all localStorage keys
      console.log("All localStorage keys:")
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key) {
          const value = localStorage.getItem(key)
          console.log(`${key}: ${value?.substring(0, 30)}${value && value.length > 30 ? "..." : ""}`)
        }
      }
    } catch (error) {
      console.error("Error debugging storage:", error)
    }
  
    console.groupEnd()
  }
  
  