import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { BrowserProvider, ethers } from 'ethers';
import { LoanDetails, formatLoanForUI, calculateRepayment } from '@/utils/blockchain';

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
  requestLoan: (principal: string, interestRate: string, dueDate: string) => Promise<void>;
};

interface EthereumError extends Error {
  code: number;
  message: string;
}

const BlockchainContext = createContext<BlockchainContextType | undefined>(undefined);

const CHAIN_ID = 11155111; // Sepolia chain ID
const CHAIN_ID_HEX = '0xaa36a7';

export function BlockchainProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState<string | null>(null);
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);

  function isEthereumError(error: unknown): error is EthereumError {
    return (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      "message" in error
    );
  }

  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        const provider = new BrowserProvider(window.ethereum);
        
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          const signer = await provider.getSigner();
          const address = await signer.getAddress();
          
          const network = await provider.getNetwork();
          if (Number(network.chainId) === CHAIN_ID) {
            setProvider(provider);
            setAccount(address);
            setIsConnected(true);
            await loadLoans(provider, address);
          }
        }
      }
    };

    checkConnection();

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', async (accounts: string[]) => {
        if (accounts.length > 0) {
          const provider = new BrowserProvider(window.ethereum);
          const network = await provider.getNetwork();
          
          if (Number(network.chainId) === CHAIN_ID) {
            const signer = await provider.getSigner();
            const address = await signer.getAddress();
            setProvider(provider);
            setAccount(address);
            setIsConnected(true);
            await loadLoans(provider, address);
          }
        } else {
          setAccount(null);
          setIsConnected(false);
          setLoans([]);
          setProvider(null);
        }
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, []);

  const connectWallet = async () => {
    if (!window.ethereum) {
      throw new Error('Please install MetaMask to use this feature');
    }

    try {
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      }) as string[];

      const provider = new BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();

      if (Number(network.chainId) !== CHAIN_ID) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: CHAIN_ID_HEX }],
          });
        } catch (switchError: unknown) {
          if (isEthereumError(switchError) && switchError.code === 4902) {
            try {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [
                  {
                    chainId: CHAIN_ID_HEX,
                    chainName: 'Sepolia Test Network',
                    nativeCurrency: {
                      name: 'SepoliaETH',
                      symbol: 'ETH',
                      decimals: 18
                    },
                    rpcUrls: ['https://sepolia.infura.io/v3/'],
                    blockExplorerUrls: ['https://sepolia.etherscan.io']
                  }
                ]
              });
            } catch (addError) {
              throw new Error('Failed to add Sepolia network to MetaMask');
            }
          } else {
            throw switchError;
          }
        }
      }

      const newProvider = new BrowserProvider(window.ethereum);
      const signer = await newProvider.getSigner();
      const address = await signer.getAddress();

      setProvider(newProvider);
      setAccount(address);
      setIsConnected(true);
      await loadLoans(newProvider, address);
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw error;
    }
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

  // Updated to calculate repayment from interest rate
  const requestLoan = async (principal: string, interestRate: string, dueDate: string) => {
    if (!provider) throw new Error('Provider not initialized');
    
    const { requestLoan, calculateRepayment } = await import('@/utils/blockchain');
    const signer = await provider.getSigner();
    
    // Calculate repayment from principal and interest rate
    const repayment = calculateRepayment(principal, parseFloat(interestRate));
    
    console.log('Requesting loan:', { principal, repayment, interestRate, dueDate });
    
    const tx = await requestLoan(signer, principal, repayment, dueDate);
    await tx.wait();
    
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