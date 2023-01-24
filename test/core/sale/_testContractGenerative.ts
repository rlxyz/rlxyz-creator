const { expect } = require('chai');
import { ethers } from 'ethers';
import { parseEther } from '../../helpers/constant';
import { currentBlockTime } from '../../RhapsodyCreatorGenerative.test';
import { RhapsodyCreatorBeforeEach, RhapsodyCreatorConstructor } from '../type';

export const _testContractGenerative = (_beforeEach: RhapsodyCreatorBeforeEach, params: RhapsodyCreatorConstructor) => {
  describe('setMintTime', () => {
    let creator: ethers.Contract;

    let minter: (minter: any, invocations: any, proof: any) => void;
    beforeEach(async () => {
      const { contracts } = await _beforeEach(params);
      creator = contracts.creator;
      minter = async (minter, invocations, proof) => creator.connect(minter).claimMint(invocations, proof);
    });

    it('should be able to set valid mint times', async () => {
      await creator.setClaimTime(currentBlockTime + 100);
      await creator.setPresaleTime(currentBlockTime + 105);
      await creator.setPublicTime(currentBlockTime + 110);

      expect(await creator.claimTime()).to.be.equal(currentBlockTime + 100);

      expect(await creator.presaleTime()).to.be.equal(currentBlockTime + 105);

      expect(await creator.publicTime()).to.be.equal(currentBlockTime + 110);
    });

    it('can change presale and public time retroactively', async () => {
      await creator.setClaimTime(currentBlockTime + 100);
      await creator.setPresaleTime(currentBlockTime + 105);
      await creator.setPublicTime(currentBlockTime + 110);

      await creator.setClaimTime(currentBlockTime + 105);
      await creator.setPresaleTime(currentBlockTime + 110);
      await creator.setPublicTime(currentBlockTime + 115);

      expect(await creator.claimTime()).to.be.equal(currentBlockTime + 105);
      expect(await creator.presaleTime()).to.be.equal(currentBlockTime + 110);
      expect(await creator.publicTime()).to.be.equal(currentBlockTime + 115);

      // backward time
      await creator.setClaimTime(currentBlockTime + 100);
      await creator.setPresaleTime(currentBlockTime + 105);
      await creator.setPublicTime(currentBlockTime + 110);

      expect(await creator.claimTime()).to.be.equal(currentBlockTime + 100);
      expect(await creator.presaleTime()).to.be.equal(currentBlockTime + 105);
      expect(await creator.publicTime()).to.be.equal(currentBlockTime + 110);

      // testing edge case
      await creator.setClaimTime(currentBlockTime + 1);
      await creator.setPresaleTime(currentBlockTime + 2);
      await creator.setPublicTime(currentBlockTime + 3);
      expect(await creator.claimTime()).to.be.equal(currentBlockTime + 1);
      expect(await creator.presaleTime()).to.be.equal(currentBlockTime + 2);
      expect(await creator.publicTime()).to.be.equal(currentBlockTime + 3);
    });

    //! in latest version; 1.0.0, any of the mints can be before/after the other, so this test is not needed
    // it('public sale time cannot be less than presale time', async () => {
    //   await expect(
    //     creator.setMintTime(currentBlockTime + 100, currentBlockTime + 110, currentBlockTime + 105)
    //   ).to.be.revertedWith('RhapsodyCreatorGenerative/invalid-public-time');

    //   // edge cases
    //   await expect(
    //     creator.setMintTime(currentBlockTime + 1, currentBlockTime + 2, currentBlockTime + 1)
    //   ).to.be.revertedWith('RhapsodyCreatorGenerative/invalid-public-time');

    //   await expect(
    //     creator.setMintTime(currentBlockTime + 1, currentBlockTime + 2, currentBlockTime + 0)
    //   ).to.be.revertedWith('RhapsodyCreatorGenerative/invalid-public-time');
    // });

    //! in latest version; 1.0.0, the first mint can be anytime..., so this test is not needed; why? because
    //! we dont want to limit the creator to set the mint time to be after the current block time
    // it('presale time cannot be less than the current block timestamp', async () => {
    //   await expect(
    //     creator.setMintTime(currentBlockTime + 1, currentBlockTime - 10, currentBlockTime + 10)
    //   ).to.be.revertedWith('RhapsodyCreatorGenerative/invalid-presale-time');

    //   await expect(
    //     creator.setMintTime(currentBlockTime + 1, currentBlockTime - 1, currentBlockTime)
    //   ).to.be.revertedWith('RhapsodyCreatorGenerative/invalid-presale-time');

    //   await expect(
    //     creator.setMintTime(currentBlockTime + 1, currentBlockTime - 2, currentBlockTime - 1)
    //   ).to.be.revertedWith('RhapsodyCreatorGenerative/invalid-presale-time');
    // });
  });

  describe('maxCollection', function () {
    this.timeout(10000);
    let minterA: any;
    let creator: ethers.Contract;
    beforeEach(async () => {
      const paramsB: RhapsodyCreatorConstructor = {
        name: 'test',
        symbol: 'test',
        collectionSize: 1200,
        amountForPromotion: 0,
        maxMintPerAddress: 1200,
        mintPrice: parseEther(0.01),
        claimTime: currentBlockTime + 100,
        presaleTime: currentBlockTime + 105,
        publicTime: currentBlockTime + 110,
      };

      const { contracts, wallets } = await _beforeEach(paramsB);

      creator = contracts.creator;
      minterA = wallets.minterA;
    });

    it('should all be unique token hashes', async () => {
      let hashes = {};
      for (let i = 0; i < 12; i++) {
        await creator.connect(minterA).publicMint(100, {
          value: parseEther(0.01 * 100),
        });
        for (let id = 0; id < 100; id++) {
          const hash = await creator.tokenHash(id * (i + 1));

          // @ts-ignore
          if (hashes[hash] !== undefined) {
            console.log('found existing token hash');
            throw new Error('it failed');
          }
        }
      }
    });
  });
};
