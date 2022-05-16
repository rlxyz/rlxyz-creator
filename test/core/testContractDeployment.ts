const { expect } = require('chai');
import { ethers } from 'ethers';
import { beforeEachSetupForGenerative } from '../helpers/contractBeforeEachSetup';
import { params } from '../RhapsodyCreatorGenerative.test';

export const testContractDeployment = () => {
  describe('deployment', () => {
    let creator: ethers.Contract;
    beforeEach(async () => {
      const { contracts } = await beforeEachSetupForGenerative(params);
      creator = contracts.creator;
    });

    it('should have an allocation promotion amount', async () => {
      expect(await creator.amountForPromotion()).to.equal(params.amountForPromotion);
    });

    it('should have set the correct max public mint per address', async () => {
      expect(await creator.maxPublicBatchPerAddress()).to.equal(params.maxPublicBatchPerAddress);
    });

    it('should have a valid mint price', async () => {
      expect(await creator.mintPrice()).to.equal(params.mintPrice);
    });
  });
};
