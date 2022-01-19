const {deploy1820} = require ('deploy-eip-1820');
const {chainName} = require ('./helpers/chain');
const {yellow, green, dim, cyan} = require ('./helpers/logs');
const hardhat = require ('hardhat');
const {
  name: deployContractName,
  deploy: deployParameters,
} = require ('../production/testnet.json');

const runner = async () => {
  const {getNamedAccounts, deployments, getChainId, ethers} = hardhat;
  const {deploy} = deployments;
  const chainId = parseInt (await getChainId (), 10);
  const {deployer} = await getNamedAccounts ();

  // 31337 is unit testing, 1337 is for coverage
  const isTestEnvironment = chainId === 31337 || chainId === 1337;

  const signer = await ethers.provider.getSigner (deployer);

  dim ('\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
  dim (`${deployContractName} Contracts - Start Script`);
  dim ('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n');

  dim (
    `network: ${chainName (chainId)} (${isTestEnvironment ? 'local' : 'remote'})`
  );
  dim (`deployer: ${deployer}`);

  await deploy1820 (signer);

  cyan ('\nDeploying NFT...');
  const creatorResult = await deploy (deployContractName, {
    args: [
      deployParameters.presaleMerkleRoot,
      deployParameters.collectionSize,
      deployParameters.maxPublicBatchPerAddress,
      deployParameters.amountForPromotion,
      deployParameters.mintPrice,
    ],
    contract: deployContractName,
    from: deployer,
    skipIfAlreadyDeployed: false,
  });

  let creatorAddress = creatorResult.address;

  dim (`  - ${deployContractName}:             `, creatorAddress);
  dim ('\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
  green ('Contract Deployments Complete!');
  dim ('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n');
};

runner ().then (() => process.exit (0)).catch (error => {
  console.error (error);
  process.exit (1);
});
