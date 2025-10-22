// MicroLoan Smart Contract ABI
export const MICROLOAN_ABI = [
  {
    inputs: [
      { name: "principal", type: "uint256" },
      { name: "interestRate", type: "uint256" },
      { name: "dueDate", type: "uint256" },
      { name: "purpose", type: "string" },
    ],
    name: "requestLoan",
    outputs: [{ name: "loanId", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "loanId", type: "uint256" }],
    name: "fundLoan",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [{ name: "loanId", type: "uint256" }],
    name: "withdrawFunds",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "loanId", type: "uint256" }],
    name: "repayLoan",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [{ name: "loanId", type: "uint256" }],
    name: "getLoanDetails",
    outputs: [
      { name: "borrower", type: "address" },
      { name: "lender", type: "address" },
      { name: "principal", type: "uint256" },
      { name: "repayment", type: "uint256" },
      { name: "dueDate", type: "uint256" },
      { name: "status", type: "uint8" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getAvailableLoans",
    outputs: [{ name: "loanIds", type: "uint256[]" }],
    stateMutability: "view",
    type: "function",
  },
] as const
