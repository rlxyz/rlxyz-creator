const hre = require('hardhat');
const { buildWhitelist } = require('../../scripts/helpers/whitelist');
import { deployRandomizerContractFactory, deployRhapsodyCreatorFactory } from './contractFactory';
import { RhapsodyCreatorConstructor } from '../core/type';

const CONSTANTS = {
  randomBlockTime: 123456789,
};

export const beforeEachSetupForGenerative = async (args: RhapsodyCreatorConstructor): Promise<any> => {
  const [deployer, admin, minterA, minterB, minterC] = await hre.ethers.getSigners();
  const { randomBlockTime: currentBlockTime } = CONSTANTS;

  const randomizer = await deployRandomizerContractFactory();
  const creator = await deployRhapsodyCreatorFactory('generative', args);

  const presaleMerklized = await buildWhitelist([
    [minterA.address, 2],
    [minterB.address, 2],
    [minterC.address, 2],
  ]);

  const claimMerklized = await buildWhitelist([
    [minterA.address, 2],
    [minterB.address, 2],
    [minterC.address, 1],
  ]);

  await creator.setPresaleMerkleRoot(presaleMerklized.root);
  await creator.setClaimMerkleRoot(claimMerklized.root);
  await creator.setMintRandomizerContract(randomizer.address);
  await creator.setMintTime(currentBlockTime + 100, currentBlockTime + 105, currentBlockTime + 110);
  await randomizer.addDependency(creator.address);

  return {
    wallets: {
      deployer,
      admin,
      minterA,
      minterB,
      minterC,
    },
    contracts: {
      creator,
      randomizer,
    },
    merkle: {
      presaleMerklized,
      claimMerklized,
    },
  };
};

export const beforeEachSetupForClaim = async (args: RhapsodyCreatorConstructor): Promise<any> => {
  const [deployer, admin, minterA, minterB, minterC] = await hre.ethers.getSigners();
  const { randomBlockTime: currentBlockTime } = CONSTANTS;

  const creator = await deployRhapsodyCreatorFactory('claim', args);

  const claimMerklized = await buildWhitelist([
    [minterA.address, 2],
    [minterB.address, 2],
    [minterC.address, 1],
  ]);

  await creator.setClaimMerkleRoot(claimMerklized.root);
  await creator.setMintTime(currentBlockTime + 100);

  return {
    wallets: {
      deployer,
      admin,
      minterA,
      minterB,
      minterC,
    },
    contracts: {
      creator,
    },
    merkle: {
      claimMerklized,
    },
  };
};
