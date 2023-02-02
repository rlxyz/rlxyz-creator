const { expect } = require('chai');
const { parseEther } = require('../helpers/constant');
import { ethers } from 'ethers';
import { generateKeccak256Hash, keccak256Hashes } from '../helpers/generateKeccak256Hash';
import { ElevateCreatorBeforeEach, ElevateCreatorConstructor } from './type';

export const testContractDev = (_beforeEach: ElevateCreatorBeforeEach, params: ElevateCreatorConstructor) => {
  describe('dev', () => {
    let deployer: any, minterA: any;
    let creator: ethers.Contract;

    beforeEach(async () => {
      const { contracts, wallets } = await _beforeEach(params);
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

        await expect(creator.promotionMint(1)).to.be.revertedWith('ElevateCreatorGenerative/invalid-promotion-supply');
      });

      it('should fail if not minting according to maxBatchSize', async () => {
        await expect(creator.promotionMint(1)).to.be.revertedWith('ElevateCreatorGenerative/invalid-batch-multiple');
      });

      it('should only allow owner to mint', async () => {
        await expect(creator.connect(minterA).promotionMint(20)).to.be.revertedWith('Ownable: caller is not the owner');
      });

      describe('totalSupply restrictions', () => {
        let creator: ethers.Contract;
        beforeEach(async () => {
          const paramsB: ElevateCreatorConstructor = {
            collectionSize: 8,
            amountForPromotion: 4,
            maxMintPerAddress: 2,
            mintPrice: params.mintPrice,
            name: '',
            symbol: '',
            mintRandomizerContract: '',
            claimTime: 0,
            presaleTime: 0,
            publicTime: 0,
          };

          const { contracts, wallets } = await _beforeEach(paramsB);

          creator = contracts.creator;
        });

        it('should not allow to mint more than promotionMint if some nfts already minted', async () => {
          await expect(creator.promotionMint(4))
            .to.emit(creator, 'Created')
            .withArgs(deployer.address, 2, 2, [keccak256Hashes[0], keccak256Hashes[1]])
            .withArgs(deployer.address, 4, 2, [keccak256Hashes[2], keccak256Hashes[3]]);

          await creator.setPublicTime(12345678);

          await creator.connect(minterA).publicMint(2, { value: parseEther(0.333 * 2) });

          await expect(creator.promotionMint(4)).to.be.revertedWith(
            'ElevateCreatorGenerative/invalid-promotion-supply'
          );
        });

        it('should only allow correct allocation of promotion mint even if late', async () => {
          await creator.setPublicTime(12345678);
          await creator.connect(minterA).publicMint(2, { value: parseEther(0.333 * 2) });
          await expect(creator.promotionMint(2))
            .to.emit(creator, 'Created')
            .withArgs(deployer.address, 4, 2, [keccak256Hashes[2], keccak256Hashes[3]]);
          await expect(creator.promotionMint(2)).to.be.revertedWith(
            'ElevateCreatorGenerative/invalid-promotion-supply'
          );
        });
      });
    });
  });
};
