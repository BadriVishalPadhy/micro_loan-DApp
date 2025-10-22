"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useAccount } from "wagmi"

export interface User {
  id: string
  email: string
  name: string
  role: "borrower" | "lender" | "admin"
  walletAddress: string
  createdAt: string
  bio?: string
  businessName?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, name: string, role: "borrower" | "lender") => Promise<void>
  logout: () => Promise<void>
  updateProfile: (data: Partial<User>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { address } = useAccount()

  useEffect(() => {
    const storedUser = localStorage.getItem("microloan_user")
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error("Failed to parse stored user:", error)
        localStorage.removeItem("microloan_user")
      }
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    if (user && address && user.walletAddress !== address) {
      const updatedUser = { ...user, walletAddress: address }
      setUser(updatedUser)
      localStorage.setItem("microloan_user", JSON.stringify(updatedUser))
    }
  }, [address, user])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      // Simulate API call - in production, call your backend
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        throw new Error("Login failed")
      }

      const userData = await response.json()
      const userWithWallet = { ...userData, walletAddress: address || "" }
      setUser(userWithWallet)
      localStorage.setItem("microloan_user", JSON.stringify(userWithWallet))
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (email: string, password: string, name: string, role: "borrower" | "lender") => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name, role }),
      })

      if (!response.ok) {
        throw new Error("Signup failed")
      }

      const userData = await response.json()
      const userWithWallet = { ...userData, walletAddress: address || "" }
      setUser(userWithWallet)
      localStorage.setItem("microloan_user", JSON.stringify(userWithWallet))
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    setIsLoading(true)
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      setUser(null)
      localStorage.removeItem("microloan_user")
    } finally {
      setIsLoading(false)
    }
  }

  const updateProfile = async (data: Partial<User>) => {
    if (!user) throw new Error("No user logged in")

    try {
      const response = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Profile update failed")
      }

      const updatedUser = await response.json()
      setUser(updatedUser)
      localStorage.setItem("microloan_user", JSON.stringify(updatedUser))
    } catch (error) {
      console.error("Profile update error:", error)
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
