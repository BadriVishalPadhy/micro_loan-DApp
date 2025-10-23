import { useState } from 'react';
import { BrowserProvider, ethers } from 'ethers';

const CONTRACT_ADDRESS = '0xcC7884d0BC84818dF3999c6742EA69cBD573bc40';

const LOAN_CONTRACT_ABI = [
  'function getBorrowerLoans(address _borrower) external view returns (uint256[] memory)',
  'function getLoan(uint256 _loanId) external view returns (address borrower, address lender, uint256 principal, uint256 repayment, uint64 dueDate, uint8 status)'
];

export function LoanDebugger() {
  const [debug, setDebug] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const debugLoans = async () => {
    setLoading(true);
    const result: any = {
      timestamp: new Date().toISOString(),
      steps: []
    };

    try {
      if (!window.ethereum) {
        result.error = 'MetaMask not found';
        setDebug(result);
        setLoading(false);
        return;
      }

      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      result.steps.push({ step: 1, message: 'Connected', address });

      const contract = new ethers.Contract(CONTRACT_ADDRESS, LOAN_CONTRACT_ABI, signer);
      result.steps.push({ step: 2, message: 'Contract initialized', contractAddress: CONTRACT_ADDRESS });

      // Get loan IDs
      const loanIds = await contract.getBorrowerLoans(address);
      result.steps.push({ 
        step: 3, 
        message: 'Fetched loan IDs', 
        loanIds: loanIds.map((id: any) => id.toString()),
        count: loanIds.length 
      });

      // Get details for each loan
      const loans = [];
      for (let i = 0; i < loanIds.length; i++) {
        const loanId = loanIds[i];
        const numericId = Number(loanId);
        
        // Try to get details, but note if ID is 0
        if (numericId === 0) {
          result.steps.push({ 
            step: `4.${i + 1}`, 
            message: '⚠️ Loan ID is 0 - contract may use 1-based indexing or loan is invalid',
            loanId: numericId
          });
        }
        
        try {
          const details = await contract.getLoanDetails(loanId);
          
          const loanData = {
            id: loanId.toString(),
            borrower: details[0],
            lender: details[1],
            principal: ethers.formatEther(details[2]),
            repayment: ethers.formatEther(details[3]),
            dueDate: Number(details[4]),
            dueDateReadable: new Date(Number(details[4]) * 1000).toISOString(),
            isFunded: details[5],
            isWithdrawn: details[6],
            isRepaid: details[7]
          };
          
          loans.push(loanData);
          result.steps.push({ 
            step: `4.${i + 1}`, 
            message: `✅ Loaded loan ${loanId.toString()}`,
            loan: loanData
          });
        } catch (error: any) {
          result.steps.push({ 
            step: `4.${i + 1}`, 
            message: `❌ Error loading loan ${loanId.toString()}`,
            error: error.message,
            possibleReasons: [
              'Contract uses 1-based indexing (IDs start from 1, not 0)',
              'getLoanDetails function signature mismatch',
              'Loan with this ID does not exist',
              'Access control restrictions'
            ]
          });
        }
      }

      result.totalLoans = loans.length;
      result.loans = loans;
      result.success = true;

    } catch (error: any) {
      result.error = error.message;
      result.errorStack = error.stack;
    }

    setDebug(result);
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Loan Data Debugger</h2>
        
        <button
          onClick={debugLoans}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg disabled:opacity-50 font-semibold"
        >
          {loading ? 'Debugging...' : 'Debug Loan Data'}
        </button>

        {debug && (
          <div className="mt-6">
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h3 className="font-bold text-lg mb-2">Summary</h3>
              <div className="space-y-1 text-sm">
                <p><strong>Timestamp:</strong> {debug.timestamp}</p>
                <p><strong>Total Loans:</strong> {debug.totalLoans || 0}</p>
                <p><strong>Status:</strong> {debug.success ? '✅ Success' : '❌ Error'}</p>
                {debug.error && (
                  <p className="text-red-600"><strong>Error:</strong> {debug.error}</p>
                )}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-bold text-lg mb-2">Detailed Steps</h3>
              <pre className="whitespace-pre-wrap overflow-auto text-xs bg-white p-3 rounded border">
                {JSON.stringify(debug, null, 2)}
              </pre>
            </div>

            {debug.loans && debug.loans.length > 0 && (
              <div className="mt-4">
                <h3 className="font-bold text-lg mb-2">Loan Cards Preview</h3>
                <div className="grid gap-4">
                  {debug.loans.map((loan: any, idx: number) => (
                    <div key={idx} className="bg-white border-2 border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-bold text-lg">Loan #{loan.id}</h4>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          loan.isRepaid ? 'bg-green-100 text-green-700' :
                          !loan.isFunded ? 'bg-yellow-100 text-yellow-700' :
                          !loan.isWithdrawn ? 'bg-blue-100 text-blue-700' :
                          'bg-purple-100 text-purple-700'
                        }`}>
                          {loan.isRepaid ? 'Repaid' :
                           !loan.isFunded ? 'Requested' :
                           !loan.isWithdrawn ? 'Funded' : 'Withdrawn'}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-gray-600">Principal</p>
                          <p className="font-semibold">{loan.principal} ETH</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Repayment</p>
                          <p className="font-semibold">{loan.repayment} ETH</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Due Date</p>
                          <p className="font-semibold">{loan.dueDateReadable.split('T')[0]}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Lender</p>
                          <p className="font-semibold">
                            {loan.lender === ethers.ZeroAddress ? 'None' : 
                             `${loan.lender.substring(0, 6)}...${loan.lender.substring(38)}`}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}