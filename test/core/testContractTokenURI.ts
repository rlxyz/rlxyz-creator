const { expect } = require('chai');
const { parseEther } = require('../helpers/constant');
import { ethers } from 'ethers';
import { beforeEachSetupForGenerative } from '../helpers/contractBeforeEachSetup';
import { params, currentBlockTime } from '../RhapsodyCreatorGenerative.test';
import { RhapsodyCreatorBeforeEach } from './type';

export const testContractTokenURI = (_beforeEach: RhapsodyCreatorBeforeEach) => {
  describe('tokenURI', () => {
    let minterA: any, minterB: any, minterC: any;
    let creator: ethers.Contract;
    let baseURI: string;

    beforeEach(async () => {
      const { contracts, wallets } = await _beforeEach(params);
      creator = contracts.creator;
      minterA = wallets.minterA;
      minterB = wallets.minterB;
      minterC = wallets.minterC;

      baseURI = 'https://somebaseuri.com/';
      await creator.setBaseURI(baseURI);
    });

    it('should return valid token uri if minting singles', async () => {
      await creator.connect(minterA).mintOne();
      expect(await creator.tokenURI(0)).to.equal(baseURI + '0');

      await creator.connect(minterA).mintOne();
      expect(await creator.tokenURI(1)).to.equal(baseURI + '1');

      await creator.connect(minterB).mintOne();
      expect(await creator.tokenURI(2)).to.equal(baseURI + '2');

      await creator.connect(minterC).mintOne();
      expect(await creator.tokenURI(3)).to.equal(baseURI + '3');

      await expect(creator.tokenURI(4)).to.be.revertedWith('URIQueryForNonexistentToken');
    });

    it('should return valid token uri if minting many at once', async () => {
      await creator.connect(minterA).mintOne();
      await creator.connect(minterA).mintOne();
      await creator.connect(minterB).mintOne();
      await creator.connect(minterB).mintOne();
      await creator.connect(minterC).mintOne();
      expect(await creator.tokenURI(0)).to.equal(baseURI + '0');
      expect(await creator.tokenURI(1)).to.equal(baseURI + '1');
      expect(await creator.tokenURI(2)).to.equal(baseURI + '2');
      expect(await creator.tokenURI(3)).to.equal(baseURI + '3');
      expect(await creator.tokenURI(4)).to.equal(baseURI + '4');
      await expect(creator.tokenURI(5)).to.be.revertedWith('URIQueryForNonexistentToken');
    });
  });
};
