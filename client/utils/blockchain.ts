import { ethers } from 'ethers';

// CORRECTED ABI to match your actual MicroLoan contract
const LOAN_CONTRACT_ABI = [
  // Events
  'event LoanRequested(uint256 indexed loanId, address indexed borrower, uint256 principal, uint256 repayment, uint64 dueDate)',
  'event LoanFunded(uint256 indexed loanId, address indexed lender, uint256 amount)',
  'event LoanRepaid(uint256 indexed loanId, address indexed borrower, uint256 amount)',
  'event LoanWithdrawn(uint256 indexed loanId, address indexed borrower, uint256 amount)',
  'event LoanDefaulted(uint256 indexed loanId, address indexed borrower)',
  
  // Functions - CORRECTED to match your actual contract
  'function requestLoan(uint256 _principal, uint256 _repayment, uint64 _dueDate) external returns (uint256)',
  'function fundLoan(uint256 _loanId) external payable',
  'function withdrawToBorrower(uint256 _loanId) external',
  'function repayLoan(uint256 _loanId) external payable',
  'function markDefault(uint256 _loanId) external',
  'function getBorrowerLoans(address _borrower) external view returns (uint256[] memory)',
  'function getLenderLoans(address _lender) external view returns (uint256[] memory)',
  'function getRequestedLoans() external view returns (uint256[] memory)',
  'function getLoan(uint256 _loanId) external view returns (address borrower, address lender, uint256 principal, uint256 repayment, uint64 dueDate, uint8 status)',
  'function getTotalLoans() external view returns (uint256)',
  'function pause() external',
  'function unpause() external'
];

const LOAN_CONTRACT_ADDRESS = '0xcC7884d0BC84818dF3999c6742EA69cBD573bc40';

declare global {
  interface Window {
    ethereum: any;
  }
}

// Loan status enum matching Solidity
export enum LoanStatus {
  Requested = 0,
  Funded = 1,
  Withdrawn = 2,
  Repaid = 3,
  Defaulted = 4
}

export interface LoanDetails {
  id: number;
  borrower: string;
  lender: string;
  principal: bigint;
  repayment: bigint;
  dueDate: number;
  status: LoanStatus;
}

export const getLoanContract = (signerOrProvider: ethers.Signer | ethers.Provider) => {
  return new ethers.Contract(LOAN_CONTRACT_ADDRESS, LOAN_CONTRACT_ABI, signerOrProvider);
};

// Updated to match your contract: principal, repayment, dueDate
export const requestLoan = async (
  signer: ethers.Signer,
  principal: string,
  repayment: string,
  dueDate: string
): Promise<ethers.ContractTransactionResponse> => {
  try {
    console.log('=== Starting Loan Request ===');
    console.log('Input parameters:', { principal, repayment, dueDate });
    
    const loanContract = getLoanContract(signer);
    console.log('Contract address:', await loanContract.getAddress());
    
    // Parse inputs
    const principalWei = ethers.parseEther(principal);
    const repaymentWei = ethers.parseEther(repayment);
    const dueTimestamp = Math.floor(new Date(dueDate).getTime() / 1000);
    const currentTimestamp = Math.floor(Date.now() / 1000);
    
    console.log('Parsed parameters:', {
      principalWei: principalWei.toString(),
      repaymentWei: repaymentWei.toString(),
      dueTimestamp: dueTimestamp,
      currentTimestamp: currentTimestamp
    });

    // Client-side validations matching contract requirements
    if (principalWei <= 0n) {
      throw new Error('Principal must be greater than 0');
    }

    if (repaymentWei <= principalWei) {
      throw new Error('Repayment amount must be greater than principal');
    }

    if (dueTimestamp <= currentTimestamp) {
      throw new Error('Due date must be in the future');
    }

    const maxDueDate = currentTimestamp + (365 * 24 * 60 * 60);
    if (dueTimestamp > maxDueDate) {
      throw new Error('Due date cannot be more than 365 days in the future');
    }

    console.log('Calling requestLoan function...');
    
    const tx = await loanContract.requestLoan(
      principalWei,
      repaymentWei,
      dueTimestamp
    );
    
    console.log('Transaction sent:', tx.hash);
    return tx;
    
  } catch (error: any) {
    console.error('=== Error in requestLoan ===');
    console.error('Error details:', error);
    
    if (error.message?.includes('user rejected')) {
      throw new Error('Transaction was rejected by user');
    } else if (error.message?.includes('insufficient funds')) {
      throw new Error('Insufficient funds for gas');
    } else if (error.message?.includes('Pausable: paused') || error.message?.includes('Contract is paused')) {
      throw new Error('Contract is currently paused');
    } else if (error.code === 'CALL_EXCEPTION') {
      throw new Error(
        'Transaction reverted by contract. Possible reasons:\n' +
        '1. Contract is paused\n' +
        '2. Principal must be greater than 0\n' +
        '3. Repayment must exceed principal\n' +
        '4. Due date must be in the future\n' +
        '5. Due date cannot be more than 365 days away\n\n' +
        'Check transaction on Sepolia Etherscan for details.'
      );
    } else {
      throw error;
    }
  }
};

// Helper function to calculate repayment from interest rate
export const calculateRepayment = (principal: string, interestRate: number): string => {
  const principalNum = parseFloat(principal);
  const repaymentNum = principalNum * (1 + interestRate / 100);
  return repaymentNum.toFixed(6);
};

export const getBorrowerLoans = async (provider: ethers.BrowserProvider, address: string): Promise<LoanDetails[]> => {
  try {
    console.log('Fetching loans for address:', address);
    
    const signer = await provider.getSigner();
    const loanContract = getLoanContract(signer);
    
    let loanIds;
    try {
      loanIds = await loanContract.getBorrowerLoans(address);
      console.log('Raw loan IDs from contract:', loanIds);
      console.log('Loan IDs as numbers:', loanIds.map((id: any) => Number(id)));
    } catch (error) {
      console.error('Error getting borrower loans:', error);
      return [];
    }
    
    const loans: LoanDetails[] = [];
    
    for (const loanId of loanIds) {
      const numericLoanId = Number(loanId);
      
      try {
        console.log(`Fetching details for loan ID: ${numericLoanId}`);
        // Use getLoan instead of getLoanDetails
        const loan = await loanContract.getLoan(loanId);
        
        console.log(`Raw loan data for ID ${numericLoanId}:`, {
          borrower: loan[0],
          lender: loan[1],
          principal: loan[2]?.toString(),
          repayment: loan[3]?.toString(),
          dueDate: loan[4]?.toString(),
          status: loan[5]
        });
        
        loans.push({
          id: numericLoanId,
          borrower: loan[0],
          lender: loan[1],
          principal: loan[2],
          repayment: loan[3],
          dueDate: Number(loan[4]),
          status: loan[5] as LoanStatus
        });
        
        console.log(`Successfully loaded loan ${numericLoanId}`);
      } catch (error: any) {
        console.error(`Error loading loan ${numericLoanId}:`, error.message);
      }
    }
    
    console.log('Total loaded loans:', loans.length);
    return loans;
  } catch (error) {
    console.error('Error in getBorrowerLoans:', error);
    return [];
  }
};

export const formatLoanForUI = (loan: LoanDetails) => {
  console.log('Formatting loan for UI:', loan);
  
  // Map status enum to string
  const statusMap = {
    [LoanStatus.Requested]: 'Requested',
    [LoanStatus.Funded]: 'Funded',
    [LoanStatus.Withdrawn]: 'Withdrawn',
    [LoanStatus.Repaid]: 'Repaid',
    [LoanStatus.Defaulted]: 'Defaulted'
  };
  
  const status = statusMap[loan.status] || 'Unknown';
  const dueDate = new Date(loan.dueDate * 1000).toISOString().split('T')[0];
  
  // Calculate interest rate from principal and repayment
  const principalNum = parseFloat(ethers.formatEther(loan.principal));
  const repaymentNum = parseFloat(ethers.formatEther(loan.repayment));
  const interestRate = principalNum > 0 ? ((repaymentNum - principalNum) / principalNum * 100).toFixed(2) : '0.00';
  
  const formattedLoan = {
    id: loan.id,
    principal: principalNum,
    repayment: repaymentNum,
    interestRate: parseFloat(interestRate),
    dueDate,
    status,
    lender: loan.lender === ethers.ZeroAddress ? null : `${loan.lender.substring(0, 6)}...${loan.lender.substring(38)}`,
    borrower: `${loan.borrower.substring(0, 6)}...${loan.borrower.substring(38)}`,
    progress: loan.status === LoanStatus.Repaid ? 100 : 0
  };
  
  console.log('Formatted loan:', formattedLoan);
  return formattedLoan;
};

// Additional helper functions for other contract interactions
export const fundLoan = async (
  signer: ethers.Signer,
  loanId: number,
  amount: string
): Promise<ethers.ContractTransactionResponse> => {
  const loanContract = getLoanContract(signer);
  const amountWei = ethers.parseEther(amount);
  
  return await loanContract.fundLoan(loanId, { value: amountWei });
};

export const withdrawLoan = async (
  signer: ethers.Signer,
  loanId: number
): Promise<ethers.ContractTransactionResponse> => {
  const loanContract = getLoanContract(signer);
  return await loanContract.withdrawToBorrower(loanId);
};

export const repayLoan = async (
  signer: ethers.Signer,
  loanId: number,
  amount: string
): Promise<ethers.ContractTransactionResponse> => {
  const loanContract = getLoanContract(signer);
  const amountWei = ethers.parseEther(amount);
  
  return await loanContract.repayLoan(loanId, { value: amountWei });
};

export const getRequestedLoans = async (provider: ethers.BrowserProvider): Promise<LoanDetails[]> => {
  const signer = await provider.getSigner();
  const loanContract = getLoanContract(signer);
  
  const loanIds = await loanContract.getRequestedLoans();
  const loans: LoanDetails[] = [];
  
  for (const loanId of loanIds) {
    try {
      const loan = await loanContract.getLoan(loanId);
      loans.push({
        id: Number(loanId),
        borrower: loan[0],
        lender: loan[1],
        principal: loan[2],
        repayment: loan[3],
        dueDate: Number(loan[4]),
        status: loan[5] as LoanStatus
      });
    } catch (error) {
      console.error(`Error loading requested loan ${loanId}:`, error);
    }
  }
  
  return loans;
};

export const getLenderLoans = async (provider: ethers.BrowserProvider, address: string): Promise<LoanDetails[]> => {
  try {
    const signer = await provider.getSigner();
    const loanContract = getLoanContract(signer);
    
    const loanIds = await loanContract.getLenderLoans(address);
    const loans: LoanDetails[] = [];
    
    for (const loanId of loanIds) {
      try {
        const loan = await loanContract.getLoan(loanId);
        loans.push({
          id: Number(loanId),
          borrower: loan[0],
          lender: loan[1],
          principal: loan[2],
          repayment: loan[3],
          dueDate: Number(loan[4]),
          status: loan[5] as LoanStatus
        });
      } catch (error) {
        console.error(`Error loading lender loan ${loanId}:`, error);
      }
    }
    
    return loans;
  } catch (error) {
    console.error('Error in getLenderLoans:', error);
    return [];
  }
};