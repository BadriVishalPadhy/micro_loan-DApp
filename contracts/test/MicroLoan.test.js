const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("MicroLoan", function () {
  let microLoan;
  let owner, borrower, lender;

  beforeEach(async function () {
    [owner, borrower, lender] = await ethers.getSigners();

    const MicroLoan = await ethers.getContractFactory("MicroLoan");
    microLoan = await MicroLoan.deploy();
    await microLoan.waitForDeployment();
  });

  it("Should request a loan", async function () {
    const principal = ethers.parseEther("0.01");
    const repayment = ethers.parseEther("0.011");
    const dueDate = Math.floor(Date.now() / 1000) + 86400 +86400 ; // 1 day

    await expect(
      microLoan.connect(borrower).requestLoan(principal, repayment, dueDate)
    ).to.emit(microLoan, "LoanRequested");

    const loan = await microLoan.getLoan(0);
    expect(loan.borrower).to.equal(borrower.address);
    expect(loan.principal).to.equal(principal);
  });

  it("Should fund a loan", async function () {
    const principal = ethers.parseEther("0.01");
    const repayment = ethers.parseEther("0.011");
    const dueDate = Math.floor(Date.now() / 1000) + 86400;

    await microLoan.connect(borrower).requestLoan(principal, repayment, dueDate);

    await expect(
      microLoan.connect(lender).fundLoan(0, { value: principal })
    ).to.emit(microLoan, "LoanFunded");

    const loan = await microLoan.getLoan(0);
    expect(loan.lender).to.equal(lender.address);
  });
});
