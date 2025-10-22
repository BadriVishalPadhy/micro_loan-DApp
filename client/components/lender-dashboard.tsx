"use client"

import { useState } from "react"
import { DollarSign, TrendingUp, Wallet, Target } from "lucide-react"
import { LoanCard } from "./loan-card"

export function LenderDashboard() {
  const [availableLoans] = useState([
    {
      id: 1,
      principal: 5000,
      repayment: 5500,
      dueDate: "2025-12-31",
      status: "Requested",
      borrower: "0x123d...4f2a",
      interestRate: 10,
      purpose: "Expand my tailoring business",
    },
    {
      id: 2,
      principal: 8000,
      repayment: 8800,
      dueDate: "2025-11-15",
      status: "Requested",
      borrower: "0x456e...7b3c",
      interestRate: 10,
      purpose: "Purchase new equipment",
    },
    {
      id: 3,
      principal: 3000,
      repayment: 3300,
      dueDate: "2025-10-30",
      status: "Requested",
      borrower: "0x789f...9d4e",
      interestRate: 10,
      purpose: "Working capital for production",
    },
  ])

  const [myInvestments] = useState([
    {
      id: 4,
      principal: 10000,
      repayment: 11000,
      dueDate: "2025-09-15",
      status: "Repaid",
      borrower: "0xabc0...1e5f",
      returns: 1000,
    },
    {
      id: 5,
      principal: 5000,
      repayment: 5500,
      dueDate: "2025-10-20",
      status: "Withdrawn",
      borrower: "0xdef1...2g6a",
      progress: 60,
    },
  ])

  const stats = [
    {
      label: "Total Invested",
      value: "$15,000",
      icon: DollarSign,
      color: "text-primary",
    },
    {
      label: "Active Investments",
      value: "2",
      icon: Wallet,
      color: "text-warning",
    },
    {
      label: "Total Returns",
      value: "$1,500",
      icon: TrendingUp,
      color: "text-success",
    },
    {
      label: "Avg. Return Rate",
      value: "10%",
      icon: Target,
      color: "text-primary",
    },
  ]

  return (
    <section className="py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-2">Lender Dashboard</h1>
          <p className="text-muted">Discover investment opportunities and grow your portfolio</p>
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

        {/* Available Loans */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">Available Loans</h2>
          <div className="space-y-4">
            {availableLoans.map((loan) => (
              <LoanCard key={loan.id} loan={loan} userType="lender" />
            ))}
          </div>
        </div>

        {/* My Investments */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-6">My Investments</h2>
          <div className="space-y-4">
            {myInvestments.map((loan) => (
              <LoanCard key={loan.id} loan={loan} userType="lender" />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
