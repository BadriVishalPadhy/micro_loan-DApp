import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { Web3Provider } from "@/components/web3-provider"
import { AuthProvider } from "@/lib/auth-context"
import { Navigation } from "@/components/navigation"

const geistSans = Geist({ subsets: ["latin"] })
const geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MicroLoan - Decentralized Lending Platform",
  description: "Empowering artisans and small businesses with accessible microloans",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.className} bg-background text-foreground`}>
        <Web3Provider>
          <AuthProvider>
            <Navigation />
            {children}
          </AuthProvider>
        </Web3Provider>
      </body>
    </html>
  )
}
