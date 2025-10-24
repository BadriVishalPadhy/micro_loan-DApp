import { http, createConfig } from "wagmi"
import { mainnet, sepolia } from "wagmi/chains"
import { injected, walletConnect } from "wagmi/connectors"

const connectors = [injected()]

if (process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID) {
  connectors.push(
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
    }  as any)  as any,
  )
}

export const config = createConfig({
  chains: [mainnet, sepolia],
  connectors,
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
})
