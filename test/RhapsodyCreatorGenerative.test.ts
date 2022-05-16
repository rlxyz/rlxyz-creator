const debug = require('debug')('ptv3:RhapsodyCreator');
const { expect } = require('chai');
const hre = require('hardhat');
const { overrides, parseEther } = require('./helpers/constant');
const { buildWhitelist, generateLeaf } = require('../scripts/helpers/whitelist');
const { keccak256 } = require('@ethersproject/keccak256');
const { defaultAbiCoder } = require('@ethersproject/abi');
export const currentBlockTime = 123456789;

import { ethers } from 'ethers';
import { Merklized } from './core/type';

import { testContractTokenHash } from './core/testContractTokenHash';
import { testContractTokenURI } from './core/testContractTokenURI';
import { testContractDeployment } from './core/testContractDeployment';
import { testContractBaseURI } from './core/testContractBaseURI';
import { testContractCore } from './core/testContractCore';
import { testContractSale } from './core/testContractSale';

export const params = {
  name: 'Rhapsody Creator Test',
  symbol: 'RCT',
  collectionSize: 1111,
  maxPresaleBatchPerAddress: 2,
  maxPublicBatchPerAddress: 2,
  amountForPromotion: 20,
  mintPrice: parseEther(0.333),
};

const keccak256Hashes = {
  0: keccak256(defaultAbiCoder.encode(['uint256'], [0])),
  1: keccak256(defaultAbiCoder.encode(['uint256'], [1])),
  2: keccak256(defaultAbiCoder.encode(['uint256'], [2])),
  3: keccak256(defaultAbiCoder.encode(['uint256'], [3])),
  4: keccak256(defaultAbiCoder.encode(['uint256'], [4])),
  5: keccak256(defaultAbiCoder.encode(['uint256'], [5])),
};

describe('RhapsodyCreatorGenerative', () => {
  let deployer: any, admin: any, minterA: any, minterB: any, minterC: any;

  let creator: ethers.Contract;
  let presaleMerklized: Merklized;
  let claimMerklized: Merklized;
  let randomizer: ethers.Contract;

  beforeEach(async () => {
    [deployer, admin, minterA, minterB, minterC] = await hre.ethers.getSigners();

    debug(`using wallet ${deployer.address}`);
    debug('deploying creator...');

    const Randomizer = await hre.ethers.getContractFactory('Randomizer', deployer, overrides);

    const RhapsodyCreator = await hre.ethers.getContractFactory('RhapsodyCreatorGenerativeTest', deployer, overrides);

    randomizer = await Randomizer.deploy();

    creator = await RhapsodyCreator.deploy(
      params.collectionSize,
      params.maxPublicBatchPerAddress,
      params.amountForPromotion,
      params.mintPrice
    );

    presaleMerklized = await buildWhitelist([
      [minterA.address, 2],
      [minterB.address, 2],
      [minterC.address, 2],
    ]);

    claimMerklized = await buildWhitelist([
      [minterA.address, 2],
      [minterB.address, 2],
      [minterC.address, 1],
    ]);

    await creator.setPresaleMerkleRoot(presaleMerklized.root);
    await creator.setClaimMerkleRoot(claimMerklized.root);
    await creator.setMintRandomizerContract(randomizer.address);
    await creator.transferOwnership(admin.address);
    await randomizer.addDependency(creator.address);
    creator = creator.connect(admin);
  });

  testContractCore();
  testContractDeployment();
  testContractBaseURI();
  testContractTokenURI();
  testContractTokenHash();
  testContractSale(['claim', 'presale', 'public']);

  describe('sale', () => {
    describe('publicMint', () => {
      let publicMinter: any;
      beforeEach(async () => {
        await creator.setMintTime(currentBlockTime + 100, currentBlockTime + 105, currentBlockTime + 110);
        publicMinter = async (minter: any, invocations: number, ether: number) =>
          creator.connect(minter).publicMint(invocations, {
            value: parseEther(ether),
          });
      });

      it('should be able to mint nfts in public mint', async () => {
        await expect(publicMinter(minterA, 1, 0.333))
          .to.emit(creator, 'Created')
          .withArgs(minterA.address, 1, 1, [keccak256Hashes[0]]);

        await expect(publicMinter(minterA, 1, 0.333))
          .to.emit(creator, 'Created')
          .withArgs(minterA.address, 2, 1, [keccak256Hashes[1]]);

        await expect(publicMinter(minterB, 2, 2 * 0.333))
          .to.emit(creator, 'Created')
          .withArgs(minterB.address, 4, 2, [keccak256Hashes[2], keccak256Hashes[3]]);

        await expect(publicMinter(minterC, 2, 2 * 0.333))
          .to.emit(creator, 'Created')
          .withArgs(minterC.address, 6, 2, [keccak256Hashes[4], keccak256Hashes[5]]);
      });

      it('should only be able to max batch amount of nfts', async () => {
        await expect(publicMinter(minterA, 2, 0.333 * 2))
          .to.emit(creator, 'Created')
          .withArgs(minterA.address, 2, 2, [keccak256Hashes[0], keccak256Hashes[1]]);

        await expect(publicMinter(minterB, 3, 3 * 0.333)).to.be.revertedWith(
          'RhapsodyCreatorGenerative/invalid-invocation-upper-boundary'
        );
      });

      it('should only be able to mint max batch amount of nfts even in two or more txs', async () => {
        await expect(publicMinter(minterA, 1, 0.333))
          .to.emit(creator, 'Created')
          .withArgs(minterA.address, 1, 1, [keccak256Hashes[0]]);

        await expect(publicMinter(minterA, 2, 0.333 * 2)).to.be.revertedWith(
          'RhapsodyCreatorGenerative/invalid-invocation-upper-boundary'
        );
      });

      it('should fail if minting invocation is 0', async () => {
        await expect(publicMinter(minterA, 0, 0.333)).to.be.revertedWith(
          'RhapsodyCreatorGenerative/invalid-invocation-lower-boundary'
        );
      });
    });

    describe('setMintTime', () => {
      it('should be able to set valid mint times', async () => {
        await creator.setMintTime(currentBlockTime + 100, currentBlockTime + 105, currentBlockTime + 110);

        expect(await creator.claimTime()).to.be.equal(currentBlockTime + 100);

        expect(await creator.presaleTime()).to.be.equal(currentBlockTime + 105);

        expect(await creator.publicTime()).to.be.equal(currentBlockTime + 110);
      });

      it('can change presale and public time retroactively', async () => {
        await creator.setMintTime(currentBlockTime + 100, currentBlockTime + 105, currentBlockTime + 110);

        // forward time
        await creator.setMintTime(currentBlockTime + 105, currentBlockTime + 110, currentBlockTime + 115);

        expect(await creator.claimTime()).to.be.equal(currentBlockTime + 105);

        expect(await creator.presaleTime()).to.be.equal(currentBlockTime + 110);

        expect(await creator.publicTime()).to.be.equal(currentBlockTime + 115);

        // backward time
        await creator.setMintTime(currentBlockTime + 100, currentBlockTime + 105, currentBlockTime + 110);

        expect(await creator.claimTime()).to.be.equal(currentBlockTime + 100);
        expect(await creator.presaleTime()).to.be.equal(currentBlockTime + 105);
        expect(await creator.publicTime()).to.be.equal(currentBlockTime + 110);

        // testing edge case
        await creator.setMintTime(currentBlockTime + 1, currentBlockTime + 2, currentBlockTime + 3);
        expect(await creator.claimTime()).to.be.equal(currentBlockTime + 1);
        expect(await creator.presaleTime()).to.be.equal(currentBlockTime + 2);
        expect(await creator.publicTime()).to.be.equal(currentBlockTime + 3);
      });

      it('public sale time cannot be less than presale time', async () => {
        await expect(
          creator.setMintTime(currentBlockTime + 100, currentBlockTime + 110, currentBlockTime + 105)
        ).to.be.revertedWith('RhapsodyCreatorGenerative/invalid-public-time');

        // edge cases
        await expect(
          creator.setMintTime(currentBlockTime + 1, currentBlockTime + 2, currentBlockTime + 1)
        ).to.be.revertedWith('RhapsodyCreatorGenerative/invalid-public-time');

        await expect(
          creator.setMintTime(currentBlockTime + 1, currentBlockTime + 2, currentBlockTime + 0)
        ).to.be.revertedWith('RhapsodyCreatorGenerative/invalid-public-time');
      });

      it('presale time cannot be less than the current block timestamp', async () => {
        await expect(
          creator.setMintTime(currentBlockTime + 1, currentBlockTime - 10, currentBlockTime + 10)
        ).to.be.revertedWith('RhapsodyCreatorGenerative/invalid-presale-time');

        await expect(
          creator.setMintTime(currentBlockTime + 1, currentBlockTime - 1, currentBlockTime)
        ).to.be.revertedWith('RhapsodyCreatorGenerative/invalid-presale-time');

        await expect(
          creator.setMintTime(currentBlockTime + 1, currentBlockTime - 2, currentBlockTime - 1)
        ).to.be.revertedWith('RhapsodyCreatorGenerative/invalid-presale-time');
      });
    });
  });

  describe('dev', () => {
    beforeEach(async () => {
      await creator.setMintTime(currentBlockTime + 100, currentBlockTime + 105, currentBlockTime + 110);
    });

    describe('promotionMint', () => {
      it('should be able to batch mint according to maxBatchSize', async () => {
        await expect(creator.promotionMint(params.amountForPromotion))
          .to.emit(creator, 'Created')
          .withArgs(admin.address, 2, 2, [keccak256Hashes[0], keccak256Hashes[1]])
          .withArgs(admin.address, 4, 2, [keccak256Hashes[2], keccak256Hashes[3]])
          .withArgs(admin.address, 18, 2, [
            keccak256(defaultAbiCoder.encode(['uint256'], [16])),
            keccak256(defaultAbiCoder.encode(['uint256'], [17])),
          ]);
      });

      it('should be able to batch mint according to maxBatchSize multiple times', async () => {
        await expect(creator.promotionMint(6))
          .to.emit(creator, 'Created')
          .withArgs(admin.address, 2, 2, [keccak256Hashes[0], keccak256Hashes[1]])
          .withArgs(admin.address, 4, 2, [keccak256Hashes[2], keccak256Hashes[3]])
          .withArgs(admin.address, 6, 2, [keccak256Hashes[4], keccak256Hashes[5]]);

        await expect(creator.promotionMint(6))
          .to.emit(creator, 'Created')
          .withArgs(admin.address, 8, 2, [
            keccak256(defaultAbiCoder.encode(['uint256'], [6])),
            keccak256(defaultAbiCoder.encode(['uint256'], [7])),
          ])
          .withArgs(admin.address, 10, 2, [
            keccak256(defaultAbiCoder.encode(['uint256'], [8])),
            keccak256(defaultAbiCoder.encode(['uint256'], [9])),
          ]);
      });

      it('should only be able to mint max promotional nfts', async () => {
        creator.promotionMint(20);

        await expect(creator.promotionMint(1)).to.be.revertedWith('RhapsodyCreatorGenerative/invalid-promotion-supply');
      });

      it('should fail if not minting according to maxBatchSize', async () => {
        await expect(creator.promotionMint(1)).to.be.revertedWith('RhapsodyCreatorGenerative/invalid-batch-multiple');
      });

      it('should only allow owner to mint', async () => {
        await expect(creator.connect(minterA).promotionMint(20)).to.be.revertedWith('Ownable: caller is not the owner');
      });

      describe('totalSupply restrictions', () => {
        let creatorA: ethers.Contract;
        beforeEach(async () => {
          let collectionSize = 8;
          let amountForPromotion = 4;
          let maxPublicBatchPerAddress = 2;
          const RhapsodyCreator = await hre.ethers.getContractFactory(
            'RhapsodyCreatorGenerativeTest',
            admin,
            overrides
          );
          creatorA = await RhapsodyCreator.deploy(
            collectionSize,
            maxPublicBatchPerAddress,
            amountForPromotion,
            params.mintPrice
          );
          await creatorA.setMintRandomizerContract(randomizer.address);
          await randomizer.addDependency(creatorA.address);
          await creatorA.setPresaleMerkleRoot(presaleMerklized.root);
        });

        it('should not allow to mint more than promotionMint if some nfts already minted', async () => {
          await expect(creatorA.promotionMint(4))
            .to.emit(creatorA, 'Created')
            .withArgs(admin.address, 2, 2, [keccak256Hashes[0], keccak256Hashes[1]])
            .withArgs(admin.address, 4, 2, [keccak256Hashes[2], keccak256Hashes[3]]);

          await creatorA.setMintTime(currentBlockTime + 1, currentBlockTime + 2, currentBlockTime + 3);

          await creatorA.connect(minterA).publicMint(2, { value: parseEther(0.333 * 2) });

          await expect(creatorA.promotionMint(4)).to.be.revertedWith(
            'RhapsodyCreatorGenerative/invalid-promotion-supply'
          );
        });

        it('should only allow correct allocation of promotion mint even if late', async () => {
          await creatorA.setMintTime(currentBlockTime + 1, currentBlockTime + 2, currentBlockTime + 3);
          await creatorA.connect(minterA).publicMint(2, { value: parseEther(0.333 * 2) });
          await expect(creatorA.promotionMint(2))
            .to.emit(creatorA, 'Created')
            .withArgs(admin.address, 4, 2, [keccak256Hashes[2], keccak256Hashes[3]]);
          await expect(creatorA.promotionMint(2)).to.be.revertedWith(
            'RhapsodyCreatorGenerative/invalid-promotion-supply'
          );
        });
      });
    });
  });

  describe('maxCollection', function () {
    this.timeout(10000);
    let creatorA: ethers.Contract;
    let minter;
    beforeEach(async () => {
      const RhapsodyCreator = await hre.ethers.getContractFactory('RhapsodyCreatorGenerative', deployer, overrides);
      creatorA = await RhapsodyCreator.deploy('Random', 'R', 1200, 1200, 0, parseEther(0.01));

      await creatorA.setClaimMerkleRoot(claimMerklized.root);

      await creatorA.setMintTime(currentBlockTime + 100, currentBlockTime + 105, currentBlockTime + 110);
      await creatorA.setMintRandomizerContract(randomizer.address);
      randomizer.addDependency(creatorA.address);
    });

    it('should all be unique token hashes', async () => {
      let hashes = {};
      for (let i = 0; i < 12; i++) {
        await creatorA.connect(minterA).publicMint(100, {
          value: parseEther(0.01 * 100),
        });
        for (let id = 0; id < 100; id++) {
          const hash = await creatorA.tokenHash(id * (i + 1));

          // @ts-ignore
          if (hashes[hash] !== undefined) {
            console.log('found existing token hash');
            throw new Error('it failed');
          }
        }
      }
    });
  });
});
