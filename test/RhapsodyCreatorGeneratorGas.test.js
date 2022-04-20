const {overrides, parseEther} = require ('./helpers/constant');
const hre = require ('hardhat');
const currentBlockTime = 123456789;
const params = {
  collectionSize: 1111,
  maxPresaleBatchPerAddress: 5,
  maxPublicBatchPerAddress: 100,
  amountForPromotion: 100,
  mintPrice: parseEther (0.08),
};

describe ('RhapsodyCreatorGenerator Gas Usage', () => {
  beforeEach (async () => {
    const [deployer] = await hre.ethers.getSigners ();

    const RhapsodyCreator = await hre.ethers.getContractFactory (
      'RhapsodyCreatorGenerativeTest',
      deployer,
      overrides
    );

    this.creator = await RhapsodyCreator.deploy (
      params.collectionSize,
      params.maxPublicBatchPerAddress,
      params.amountForPromotion,
      params.mintPrice
    );

    await this.creator.setMintTime (
      currentBlockTime + 1,
      currentBlockTime + 2,
      currentBlockTime + 3
    );

    this.deployer = deployer;
  });

  describe ('public', () => {
    it ('should mint one', async () => {
      for (let i = 0; i < 50; i++) {
        await this.creator.publicMint (1, {value: parseEther (0.08)});
      }
    });

    it ('should mint two', async () => {
      for (let i = 0; i < 50; i++) {
        await this.creator.publicMint (2, {value: parseEther (0.08 * 2)});
      }
    });
  });

  //   context ('mintOne', function () {
  //     it ('runs mintOne 50 times', async function () {
  //       for (let i = 0; i < 50; i++) {
  //         await this.creator.mintOne (this.addr1.address);
  //       }
  //     });
  //   });

  //   context ('safeMintOne', function () {
  //     it ('runs safeMintOne 50 times', async function () {
  //       for (let i = 0; i < 50; i++) {
  //         await this.creator.safeMintOne (this.addr1.address);
  //       }
  //     });
  //   });

  //   context ('mintTen', function () {
  //     it ('runs mintTen 50 times', async function () {
  //       for (let i = 0; i < 50; i++) {
  //         await this.creator.mintTen (this.addr1.address);
  //       }
  //     });
  //   });

  //   context ('safeMintTen', function () {
  //     it ('runs safeMintTen 50 times', async function () {
  //       for (let i = 0; i < 50; i++) {
  //         await this.creator.safeMintTen (this.addr1.address);
  //       }
  //     });
  //   });
});
