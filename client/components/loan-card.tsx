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
  onWithdraw?: (loanId: number) => Promise<void>
  onRepay?: (loanId: number, amount: number) => Promise<void>
}

export function LoanCard({ loan, userType, onFund, onWithdraw, onRepay }: LoanCardProps) {
  const [processing, setProcessing] = useState(false)

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
      `Amount: ${loan.principal.toFixed(4)} ETH\n` +
      `Interest Rate: ${loan.interestRate}%\n` +
      `Expected Return: ${loan.repayment.toFixed(4)} ETH\n` +
      `Due Date: ${loan.dueDate}`
    )
    
    if (!confirmed) return
    
    try {
      setProcessing(true)
      await onFund(loan.id, loan.principal)
    } catch (error) {
      console.error("Error funding loan:", error)
    } finally {
      setProcessing(false)
    }
  }

  const handleWithdraw = async () => {
    if (!onWithdraw) return
    
    const confirmed = confirm(
      `Are you sure you want to withdraw this loan?\n\n` +
      `Amount to receive: ${loan.principal.toFixed(4)} ETH\n` +
      `Must repay: ${loan.repayment.toFixed(4)} ETH\n` +
      `By: ${loan.dueDate}\n\n` +
      `Remember: You must repay the full amount by the due date!`
    )
    
    if (!confirmed) return
    
    try {
      setProcessing(true)
      await onWithdraw(loan.id)
    } catch (error) {
      console.error("Error withdrawing loan:", error)
    } finally {
      setProcessing(false)
    }
  }

  const handleRepay = async () => {
    if (!onRepay) return
    
    const confirmed = confirm(
      `Are you sure you want to repay this loan?\n\n` +
      `Repayment Amount: ${loan.repayment.toFixed(4)} ETH\n` +
      `Principal: ${loan.principal.toFixed(4)} ETH\n` +
      `Interest: ${(loan.repayment - loan.principal).toFixed(4)} ETH\n` +
      `Due Date: ${loan.dueDate}\n\n` +
      `Make sure you have enough ETH in your wallet!`
    )
    
    if (!confirmed) return
    
    try {
      setProcessing(true)
      await onRepay(loan.id, loan.repayment)
    } catch (error) {
      console.error("Error repaying loan:", error)
    } finally {
      setProcessing(false)
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
                <p className="text-sm ">{loan.purpose}</p>
              )}
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(loan.status)}`}>
              {loan.status}
            </span>
          </div>

          {/* Loan Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="flex items-center gap-2  text-sm mb-1">
                <DollarSign className="w-4 h-4" />
                <span>Principal</span>
              </div>
              <p className="font-semibold text-foreground">{loan.principal.toFixed(4)} ETH</p>
            </div>

            <div>
              <div className="flex items-center gap-2  text-sm mb-1">
                <TrendingUp className="w-4 h-4" />
                <span>Repayment</span>
              </div>
              <p className="font-semibold text-foreground">{loan.repayment.toFixed(4)} ETH</p>
            </div>

            {loan.interestRate !== undefined && (
              <div>
                <div className="flex items-center gap-2  text-sm mb-1">
                  <TrendingUp className="w-4 h-4" />
                  <span>Interest</span>
                </div>
                <p className="font-semibold text-success">{loan.interestRate.toFixed(2)}%</p>
              </div>
            )}

            <div>
              <div className="flex items-center gap-2  text-sm mb-1">
                <Calendar className="w-4 h-4" />
                <span>Due Date</span>
              </div>
              <p className="font-semibold text-foreground">{loan.dueDate}</p>
            </div>
          </div>

          {/* Borrower/Lender Info */}
          {userType === "lender" && loan.borrower && (
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 " />
              <span className="">Borrower:</span>
              <span className="font-mono text-foreground">{loan.borrower}</span>
            </div>
          )}

          {userType === "borrower" && loan.lender && (
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 " />
              <span className="">Lender:</span>
              <span className="font-mono text-foreground">{loan.lender}</span>
            </div>
          )}

          {/* Progress Bar for Active Loans */}
          {loan.progress !== undefined && loan.progress > 0 && (
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="">Repayment Progress</span>
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
              <span className="">Returns Earned:</span>
              <span className="font-semibold text-success">{loan.returns.toFixed(4)} ETH</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          {/* Lender - Fund Loan Button */}
          {userType === "lender" && loan.status === "Requested" && onFund && (
            <button
              onClick={handleFund}
              disabled={processing}
              className="btn btn-primary flex items-center justify-center gap-2 min-w-[140px]"
            >
              {processing ? (
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

          {/* Borrower - Withdraw Button */}
          {loan.status === "Funded" && userType === "borrower" && onWithdraw && (
            <button 
              onClick={handleWithdraw}
              disabled={processing}
              className="btn btn-primary flex items-center justify-center gap-2 min-w-[140px]"
            >
              {processing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Withdraw
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          )}

          {/* Borrower - Repay Loan Button */}
          {loan.status === "Withdrawn" && userType === "borrower" && onRepay && (
            <button 
              onClick={handleRepay}
              disabled={processing}
              className="btn btn-success flex items-center justify-center gap-2 min-w-[140px]"
            >
              {processing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Repaying...
                </>
              ) : (
                <>
                  Repay Loan
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          )}

          {/* Expected Return Info for Lenders */}
          {userType === "lender" && loan.status === "Requested" && (
            <div className="text-center">
              <p className="text-xs ">Expected Return</p>
              <p className="font-bold text-success">
                +{(loan.repayment - loan.principal).toFixed(4)} ETH
              </p>
            </div>
          )}

          {/* Amount to Repay Info for Borrowers */}
          {userType === "borrower" && loan.status === "Withdrawn" && (
            <div className="text-center">
              <p className="text-xs ">Amount to Repay</p>
              <p className="font-bold text-warning">
                {loan.repayment.toFixed(4)} ETH
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}