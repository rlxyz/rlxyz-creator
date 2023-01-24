const { expect } = require('chai');
import { ethers } from 'ethers';
import { generateLeaf } from '../../../scripts/helpers/whitelist';
import { keccak256Hashes } from '../../helpers/generateKeccak256Hash';
import { Merklized, RhapsodyCreatorBeforeEach, RhapsodyCreatorConstructor } from '../type';

export const _testContractClaimGenerative = (
  _beforeEach: RhapsodyCreatorBeforeEach,
  params: RhapsodyCreatorConstructor
) => {
  describe('claimMint', () => {
    let minterA: any, minterB: any, minterC: any;
    let creator: ethers.Contract;
    let claimMerklized: Merklized;
    let presaleMerklized: Merklized;

    let minter: (minter: any, invocations: any, maxInvocations: any, proof: any) => void;
    beforeEach(async () => {
      const { wallets, contracts, merkle } = await _beforeEach(params);

      minterA = wallets.minterA;
      minterB = wallets.minterB;
      minterC = wallets.minterC;
      creator = contracts.creator;
      claimMerklized = merkle.claimMerklized;
      presaleMerklized = merkle.presaleMerklized;

      minter = async (minter: any, invocations: number, maxInvocations: number, proof: any) =>
        creator.connect(minter).claimMint(invocations, maxInvocations, proof);
    });

    it('should be able to mint if address whitelisted', async () => {
      let leaf = generateLeaf(minterA.address, 2);
      let proof = claimMerklized.tree.getHexProof(leaf);
      await expect(minter(minterA, 2, 2, proof))
        .to.emit(creator, 'Created')
        .withArgs(minterA.address, 2, 2, [keccak256Hashes[0], keccak256Hashes[1]]);
    });

    it('should be able to mint if less than allocated invocation', async () => {
      let leaf = generateLeaf(minterA.address, 2);
      let proof = claimMerklized.tree.getHexProof(leaf);
      await expect(minter(minterA, 1, 2, proof))
        .to.emit(creator, 'Created')
        .withArgs(minterA.address, 1, 1, [keccak256Hashes[0]]);
    });

    it('should fail if minting invocation is 0', async () => {
      let leaf = generateLeaf(minterA.address, 2);
      let proof = claimMerklized.tree.getHexProof(leaf);
      await expect(minter(minterA, 0, 2, proof)).to.be.revertedWith(
        'RhapsodyCreatorGenerative/invalid-invocation-lower-boundary'
      );
    });

    it('should fail if trying to minting more than maxMintPerAddress', async () => {
      let leaf = generateLeaf(minterA.address, 2);
      let proof = claimMerklized.tree.getHexProof(leaf);
      await expect(minter(minterA, params.maxMintPerAddress + 1, 2, proof)).to.be.revertedWith(
        'RhapsodyCreatorGenerative/invalid-invocation-upper-boundary'
      );
    });

    it('should fail address proof if passed in invalid maxInvocations', async () => {
      let leaf = generateLeaf(minterA.address, 3);
      let proof = claimMerklized.tree.getHexProof(leaf);
      await expect(minter(minterA, 2, 2, proof)).to.be.revertedWith('RhapsodyCreatorGenerative/invalid-address-proof');

      leaf = generateLeaf(minterC.address, 5);
      proof = claimMerklized.tree.getHexProof(leaf);
      await expect(minter(minterC, 1, 1, proof)).to.be.revertedWith('RhapsodyCreatorGenerative/invalid-address-proof');
    });

    it('should only be able to mint till max', async () => {
      let leaf = generateLeaf(minterC.address, 1);
      let proof = claimMerklized.tree.getHexProof(leaf);

      await expect(minter(minterC, 1, 1, proof))
        .to.emit(creator, 'Created')
        .withArgs(minterC.address, 1, 1, [keccak256Hashes[0]]);

      await expect(minter(minterC, 1, 1, proof)).to.to.be.revertedWith(
        'RhapsodyCreatorGenerative/invalid-invocation-upper-boundary'
      );

      leaf = generateLeaf(minterA.address, 2);
      proof = claimMerklized.tree.getHexProof(leaf);

      await expect(minter(minterA, 2, 2, proof))
        .to.emit(creator, 'Created')
        .withArgs(minterA.address, 3, 2, [keccak256Hashes[1], keccak256Hashes[2]]);

      await expect(minter(minterA, 1, 1, proof)).to.to.be.revertedWith(
        'RhapsodyCreatorGenerative/invalid-invocation-upper-boundary'
      );
    });

    it('should not be able to transfer NFTs out and mint again', async () => {
      let leaf = generateLeaf(minterC.address, 1);
      let proof = claimMerklized.tree.getHexProof(leaf);

      await expect(minter(minterC, 1, 1, proof))
        .to.emit(creator, 'Created')
        .withArgs(minterC.address, 1, 1, [keccak256Hashes[0]]);

      await creator.connect(minterC).transferFrom(minterC.address, minterB.address, 0);

      await expect(minter(minterC, 1, 1, proof)).to.to.be.revertedWith(
        'RhapsodyCreatorGenerative/invalid-invocation-upper-boundary'
      );
    });

    it('should not be able to transfer NFTs out and mint again at max mint', async () => {
      let leaf = generateLeaf(minterA.address, 2);
      let proof = claimMerklized.tree.getHexProof(leaf);

      await expect(minter(minterA, 1, 2, proof))
        .to.emit(creator, 'Created')
        .withArgs(minterA.address, 1, 1, [keccak256Hashes[0]]);

      await creator.connect(minterA).transferFrom(minterA.address, minterB.address, 0);

      await expect(minter(minterA, 2, 2, proof)).to.to.be.revertedWith(
        'RhapsodyCreatorGenerative/invalid-invocation-upper-boundary'
      );

      await expect(minter(minterA, 1, 2, proof))
        .to.emit(creator, 'Created')
        .withArgs(minterA.address, 2, 1, [keccak256Hashes[1]]);

      await expect(minter(minterA, 2, 2, proof)).to.to.be.revertedWith(
        'RhapsodyCreatorGenerative/invalid-invocation-upper-boundary'
      );
    });

    it('should not be able to mint if not whitelisted', async () => {
      const wrongProof = [
        '0x1428975b69ccaa80e5613347ec07d7a0696894fc28b3655983d43f9eb00032a1',
        '0xf55f0dad9adfe0f2aa1946779b3ca83c165360edef49c6b72ddc0e2f070f7ff6',
      ];

      await expect(minter(minterB, 2, 2, wrongProof)).to.be.revertedWith(
        'RhapsodyCreatorGenerative/invalid-address-proof'
      );
    });
  });
};
