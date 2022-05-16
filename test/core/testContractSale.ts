const { expect } = require('chai');
import { ethers } from 'ethers';
import { defaultAbiCoder, keccak256 } from 'ethers/lib/utils';
import { beforeEachSetupForGenerative } from '../helpers/contractBeforeEachSetup';
import { params } from '../RhapsodyCreatorGenerative.test';
import { Merklized, RhapsodyCreatorSaleType } from './type';
const { generateLeaf, buildWhitelist } = require('../../scripts/helpers/whitelist');
const { parseEther } = require('../helpers/constant');

const keccak256Hashes = {
  0: keccak256(defaultAbiCoder.encode(['uint256'], [0])),
  1: keccak256(defaultAbiCoder.encode(['uint256'], [1])),
  2: keccak256(defaultAbiCoder.encode(['uint256'], [2])),
  3: keccak256(defaultAbiCoder.encode(['uint256'], [3])),
  4: keccak256(defaultAbiCoder.encode(['uint256'], [4])),
  5: keccak256(defaultAbiCoder.encode(['uint256'], [5])),
};

export const testContractSale = (types: RhapsodyCreatorSaleType[]) => {
  describe('sale', () => {
    types.forEach((type) => {
      switch (type) {
        case 'claim':
          _testContractClaim();
          break;
        case 'presale':
          _testContractPresale();
          break;
      }
    });
  });
};

const _testContractClaim = () => {
  describe('claimMint', () => {
    let minterA: any, minterB: any, minterC: any;

    let creator: ethers.Contract;
    let randomizer: ethers.Contract;

    let claimMerklized: Merklized;
    let presaleMerklized: Merklized;

    let minter: (minter: any, invocations: any, proof: any) => void;
    beforeEach(async () => {
      const { wallets, contracts, merkle } = await beforeEachSetupForGenerative(params);

      minterA = wallets.minterA;
      minterB = wallets.minterB;
      minterC = wallets.minterC;

      creator = contracts.creator;
      randomizer = contracts.randomizer;

      claimMerklized = merkle.claimMerklized;
      presaleMerklized = merkle.presaleMerklized;

      minter = async (minter, invocations, proof) => creator.connect(minter).claimMint(invocations, proof);
    });

    beforeEach(async () => {});

    it('should be able to mint if address whitelisted', async () => {
      let leaf = generateLeaf(minterA.address, 2);
      let proof = claimMerklized.tree.getHexProof(leaf);
      await expect(minter(minterA, 2, proof))
        .to.emit(creator, 'Created')
        .withArgs(minterA.address, 2, 2, [keccak256Hashes[0], keccak256Hashes[1]]);
    });

    it('should not be able to mint if less than allocated invocation', async () => {
      let leaf = generateLeaf(minterA.address, 2);
      let proof = presaleMerklized.tree.getHexProof(leaf);
      await expect(minter(minterA, 1, proof)).to.be.revertedWith('RhapsodyCreatorGenerative/invalid-address-proof');
    });

    it('should fail if minting invocation is 0', async () => {
      let leaf = generateLeaf(minterA.address, 2);
      let proof = claimMerklized.tree.getHexProof(leaf);
      await expect(minter(minterA, 0, proof)).to.be.revertedWith(
        'RhapsodyCreatorGenerative/invalid-invocation-lower-boundary'
      );
    });

    it('should fail if trying to minting more than maxPresaleBatchPerAddress', async () => {
      let leaf = generateLeaf(minterA.address, 2);
      let proof = claimMerklized.tree.getHexProof(leaf);
      await expect(minter(minterA, params.maxPublicBatchPerAddress + 1, proof)).to.be.revertedWith(
        'RhapsodyCreatorGenerative/invalid-address-proof'
      );
    });

    it('should fail address proof if passed in invalid maxInvocations', async () => {
      let leaf = generateLeaf(minterA.address, 3);
      let proof = claimMerklized.tree.getHexProof(leaf);
      await expect(minter(minterA, 2, proof)).to.be.revertedWith('RhapsodyCreatorGenerative/invalid-address-proof');

      leaf = generateLeaf(minterC.address, 5);
      proof = claimMerklized.tree.getHexProof(leaf);
      await expect(minter(minterC, 1, proof)).to.be.revertedWith('RhapsodyCreatorGenerative/invalid-address-proof');
    });

    it('should only be able to mint once', async () => {
      let leaf = generateLeaf(minterC.address, 1);
      let proof = claimMerklized.tree.getHexProof(leaf);

      await expect(minter(minterC, 1, proof))
        .to.emit(creator, 'Created')
        .withArgs(minterC.address, 1, 1, [keccak256Hashes[0]]);

      await expect(minter(minterC, 1, proof)).to.to.be.revertedWith(
        'RhapsodyCreatorGenerative/invalid-invocation-upper-boundary'
      );

      leaf = generateLeaf(minterA.address, 2);
      proof = claimMerklized.tree.getHexProof(leaf);

      await expect(minter(minterA, 2, proof))
        .to.emit(creator, 'Created')
        .withArgs(minterA.address, 3, 2, [keccak256Hashes[1], keccak256Hashes[2]]);

      await expect(minter(minterA, 1, proof)).to.to.be.revertedWith(
        'RhapsodyCreatorGenerative/invalid-invocation-upper-boundary'
      );
    });

    it('should not be able to transfer NFTs out and mint again', async () => {
      let leaf = generateLeaf(minterC.address, 1);
      let proof = claimMerklized.tree.getHexProof(leaf);

      await expect(minter(minterC, 1, proof))
        .to.emit(creator, 'Created')
        .withArgs(minterC.address, 1, 1, [keccak256Hashes[0]]);

      await creator.connect(minterC).transferFrom(minterC.address, minterB.address, 0);

      await expect(minter(minterC, 1, proof)).to.to.be.revertedWith(
        'RhapsodyCreatorGenerative/invalid-invocation-upper-boundary'
      );
    });

    it('should not be able to mint if not whitelisted', async () => {
      const wrongProof = [
        '0x1428975b69ccaa80e5613347ec07d7a0696894fc28b3655983d43f9eb00032a1',
        '0xf55f0dad9adfe0f2aa1946779b3ca83c165360edef49c6b72ddc0e2f070f7ff6',
      ];

      await expect(minter(minterB, 2, wrongProof)).to.be.revertedWith(
        'RhapsodyCreatorGenerative/invalid-address-proof'
      );
    });
  });
};

const _testContractPresale = () => {
  describe('presaleMint', () => {
    let minterA: any, minterB: any, minterC: any;

    let creator: ethers.Contract;
    let randomizer: ethers.Contract;

    let claimMerklized: Merklized;
    let presaleMerklized: Merklized;

    let minter: (minter: any, invocations: any, maxInvocation: any, proof: any, ether: any) => void;

    beforeEach(async () => {
      const { wallets, contracts, merkle } = await beforeEachSetupForGenerative(params);

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

    it('should fail if trying to minting more than maxPresaleBatchPerAddress', async () => {
      let leaf = generateLeaf(minterA.address, 2);
      let proof = presaleMerklized.tree.getHexProof(leaf);
      await expect(minter(minterA, 3, 2, proof, 3 * 0.333)).to.be.revertedWith(
        'RhapsodyCreatorGenerative/invalid-invocation-upper-boundary'
      );
    });

    it('should fail address proof if passed in invalid maxInvocations', async () => {
      let leaf = generateLeaf(minterA.address, 5);
      let proof = presaleMerklized.tree.getHexProof(leaf);
      await expect(minter(minterA, 1, 10, proof, 0.333)).to.be.revertedWith(
        'RhapsodyCreatorGenerative/invalid-address-proof'
      );

      leaf = generateLeaf(minterB.address, 5);
      proof = presaleMerklized.tree.getHexProof(leaf);
      await expect(minter(minterB, 5, 10, proof, 0.333 * 5)).to.be.revertedWith(
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
      await expect(minter(minterB, 5, 10, proof, 0)).to.be.revertedWith('RhapsodyCreatorGenerative/invalid-mint-value');
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
