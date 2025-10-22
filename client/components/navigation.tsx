"use client"

import Link from "next/link"
import { Menu, X, LogOut, User } from "lucide-react"
import { useState } from "react"
import { WalletConnectButton } from "./wallet-connect-button"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const { user, isAuthenticated, logout } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    setIsProfileOpen(false)
    router.push("/")
  }

  return (
    <nav className="sticky top-0 z-50 bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">μ</span>
            </div>
            <span className="font-bold text-xl text-foreground">MicroLoan</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-muted hover:text-foreground transition">
              Features
            </Link>
            <Link href="#how-it-works" className="text-muted hover:text-foreground transition">
              How It Works
            </Link>
            <Link href="#stats" className="text-muted hover:text-foreground transition">
              Impact
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <WalletConnectButton />

            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition"
                >
                  <User size={18} />
                  <span className="text-sm font-medium">{user.name}</span>
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-background border border-border rounded-lg shadow-lg py-2 z-50">
                    <Link
                      href="/dashboard"
                      className="block px-4 py-2 text-sm text-foreground hover:bg-muted transition"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-foreground hover:bg-muted transition"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      Edit Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-muted transition flex items-center gap-2"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/auth/login" className="text-muted hover:text-foreground transition">
                  Sign In
                </Link>
                <Link href="/auth/signup" className="btn-primary">
                  Sign Up
                </Link>
              </>
            )}

            {isAuthenticated && user && (
              <>
                <Link href={user.role === "borrower" ? "/borrower" : "/lender"} className="btn-secondary">
                  {user.role === "borrower" ? "Borrow" : "Invest"}
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-4">
            <Link href="#features" className="block text-muted hover:text-foreground">
              Features
            </Link>
            <Link href="#how-it-works" className="block text-muted hover:text-foreground">
              How It Works
            </Link>
            <Link href="#stats" className="block text-muted hover:text-foreground">
              Impact
            </Link>
            <div className="flex gap-4 pt-4">
              <WalletConnectButton />
            </div>
            {isAuthenticated && user ? (
              <div className="pt-4 border-t border-muted space-y-2">
                <Link href="/dashboard" className="block text-sm text-foreground hover:text-primary">
                  Dashboard
                </Link>
                <Link href="/profile" className="block text-sm text-foreground hover:text-primary">
                  Edit Profile
                </Link>
                <button onClick={handleLogout} className="w-full text-left text-sm text-red-600 hover:text-red-700">
                  Logout
                </button>
              </div>
            ) : (
              <div className="pt-4 border-t border-muted space-y-2">
                <Link href="/auth/login" className="block text-sm text-foreground hover:text-primary">
                  Sign In
                </Link>
                <Link href="/auth/signup" className="block text-sm text-foreground hover:text-primary">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
