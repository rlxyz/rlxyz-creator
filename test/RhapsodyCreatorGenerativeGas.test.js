const {overrides, parseEther} = require ('./helpers/constant');
const hre = require ('hardhat');
const {expect} = require ('chai');
const currentBlockTime = 123456789;
const params = {
  collectionSize: 1111,
  maxPresaleBatchPerAddress: 5,
  maxPublicBatchPerAddress: 1000,
  amountForPromotion: 100,
  mintPrice: parseEther (0.333),
};

describe ('RhapsodyCreatorGenerativeGas', () => {
  beforeEach (async () => {
    const [deployer, addr1] = await hre.ethers.getSigners ();

    const RhapsodyCreator = await hre.ethers.getContractFactory (
      'RhapsodyCreatorGenerativeGasTest',
      deployer,
      overrides
    );

    this.creator = await RhapsodyCreator.deploy (
      params.collectionSize,
      params.maxPublicBatchPerAddress,
      params.amountForPromotion,
      params.mintPrice
    );

    this.deployer = deployer;
    this.addr1 = addr1;
  });

  describe ('public', () => {
    it ('should mint one', async () => {
      for (let i = 0; i < 50; i++) {
        // await expect (
        this.creator.mintOne (this.addr1.address);
        // ).to
        // .emit (this.creator, 'Created')
        // .withArgs (this.addr1.address, i, 1);
      }
    });
    // it ('should mint two', async () => {
    //   try {
    //     for (let i = 0; i < 50; i++) {
    //       this.creator.mintOne (this.addr1.address);
    //     }
    //   } catch (e) {
    //     console.log ('dafuq');
    //   }
    // });
  });
});
