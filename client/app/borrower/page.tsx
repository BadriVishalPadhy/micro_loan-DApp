"use client"

import { BorrowerDashboard } from "@/components/borrower-dashboard"
import { Footer } from "@/components/footer"
import { Navigation } from "@/components/navigation"

export default function BorrowerPage() {
  return (
    <main className="min-h-screen bg-background">
      <BorrowerDashboard />
      <Footer />
    </main>
  )
}
