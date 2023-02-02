const { expect } = require('chai');
import { ethers } from 'ethers';
import { generateLeaf } from '../../../scripts/helpers/whitelist';
import { params } from '../../ElevateCreatorGenerative.test';
import { ElevateCreatorBeforeEach, Merklized } from '../type';

export const _testContractClaimBasic = (_beforeEach: ElevateCreatorBeforeEach) => {
  describe('claimMint', () => {
    let minterA: any, minterB: any, minterC: any;

    let creator: ethers.Contract;

    let claimMerklized: Merklized;

    let minter: (minter: any, invocations: any, proof: any) => void;
    beforeEach(async () => {
      const { wallets, contracts, merkle } = await _beforeEach(params);

      minterA = wallets.minterA;
      minterB = wallets.minterB;
      minterC = wallets.minterC;
      creator = contracts.creator;
      claimMerklized = merkle.claimMerklized;

      minter = async (minter, invocations, proof) => creator.connect(minter).claimMint(invocations, proof);
    });

    it('should be able to mint if address whitelisted', async () => {
      let leaf = generateLeaf(minterA.address, 2);
      let proof = claimMerklized.tree.getHexProof(leaf);
      await expect(minter(minterA, 2, proof)).to.emit(creator, 'Created').withArgs(minterA.address, 2);
    });

    it('should not be able to mint if less than allocated invocation', async () => {
      const wrongProof = [
        '0x1428975b69ccaa80e5613347ec07d7a0696894fc28b3655983d43f9eb00032a1',
        '0xf55f0dad9adfe0f2aa1946779b3ca83c165360edef49c6b72ddc0e2f070f7ff6',
      ];
      await expect(minter(minterA, 1, wrongProof)).to.be.revertedWith('ElevateCreatorGenerative/invalid-address-proof');
    });

    it('should fail if minting invocation is 0', async () => {
      let leaf = generateLeaf(minterA.address, 2);
      let proof = claimMerklized.tree.getHexProof(leaf);
      await expect(minter(minterA, 0, proof)).to.be.revertedWith(
        'ElevateCreatorGenerative/invalid-invocation-lower-boundary'
      );
    });

    it('should fail if trying to minting more than maxMintPerAddress', async () => {
      let leaf = generateLeaf(minterA.address, 2);
      let proof = claimMerklized.tree.getHexProof(leaf);
      await expect(minter(minterA, params.maxMintPerAddress + 1, proof)).to.be.revertedWith(
        'ElevateCreatorGenerative/invalid-address-proof'
      );
    });

    it('should fail address proof if passed in invalid maxInvocations', async () => {
      let leaf = generateLeaf(minterA.address, 3);
      let proof = claimMerklized.tree.getHexProof(leaf);
      await expect(minter(minterA, 2, proof)).to.be.revertedWith('ElevateCreatorGenerative/invalid-address-proof');

      leaf = generateLeaf(minterC.address, 5);
      proof = claimMerklized.tree.getHexProof(leaf);
      await expect(minter(minterC, 1, proof)).to.be.revertedWith('ElevateCreatorGenerative/invalid-address-proof');
    });

    it('should only be able to mint once', async () => {
      let leaf = generateLeaf(minterC.address, 1);
      let proof = claimMerklized.tree.getHexProof(leaf);

      await expect(minter(minterC, 1, proof)).to.emit(creator, 'Created').withArgs(minterC.address, 1);

      await expect(minter(minterC, 1, proof)).to.to.be.revertedWith(
        'ElevateCreatorGenerative/invalid-invocation-upper-boundary'
      );

      leaf = generateLeaf(minterA.address, 2);
      proof = claimMerklized.tree.getHexProof(leaf);

      await expect(minter(minterA, 2, proof)).to.emit(creator, 'Created').withArgs(minterA.address, 2);

      await expect(minter(minterA, 1, proof)).to.to.be.revertedWith(
        'ElevateCreatorGenerative/invalid-invocation-upper-boundary'
      );
    });

    it('should not be able to transfer NFTs out and mint again', async () => {
      let leaf = generateLeaf(minterC.address, 1);
      let proof = claimMerklized.tree.getHexProof(leaf);

      await expect(minter(minterC, 1, proof)).to.emit(creator, 'Created').withArgs(minterC.address, 1);

      await creator.connect(minterC).transferFrom(minterC.address, minterB.address, 0);

      await expect(minter(minterC, 1, proof)).to.to.be.revertedWith(
        'ElevateCreatorGenerative/invalid-invocation-upper-boundary'
      );
    });

    it('should not be able to mint if not whitelisted', async () => {
      const wrongProof = [
        '0x1428975b69ccaa80e5613347ec07d7a0696894fc28b3655983d43f9eb00032a1',
        '0xf55f0dad9adfe0f2aa1946779b3ca83c165360edef49c6b72ddc0e2f070f7ff6',
      ];

      await expect(minter(minterB, 2, wrongProof)).to.be.revertedWith('ElevateCreatorGenerative/invalid-address-proof');
    });
  });
};
