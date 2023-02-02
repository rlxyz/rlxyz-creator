const { expect } = require('chai');
const { parseEther } = require('../helpers/constant');
import { ethers } from 'ethers';
import { keccak256Hashes } from '../helpers/generateKeccak256Hash';
import { ElevateCreatorBeforeEach, ElevateCreatorConstructor } from './type';

export const testContractMintPrice = (_beforeEach: ElevateCreatorBeforeEach, params: ElevateCreatorConstructor) => {
  describe('mintPrice', () => {
    let minterA: any, minterB: any, minterC: any;
    let creator: ethers.Contract;
    let baseURI: string;

    let minter: (minter: any, invocations: any, ether: any) => void;
    beforeEach(async () => {
      const { contracts, wallets } = await _beforeEach(params);
      creator = contracts.creator;
      minterA = wallets.minterA;
      minterB = wallets.minterB;
      minterC = wallets.minterC;

      baseURI = 'https://somebaseuri.com/';
      await creator.setBaseURI(baseURI);
      minter = async (minter, invocations, ether) =>
        creator.connect(minter).publicMint(invocations, {
          value: parseEther(ether),
        });
    });

    it('should change the mintPrice', async () => {
      await creator.setMintPrice(parseEther('0.1'));
      expect(await creator.mintPrice()).to.equal(parseEther('0.1'));
    });

    it('should allow minter to mint if they have enough balance', async () => {
      await creator.setMintPrice(parseEther('0.11'));
      await expect(minter(minterA, 1, 0.11))
        .to.emit(creator, 'Created')
        .withArgs(minterA.address, 1, 1, [keccak256Hashes[0]]);
    });

    // it('should return valid token uri if minting many at once', async () => {});
  });
};
