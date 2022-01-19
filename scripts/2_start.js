const hardhat = require ('hardhat');
const {setAdminAsSigner} = require ('./helpers/signer');
const debug = require ('debug') ('ptv3:postdeploy');
const {chainName} = require ('./helpers/chain');
const {green, dim, cyan} = require ('./helpers/logs');
const {
  name: deployContractName,
  start: startParameters,
} = require ('../production/testnet.json');

const runner = async () => {
  const {getChainId, ethers} = hardhat;
  const creator = await deployments.get (deployContractName);
  const chainId = parseInt (await getChainId (), 10);
  const isTestEnvironment = chainId === 31337 || chainId === 1337;
  const {admin} = await getNamedAccounts ();

  dim ('\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
  dim (`${deployContractName} Contracts - Start Script`);
  dim ('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n');

  dim (
    `network: ${chainName (chainId)} (${isTestEnvironment ? 'local' : 'remote'})`
  );

  let signer = await setAdminAsSigner ();

  dim (`admin: ${admin}`);

  let creatorResult = await hardhat.ethers.getContractAt (
    deployContractName,
    creator.address,
    signer
  );

  dim (`creator: ${creatorResult.address}`);

  let tx = await creatorResult.promotionMint (
    startParameters.amountForPromotion
  );
  tx.wait (1);

  dim ('\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
  green ('Contract Post Deployment Complete!');
  dim ('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n');
};

runner ().then (() => process.exit (0)).catch (error => {
  console.error (error);
  process.exit (1);
});
