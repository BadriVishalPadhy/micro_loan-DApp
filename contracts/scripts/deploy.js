const hre = require("hardhat");

async function main() {
  console.log("Deploying MicroLoan contract to Sepolia...");

  // Get the contract factory
  const MicroLoan = await hre.ethers.getContractFactory("MicroLoan");

  // Deploy the contract
  const microLoan = await MicroLoan.deploy();

  await microLoan.waitForDeployment();

  const address = await microLoan.getAddress();

  console.log("✅ MicroLoan deployed to:", address);
  console.log("📝 Save this address for your frontend!");
  console.log("\nVerify contract with:");
  console.log(`npx hardhat verify --network sepolia ${address}`);

  // Wait for a few block confirmations
  console.log("\nWaiting for block confirmations...");
  await microLoan.deploymentTransaction().wait(5);

  console.log("✅ Contract confirmed!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

