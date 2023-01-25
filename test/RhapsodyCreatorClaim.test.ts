export const currentBlockTime = 123456789;

import { testContractBaseURI } from './core/testContractBaseURI';
import { testContractCore } from './core/testContractCore';
import { testContractSale } from './core/testContractSale';
import { testContractTokenURI } from './core/testContractTokenURI';
import { RhapsodyCreatorConstructor } from './core/type';
import { parseEther } from './helpers/constant';
import { beforeEachSetupForClaim } from './helpers/contractBeforeEachSetup';

export const params: RhapsodyCreatorConstructor = {
  name: 'Rhapsody Creator Test',
  symbol: 'RCT',
  collectionSize: 1111,
  maxMintPerAddress: 2,
  amountForPromotion: 20,
  mintPrice: parseEther(0.333),
  claimTime: 0,
  presaleTime: 0,
  publicTime: 0,
};

describe('RhapsodyCreatorClaim', () => {
  const _beforeEach = beforeEachSetupForClaim;

  // test cases
  testContractCore(_beforeEach, params);
  // testContractDeployment(_beforeEach);
  testContractBaseURI(_beforeEach, params);
  testContractTokenURI(_beforeEach, params);
  testContractSale(_beforeEach, 'basic', ['claim'], params);
});
