import Link from "next/link"
import { ArrowRight } from "lucide-react"

export function CTA() {
  return (
    <section className="py-20 md:py-32 bg-gradient-to-r from-primary to-primary-dark text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-balance">Ready to Transform Lending?</h2>
        <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
          Join thousands of borrowers and lenders building a more equitable financial future.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/borrower"
            className="px-8 py-4 bg-white text-primary rounded-full font-semibold hover:bg-muted-light transition-colors inline-flex items-center justify-center gap-2"
          >
            Get Started as Borrower
            <ArrowRight size={20} />
          </Link>
          <Link
            href="/lender"
            className="px-8 py-4 bg-white/10 text-white rounded-full font-semibold hover:bg-white/20 transition-colors inline-flex items-center justify-center gap-2 border border-white/20"
          >
            Explore as Lender
            <ArrowRight size={20} />
          </Link>
        </div>
      </div>
    </section>
  )
}
