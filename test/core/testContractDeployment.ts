const { expect } = require('chai');
import { ethers } from 'ethers';
import { params } from '../RhapsodyCreatorGenerative.test';
import { RhapsodyCreatorBeforeEach } from './type';

export const testContractDeployment = (_beforeEach: RhapsodyCreatorBeforeEach) => {
  describe('deployment', () => {
    let creator: ethers.Contract;

    beforeEach(async () => {
      const { contracts } = await _beforeEach(params);
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
