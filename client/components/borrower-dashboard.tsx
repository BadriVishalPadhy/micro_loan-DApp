"use client"

import { useState } from "react"
import { Plus, TrendingUp, Clock, CheckCircle2, AlertCircle } from "lucide-react"
import { RequestLoanModal } from "./request-loan-modal"
import { LoanCard } from "./loan-card"

export function BorrowerDashboard() {
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [loans, setLoans] = useState([
    {
      id: 1,
      principal: 5000,
      repayment: 5500,
      dueDate: "2025-12-31",
      status: "Withdrawn",
      lender: "0x742d...8f2a",
      progress: 45,
    },
    {
      id: 2,
      principal: 10000,
      repayment: 11000,
      dueDate: "2025-11-15",
      status: "Funded",
      lender: null,
      progress: 0,
    },
  ])

  const stats = [
    {
      label: "Total Borrowed",
      value: "$15,000",
      icon: TrendingUp,
      color: "text-primary",
    },
    {
      label: "Active Loans",
      value: "2",
      icon: Clock,
      color: "text-warning",
    },
    {
      label: "Repaid",
      value: "$8,500",
      icon: CheckCircle2,
      color: "text-success",
    },
    {
      label: "Repayment Rate",
      value: "100%",
      icon: AlertCircle,
      color: "text-success",
    },
  ]

  return (
    <section className="py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-2">Borrower Dashboard</h1>
          <p className="text-muted">Manage your loans and grow your business</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div key={index} className="card">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-muted text-sm mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                  </div>
                  <Icon className={`${stat.color} w-6 h-6`} />
                </div>
              </div>
            )
          })}
        </div>

        {/* Request Loan Button */}
        <div className="mb-12">
          <button onClick={() => setShowRequestModal(true)} className="btn-primary inline-flex items-center gap-2">
            <Plus size={20} />
            Request New Loan
          </button>
        </div>

        {/* Loans List */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-6">Your Loans</h2>
          <div className="space-y-4">
            {loans.map((loan) => (
              <LoanCard key={loan.id} loan={loan} userType="borrower" />
            ))}
          </div>
        </div>

        {/* Request Loan Modal */}
        {showRequestModal && <RequestLoanModal onClose={() => setShowRequestModal(false)} />}
      </div>
    </section>
  )
}
