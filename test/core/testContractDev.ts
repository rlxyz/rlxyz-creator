const { expect } = require('chai');
const { parseEther } = require('../helpers/constant');
import { ethers } from 'ethers';
import { defaultAbiCoder, keccak256 } from 'ethers/lib/utils';
import { beforeEachSetupForGenerative } from '../helpers/contractBeforeEachSetup';
import { generateKeccak256Hash, keccak256Hashes } from '../helpers/generateKeccak256Hash';
import { params, currentBlockTime } from '../RhapsodyCreatorGenerative.test';

export const testContractDev = () => {
  describe('dev', () => {
    let deployer: any, minterA: any;
    let creator: ethers.Contract;

    beforeEach(async () => {
      const { contracts, wallets } = await beforeEachSetupForGenerative(params);
      creator = contracts.creator;
      deployer = wallets.deployer;
      minterA = wallets.minterA;
    });

    describe('promotionMint', () => {
      it('should be able to batch mint according to maxBatchSize', async () => {
        await expect(creator.promotionMint(params.amountForPromotion))
          .to.emit(creator, 'Created')
          .withArgs(deployer.address, 2, 2, [keccak256Hashes[0], keccak256Hashes[1]])
          .withArgs(deployer.address, 4, 2, [keccak256Hashes[2], keccak256Hashes[3]])
          .withArgs(deployer.address, 18, 2, [generateKeccak256Hash(16), generateKeccak256Hash(17)]);
      });

      it('should be able to batch mint according to maxBatchSize multiple times', async () => {
        await expect(creator.promotionMint(6))
          .to.emit(creator, 'Created')
          .withArgs(deployer.address, 2, 2, [keccak256Hashes[0], keccak256Hashes[1]])
          .withArgs(deployer.address, 4, 2, [keccak256Hashes[2], keccak256Hashes[3]])
          .withArgs(deployer.address, 6, 2, [keccak256Hashes[4], keccak256Hashes[5]]);

        await expect(creator.promotionMint(6))
          .to.emit(creator, 'Created')
          .withArgs(deployer.address, 8, 2, [generateKeccak256Hash(6), generateKeccak256Hash(7)])
          .withArgs(deployer.address, 10, 2, [generateKeccak256Hash(8), generateKeccak256Hash(9)]);
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
        let creator: ethers.Contract;
        beforeEach(async () => {
          const paramsB = {
            collectionSize: 8,
            amountForPromotion: 4,
            maxPublicBatchPerAddress: 2,
            mintPrice: params.mintPrice,
          };

          const { contracts, wallets } = await beforeEachSetupForGenerative(paramsB);

          creator = contracts.creator;
        });

        it('should not allow to mint more than promotionMint if some nfts already minted', async () => {
          await expect(creator.promotionMint(4))
            .to.emit(creator, 'Created')
            .withArgs(deployer.address, 2, 2, [keccak256Hashes[0], keccak256Hashes[1]])
            .withArgs(deployer.address, 4, 2, [keccak256Hashes[2], keccak256Hashes[3]]);

          await creator.setMintTime(currentBlockTime + 1, currentBlockTime + 2, currentBlockTime + 3);

          await creator.connect(minterA).publicMint(2, { value: parseEther(0.333 * 2) });

          await expect(creator.promotionMint(4)).to.be.revertedWith(
            'RhapsodyCreatorGenerative/invalid-promotion-supply'
          );
        });

        it('should only allow correct allocation of promotion mint even if late', async () => {
          await creator.setMintTime(currentBlockTime + 1, currentBlockTime + 2, currentBlockTime + 3);
          await creator.connect(minterA).publicMint(2, { value: parseEther(0.333 * 2) });
          await expect(creator.promotionMint(2))
            .to.emit(creator, 'Created')
            .withArgs(deployer.address, 4, 2, [keccak256Hashes[2], keccak256Hashes[3]]);
          await expect(creator.promotionMint(2)).to.be.revertedWith(
            'RhapsodyCreatorGenerative/invalid-promotion-supply'
          );
        });
      });
    });
  });
};
