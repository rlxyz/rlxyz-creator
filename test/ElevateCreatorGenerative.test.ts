export const currentBlockTime = 123456789;

import { testContractBaseURI } from './core/testContractBaseURI';
import { testContractCore } from './core/testContractCore';
import { testContractDeploymentArgs } from './core/testContractDeploymentArgs';
import { testContractDev } from './core/testContractDev';
import { testContractMintPrice } from './core/testContractMintPrice';
import { testContractSale } from './core/testContractSale';
import { testContractTokenHash } from './core/testContractTokenHash';
import { testContractTokenURI } from './core/testContractTokenURI';
import { ElevateCreatorConstructor } from './core/type';
import { parseEther } from './helpers/constant';
import { beforeEachSetupForGenerative } from './helpers/contractBeforeEachSetup';

const params: ElevateCreatorConstructor = {
  name: 'Rhapsody Creator Test',
  symbol: 'RCT',
  mintRandomizerContract: '0x', //! this is set in the _beforeEachSetupForGenerative
  collectionSize: 1111,
  maxMintPerAddress: 2,
  amountForPromotion: 20,
  mintPrice: parseEther(0.333),
  claimTime: currentBlockTime + 100,
  presaleTime: currentBlockTime + 200,
  publicTime: currentBlockTime + 300,
};

describe('ElevateCreatorGenerative', async () => {
  const _beforeEach = beforeEachSetupForGenerative;
  testContractCore(_beforeEach, params);
  testContractDeploymentArgs(_beforeEach, params);
  testContractBaseURI(_beforeEach, params);
  testContractTokenURI(_beforeEach, params);
  testContractTokenHash(_beforeEach, params);
  testContractSale(_beforeEach, 'generative', ['claim', 'presale', 'public'], params);
  testContractDev(_beforeEach, params);
  testContractMintPrice(_beforeEach, params);
});
