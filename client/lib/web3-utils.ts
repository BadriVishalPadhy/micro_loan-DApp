import { parseEther, formatEther } from "ethers"

export const formatAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export const formatBalance = (balance: string | bigint) => {
  return Number.parseFloat(formatEther(balance)).toFixed(4)
}

export const parseAmount = (amount: string) => {
  return parseEther(amount)
}

export const getLoanStatus = (status: number) => {
  const statuses: Record<number, string> = {
    0: "Requested",
    1: "Funded",
    2: "Withdrawn",
    3: "Repaid",
    4: "Defaulted",
  }
  return statuses[status] || "Unknown"
}

export const calculateInterestRate = (principal: bigint, repayment: bigint) => {
  if (principal === 0n) return 0
  return Number(((repayment - principal) * 100n) / principal)
}
