export const currentBlockTime = 123456789;

import { parseEther } from './helpers/constant';
import { testContractTokenHash } from './core/testContractTokenHash';
import { testContractTokenURI } from './core/testContractTokenURI';
import { testContractDeployment } from './core/testContractDeployment';
import { testContractBaseURI } from './core/testContractBaseURI';
import { testContractCore } from './core/testContractCore';
import { testContractSale } from './core/testContractSale';
import { testContractDev } from './core/testContractDev';

export const params = {
  name: 'Rhapsody Creator Test',
  symbol: 'RCT',
  collectionSize: 1111,
  maxPresaleBatchPerAddress: 2,
  maxPublicBatchPerAddress: 2,
  amountForPromotion: 20,
  mintPrice: parseEther(0.333),
};

describe('RhapsodyCreatorGenerative', () => {
  testContractCore();
  testContractDeployment();
  testContractBaseURI();
  testContractTokenURI();
  testContractTokenHash();
  testContractSale('generative', ['claim', 'presale', 'public']);
  testContractDev();
});
