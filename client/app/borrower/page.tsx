"use client"

import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { BorrowerDashboard } from "@/components/borrower-dashboard"
import { ProtectedRoute } from "@/components/protected-route"

export default function BorrowerPage() {
  return (

      <main className="min-h-screen bg-background">
        <Navigation />
        <BorrowerDashboard />
        <Footer />
      </main>

  )
}
