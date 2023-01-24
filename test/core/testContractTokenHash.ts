const { expect } = require('chai');
const { parseEther } = require('../helpers/constant');
import { ethers } from 'ethers';
import { currentBlockTime } from '../RhapsodyCreatorGenerative.test';
import { RhapsodyCreatorBeforeEach, RhapsodyCreatorConstructor } from './type';

export const testContractTokenHash = (_beforeEach: RhapsodyCreatorBeforeEach, params: RhapsodyCreatorConstructor) => {
  describe('tokenHash', () => {
    let minterA: any, minterB: any, minterC: any;
    let creator: ethers.Contract;

    beforeEach(async () => {
      const { contracts, wallets } = await _beforeEach(params);
      creator = contracts.creator;
      minterA = wallets.minterA;
      minterB = wallets.minterB;
      minterC = wallets.minterC;
    });

    let baseURI;
    beforeEach(async () => {
      baseURI = 'https://somebaseuri.com/';
      await creator.setBaseURI(baseURI);
      await creator.setClaimTime(currentBlockTime + 1);
      await creator.setPresaleTime(currentBlockTime + 2);
      await creator.setPublicTime(currentBlockTime + 3);
    });

    it('should return valid token hash', async () => {
      await creator.connect(minterA).publicMint(1, { value: parseEther(0.333) });
      expect(await creator.tokenHash(0)).to.equal('0x290decd9548b62a8d60345a988386fc84ba6bc95484008f6362f93160ef3e563');

      await creator.connect(minterA).publicMint(1, { value: parseEther(0.333) });
      expect(await creator.tokenHash(1)).to.equal('0xb10e2d527612073b26eecdfd717e6a320cf44b4afac2b0732d9fcbe2b7fa0cf6');

      await creator.connect(minterB).publicMint(1, { value: parseEther(0.333) });
      expect(await creator.tokenHash(2)).to.equal('0x405787fa12a823e0f2b7631cc41b3ba8828b3321ca811111fa75cd3aa3bb5ace');

      await creator.connect(minterC).publicMint(1, { value: parseEther(0.333) });
      expect(await creator.tokenHash(3)).to.equal('0xc2575a0e9e593c00f959f8c92f12db2869c3395a3b0502d05e2516446f71f85b');

      await expect(creator.tokenHash(4)).to.be.revertedWith('HashQueryForNonexistentToken');
    });

    it('should return valid token hash if multiple mints', async () => {
      await creator.connect(minterA).publicMint(2, { value: parseEther(0.333 * 2) });
      expect(await creator.tokenHash(0)).to.equal('0x290decd9548b62a8d60345a988386fc84ba6bc95484008f6362f93160ef3e563');
      expect(await creator.tokenHash(1)).to.equal('0xb10e2d527612073b26eecdfd717e6a320cf44b4afac2b0732d9fcbe2b7fa0cf6');
      await creator.connect(minterB).publicMint(2, { value: parseEther(0.333 * 2) });
      expect(await creator.tokenHash(2)).to.equal('0x405787fa12a823e0f2b7631cc41b3ba8828b3321ca811111fa75cd3aa3bb5ace');
      expect(await creator.tokenHash(3)).to.equal('0xc2575a0e9e593c00f959f8c92f12db2869c3395a3b0502d05e2516446f71f85b');
      await creator.connect(minterC).publicMint(1, { value: parseEther(0.333 * 1) });
      expect(await creator.tokenHash(4)).to.equal('0x8a35acfbc15ff81a39ae7d344fd709f28e8600b4aa8c65c6b64bfe7fe36bd19b');
      await expect(creator.tokenHash(5)).to.be.revertedWith('HashQueryForNonexistentToken');
    });
  });
};
