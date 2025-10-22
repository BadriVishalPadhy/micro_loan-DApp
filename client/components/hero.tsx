import Link from "next/link"
import { ArrowRight } from "lucide-react"

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-muted-light py-20 md:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="section-title text-5xl md:text-6xl">Finance Without the Middleman</h1>
              <p className="section-subtitle text-xl">
                Empower artisans and small businesses with accessible microloans. Connect directly with lenders on a
                transparent, decentralized platform.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/borrower" className="btn-primary inline-flex items-center justify-center gap-2">
                Request a Loan
                <ArrowRight size={20} />
              </Link>
              <Link href="/lender" className="btn-secondary inline-flex items-center justify-center gap-2">
                Start Investing
                <ArrowRight size={20} />
              </Link>
            </div>

            <div className="flex gap-8 pt-8 border-t border-border">
              <div>
                <p className="text-3xl font-bold text-primary">$2.5M+</p>
                <p className="text-muted">Loans Funded</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-primary">15K+</p>
                <p className="text-muted">Active Users</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-primary">98%</p>
                <p className="text-muted">Repayment Rate</p>
              </div>
            </div>
          </div>

          <div className="hidden md:block">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-light to-primary opacity-10 rounded-2xl blur-3xl"></div>
              <div className="relative bg-gradient-to-br from-primary-light to-primary rounded-2xl p-8 text-white">
                <div className="space-y-6">
                  <div className="bg-white/10 rounded-lg p-4 backdrop-blur">
                    <p className="text-sm text-white/70">Available Loans</p>
                    <p className="text-3xl font-bold">$847,500</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4 backdrop-blur">
                    <p className="text-sm text-white/70">Your Portfolio</p>
                    <p className="text-3xl font-bold">$125,000</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4 backdrop-blur">
                    <p className="text-sm text-white/70">Expected Returns</p>
                    <p className="text-3xl font-bold text-success">+12.5%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
