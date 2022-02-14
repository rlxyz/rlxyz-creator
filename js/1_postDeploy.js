const hardhat = require ('hardhat');
const {setDeployerAsSigner, setAdminAsSigner} = require ('./helpers/signer');
const {transferOwnership} = require ('./contracts/Ownable');
const {setBaseURI, setMintTime} = require ('./contracts/RhapsodyCreator');
const {chainName} = require ('./helpers/chain');
const {yellow, green, dim, cyan} = require ('./helpers/logs');

const runner = async (deployContractName, postDeployParameters) => {
  const {getChainId} = hardhat;
  const {deployments, getNamedAccounts} = hardhat;
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

  let signer = await setDeployerAsSigner ();

  dim (`deployer: ${signer._address}`);
  dim (`admin: ${admin}`);

  let creatorResult = await hardhat.ethers.getContractAt (
    deployContractName,
    creator,
    signer
  );

  dim (`creator: ${creatorResult.address}`);

  // // move ownership to admin
  await transferOwnership (creatorResult, admin);

  // // run commands
  creatorResult = creatorResult.connect (await setAdminAsSigner ());
  await setBaseURI (creatorResult, postDeployParameters.baseTokenURI);
  await setMintTime (
    creatorResult,
    postDeployParameters.presaleTime,
    postDeployParameters.publicTime
  );

  dim (
    `Presale: ${new Date ((await creatorResult.presaleTime ()).toNumber ()).toString ()}`
  );

  dim (
    `Public: ${new Date ((await creatorResult.publicTime ()).toNumber ()).toString ()}`
  );

  dim (`baseURI: ${await creatorResult.baseURI ()}`);

  dim ('\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
  green ('Contract Post Deployment Complete!');
  dim ('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n');
};

module.exports = runner;
