const hre = require('hardhat');
const { overrides } = require('../helpers/constant');
import { RhapsodyCreatorVariation, RhapsodyCreatorConstructor } from '../core/type';

export const deployRandomizerContractFactory = async () => {
  const [deployer] = await hre.ethers.getSigners();
  const factory = await hre.ethers.getContractFactory('Randomizer', deployer, overrides);
  return await factory.deploy();
};
export const deployRhapsodyCreatorFactory = async (
  name: RhapsodyCreatorVariation,
  args: RhapsodyCreatorConstructor
) => {
  const [deployer] = await hre.ethers.getSigners();

  switch (name) {
    case 'basic':
      return await hre.ethers.getContractFactory('RhapsodyCreatorTest', deployer, overrides);
    case 'generative':
      const factory = await hre.ethers.getContractFactory('RhapsodyCreatorGenerativeTest', deployer, overrides);
      const creator = factory.deploy(
        args.collectionSize,
        args.maxPublicBatchPerAddress,
        args.amountForPromotion,
        args.mintPrice
      );
      return creator;
    case 'claim':
      return await hre.ethers.getContractFactory('RhapsodyCreatorClaimTest', deployer, overrides);
  }
};
