const { expect } = require('chai');
import { ethers } from 'ethers';
import { ElevateCreatorBeforeEach, ElevateCreatorConstructor } from './type';

export const testContractBaseURI = (_beforeEach: ElevateCreatorBeforeEach, params: ElevateCreatorConstructor) => {
  describe('baseURI', () => {
    let creator: ethers.Contract;

    beforeEach(async () => {
      const { contracts } = await _beforeEach(params);
      creator = contracts.creator;
    });

    it('should have empty base uri', async () => {
      expect(await creator.baseURI()).to.equal('');
    });

    it('should set baseUri', async () => {
      const baseURI = 'https://someuri.com';
      await creator.setBaseURI(baseURI);
      expect(await creator.baseURI()).to.equal(baseURI);
    });

    it('should be able to change the baseURI', async () => {
      const baseURI = 'https://somebaseuri.com/';
      await creator.setBaseURI(baseURI);
      expect(await creator.baseURI()).to.equal(baseURI);

      const baseURI2 = 'https://someotherbaseuri.com/';
      await creator.setBaseURI(baseURI2);
      expect(await creator.baseURI()).to.equal(baseURI2);
    });
  });
};
