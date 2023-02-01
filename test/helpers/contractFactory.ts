const hre = require('hardhat');
const { overrides } = require('../helpers/constant');
import { ElevateCreatorConstructor, ElevateCreatorVariation } from '../core/type';

export const deployRandomizerContractFactory = async () => {
  const [deployer] = await hre.ethers.getSigners();
  const factory = await hre.ethers.getContractFactory('Randomizer', deployer, overrides);
  return await factory.deploy();
};
export const deployCreatorFactory = async (name: ElevateCreatorVariation, args: ElevateCreatorConstructor) => {
  const [deployer] = await hre.ethers.getSigners();
  let factory;
  let creator;
  switch (name) {
    case 'basic':
      factory = await hre.ethers.getContractFactory('ElevateCreatorTest', deployer, overrides);
      creator = factory.deploy(args.collectionSize, args.maxMintPerAddress, args.amountForPromotion, args.mintPrice);
      return creator;
    case 'generative':
      factory = await hre.ethers.getContractFactory('ElevateCreatorGenerativeTest', deployer, overrides);
      creator = factory.deploy(
        args.mintRandomizerContract,
        args.collectionSize,
        args.maxMintPerAddress,
        args.amountForPromotion,
        args.mintPrice
      );
      return creator;
    case 'claim':
      factory = await hre.ethers.getContractFactory('ElevateCreatorClaimTest', deployer, overrides);
      creator = factory.deploy(args.collectionSize);
      return creator;
  }
};
