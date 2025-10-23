"use client"

import { useState } from "react"
import { Calendar, DollarSign, TrendingUp, User, ArrowRight } from "lucide-react"

interface LoanCardProps {
  loan: {
    id: number
    principal: number
    repayment: number
    dueDate: string
    status: string
    borrower?: string
    lender?: string | null
    interestRate?: number
    purpose?: string
    progress?: number
    returns?: number
  }
  userType: "borrower" | "lender"
  onFund?: (loanId: number, amount: number) => Promise<void>
}

export function LoanCard({ loan, userType, onFund }: LoanCardProps) {
  const [fundingLoan, setFundingLoan] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Requested":
        return "bg-yellow-100 text-yellow-800"
      case "Funded":
        return "bg-blue-100 text-blue-800"
      case "Withdrawn":
        return "bg-purple-100 text-purple-800"
      case "Repaid":
        return "bg-green-100 text-green-800"
      case "Defaulted":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleFund = async () => {
    if (!onFund) return
    
    const confirmed = confirm(
      `Are you sure you want to fund this loan?\n\n` +
      `Amount: ${loan.principal} ETH\n` +
      `Interest Rate: ${loan.interestRate}%\n` +
      `Expected Return: ${loan.repayment} ETH\n` +
      `Due Date: ${loan.dueDate}`
    )
    
    if (!confirmed) return
    
    try {
      setFundingLoan(true)
      await onFund(loan.id, loan.principal)
    } catch (error) {
      console.error("Error funding loan:", error)
    } finally {
      setFundingLoan(false)
    }
  }

  return (
    <div className="card hover:shadow-lg transition-shadow">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1 space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-1">
                Loan #{loan.id}
              </h3>
              {loan.purpose && (
                <p className="text-sm text-muted">{loan.purpose}</p>
              )}
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(loan.status)}`}>
              {loan.status}
            </span>
          </div>

          {/* Loan Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="flex items-center gap-2 text-muted text-sm mb-1">
                <DollarSign className="w-4 h-4" />
                <span>Principal</span>
              </div>
              <p className="font-semibold text-foreground">{loan.principal.toFixed(4)} ETH</p>
            </div>

            <div>
              <div className="flex items-center gap-2 text-muted text-sm mb-1">
                <TrendingUp className="w-4 h-4" />
                <span>Repayment</span>
              </div>
              <p className="font-semibold text-foreground">{loan.repayment.toFixed(4)} ETH</p>
            </div>

            {loan.interestRate !== undefined && (
              <div>
                <div className="flex items-center gap-2 text-muted text-sm mb-1">
                  <TrendingUp className="w-4 h-4" />
                  <span>Interest</span>
                </div>
                <p className="font-semibold text-success">{loan.interestRate.toFixed(2)}%</p>
              </div>
            )}

            <div>
              <div className="flex items-center gap-2 text-muted text-sm mb-1">
                <Calendar className="w-4 h-4" />
                <span>Due Date</span>
              </div>
              <p className="font-semibold text-foreground">{loan.dueDate}</p>
            </div>
          </div>

          {/* Borrower/Lender Info */}
          {userType === "lender" && loan.borrower && (
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-muted" />
              <span className="text-muted">Borrower:</span>
              <span className="font-mono text-foreground">{loan.borrower}</span>
            </div>
          )}

          {userType === "borrower" && loan.lender && (
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-muted" />
              <span className="text-muted">Lender:</span>
              <span className="font-mono text-foreground">{loan.lender}</span>
            </div>
          )}

          {/* Progress Bar for Active Loans */}
          {loan.progress !== undefined && loan.progress > 0 && (
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted">Repayment Progress</span>
                <span className="font-semibold text-foreground">{loan.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${loan.progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Returns for Repaid Loans */}
          {loan.returns !== undefined && (
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="w-4 h-4 text-success" />
              <span className="text-muted">Returns Earned:</span>
              <span className="font-semibold text-success">{loan.returns.toFixed(4)} ETH</span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="flex flex-col gap-2">
          {userType === "lender" && loan.status === "Requested" && onFund && (
            <button
              onClick={handleFund}
              disabled={fundingLoan}
              className="btn btn-primary flex items-center justify-center gap-2 min-w-[140px]"
            >
              {fundingLoan ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Funding...
                </>
              ) : (
                <>
                  Fund Loan
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          )}

          {loan.status === "Funded" && userType === "borrower" && (
            <button className="btn btn-primary flex items-center justify-center gap-2 min-w-[140px]">
              Withdraw
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {loan.status === "Withdrawn" && userType === "borrower" && (
            <button className="btn btn-success flex items-center justify-center gap-2 min-w-[140px]">
              Repay Loan
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {/* Expected Return Info for Lenders */}
          {userType === "lender" && loan.status === "Requested" && (
            <div className="text-center">
              <p className="text-xs text-muted">Expected Return</p>
              <p className="font-bold text-success">
                +{(loan.repayment - loan.principal).toFixed(4)} ETH
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}