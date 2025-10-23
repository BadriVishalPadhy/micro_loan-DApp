"use client"

import { useState, useEffect } from "react"
import { DollarSign, TrendingUp, Wallet, Target, RefreshCw } from "lucide-react"
import { LoanCard } from "./loan-card"
import { useBlockchain } from "@/contexts/BlockchainContext"
import { getRequestedLoans, fundLoan, formatLoanForUI } from "@/utils/blockchain"
import { ethers } from "ethers"

export function LenderDashboard() {
  const { isConnected, account, connectWallet, loading } = useBlockchain()
  const [availableLoans, setAvailableLoans] = useState<any[]>([])
  const [myInvestments, setMyInvestments] = useState<any[]>([])
  const [loadingLoans, setLoadingLoans] = useState(false)
  const [stats, setStats] = useState({
    totalInvested: 0,
    activeInvestments: 0,
    totalReturns: 0,
    avgReturnRate: 0,
  })

  // Load available loans (Requested status)
  const loadAvailableLoans = async () => {
    if (!window.ethereum) return
    
    try {
      setLoadingLoans(true)
      const provider = new ethers.BrowserProvider(window.ethereum)
      const loans = await getRequestedLoans(provider)
      const formattedLoans = loans.map(formatLoanForUI)
      
      // Filter out loans from current user (can't fund own loans)
      const filteredLoans = account 
        ? formattedLoans.filter(loan => loan.borrower.toLowerCase() !== account.toLowerCase())
        : formattedLoans
      
      setAvailableLoans(filteredLoans)
    } catch (error) {
      console.error("Error loading available loans:", error)
    } finally {
      setLoadingLoans(false)
    }
  }

  // Load lender's investments
  const loadMyInvestments = async () => {
    if (!window.ethereum || !account) return
    
    try {
      setLoadingLoans(true)
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      
      // Import getLenderLoans from blockchain utils
      const { getLoanContract } = await import("@/utils/blockchain")
      const contract = getLoanContract(signer)
      
      const loanIds = await contract.getLenderLoans(account)
      const loans = []
      
      for (const loanId of loanIds) {
        try {
          const loan = await contract.getLoan(loanId)
          loans.push({
            id: Number(loanId),
            borrower: loan[0],
            lender: loan[1],
            principal: loan[2],
            repayment: loan[3],
            dueDate: Number(loan[4]),
            status: loan[5]
          })
        } catch (error) {
          console.error(`Error loading loan ${loanId}:`, error)
        }
      }
      
      const formattedLoans = loans.map(formatLoanForUI)
      setMyInvestments(formattedLoans)
      
      // Calculate stats
      calculateStats(formattedLoans)
    } catch (error) {
      console.error("Error loading investments:", error)
    } finally {
      setLoadingLoans(false)
    }
  }

  // Calculate statistics
  const calculateStats = (investments: any[]) => {
    const totalInvested = investments.reduce((sum, loan) => sum + loan.principal, 0)
    const activeInvestments = investments.filter(
      loan => loan.status === 'Funded' || loan.status === 'Withdrawn'
    ).length
    
    const repaidLoans = investments.filter(loan => loan.status === 'Repaid')
    const totalReturns = repaidLoans.reduce(
      (sum, loan) => sum + (loan.repayment - loan.principal), 
      0
    )
    
    const avgReturnRate = totalInvested > 0 
      ? (totalReturns / totalInvested) * 100 
      : 0

    setStats({
      totalInvested,
      activeInvestments,
      totalReturns,
      avgReturnRate,
    })
  }

  // Fund a loan
  const handleFundLoan = async (loanId: number, amount: number) => {
    if (!window.ethereum || !account) {
      alert("Please connect your wallet first")
      return
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      
      console.log(`Funding loan ${loanId} with ${amount} ETH`)
      
      const tx = await fundLoan(signer, loanId, amount.toString())
      console.log("Transaction sent:", tx.hash)
      
      // Wait for confirmation
      await tx.wait()
      console.log("Transaction confirmed!")
      
      // Refresh data
      await loadAvailableLoans()
      await loadMyInvestments()
      
      alert("Loan funded successfully!")
    } catch (error: any) {
      console.error("Error funding loan:", error)
      alert(`Error funding loan: ${error.message}`)
    }
  }

  // Load data on mount and when account changes
  useEffect(() => {
    if (isConnected && account) {
      loadAvailableLoans()
      loadMyInvestments()
    }
  }, [isConnected, account])

  // Refresh data
  const handleRefresh = async () => {
    await loadAvailableLoans()
    if (account) {
      await loadMyInvestments()
    }
  }

  const statsDisplay = [
    {
      label: "Total Invested",
      value: `${stats.totalInvested.toFixed(4)} ETH`,
      icon: DollarSign,
      color: "text-primary",
    },
    {
      label: "Active Investments",
      value: stats.activeInvestments.toString(),
      icon: Wallet,
      color: "text-warning",
    },
    {
      label: "Total Returns",
      value: `${stats.totalReturns.toFixed(4)} ETH`,
      icon: TrendingUp,
      color: "text-success",
    },
    {
      label: "Avg. Return Rate",
      value: `${stats.avgReturnRate.toFixed(2)}%`,
      icon: Target,
      color: "text-primary",
    },
  ]

  if (!isConnected) {
    return (
      <section className="py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">Lender Dashboard</h1>
            <p className="text-muted mb-8">Connect your wallet to view investment opportunities</p>
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
            <h1 className="text-4xl font-bold text-foreground mb-2">Lender Dashboard</h1>
            <p className="text-muted">Discover investment opportunities and grow your portfolio</p>
            {account && (
              <p className="text-sm text-muted mt-2">
                Connected: {account.substring(0, 6)}...{account.substring(38)}
              </p>
            )}
          </div>
          <button
            onClick={handleRefresh}
            disabled={loadingLoans}
            className="btn btn-secondary flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loadingLoans ? 'animate-spin' : ''}`} />
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

        {/* Available Loans */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            Available Loans ({availableLoans.length})
          </h2>
          
          {loadingLoans ? (
            <div className="text-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted">Loading available loans...</p>
            </div>
          ) : availableLoans.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-muted">No loans available for funding at the moment.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {availableLoans.map((loan) => (
                <LoanCard 
                  key={loan.id} 
                  loan={loan} 
                  userType="lender"
                  onFund={handleFundLoan}
                />
              ))}
            </div>
          )}
        </div>

        {/* My Investments */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-6">
            My Investments ({myInvestments.length})
          </h2>
          
          {loadingLoans ? (
            <div className="text-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted">Loading your investments...</p>
            </div>
          ) : myInvestments.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-muted">You haven't made any investments yet.</p>
              <p className="text-sm text-muted mt-2">Browse available loans above to get started!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {myInvestments.map((loan) => (
                <LoanCard 
                  key={loan.id} 
                  loan={loan} 
                  userType="lender"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}