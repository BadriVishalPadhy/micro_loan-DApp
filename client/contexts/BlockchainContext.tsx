import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';
import { LoanDetails, formatLoanForUI } from '@/utils/blockchain';

declare global {
  interface Window {
    ethereum: any;
  }
}

type BlockchainContextType = {
  isConnected: boolean;
  account: string | null;
  connectWallet: () => Promise<void>;
  loans: any[];
  loading: boolean;
  refreshLoans: () => Promise<void>;
  requestLoan: (amount: string, interestRate: string, dueDate: string, purpose: string) => Promise<void>;
};

const BlockchainContext = createContext<BlockchainContextType | undefined>(undefined);

export function BlockchainProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState<string | null>(null);
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);

  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        setProvider(provider);
        
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          const signer = await provider.getSigner();
          const address = await signer.getAddress();
          setAccount(address);
          setIsConnected(true);
          await loadLoans(provider, address);
        }
      }
    };

    checkConnection();

    // Handle account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', async (accounts: string[]) => {
        if (accounts.length > 0 && provider) {
          const signer = await provider.getSigner();
          const address = await signer.getAddress();
          setAccount(address);
          setIsConnected(true);
          await loadLoans(provider, address);
        } else {
          setAccount(null);
          setIsConnected(false);
          setLoans([]);
        }
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
      }
    };
  }, []);

  const connectWallet = async () => {
    if (!window.ethereum) {
      throw new Error('Please install MetaMask to use this feature');
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.send('eth_requestAccounts', []);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    
    setProvider(provider);
    setAccount(address);
    setIsConnected(true);
    await loadLoans(provider, address);
  };

  const loadLoans = async (provider: ethers.BrowserProvider, account: string) => {
    try {
      setLoading(true);
      const { getBorrowerLoans } = await import('@/utils/blockchain');
      const loans = await getBorrowerLoans(provider, account);
      setLoans(loans.map(formatLoanForUI));
    } catch (error) {
      console.error('Error loading loans:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshLoans = async () => {
    if (provider && account) {
      await loadLoans(provider, account);
    }
  };

  const requestLoan = async (amount: string, interestRate: string, dueDate: string, purpose: string) => {
    if (!provider) throw new Error('Provider not initialized');
    
    const { requestLoan } = await import('@/utils/blockchain');
    const signer = await provider.getSigner();
    
    const tx = await requestLoan(signer, amount, interestRate, dueDate, purpose);
    await tx.wait();
    
    // Refresh loans after successful request
    if (account) {
      await loadLoans(provider, account);
    }
  };

  return (
    <BlockchainContext.Provider
      value={{
        isConnected,
        account,
        connectWallet,
        loans,
        loading,
        refreshLoans,
        requestLoan,
      }}
    >
      {children}
    </BlockchainContext.Provider>
  );
}

export function useBlockchain() {
  const context = useContext(BlockchainContext);
  if (context === undefined) {
    throw new Error('useBlockchain must be used within a BlockchainProvider');
  }
  return context;
}
