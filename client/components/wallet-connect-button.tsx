"use client"

import { useAccount, useConnect, useDisconnect } from "wagmi"
import { formatAddress } from "@/lib/web3-utils"
import { Wallet, LogOut, AlertCircle } from "lucide-react"
import { useMemo } from "react"

export function WalletConnectButton() {
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()

  const filteredConnectors = useMemo(() => {
    return connectors.filter(connector => connector.id !== "injected") || []
  }, [connectors])

  if (filteredConnectors.length === 0) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-lg">
        <AlertCircle size={16} className="text-yellow-600" />
        <span className="text-xs text-yellow-600">Configure WalletConnect</span>
      </div>
    )
  }

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <div className="px-4 py-2 bg-primary/10 rounded-lg">
          <p className="text-sm font-mono text-primary">{formatAddress(address)}</p>
        </div>
        <button
          onClick={() => disconnect()}
          className="p-2 hover:bg-muted-light rounded-lg transition"
          aria-label="Disconnect wallet"
        >
          <LogOut size={20} className="" />
        </button>
      </div>
    )
  }

  return (
    <div className="flex gap-2">
      {filteredConnectors.map((connector) => (
        <button
          key={connector.uid}
          onClick={() => connect({ connector })}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
        >
          <Wallet size={18} />
          Connect {connector.name}
        </button>
      ))}
    </div>
  )
}
