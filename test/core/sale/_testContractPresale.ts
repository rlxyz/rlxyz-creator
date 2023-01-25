const { expect } = require('chai');
import { ethers } from 'ethers';
import { defaultAbiCoder, keccak256 } from 'ethers/lib/utils';
import { buildWhitelist, generateLeaf } from '../../../scripts/helpers/whitelist';
import { parseEther } from '../../helpers/constant';
import { keccak256Hashes } from '../../helpers/generateKeccak256Hash';
import { currentBlockTime } from '../../RhapsodyCreatorGenerative.test';
import { Merklized, RhapsodyCreatorBeforeEach, RhapsodyCreatorConstructor } from '../type';

export const _testContractPresale = (_beforeEach: RhapsodyCreatorBeforeEach, params: RhapsodyCreatorConstructor) => {
  describe('presaleMint', () => {
    let minterA: any, minterB: any, minterC: any;

    let creator: ethers.Contract;
    let randomizer: ethers.Contract;

    let claimMerklized: Merklized;
    let presaleMerklized: Merklized;

    let minter: (minter: any, invocations: any, maxInvocation: any, proof: any, ether: any) => void;

    beforeEach(async () => {
      const { wallets, contracts, merkle } = await _beforeEach(params);

      minterA = wallets.minterA;
      minterB = wallets.minterB;
      minterC = wallets.minterC;

      creator = contracts.creator;
      randomizer = contracts.randomizer;

      claimMerklized = merkle.claimMerklized;
      presaleMerklized = merkle.presaleMerklized;

      minter = async (minter, invocations, maxInvocation, proof, ether) =>
        creator.connect(minter).presaleMint(invocations, maxInvocation, proof, {
          value: parseEther(ether),
        });
    });

    it('should be able to mint if address whitelisted', async () => {
      let leaf = generateLeaf(minterA.address, 2);
      let proof = presaleMerklized.tree.getHexProof(leaf);
      await expect(minter(minterA, 2, 2, proof, 0.333 * 2))
        .to.emit(creator, 'Created')
        .withArgs(minterA.address, 2, 2, [keccak256Hashes[0], keccak256Hashes[1]]);
    });

    it('should be able to mint if less than max invocation limit', async () => {
      let leaf = generateLeaf(minterA.address, 2);
      let proof = presaleMerklized.tree.getHexProof(leaf);
      await expect(minter(minterA, 1, 2, proof, 0.333))
        .to.emit(creator, 'Created')
        .withArgs(minterA.address, 1, 1, [keccak256Hashes[0]]);
    });

    it('should fail if minting invocation is 0', async () => {
      let leaf = generateLeaf(minterA.address, 2);
      let proof = presaleMerklized.tree.getHexProof(leaf);
      await expect(minter(minterA, 0, 2, proof, 0)).to.be.revertedWith(
        'RhapsodyCreatorGenerative/invalid-invocation-lower-boundary'
      );
    });

    it('should fail if trying to minting more than maxMintPerAddress', async () => {
      let leaf = generateLeaf(minterA.address, 2);
      let proof = presaleMerklized.tree.getHexProof(leaf);
      await expect(minter(minterA, 2, 2, proof, 0.333 * 2))
        .to.emit(creator, 'Created')
        .withArgs(minterA.address, 2, 2, [keccak256Hashes[0], keccak256Hashes[1]]);
      await expect(minter(minterA, 1, 4, proof, 3 * 0.333)).to.be.revertedWith(
        'RhapsodyCreatorGenerative/invalid-invocation-upper-boundary'
      );
    });

    it('should fail address proof if passed in invalid maxInvocations', async () => {
      let leaf = generateLeaf(minterA.address, 5);
      let proof = presaleMerklized.tree.getHexProof(leaf);
      await expect(minter(minterA, 1, 5, proof, 0.333)).to.be.revertedWith(
        'RhapsodyCreatorGenerative/invalid-address-proof'
      );

      leaf = generateLeaf(minterB.address, 5);
      proof = presaleMerklized.tree.getHexProof(leaf);
      await expect(minter(minterB, 2, 2, proof, 0.333 * 2)).to.be.revertedWith(
        'RhapsodyCreatorGenerative/invalid-address-proof'
      );
    });

    it('should fail if too much or too little eth supplied', async () => {
      let leaf = generateLeaf(minterA.address, 5);
      let proof = presaleMerklized.tree.getHexProof(leaf);
      await expect(minter(minterA, 1, 5, proof, 1.5)).to.be.revertedWith(
        'RhapsodyCreatorGenerative/invalid-mint-value'
      );

      leaf = generateLeaf(minterB.address, 5);
      proof = presaleMerklized.tree.getHexProof(leaf);
      await expect(minter(minterB, 2, 2, proof, 0)).to.be.revertedWith('RhapsodyCreatorGenerative/invalid-mint-value');
    });

    it('should be able to mint more than once', async () => {
      let leaf = generateLeaf(minterA.address, 2);
      let proof = presaleMerklized.tree.getHexProof(leaf);

      await expect(minter(minterA, 1, 2, proof, 1 * 0.333))
        .to.emit(creator, 'Created')
        .withArgs(minterA.address, 1, 1, [keccak256Hashes[0]]);

      await expect(minter(minterA, 1, 2, proof, 0.333))
        .to.emit(creator, 'Created')
        .withArgs(minterA.address, 2, 1, [keccak256Hashes[1]]);

      leaf = generateLeaf(minterB.address, 2);
      proof = presaleMerklized.tree.getHexProof(leaf);

      await expect(minter(minterB, 1, 2, proof, 1 * 0.333))
        .to.emit(creator, 'Created')
        .withArgs(minterB.address, 3, 1, [keccak256Hashes[2]]);

      await expect(minter(minterB, 1, 2, proof, 1 * 0.333))
        .to.emit(creator, 'Created')
        .withArgs(minterB.address, 4, 1, [keccak256Hashes[3]]);
    });

    it('should not be able to transfer NFTs out and mint again', async () => {
      let leaf = generateLeaf(minterA.address, 2);
      let proof = presaleMerklized.tree.getHexProof(leaf);

      await expect(minter(minterA, 2, 2, proof, 0.333 * 2))
        .to.emit(creator, 'Created')
        .withArgs(minterA.address, 2, 2, [keccak256Hashes[0], keccak256Hashes[1]]);

      await creator.connect(minterA).transferFrom(minterA.address, minterB.address, 0);

      await expect(minter(minterA, 1, 2, proof, 0.333)).to.to.be.revertedWith(
        'RhapsodyCreatorGenerative/invalid-invocation-upper-boundary'
      );
    });

    it('should not be able to mint if not whitelisted', async () => {
      const wrongProof = [
        '0x1428975b69ccaa80e5613347ec07d7a0696894fc28b3655983d43f9eb00032a1',
        '0xf55f0dad9adfe0f2aa1946779b3ca83c165360edef49c6b72ddc0e2f070f7ff6',
      ];
      await expect(minter(minterB, 1, 2, wrongProof, 1 * 0.333)).to.be.revertedWith(
        'RhapsodyCreatorGenerative/invalid-address-proof'
      );
    });

    describe('variable whitelist', () => {
      let presaleMerklizedA: Merklized;
      beforeEach(async () => {
        const paramsB: RhapsodyCreatorConstructor = {
          name: 'test',
          symbol: 'test',
          collectionSize: 1200,
          amountForPromotion: 0,
          maxMintPerAddress: 5,
          mintPrice: parseEther(0.333),
          claimTime: currentBlockTime + 100,
          presaleTime: currentBlockTime + 105,
          publicTime: currentBlockTime + 110,
        };

        const { contracts, wallets } = await _beforeEach(paramsB);

        creator = contracts.creator;
        minterA = wallets.minterA;
        presaleMerklizedA = await buildWhitelist([
          [minterB.address, 5],
          [minterA.address, 4],
          [minterC.address, 3],
        ]);

        await creator.setPresaleMerkleRoot(presaleMerklizedA.root);
      });

      it('should be able to variable mint', async () => {
        let leaf = generateLeaf(minterA.address, 4);
        let proof = presaleMerklizedA.tree.getHexProof(leaf);
        await expect(minter(minterA, 2, 4, proof, 2 * 0.333))
          .to.emit(creator, 'Created')
          .withArgs(minterA.address, 2, 2, [keccak256Hashes[0], keccak256Hashes[1]]);

        leaf = generateLeaf(minterB.address, 5);
        proof = presaleMerklizedA.tree.getHexProof(leaf);
        await expect(minter(minterB, 4, 5, proof, 4 * 0.333))
          .to.emit(creator, 'Created')
          .withArgs(minterB.address, 6, 4, [
            keccak256Hashes[2],
            keccak256Hashes[3],
            keccak256Hashes[4],
            keccak256Hashes[5],
          ]);

        leaf = generateLeaf(minterC.address, 3);
        proof = presaleMerklizedA.tree.getHexProof(leaf);
        await expect(minter(minterC, 1, 3, proof, 1 * 0.333))
          .to.emit(creator, 'Created')
          .withArgs(minterC.address, 7, 1, [keccak256(defaultAbiCoder.encode(['uint256'], [6]))]);
      });

      it('should only allow max allocated variable amount in merkle root', async () => {
        let leaf = generateLeaf(minterA.address, 4);
        let proof = presaleMerklizedA.tree.getHexProof(leaf);
        await expect(minter(minterA, 4, 4, proof, 4 * 0.333))
          .to.emit(creator, 'Created')
          .withArgs(minterA.address, 4, 4, [
            keccak256Hashes[0],
            keccak256Hashes[1],
            keccak256Hashes[2],
            keccak256Hashes[3],
          ]);

        leaf = generateLeaf(minterB.address, 5);
        proof = presaleMerklizedA.tree.getHexProof(leaf);
        await expect(minter(minterB, 5, 5, proof, 5 * 0.333))
          .to.emit(creator, 'Created')
          .withArgs(minterB.address, 9, 5, [
            keccak256Hashes[4],
            keccak256Hashes[5],
            keccak256(defaultAbiCoder.encode(['uint256'], [6])),
            keccak256(defaultAbiCoder.encode(['uint256'], [7])),
            keccak256(defaultAbiCoder.encode(['uint256'], [8])),
          ]);
      });

      it('should fail if trying to mint more than max limit of an allocated address limit', async () => {
        let leaf = generateLeaf(minterA.address, 4);
        let proof = presaleMerklizedA.tree.getHexProof(leaf);
        await expect(minter(minterA, 5, 4, proof, 5 * 0.333)).to.be.revertedWith(
          'RhapsodyCreatorGenerative/invalid-invocation-upper-boundary'
        );

        leaf = generateLeaf(minterC.address, 3);
        proof = presaleMerklizedA.tree.getHexProof(leaf);
        await expect(minter(minterC, 4, 3, proof, 4 * 0.333)).to.be.revertedWith(
          'RhapsodyCreatorGenerative/invalid-invocation-upper-boundary'
        );
      });
    });
  });
};
