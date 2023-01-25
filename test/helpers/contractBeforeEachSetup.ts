const hre = require('hardhat');
const { buildWhitelist } = require('../../scripts/helpers/whitelist');
import { RhapsodyCreatorConstructor } from '../core/type';
import { deployRandomizerContractFactory, deployRhapsodyCreatorFactory } from './contractFactory';

const CONSTANTS = {
  randomBlockTime: 123456789,
};

export const beforeEachSetupForGenerative = async (args: RhapsodyCreatorConstructor): Promise<any> => {
  const [deployer, admin, minterA, minterB, minterC] = await hre.ethers.getSigners();
  const { randomBlockTime: currentBlockTime } = CONSTANTS;

  const randomizer = await deployRandomizerContractFactory();
  const creator = await deployRhapsodyCreatorFactory('generative', {
    ...args,
    mintRandomizerContract: randomizer.address,
  });

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
  await creator.setClaimTime(currentBlockTime + 100);
  await creator.setPresaleTime(currentBlockTime + 200);
  await creator.setPublicTime(currentBlockTime + 300);

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
