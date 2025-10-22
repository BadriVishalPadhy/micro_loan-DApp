"use client"

import { useState } from "react"
import { ChevronRight, DollarSign, Calendar, TrendingUp } from "lucide-react"
import { LoanDetailModal } from "./loan-detail-modal"

interface LoanCardProps {
  loan: any
  userType: "borrower" | "lender"
}

export function LoanCard({ loan, userType }: LoanCardProps) {
  const [showDetail, setShowDetail] = useState(false)

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

  const interestRate = loan.repayment ? Math.round(((loan.repayment - loan.principal) / loan.principal) * 100) : 0

  return (
    <>
      <div onClick={() => setShowDetail(true)} className="card cursor-pointer hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold text-foreground">Loan #{loan.id}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(loan.status)}`}>
                    {loan.status}
                  </span>
                </div>
                <p className="text-sm text-muted">
                  {userType === "borrower" ? `Lender: ${loan.lender || "Pending"}` : `Borrower: ${loan.borrower}`}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-muted" />
                <div>
                  <p className="text-xs text-muted">Amount</p>
                  <p className="font-semibold text-foreground">${loan.principal.toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-muted" />
                <div>
                  <p className="text-xs text-muted">Interest</p>
                  <p className="font-semibold text-foreground">{interestRate}%</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted" />
                <div>
                  <p className="text-xs text-muted">Due Date</p>
                  <p className="font-semibold text-foreground">{loan.dueDate}</p>
                </div>
              </div>
            </div>

            {loan.progress !== undefined && (
              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-xs text-muted">Repayment Progress</p>
                  <p className="text-xs font-semibold text-foreground">{loan.progress}%</p>
                </div>
                <div className="w-full bg-muted-light rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${loan.progress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          <ChevronRight className="w-6 h-6 text-muted flex-shrink-0 ml-4" />
        </div>
      </div>

      {showDetail && <LoanDetailModal loan={loan} userType={userType} onClose={() => setShowDetail(false)} />}
    </>
  )
}
