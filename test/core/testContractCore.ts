const { expect } = require('chai');
const hre = require('hardhat');
import { ethers } from 'ethers';
import { overrides } from '../helpers/constant';
import { params } from '../RhapsodyCreatorGenerative.test';
import { RhapsodyCreatorBeforeEach } from './type';

export const testContractCore = (_beforeEach: RhapsodyCreatorBeforeEach) => {
  describe('core', () => {
    let creator: ethers.Contract;

    beforeEach(async () => {
      const { contracts } = await _beforeEach(params);
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
