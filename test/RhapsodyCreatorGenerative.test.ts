export const currentBlockTime = 123456789;

import { testContractSale } from './core/testContractSale';
import { RhapsodyCreatorConstructor } from './core/type';
import { parseEther } from './helpers/constant';
import { beforeEachSetupForGenerative } from './helpers/contractBeforeEachSetup';

export const params: RhapsodyCreatorConstructor = {
  name: 'Rhapsody Creator Test',
  symbol: 'RCT',
  collectionSize: 1111,
  maxMintPerAddress: 2,
  amountForPromotion: 20,
  mintPrice: parseEther(0.333),
  claimTime: currentBlockTime + 100,
  presaleTime: currentBlockTime + 200,
  publicTime: currentBlockTime + 300,
};

describe('RhapsodyCreatorGenerative', () => {
  const _beforeEach = beforeEachSetupForGenerative;
  // testContractCore(_beforeEach, params);
  // testContractDeployment(_beforeEach, params);
  // testContractBaseURI(_beforeEach, params);
  // testContractTokenURI(_beforeEach, params);
  // testContractTokenHash(_beforeEach, params);
  testContractSale(_beforeEach, 'generative', ['claim', 'presale', 'public'], params);
  // testContractDev(_beforeEach);
});
