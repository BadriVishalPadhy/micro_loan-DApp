"use client"

import { X, DollarSign, Calendar, TrendingUp, User } from "lucide-react"

interface LoanDetailModalProps {
  loan: any
  userType: "borrower" | "lender"
  onClose: () => void
}

export function LoanDetailModal({ loan, userType, onClose }: LoanDetailModalProps) {
  const interestRate = loan.repayment ? Math.round(((loan.repayment - loan.principal) / loan.principal) * 100) : 0

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Requested":
        return "bg-warning/10 text-warning"
      case "Funded":
        return "bg-primary/10 text-primary"
      case "Withdrawn":
        return "bg-primary/10 text-primary"
      case "Repaid":
        return "bg-success/10 text-success"
      case "Defaulted":
        return "bg-error/10 text-error"
      default:
        return "bg-muted-light text-muted"
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Loan #{loan.id}</h2>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(loan.status)}`}>
              {loan.status}
            </span>
          </div>
          <button onClick={onClose} className="text-muted hover:text-foreground transition">
            <X size={24} />
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="space-y-6">
            <div className="card">
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="w-5 h-5 text-primary" />
                <p className="text-sm text-muted">Principal Amount</p>
              </div>
              <p className="text-3xl font-bold text-foreground">${loan.principal.toLocaleString()}</p>
            </div>

            <div className="card">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <p className="text-sm text-muted">Interest Rate</p>
              </div>
              <p className="text-3xl font-bold text-foreground">{interestRate}%</p>
              <p className="text-sm text-muted mt-2">Total Repayment: ${loan.repayment.toLocaleString()}</p>
            </div>

            <div className="card">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="w-5 h-5 text-primary" />
                <p className="text-sm text-muted">Due Date</p>
              </div>
              <p className="text-2xl font-bold text-foreground">{loan.dueDate}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="card">
              <div className="flex items-center gap-3 mb-2">
                <User className="w-5 h-5 text-primary" />
                <p className="text-sm text-muted">{userType === "borrower" ? "Lender" : "Borrower"}</p>
              </div>
              <p className="text-lg font-mono text-foreground">
                {userType === "borrower" ? loan.lender || "Pending" : loan.borrower}
              </p>
            </div>

            {loan.purpose && (
              <div className="card">
                <p className="text-sm text-muted mb-2">Purpose</p>
                <p className="text-foreground">{loan.purpose}</p>
              </div>
            )}

            {loan.progress !== undefined && (
              <div className="card">
                <p className="text-sm text-muted mb-4">Repayment Progress</p>
                <div className="w-full bg-muted-light rounded-full h-3 mb-2">
                  <div
                    className="bg-primary h-3 rounded-full transition-all"
                    style={{ width: `${loan.progress}%` }}
                  ></div>
                </div>
                <p className="text-sm font-semibold text-foreground">{loan.progress}%</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-4">
          {userType === "lender" && loan.status === "Requested" && (
            <>
              <button className="btn-primary flex-1">Fund This Loan</button>
              <button className="btn-secondary flex-1">Decline</button>
            </>
          )}
          {userType === "borrower" && loan.status === "Funded" && (
            <button className="btn-primary flex-1">Withdraw Funds</button>
          )}
          {userType === "borrower" && loan.status === "Withdrawn" && (
            <button className="btn-primary flex-1">Repay Loan</button>
          )}
          <button onClick={onClose} className="btn-secondary flex-1">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
