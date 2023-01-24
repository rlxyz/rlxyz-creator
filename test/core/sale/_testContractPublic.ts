const { expect } = require('chai');
import { ethers } from 'ethers';
import { parseEther } from '../../helpers/constant';
import { keccak256Hashes } from '../../helpers/generateKeccak256Hash';
import { RhapsodyCreatorBeforeEach, RhapsodyCreatorConstructor } from '../type';

export const _testContractPublic = (_beforeEach: RhapsodyCreatorBeforeEach, params: RhapsodyCreatorConstructor) => {
  describe('publicMint', () => {
    let minterA: any, minterB: any, minterC: any;

    let creator: ethers.Contract;

    let minter: (minter: any, invocations: any, ether: any) => void;

    beforeEach(async () => {
      const { wallets, contracts, merkle } = await _beforeEach(params);

      minterA = wallets.minterA;
      minterB = wallets.minterB;
      minterC = wallets.minterC;

      creator = contracts.creator;

      minter = async (minter, invocations, ether) =>
        creator.connect(minter).publicMint(invocations, {
          value: parseEther(ether),
        });
    });

    it('should be able to mint nfts in public mint', async () => {
      await expect(minter(minterA, 1, 0.333))
        .to.emit(creator, 'Created')
        .withArgs(minterA.address, 1, 1, [keccak256Hashes[0]]);

      await expect(minter(minterA, 1, 0.333))
        .to.emit(creator, 'Created')
        .withArgs(minterA.address, 2, 1, [keccak256Hashes[1]]);

      await expect(minter(minterB, 2, 2 * 0.333))
        .to.emit(creator, 'Created')
        .withArgs(minterB.address, 4, 2, [keccak256Hashes[2], keccak256Hashes[3]]);

      await expect(minter(minterC, 2, 2 * 0.333))
        .to.emit(creator, 'Created')
        .withArgs(minterC.address, 6, 2, [keccak256Hashes[4], keccak256Hashes[5]]);
    });

    it('should only be able to max batch amount of nfts', async () => {
      await expect(minter(minterA, 2, 0.333 * 2))
        .to.emit(creator, 'Created')
        .withArgs(minterA.address, 2, 2, [keccak256Hashes[0], keccak256Hashes[1]]);

      await expect(minter(minterB, 3, 3 * 0.333)).to.be.revertedWith(
        'RhapsodyCreatorGenerative/invalid-invocation-upper-boundary'
      );
    });

    it('should only be able to mint max batch amount of nfts even in two or more txs', async () => {
      await expect(minter(minterA, 1, 0.333))
        .to.emit(creator, 'Created')
        .withArgs(minterA.address, 1, 1, [keccak256Hashes[0]]);

      await expect(minter(minterA, 2, 0.333 * 2)).to.be.revertedWith(
        'RhapsodyCreatorGenerative/invalid-invocation-upper-boundary'
      );
    });

    it('should fail if minting invocation is 0', async () => {
      await expect(minter(minterA, 0, 0.333)).to.be.revertedWith(
        'RhapsodyCreatorGenerative/invalid-invocation-lower-boundary'
      );
    });
  });
};
