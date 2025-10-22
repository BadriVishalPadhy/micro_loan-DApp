"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Wallet, LogOut, Settings } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const { user, isLoading, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const handleLogout = async () => {
    await logout()
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-foreground">Dashboard</h1>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut size={18} className="mr-2" />
            Logout
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted text-sm mb-1">Account Type</p>
                <p className="text-2xl font-bold text-foreground capitalize">{user.role}</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg">
                <Wallet size={24} className="text-primary" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div>
              <p className="text-muted text-sm mb-1">Name</p>
              <p className="text-xl font-semibold text-foreground">{user.name}</p>
            </div>
          </Card>

          <Card className="p-6">
            <div>
              <p className="text-muted text-sm mb-1">Email</p>
              <p className="text-sm font-mono text-foreground break-all">{user.email}</p>
            </div>
          </Card>
        </div>

        <Card className="p-6 mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4">Wallet Connection</h2>
          {user.walletAddress ? (
            <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
              <div>
                <p className="text-sm text-muted mb-1">Connected Wallet</p>
                <p className="font-mono text-foreground">{user.walletAddress}</p>
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
          ) : (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                No wallet connected. Connect a wallet to start using the platform.
              </p>
            </div>
          )}
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href={user.role === "borrower" ? "/borrower" : "/lender"}>
            <Card className="p-6 hover:shadow-lg transition cursor-pointer">
              <h3 className="text-lg font-bold text-foreground mb-2">
                {user.role === "borrower" ? "Request a Loan" : "Browse Loans"}
              </h3>
              <p className="text-muted text-sm">
                {user.role === "borrower"
                  ? "Start your loan application process"
                  : "Explore available lending opportunities"}
              </p>
            </Card>
          </Link>

          <Link href="/profile">
            <Card className="p-6 hover:shadow-lg transition cursor-pointer">
              <h3 className="text-lg font-bold text-foreground mb-2 flex items-center gap-2">
                <Settings size={20} />
                Edit Profile
              </h3>
              <p className="text-muted text-sm">Update your profile information and preferences</p>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}
