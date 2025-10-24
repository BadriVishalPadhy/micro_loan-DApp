"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { useBlockchain } from "@/contexts/BlockchainContext"

interface RequestLoanModalProps {
  onClose: () => void
}

export function RequestLoanModal({ onClose }: RequestLoanModalProps) {
  const { requestLoan, refreshLoans } = useBlockchain()
  const [formData, setFormData] = useState({
    principal: "",
    interestRate: "10", // Default to 10%
    dueDate: "",
    purpose: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form
    if (!formData.principal || !formData.interestRate || !formData.dueDate || !formData.purpose) {
      setError("Please fill in all fields")
      return
    }
    
    if (parseFloat(formData.principal) <= 0) {
      setError("Loan amount must be greater than 0")
      return
    }
    
    if (parseFloat(formData.interestRate) <= 0) {
      setError("Interest rate must be greater than 0")
      return
    }
    
    const dueDate = new Date(formData.dueDate)
    if (dueDate < new Date()) {
      setError("Due date must be in the future")
      return
    }
    
    try {
      setIsSubmitting(true)
      setError(null)
      
      await requestLoan(
        formData.principal,
        formData.interestRate,
        formData.dueDate,
      )
      
      // Refresh the loans list
      await refreshLoans()
      
      // Close the modal
      onClose()
    } catch (err: any) {
      console.error("Error requesting loan:", err)
      setError(err.message || "Failed to request loan. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Calculate minimum date (tomorrow)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split('T')[0]
  
  // Calculate max date (1 year from now)
  const maxDate = new Date()
  maxDate.setFullYear(maxDate.getFullYear() + 1)
  const maxDateStr = maxDate.toISOString().split('T')[0]

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-foreground">Request a Loan</h2>
          <button 
            onClick={onClose} 
            className=" hover:text-foreground transition"
            disabled={isSubmitting}
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-error/10 border border-error/20 text-error p-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Loan Amount
            </label>
            <div className="relative">
              <input
                type="number"
                value={formData.principal}
                onChange={(e) => setFormData({ ...formData, principal: e.target.value })}
                className="w-full pl-4 pr-20 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="5000"
                step="0.01"
                required
                disabled={isSubmitting}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <span className="">ETH</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Interest Rate (%)
              <span className=" text-xs ml-2">APR</span>
            </label>
            <div className="relative">
              <input
                type="number"
                value={formData.interestRate}
                onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                className="w-full pl-4 pr-20 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="10"
                min="1"
                max="100"
                step="0.1"
                required
                disabled={isSubmitting}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <span className="">%</span>
              </div>
            </div>
            <p className="text-xs  mt-1">
              Total to repay: ${(parseFloat(formData.principal || '0') * (1 + parseFloat(formData.interestRate || '0') / 100)).toFixed(2)}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Due Date
              <span className=" text-xs ml-2">Loan term</span>
            </label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              min={minDate}
              max={maxDateStr}
              required
              disabled={isSubmitting}
            />
            <p className="text-xs  mt-1">
              Minimum loan term: 1 day, Maximum: 1 year
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Purpose
              <span className=" text-xs ml-2">What will you use the funds for?</span>
            </label>
            <textarea
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="I need funding for my small business to purchase inventory..."
              rows={3}
              required
              disabled={isSubmitting}
            />
            <p className="text-xs  mt-1">
              Be specific to attract lenders. 100-200 characters recommended.
            </p>
          </div>

          <div className="bg-muted/30 p-4 rounded-lg">
            <h4 className="font-medium text-sm mb-2">Loan Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="">Amount</span>
                <span>{parseFloat(formData.principal || '0').toLocaleString()}ETH</span>
              </div>
              <div className="flex justify-between">
                <span className="">Interest ({formData.interestRate || '0'}%)</span>
                <span>{(parseFloat(formData.principal || '0') * parseFloat(formData.interestRate || '0') / 100).toFixed(2)}ETH</span>
              </div>
              <div className="border-t border-border my-2"></div>
              <div className="flex justify-between font-medium">
                <span>Total to repay</span>
                <span>{(parseFloat(formData.principal || '0') * (1 + parseFloat(formData.interestRate || '0') / 100)).toFixed(2)}ETH</span>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-2">
            <button 
              type="button" 
              onClick={onClose} 
              className="btn-secondary flex-1 py-3"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary flex-1 py-3 flex items-center justify-center gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                'Submit Request'
              )}
            </button>
          </div>
          
          <p className="text-xs  text-center">
            By submitting, you agree to our Terms of Service and Privacy Policy.
          </p>
        </form>
      </div>
    </div>
  )
}
