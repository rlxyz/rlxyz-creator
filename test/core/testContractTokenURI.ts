const { expect } = require('chai');
const { parseEther } = require('../helpers/constant');
import { ethers } from 'ethers';
import { beforeEachSetupForGenerative } from '../helpers/contractBeforeEachSetup';
import { params, currentBlockTime } from '../RhapsodyCreatorGenerative.test';
import { RhapsodyCreatorBeforeEach } from './type';

export const testContractTokenURI = () => {
  describe('tokenURI', () => {
    let minterA: any, minterB: any, minterC: any;
    let creator: ethers.Contract;
    let baseURI: string;

    beforeEach(async () => {
      const { contracts, wallets } = await beforeEachSetupForGenerative(params);
      creator = contracts.creator;
      minterA = wallets.minterA;
      minterB = wallets.minterB;
      minterC = wallets.minterC;

      baseURI = 'https://somebaseuri.com/';
      await creator.setBaseURI(baseURI);
      await creator.setMintTime(currentBlockTime + 1, currentBlockTime + 2, currentBlockTime + 3);
    });

    it('should return valid token uri if minting singles', async () => {
      await creator.connect(minterA).publicMint(1, { value: parseEther(0.333) });
      expect(await creator.tokenURI(0)).to.equal(baseURI + '0');

      await creator.connect(minterA).publicMint(1, { value: parseEther(0.333) });
      expect(await creator.tokenURI(1)).to.equal(baseURI + '1');

      await creator.connect(minterB).publicMint(1, { value: parseEther(0.333) });
      expect(await creator.tokenURI(2)).to.equal(baseURI + '2');

      await creator.connect(minterC).publicMint(1, { value: parseEther(0.333) });
      expect(await creator.tokenURI(3)).to.equal(baseURI + '3');

      await expect(creator.tokenURI(4)).to.be.revertedWith('URIQueryForNonexistentToken');
    });

    it('should return valid token uri if minting many at once', async () => {
      await creator.connect(minterA).publicMint(2, { value: parseEther(0.333 * 2) });
      await creator.connect(minterB).publicMint(2, { value: parseEther(0.333 * 2) });
      await creator.connect(minterC).publicMint(1, { value: parseEther(0.333) });
      expect(await creator.tokenURI(0)).to.equal(baseURI + '0');
      expect(await creator.tokenURI(1)).to.equal(baseURI + '1');
      expect(await creator.tokenURI(2)).to.equal(baseURI + '2');
      expect(await creator.tokenURI(3)).to.equal(baseURI + '3');
      expect(await creator.tokenURI(4)).to.equal(baseURI + '4');
      await expect(creator.tokenURI(5)).to.be.revertedWith('URIQueryForNonexistentToken');
    });
  });
};
