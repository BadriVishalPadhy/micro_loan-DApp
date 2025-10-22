"use client"

import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { LenderDashboard } from "@/components/lender-dashboard"
import { ProtectedRoute } from "@/components/protected-route"

export default function LenderPage() {
  return (
    <ProtectedRoute requiredRole="lender">
      <main className="min-h-screen bg-background">
        <Navigation />
        <LenderDashboard />
        <Footer />
      </main>
    </ProtectedRoute>
  )
}
