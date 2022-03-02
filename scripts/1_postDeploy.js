const hardhat = require ('hardhat');
const {setDeployerAsSigner, setAdminAsSigner} = require ('./helpers/signer');
const {transferOwnership} = require ('./contracts/Ownable');
const {setBaseURI, setMintTime} = require ('./contracts/RhapsodyCreator');
const {chainName} = require ('./helpers/chain');
const {yellow, green, dim, cyan} = require ('./helpers/logs');
const {
  name: deployContractName,
  postDeploy: postDeployParameters,
} = require ('../production/testnet.json');

const prepare = async () => {
  const {deployments, getNamedAccounts} = hardhat;
  const creator = await deployments.get (deployContractName);
  return {
    creator: creator.address,
    claimTime: postDeployParameters.claimTime,
    presaleTime: postDeployParameters.presaleTime,
    publicTime: postDeployParameters.publicTime,
    baseTokenURI: postDeployParameters.baseTokenURI,
  };
};

const runner = async () => {
  const {getChainId} = hardhat;
  const {
    creator,
    claimTime,
    presaleTime,
    publicTime,
    baseTokenURI,
  } = await prepare ();
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

  // move ownership to admin
  // const tx = await transferOwnership (creatorResult, admin);
  // tx.wait (1);
  // creatorResult = creatorResult.connect (await setAdminAsSigner ());

  // run commands
  await setBaseURI (creatorResult, baseTokenURI);
  await setMintTime (creatorResult, claimTime, presaleTime, publicTime);

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

runner ().then (() => process.exit (0)).catch (error => {
  console.error (error);
  process.exit (1);
});
