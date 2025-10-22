const steps = [
  {
    number: "1",
    title: "Request or Browse",
    description: "Borrowers request loans with clear terms. Lenders browse available opportunities.",
  },
  {
    number: "2",
    title: "Fund or Apply",
    description: "Lenders fund loans they believe in. Borrowers receive funds in escrow.",
  },
  {
    number: "3",
    title: "Withdraw & Use",
    description: "Borrowers withdraw funds to grow their business. Lenders earn interest.",
  },
  {
    number: "4",
    title: "Repay & Earn",
    description: "Borrowers repay on schedule. Lenders receive principal + interest automatically.",
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 md:py-32 bg-muted-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="section-title text-4xl md:text-5xl mb-4">How It Works</h2>
          <p className="section-subtitle text-xl max-w-2xl mx-auto">
            A simple, transparent process for both borrowers and lenders
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="card">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                    {step.number}
                  </div>
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-primary/20"></div>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-muted text-sm">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
