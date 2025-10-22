export function Stats() {
  return (
    <section id="stats" className="py-20 md:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="text-center">
            <p className="text-5xl font-bold text-primary mb-2">$2.5M</p>
            <p className="text-muted">Total Loans Funded</p>
          </div>
          <div className="text-center">
            <p className="text-5xl font-bold text-primary mb-2">15K+</p>
            <p className="text-muted">Active Users</p>
          </div>
          <div className="text-center">
            <p className="text-5xl font-bold text-primary mb-2">98%</p>
            <p className="text-muted">Repayment Rate</p>
          </div>
          <div className="text-center">
            <p className="text-5xl font-bold text-primary mb-2">12.5%</p>
            <p className="text-muted">Average Returns</p>
          </div>
        </div>
      </div>
    </section>
  )
}
