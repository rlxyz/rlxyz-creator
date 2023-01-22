const { chainName } = require("./helpers/chain");
const { yellow, green, dim, cyan } = require("./helpers/logs");
const hardhat = require("hardhat");
const {
  name: deployContractName,
  deploy: deployParameters,
} = require("../production/testnet.json");

const runner = async () => {
  const { getNamedAccounts, deployments, getChainId, ethers } = hardhat;
  const { deploy } = deployments;
  const chainId = parseInt(await getChainId(), 10);
  const { deployer } = await getNamedAccounts();

  // 31337 is unit testing, 1337 is for coverage
  const isTestEnvironment = chainId === 31337 || chainId === 1337;

  const signer = await ethers.provider.getSigner(deployer);

  dim("\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
  dim(`${deployContractName} Contracts - Start Script`);
  dim("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n");
  dim(
    `network: ${chainName(chainId)} (${isTestEnvironment ? "local" : "remote"})`
  );
  dim(`deployer: ${deployer}`);

  cyan("\nDeploying NFT...");
  const creatorResult = await deploy(deployContractName, {
    args: [
      deployParameters.name,
      deployParameters.symbol,
      deployParameters.collectionSize,
      deployParameters.maxMintPerAddress,
      deployParameters.amountForPromotion,
      deployParameters.mintPrice,
      deployParameters.claimTime,
      deployParameters.presaleTime,
      deployParameters.publicTime,
    ],
    contract: deployContractName,
    from: deployer,
    skipIfAlreadyDeployed: false,
  });

  // const randomizer = await deploy("Randomizer", {
  //   contract: "Randomizer",
  //   from: deployer,
  //   skipIfAlreadyDeployed: false,
  // });

  let creatorAddress = creatorResult.address;
  // let randomizerAddress = randomizer.address;

  // dim(`  - Randomizer:             `, randomizerAddress);
  dim(`  - ${deployContractName}:             `, creatorAddress);

  dim("\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
  green("Contract Deployments Complete!");
  dim("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n");
};

runner()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
