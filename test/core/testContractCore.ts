const { expect } = require('chai');
import { ethers } from 'ethers';
import { beforeEachSetupForGenerative } from '../helpers/contractBeforeEachSetup';
import { params } from '../RhapsodyCreatorGenerative.test';

export const testContractCore = () => {
  describe('core', () => {
    let creator: ethers.Contract;

    beforeEach(async () => {
      const { contracts } = await beforeEachSetupForGenerative(params);
      creator = contracts.creator;
    });

    it('should have name', async () => {
      expect(await creator.name()).to.equal(params.name);
    });

    it('should have symbol', async () => {
      expect(await creator.symbol()).to.equal(params.symbol);
    });
  });
};
