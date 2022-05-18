const hardhat = require ('hardhat');
const {setDeployerAsSigner} = require ('./helpers/signer');
const debug = require ('debug') ('ptv3:postdeploy');
const {chainName} = require ('./helpers/chain');
const {green, dim, cyan} = require ('./helpers/logs');
const {setPromotionMint} = require ('./contracts/RhapsodyCreator');
const {
  name: deployContractName,
  start: startParameters,
} = require ('../production/mainnet.json');

const runner = async () => {
  const {getChainId, ethers} = hardhat;
  const creator = await deployments.get (deployContractName);
  const chainId = parseInt (await getChainId (), 10);
  const isTestEnvironment = chainId === 31337 || chainId === 1337;

  dim ('\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
  dim (`${deployContractName} Contracts - Start Script`);
  dim ('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n');

  dim (
    `network: ${chainName (chainId)} (${isTestEnvironment ? 'local' : 'remote'})`
  );

  let signer = await setDeployerAsSigner ();

  let creatorResult = await hardhat.ethers.getContractAt (
    deployContractName,
    creator.address,
    signer
  );

  dim (`creator: ${creatorResult.address}`);

  await setPromotionMint (creatorResult, startParameters.amountForPromotion);

  dim ('\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
  green ('Contract Post Deployment Complete!');
  dim ('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n');
};

runner ().then (() => process.exit (0)).catch (error => {
  console.error (error);
  process.exit (1);
});
