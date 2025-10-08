// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title MicroLoan
 * @dev A decentralized micro-lending platform for artisans
 * @notice This contract manages the complete loan lifecycle: request, fund, withdraw, repay, default
 */
contract MicroLoan {
    // Loan status enumeration
    enum LoanStatus {
        Requested,   // Loan has been requested by borrower
        Funded,      // Lender has funded the loan (escrowed)
        Withdrawn,   // Borrower has withdrawn the funds
        Repaid,      // Borrower has repaid the loan
        Defaulted    // Loan has defaulted (past due date without repayment)
    }

    // Loan structure
    struct Loan {
        address borrower;        // Address of the borrower
        address lender;          // Address of the lender (zero until funded)
        uint256 principal;       // Amount borrowed
        uint256 repayment;       // Total amount to repay (principal + fee)
        uint64 dueDate;          // Unix timestamp when loan is due
        LoanStatus status;       // Current status of the loan
    }

    // State variables
    mapping(uint256 => Loan) public loans;
    uint256 public loanCounter;
    bool public paused;
    address public admin;

    // Events
    event LoanRequested(
        uint256 indexed loanId,
        address indexed borrower,
        uint256 principal,
        uint256 repayment,
        uint64 dueDate
    );

    event LoanFunded(
        uint256 indexed loanId,
        address indexed lender,
        uint256 amount
    );

    event LoanWithdrawn(
        uint256 indexed loanId,
        address indexed borrower,
        uint256 amount
    );

    event LoanRepaid(
        uint256 indexed loanId,
        address indexed borrower,
        uint256 amount
    );

    event LoanDefaulted(
        uint256 indexed loanId,
        address indexed borrower
    );

    event ContractPaused(address indexed admin);
    event ContractUnpaused(address indexed admin);

    // Modifiers
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this");
        _;
    }

    modifier whenNotPaused() {
        require(!paused, "Contract is paused");
        _;
    }

    modifier loanExists(uint256 _loanId) {
        require(_loanId < loanCounter, "Loan does not exist");
        _;
    }

    // Constructor
    constructor() {
        admin = msg.sender;
        loanCounter = 0;
        paused = false;
    }

    /**
     * @dev Request a new loan
     * @param _principal Amount to borrow (in wei)
     * @param _repayment Total amount to repay (principal + fee)
     * @param _dueDate Unix timestamp when loan must be repaid
     */
    function requestLoan(
        uint256 _principal,
        uint256 _repayment,
        uint64 _dueDate
    ) external whenNotPaused returns (uint256) {
        require(_principal > 0, "Principal must be greater than 0");
        require(_repayment > _principal, "Repayment must exceed principal");
        require(_dueDate > block.timestamp, "Due date must be in the future");
        require(_dueDate <= block.timestamp + 365 days, "Due date too far in future");

        uint256 loanId = loanCounter;

        loans[loanId] = Loan({
            borrower: msg.sender,
            lender: address(0),
            principal: _principal,
            repayment: _repayment,
            dueDate: _dueDate,
            status: LoanStatus.Requested
        });

        loanCounter++;

        emit LoanRequested(loanId, msg.sender, _principal, _repayment, _dueDate);

        return loanId;
    }

    /**
     * @dev Fund a requested loan
     * @param _loanId ID of the loan to fund
     */
    function fundLoan(uint256 _loanId)
        external
        payable
        whenNotPaused
        loanExists(_loanId)
    {
        Loan storage loan = loans[_loanId];

        require(loan.status == LoanStatus.Requested, "Loan is not in Requested status");
        require(msg.value == loan.principal, "Must send exact principal amount");
        require(msg.sender != loan.borrower, "Borrower cannot fund their own loan");
        require(block.timestamp < loan.dueDate, "Loan request has expired");

        loan.lender = msg.sender;
        loan.status = LoanStatus.Funded;

        emit LoanFunded(_loanId, msg.sender, msg.value);
    }

    /**
     * @dev Withdraw funded loan (borrower only)
     * @param _loanId ID of the loan to withdraw
     */
    function withdrawToBorrower(uint256 _loanId)
        external
        whenNotPaused
        loanExists(_loanId)
    {
        Loan storage loan = loans[_loanId];

        require(msg.sender == loan.borrower, "Only borrower can withdraw");
        require(loan.status == LoanStatus.Funded, "Loan is not funded");
        require(block.timestamp < loan.dueDate, "Loan has expired");

        loan.status = LoanStatus.Withdrawn;

        uint256 amount = loan.principal;

        emit LoanWithdrawn(_loanId, msg.sender, amount);

        // Transfer funds to borrower
        (bool success, ) = payable(loan.borrower).call{value: amount}("");
        require(success, "Transfer to borrower failed");
    }

    /**
     * @dev Repay a loan
     * @param _loanId ID of the loan to repay
     */
    function repayLoan(uint256 _loanId)
        external
        payable
        whenNotPaused
        loanExists(_loanId)
    {
        Loan storage loan = loans[_loanId];

        require(msg.sender == loan.borrower, "Only borrower can repay");
        require(loan.status == LoanStatus.Withdrawn, "Loan is not withdrawn");
        require(block.timestamp <= loan.dueDate, "Loan is past due date");
        require(msg.value == loan.repayment, "Must send exact repayment amount");

        loan.status = LoanStatus.Repaid;

        emit LoanRepaid(_loanId, msg.sender, msg.value);

        // Transfer repayment to lender
        (bool success, ) = payable(loan.lender).call{value: msg.value}("");
        require(success, "Transfer to lender failed");
    }

    /**
     * @dev Mark a loan as defaulted (after due date)
     * @param _loanId ID of the loan to mark as defaulted
     */
    function markDefault(uint256 _loanId)
        external
        loanExists(_loanId)
    {
        Loan storage loan = loans[_loanId];

        require(loan.status == LoanStatus.Withdrawn, "Loan is not withdrawn");
        require(block.timestamp > loan.dueDate, "Due date has not passed");

        loan.status = LoanStatus.Defaulted;

        emit LoanDefaulted(_loanId, loan.borrower);
    }

    /**
     * @dev Get loan details
     * @param _loanId ID of the loan
     */
    function getLoan(uint256 _loanId)
        external
        view
        loanExists(_loanId)
        returns (
            address borrower,
            address lender,
            uint256 principal,
            uint256 repayment,
            uint64 dueDate,
            LoanStatus status
        )
    {
        Loan storage loan = loans[_loanId];
        return (
            loan.borrower,
            loan.lender,
            loan.principal,
            loan.repayment,
            loan.dueDate,
            loan.status
        );
    }

    /**
     * @dev Get all loan IDs for a borrower
     * @param _borrower Address of the borrower
     */
    function getBorrowerLoans(address _borrower)
        external
        view
        returns (uint256[] memory)
    {
        uint256 count = 0;

        // Count loans
        for (uint256 i = 0; i < loanCounter; i++) {
            if (loans[i].borrower == _borrower) {
                count++;
            }
        }

        // Populate array
        uint256[] memory borrowerLoans = new uint256[](count);
        uint256 index = 0;

        for (uint256 i = 0; i < loanCounter; i++) {
            if (loans[i].borrower == _borrower) {
                borrowerLoans[index] = i;
                index++;
            }
        }

        return borrowerLoans;
    }

    /**
     * @dev Get all loan IDs for a lender
     * @param _lender Address of the lender
     */
    function getLenderLoans(address _lender)
        external
        view
        returns (uint256[] memory)
    {
        uint256 count = 0;

        // Count loans
        for (uint256 i = 0; i < loanCounter; i++) {
            if (loans[i].lender == _lender) {
                count++;
            }
        }

        // Populate array
        uint256[] memory lenderLoans = new uint256[](count);
        uint256 index = 0;

        for (uint256 i = 0; i < loanCounter; i++) {
            if (loans[i].lender == _lender) {
                lenderLoans[index] = i;
                index++;
            }
        }

        return lenderLoans;
    }

    /**
     * @dev Get all requested (unfunded) loans
     */
    function getRequestedLoans()
        external
        view
        returns (uint256[] memory)
    {
        uint256 count = 0;

        // Count requested loans
        for (uint256 i = 0; i < loanCounter; i++) {
            if (loans[i].status == LoanStatus.Requested && block.timestamp < loans[i].dueDate) {
                count++;
            }
        }

        // Populate array
        uint256[] memory requestedLoans = new uint256[](count);
        uint256 index = 0;

        for (uint256 i = 0; i < loanCounter; i++) {
            if (loans[i].status == LoanStatus.Requested && block.timestamp < loans[i].dueDate) {
                requestedLoans[index] = i;
                index++;
            }
        }

        return requestedLoans;
    }

    /**
     * @dev Pause the contract (admin only)
     */
    function pause() external onlyAdmin {
        paused = true;
        emit ContractPaused(msg.sender);
    }

    /**
     * @dev Unpause the contract (admin only)
     */
    function unpause() external onlyAdmin {
        paused = false;
        emit ContractUnpaused(msg.sender);
    }

    /**
     * @dev Get total number of loans
     */
    function getTotalLoans() external view returns (uint256) {
        return loanCounter;
    }
}
