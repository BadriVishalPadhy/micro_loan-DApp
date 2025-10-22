import { TrendingUp, Lock, Users, Zap } from "lucide-react"

const features = [
  {
    icon: TrendingUp,
    title: "Transparent Returns",
    description: "See exactly how your money works. Clear terms, predictable returns, and real-time tracking.",
  },
  {
    icon: Lock,
    title: "Secure & Decentralized",
    description: "Smart contracts ensure funds are held safely in escrow until all conditions are met.",
  },
  {
    icon: Users,
    title: "Direct Connection",
    description: "Connect directly with borrowers. No intermediaries, no hidden fees, just fair lending.",
  },
  {
    icon: Zap,
    title: "Instant Settlement",
    description: "Blockchain-powered transactions settle instantly. Get your returns when loans are repaid.",
  },
]

export function Features() {
  return (
    <section id="features" className="py-20 md:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="section-title text-4xl md:text-5xl mb-4">Why Choose MicroLoan?</h2>
          <p className="section-subtitle text-xl max-w-2xl mx-auto">
            A platform built for transparency, security, and mutual benefit
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div key={index} className="card">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
                    <p className="text-muted">{feature.description}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
