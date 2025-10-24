import Link from "next/link"
import { ArrowRight } from "lucide-react"

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-muted py-20 md:py-32">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-12">
          <div className="space-y-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">Finance Without the Middleman</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Empower artisans and small businesses with accessible microloans. Connect directly with lenders on a
              transparent, decentralized platform.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <Link href="/borrower" className="group">
              <div className="border border-border rounded-lg p-6 hover:border-primary hover:bg-muted transition-all">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-foreground">Request a Loan</h3>
                  <ArrowRight size={20} className="text-primary group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Access flexible microloans with transparent terms and competitive rates to grow your business.
                </p>
              </div>
            </Link>

            <Link href="/lender" className="group">
              <div className="border border-border rounded-lg p-6 hover:border-primary hover:bg-muted transition-all">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-foreground">Fund a Loan</h3>
                  <ArrowRight size={20} className="text-primary group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Invest in small businesses and earn competitive returns while supporting economic growth.
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
