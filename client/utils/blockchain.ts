import { ethers } from 'ethers';

// ABI for the LoanContract
const LOAN_CONTRACT_ABI = [
  // Events
  'event LoanRequested(uint256 loanId, address indexed borrower, uint256 amount, uint256 interestRate, uint256 dueDate, string purpose)',
  'event LoanFunded(uint256 loanId, address indexed lender, uint256 amount)',
  'event LoanRepaid(uint256 loanId, uint256 amount)',
  'event LoanWithdrawn(uint256 loanId, address indexed borrower, uint256 amount)',
  'event LoanDefaulted(uint256 loanId, uint256 amount)',
  
  // Functions
  'function requestLoan(uint256 amount, uint256 interestRate, uint256 dueDate, string memory purpose) external returns (uint256)',
  'function fundLoan(uint256 loanId) external payable',
  'function withdrawLoan(uint256 loanId) external',
  'function repayLoan(uint256 loanId) external payable',
  'function getBorrowerLoans(address borrower) external view returns (uint256[] memory)',
  'function getLoanDetails(uint256 loanId) external view returns (address, uint256, uint256, uint256, uint256, string memory, bool, bool, bool)'
];

// Replace with your deployed contract address
const LOAN_CONTRACT_ADDRESS = '0xYourContractAddress';

declare global {
  interface Window {
    ethereum: any;
  }
}

export interface LoanDetails {
  id: number;
  borrower: string;
  lender: string;
  principal: bigint;
  repayment: bigint;
  dueDate: number;
  purpose: string;
  isFunded: boolean;
  isWithdrawn: boolean;
  isRepaid: boolean;
}

export const connectWallet = async (): Promise<string> => {
  if (!window.ethereum) {
    throw new Error('Please install MetaMask to use this feature');
  }

  const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
  return accounts[0];
};

export const getLoanContract = (signer: ethers.Signer) => {
  return new ethers.Contract(LOAN_CONTRACT_ADDRESS, LOAN_CONTRACT_ABI, signer);
};

export const requestLoan = async (
  signer: ethers.Signer,
  amount: string,
  interestRate: string,
  dueDate: string,
  purpose: string
): Promise<ethers.ContractTransactionResponse> => {
  const loanContract = getLoanContract(signer);
  const dueTimestamp = Math.floor(new Date(dueDate).getTime() / 1000);
  
  return await loanContract.requestLoan(
    ethers.parseEther(amount),
    interestRate,
    dueTimestamp,
    purpose
  ) as ethers.ContractTransactionResponse;
};

export const getBorrowerLoans = async (provider: ethers.BrowserProvider, address: string): Promise<LoanDetails[]> => {
  const signer = await provider.getSigner();
  const loanContract = getLoanContract(signer);
  const loanIds = await loanContract.getBorrowerLoans(address);
  
  const loans: LoanDetails[] = [];
  
  for (const loanId of loanIds) {
    const loan = await loanContract.getLoanDetails(loanId);
    
    loans.push({
      id: Number(loanId),
      borrower: loan[0],
      lender: loan[1],
      principal: loan[2],
      repayment: loan[3],
      dueDate: Number(loan[4]),
      purpose: loan[5],
      isFunded: loan[6],
      isWithdrawn: loan[7],
      isRepaid: loan[8],
    });
  }
  
  return loans;
};

export const formatLoanForUI = (loan: LoanDetails) => {
  const status = loan.isRepaid ? 'Repaid' : 
                !loan.isFunded ? 'Requested' : 
                !loan.isWithdrawn ? 'Funded' : 'Withdrawn';
  
  const dueDate = new Date(loan.dueDate * 1000).toISOString().split('T')[0];
  
  return {
    id: loan.id,
    principal: parseFloat(ethers.formatEther(loan.principal)),
    repayment: parseFloat(ethers.formatEther(loan.repayment)),
    dueDate,
    status,
    lender: loan.lender === ethers.ZeroAddress ? null : `${loan.lender.substring(0, 6)}...${loan.lender.substring(38)}`,
    progress: loan.isRepaid ? 100 : 0,
    purpose: loan.purpose
  };
};
