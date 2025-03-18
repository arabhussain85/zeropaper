import type React from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { Toaster } from "./components/ui/toaster"
import { ThemeProvider } from "./components/theme-provider"

// Pages
import Home from "./pages/Home"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import ForgotPassword from "./pages/ForgotPassword"
import Dashboard from "./pages/Dashboard"
import Analytics from "./pages/Analytics"
import Receipts from "./pages/Receipts"
import Settings from "./pages/Settings"
import Electricity from "./pages/Electricity"
import ZeroPaperPay from "./pages/ZeroPaperPay"

// Auth guard component
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = localStorage.getItem("authToken") !== null
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} storageKey="zero-paper-theme">
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <PrivateRoute>
                <Analytics />
              </PrivateRoute>
            }
          />
          <Route
            path="/receipts"
            element={
              <PrivateRoute>
                <Receipts />
              </PrivateRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <PrivateRoute>
                <Settings />
              </PrivateRoute>
            }
          />
          <Route
            path="/electricity"
            element={
              <PrivateRoute>
                <Electricity />
              </PrivateRoute>
            }
          />
          <Route
            path="/zero-paper-pay"
            element={
              <PrivateRoute>
                <ZeroPaperPay />
              </PrivateRoute>
            }
          />
        </Routes>
        <Toaster />
      </Router>
    </ThemeProvider>
  )
}

export default App

