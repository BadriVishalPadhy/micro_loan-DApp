"use client"

import { useState, useEffect } from "react"
import { Plus, TrendingUp, Clock, CheckCircle2, AlertCircle, AlertCircleIcon } from "lucide-react"
import { RequestLoanModal } from "./request-loan-modal"
import { LoanCard } from "./loan-card"
import { useBlockchain } from "@/contexts/BlockchainContext"
import { ethers } from 'ethers'

export function BorrowerDashboard() {
  const [showRequestModal, setShowRequestModal] = useState(false)
  const { isConnected, connectWallet, loans, loading, account } = useBlockchain()
  const [stats, setStats] = useState([
    {
      label: "Total Borrowed",
      value: "$0",
      icon: TrendingUp,
      color: "text-primary",
    },
    {
      label: "Active Loans",
      value: "0",
      icon: Clock,
      color: "text-warning",
    },
    {
      label: "Repaid",
      value: "$0",
      icon: CheckCircle2,
      color: "text-success",
    },
    {
      label: "Repayment Rate",
      value: "0%",
      icon: AlertCircle,
      color: "text-muted",
    },
  ])

  useEffect(() => {
    if (isConnected && loans.length > 0) {
      const totalBorrowed = loans.reduce((sum, loan) => sum + loan.principal, 0);
      const activeLoans = loans.filter(loan => 
        loan.status === 'Requested' || loan.status === 'Funded' || loan.status === 'Withdrawn'
      ).length;
      const repaidLoans = loans.filter(loan => loan.status === 'Repaid');
      const totalRepaid = repaidLoans.reduce((sum, loan) => sum + loan.principal, 0);
      const repaymentRate = loans.length > 0 
        ? Math.round((repaidLoans.length / loans.length) * 100) 
        : 0;

      setStats([
        {
          ...stats[0],
          value: `$${totalBorrowed.toLocaleString()}`,
        },
        {
          ...stats[1],
          value: activeLoans.toString(),
        },
        {
          ...stats[2],
          value: `$${totalRepaid.toLocaleString()}`,
        },
        {
          ...stats[3],
          value: `${repaymentRate}%`,
          color: repaymentRate === 100 ? 'text-success' : 
                 repaymentRate >= 50 ? 'text-warning' : 'text-error'
        },
      ]);
    }
  }, [loans, isConnected])

  const handleConnectWallet = async () => {
    try {
      await connectWallet();
    } catch (error) {
      console.error('Error connecting wallet:', error);
      // You might want to show an error toast here
    }
  };

  if (!isConnected) {
    return (
      <section className="py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-card p-8 rounded-lg shadow-sm border">
            <h1 className="text-3xl font-bold text-foreground mb-4">Connect Your Wallet</h1>
            <p className="text-muted-foreground mb-8">Connect your MetaMask wallet to view and manage your loans</p>
            <button 
              onClick={handleConnectWallet}
              className="btn-primary inline-flex items-center gap-2 px-6 py-3 text-lg"
            >
              <img src="/metamask-logo.svg" alt="MetaMask" className="w-6 h-6" />
              Connect MetaMask
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Borrower Dashboard</h1>
            <p className="text-muted">
              Connected as: {`${account?.substring(0, 6)}...${account?.substring(38)}`}
            </p>
          </div>
          <button 
            onClick={handleConnectWallet}
            className="btn-secondary inline-flex items-center gap-2 text-sm"
          >
            <img src="/metamask-logo.svg" alt="MetaMask" className="w-4 h-4" />
            Switch Account
          </button>
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
          <button 
            onClick={() => setShowRequestModal(true)} 
            className="btn-primary inline-flex items-center gap-2"
            disabled={loading}
          >
            <Plus size={20} />
            {loading ? 'Loading...' : 'Request New Loan'}
          </button>
        </div>

        {/* Loans List */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-foreground">Your Loans</h2>
            <button 
              onClick={() => window.location.reload()} 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              disabled={loading}
            >
              Refresh
            </button>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : loans.length === 0 ? (
            <div className="text-center py-12 border rounded-lg">
              <p className="text-muted-foreground">You don't have any loans yet.</p>
              <button 
                onClick={() => setShowRequestModal(true)}
                className="mt-4 btn-primary inline-flex items-center gap-2"
              >
                <Plus size={16} />
                Request Your First Loan
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {loans.map((loan) => (
                <LoanCard key={loan.id} loan={loan} userType="borrower" />
              ))}
            </div>
          )}
        </div>

        {/* Request Loan Modal */}
        {showRequestModal && <RequestLoanModal onClose={() => setShowRequestModal(false)} />}
      </div>
    </section>
  )
}
