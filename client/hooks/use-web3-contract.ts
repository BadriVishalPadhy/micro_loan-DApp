"use client"

import { useAccount, useWriteContract } from "wagmi"
import { MICROLOAN_ABI } from "@/lib/contract-abi"

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`

export function useWeb3Contract() {
  const { address, isConnected } = useAccount()
  const { writeContract, isPending } = useWriteContract()

  const requestLoan = async (principal: bigint, interestRate: number, dueDate: number, purpose: string) => {
    if (!isConnected) throw new Error("Wallet not connected")

    return writeContract({
      address: CONTRACT_ADDRESS,
      abi: MICROLOAN_ABI,
      functionName: "requestLoan",
      args: [principal, BigInt(interestRate), BigInt(dueDate), purpose],
    })
  }

  const fundLoan = async (loanId: number, amount: bigint) => {
    if (!isConnected) throw new Error("Wallet not connected")

    return writeContract({
      address: CONTRACT_ADDRESS,
      abi: MICROLOAN_ABI,
      functionName: "fundLoan",
      args: [BigInt(loanId)],
      value: amount,
    })
  }

  const withdrawFunds = async (loanId: number) => {
    if (!isConnected) throw new Error("Wallet not connected")

    return writeContract({
      address: CONTRACT_ADDRESS,
      abi: MICROLOAN_ABI,
      functionName: "withdrawFunds",
      args: [BigInt(loanId)],
    })
  }

  const repayLoan = async (loanId: number, amount: bigint) => {
    if (!isConnected) throw new Error("Wallet not connected")

    return writeContract({
      address: CONTRACT_ADDRESS,
      abi: MICROLOAN_ABI,
      functionName: "repayLoan",
      args: [BigInt(loanId)],
      value: amount,
    })
  }

  return {
    address,
    isConnected,
    isPending,
    requestLoan,
    fundLoan,
    withdrawFunds,
    repayLoan,
  }
}
