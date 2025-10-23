"use client"

import { useState, useEffect } from "react"
import { DollarSign, TrendingDown, Clock, CheckCircle, RefreshCw } from "lucide-react"
import { LoanCard } from "./loan-card"
import { useBlockchain } from "@/contexts/BlockchainContext"
import { withdrawLoan, repayLoan, formatLoanForUI } from "@/utils/blockchain"
import { ethers } from "ethers"

export function BorrowerDashboard() {
  const { isConnected, account, connectWallet, loans, loading, refreshLoans } = useBlockchain()
  const [processing, setProcessing] = useState(false)

  // Calculate statistics
  const stats = {
    totalBorrowed: loans.reduce((sum, loan) => {
      if (loan.status === "Funded" || loan.status === "Withdrawn" || loan.status === "Repaid") {
        return sum + loan.principal
      }
      return sum
    }, 0),
    activeLoans: loans.filter(
      loan => loan.status === "Funded" || loan.status === "Withdrawn"
    ).length,
    pendingRequests: loans.filter(loan => loan.status === "Requested").length,
    repaidLoans: loans.filter(loan => loan.status === "Repaid").length,
  }

  // Handle withdraw
  const handleWithdraw = async (loanId: number) => {
    if (!window.ethereum || !account) {
      alert("Please connect your wallet first")
      return
    }

    try {
      setProcessing(true)
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      
      console.log(`Withdrawing loan ${loanId}`)
      
      const tx = await withdrawLoan(signer, loanId)
      console.log("Transaction sent:", tx.hash)
      
      // Wait for confirmation
      await tx.wait()
      console.log("Transaction confirmed!")
      
      // Refresh loans
      await refreshLoans()
      
      alert("Loan withdrawn successfully! The funds have been transferred to your wallet.")
    } catch (error: any) {
      console.error("Error withdrawing loan:", error)
      let errorMessage = "Error withdrawing loan"
      
      if (error.message?.includes("user rejected")) {
        errorMessage = "Transaction was rejected"
      } else if (error.message?.includes("Only borrower can withdraw")) {
        errorMessage = "Only the borrower can withdraw this loan"
      } else if (error.message?.includes("Loan is not funded")) {
        errorMessage = "Loan must be funded before withdrawal"
      } else if (error.message?.includes("Loan has expired")) {
        errorMessage = "Loan has expired and cannot be withdrawn"
      } else if (error.message) {
        errorMessage = error.message
      }
      
      alert(errorMessage)
    } finally {
      setProcessing(false)
    }
  }

  // Handle repay
  const handleRepay = async (loanId: number, amount: number) => {
    if (!window.ethereum || !account) {
      alert("Please connect your wallet first")
      return
    }

    try {
      setProcessing(true)
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      
      // Check balance
      const balance = await provider.getBalance(account)
      const amountWei = ethers.parseEther(amount.toString())
      
      if (balance < amountWei) {
        alert(`Insufficient balance. You need ${amount.toFixed(4)} ETH but only have ${ethers.formatEther(balance)} ETH`)
        setProcessing(false)
        return
      }
      
      console.log(`Repaying loan ${loanId} with ${amount} ETH`)
      
      const tx = await repayLoan(signer, loanId, amount.toString())
      console.log("Transaction sent:", tx.hash)
      
      // Wait for confirmation
      await tx.wait()
      console.log("Transaction confirmed!")
      
      // Refresh loans
      await refreshLoans()
      
      alert("Loan repaid successfully! The lender has received the repayment.")
    } catch (error: any) {
      console.error("Error repaying loan:", error)
      let errorMessage = "Error repaying loan"
      
      if (error.message?.includes("user rejected")) {
        errorMessage = "Transaction was rejected"
      } else if (error.message?.includes("Only borrower can repay")) {
        errorMessage = "Only the borrower can repay this loan"
      } else if (error.message?.includes("Loan is not withdrawn")) {
        errorMessage = "Loan must be withdrawn before repayment"
      } else if (error.message?.includes("Loan is past due date")) {
        errorMessage = "Loan is past due date and cannot be repaid normally"
      } else if (error.message?.includes("Must send exact repayment amount")) {
        errorMessage = "You must send the exact repayment amount"
      } else if (error.message?.includes("insufficient funds")) {
        errorMessage = "Insufficient funds for repayment + gas fees"
      } else if (error.message) {
        errorMessage = error.message
      }
      
      alert(errorMessage)
    } finally {
      setProcessing(false)
    }
  }

  const statsDisplay = [
    {
      label: "Total Borrowed",
      value: `${stats.totalBorrowed.toFixed(4)} ETH`,
      icon: DollarSign,
      color: "text-primary",
    },
    {
      label: "Active Loans",
      value: stats.activeLoans.toString(),
      icon: TrendingDown,
      color: "text-warning",
    },
    {
      label: "Pending Requests",
      value: stats.pendingRequests.toString(),
      icon: Clock,
      color: "text-muted",
    },
    {
      label: "Repaid Loans",
      value: stats.repaidLoans.toString(),
      icon: CheckCircle,
      color: "text-success",
    },
  ]

  // Categorize loans
  const requestedLoans = loans.filter(loan => loan.status === "Requested")
  const fundedLoans = loans.filter(loan => loan.status === "Funded")
  const withdrawnLoans = loans.filter(loan => loan.status === "Withdrawn")
  const completedLoans = loans.filter(loan => loan.status === "Repaid" || loan.status === "Defaulted")

  if (!isConnected) {
    return (
      <section className="py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">Borrower Dashboard</h1>
            <p className="text-muted mb-8">Connect your wallet to view and manage your loans</p>
            <button
              onClick={connectWallet}
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Connecting..." : "Connect Wallet"}
            </button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Borrower Dashboard</h1>
            <p className="text-muted">Manage your loan requests and repayments</p>
            {account && (
              <p className="text-sm text-muted mt-2">
                Connected: {account.substring(0, 6)}...{account.substring(38)}
              </p>
            )}
          </div>
          <button
            onClick={refreshLoans}
            disabled={loading || processing}
            className="btn btn-secondary flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          {statsDisplay.map((stat, index) => {
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

        {/* Loans Requiring Action */}
        {(fundedLoans.length > 0 || withdrawnLoans.length > 0) && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              Action Required ({fundedLoans.length + withdrawnLoans.length})
            </h2>
            <div className="space-y-4">
              {fundedLoans.map((loan) => (
                <LoanCard 
                  key={loan.id} 
                  loan={loan} 
                  userType="borrower"
                  onWithdraw={handleWithdraw}
                />
              ))}
              {withdrawnLoans.map((loan) => (
                <LoanCard 
                  key={loan.id} 
                  loan={loan} 
                  userType="borrower"
                  onRepay={handleRepay}
                />
              ))}
            </div>
          </div>
        )}

        {/* Pending Requests */}
        {requestedLoans.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              Pending Requests ({requestedLoans.length})
            </h2>
            <div className="space-y-4">
              {requestedLoans.map((loan) => (
                <LoanCard key={loan.id} loan={loan} userType="borrower" />
              ))}
            </div>
          </div>
        )}

        {/* Completed Loans */}
        {completedLoans.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              Completed Loans ({completedLoans.length})
            </h2>
            <div className="space-y-4">
              {completedLoans.map((loan) => (
                <LoanCard key={loan.id} loan={loan} userType="borrower" />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {loans.length === 0 && !loading && (
          <div className="card text-center py-12">
            <p className="text-muted mb-4">You don't have any loans yet.</p>
            <p className="text-sm text-muted">Request a loan to get started!</p>
          </div>
        )}

        {/* Loading State */}
        {loading && loans.length === 0 && (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted">Loading your loans...</p>
          </div>
        )}
      </div>
    </section>
  )
}