"use client"

import { BorrowerDashboard } from "@/components/borrower-dashboard"
import { LoanDebugger } from "@/components/debug"
import { Footer } from "@/components/footer"
import { Navigation } from "@/components/navigation"

export default function BorrowerPage() {
  return (
    <main className="min-h-screen bg-background">
      <LoanDebugger />
      <BorrowerDashboard />
      <Footer />
    </main>
  )
}
