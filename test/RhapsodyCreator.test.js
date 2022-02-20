const debug = require ('debug') ('ptv3:RhapsodyCreator');
const {expect} = require ('chai');
const hre = require ('hardhat');
const {overrides, parseEther} = require ('./helpers/constant');
const {buildWhitelist, generateLeaf} = require ('../scripts/helpers/whitelist');

const currentBlockTime = 123456789;
const name = 'Rhapsody Creator Test';
const symbol = 'RCT';

const creatorTestParams = {
  collectionSize: 6688,
  maxPresaleBatchPerAddress: 5,
  maxPublicBatchPerAddress: 20,
  amountForPromotion: 100,
  mintPrice: parseEther (0.08),
};

describe ('RhapsodyCreator', () => {
  let deployer, admin, minterA, minterB, minterC;

  let creator;
  let merklized;

  beforeEach (async () => {
    [
      deployer,
      admin,
      minterA,
      minterB,
      minterC,
    ] = await hre.ethers.getSigners ();

    merklized = await buildWhitelist ([
      [minterA.address, 5],
      [minterB.address, 5],
      [minterC.address, 5],
    ]);
    debug (`using wallet ${deployer.address}`);
    debug ('deploying creator...');
    const RhapsodyCreator = await hre.ethers.getContractFactory (
      'RhapsodyCreatorTest',
      deployer,
      overrides
    );

    creator = await RhapsodyCreator.deploy (
      creatorTestParams.collectionSize,
      creatorTestParams.maxPublicBatchPerAddress,
      creatorTestParams.amountForPromotion,
      creatorTestParams.mintPrice
    );

    await creator.setMintMerkleRoot (merklized.root);

    await creator.transferOwnership (admin.address);

    creator = creator.connect (admin);

    // await hre.ethers.provider.send ('evm_increaseTime', [500]);
    // await hre.ethers.provider.send ('evm_mine');
  });

  describe ('core', () => {
    it ('should have name', async () => {
      expect (await creator.name ()).to.equal (name);
    });

    it ('should have symbol', async () => {
      expect (await creator.symbol ()).to.equal (symbol);
    });
  });

  describe ('deployment', () => {
    it ('should have an allocation promotion amount', async () => {
      expect (await creator.amountForPromotion ()).to.equal (
        creatorTestParams.amountForPromotion
      );
    });

    it ('should have set the correct max public mint per address', async () => {
      expect (await creator.maxPublicBatchPerAddress ()).to.equal (
        creatorTestParams.maxPublicBatchPerAddress
      );
    });

    it ('should have a valid mint price', async () => {
      expect (await creator.mintPrice ()).to.equal (
        creatorTestParams.mintPrice
      );
    });
  });

  describe ('baseURI', () => {
    it ('should have empty base uri', async () => {
      expect (await creator.baseURI ()).to.equal ('');
    });

    it ('should set baseUri', async () => {
      const baseURI = 'https://someuri.com';
      await creator.setBaseURI (baseURI);
      expect (await creator.baseURI ()).to.equal (baseURI);
    });

    it ('should be able to change the baseURI', async () => {
      const baseURI = 'https://somebaseuri.com/';
      await creator.setBaseURI (baseURI);
      expect (await creator.baseURI ()).to.equal (baseURI);

      const baseURI2 = 'https://someotherbaseuri.com/';
      await creator.setBaseURI (baseURI2);
      expect (await creator.baseURI ()).to.equal (baseURI2);
    });
  });

  describe ('tokenURI', () => {
    let baseURI;
    beforeEach (async () => {
      baseURI = 'https://somebaseuri.com/';
      await creator.setBaseURI (baseURI);
      await creator.setMintTime (currentBlockTime + 1, currentBlockTime + 2);
    });

    it ('should return valid token uri', async () => {
      await creator
        .connect (minterA)
        .publicMint (1, {value: parseEther (0.08)});
      expect (await creator.tokenURI (0)).to.equal (baseURI + '0');

      await creator
        .connect (minterA)
        .publicMint (1, {value: parseEther (0.08)});
      expect (await creator.tokenURI (1)).to.equal (baseURI + '1');

      await creator
        .connect (minterA)
        .publicMint (1, {value: parseEther (0.08)});
      expect (await creator.tokenURI (2)).to.equal (baseURI + '2');

      await creator
        .connect (minterA)
        .publicMint (1, {value: parseEther (0.08)});
      expect (await creator.tokenURI (3)).to.equal (baseURI + '3');

      await expect (creator.tokenURI (4)).to.be.revertedWith (
        'URIQueryForNonexistentToken'
      );
    });

    it ('should return valid token uri', async () => {
      await creator
        .connect (minterA)
        .publicMint (5, {value: parseEther (0.08 * 5)});
      expect (await creator.tokenURI (0)).to.equal (baseURI + '0');
      expect (await creator.tokenURI (1)).to.equal (baseURI + '1');
      expect (await creator.tokenURI (2)).to.equal (baseURI + '2');
      expect (await creator.tokenURI (3)).to.equal (baseURI + '3');
      expect (await creator.tokenURI (4)).to.equal (baseURI + '4');
      await expect (creator.tokenURI (5)).to.be.revertedWith (
        'URIQueryForNonexistentToken'
      );
    });
  });

  describe ('sale', () => {
    describe ('presaleMint', () => {
      let creatorA;
      let presaleMinter;
      beforeEach (async () => {
        const RhapsodyCreator = await hre.ethers.getContractFactory (
          'RhapsodyCreatorTest',
          deployer,
          overrides
        );
        creatorA = await RhapsodyCreator.deploy (
          creatorTestParams.collectionSize,
          creatorTestParams.maxPublicBatchPerAddress,
          creatorTestParams.amountForPromotion,
          creatorTestParams.mintPrice
        );

        await creatorA.setMintMerkleRoot (merklized.root);

        await creatorA.setMintTime (
          currentBlockTime + 105,
          currentBlockTime + 110
        );

        presaleMinter = async (
          minter,
          invocations,
          maxInvocation,
          proof,
          ether
        ) =>
          creatorA
            .connect (minter)
            .presaleMint (invocations, maxInvocation, proof, {
              value: parseEther (ether),
            });
      });

      it ('should be able to mint if address whitelisted', async () => {
        let leaf = generateLeaf (minterA.address, 5);
        let proof = merklized.tree.getHexProof (leaf);
        await expect (presaleMinter (minterA, 5, 5, proof, 0.08 * 5)).to
          .emit (creatorA, 'Created')
          .withArgs (minterA.address, 5);
      });

      it ('should be able to mint if less than max invocation limit', async () => {
        let leaf = generateLeaf (minterA.address, 5);
        let proof = merklized.tree.getHexProof (leaf);
        await expect (presaleMinter (minterA, 4, 5, proof, 0.08 * 4)).to
          .emit (creatorA, 'Created')
          .withArgs (minterA.address, 4);

        leaf = generateLeaf (minterC.address, 5);
        proof = merklized.tree.getHexProof (leaf);
        await expect (presaleMinter (minterC, 1, 5, proof, 0.08)).to
          .emit (creatorA, 'Created')
          .withArgs (minterC.address, 1);
      });

      it ('should fail if minting invocation is 0', async () => {
        let leaf = generateLeaf (minterA.address, 5);
        let proof = merklized.tree.getHexProof (leaf);
        await expect (
          presaleMinter (minterA, 0, 5, proof, 0)
        ).to.be.revertedWith (
          'RhapsodyCreator/invalid-invocation-lower-boundary'
        );
      });

      it ('should fail if trying to minting more than maxPresaleBatchPerAddress', async () => {
        let leaf = generateLeaf (minterA.address, 5);
        let proof = merklized.tree.getHexProof (leaf);
        await expect (
          presaleMinter (minterA, 6, 5, proof, 6 * 0.08)
        ).to.be.revertedWith (
          'RhapsodyCreator/invalid-invocation-upper-boundary'
        );
      });

      it ('should fail address proof if passed in invalid maxInvocations', async () => {
        let leaf = generateLeaf (minterA.address, 5);
        let proof = merklized.tree.getHexProof (leaf);
        await expect (
          presaleMinter (minterA, 1, 10, proof, 0.08)
        ).to.be.revertedWith ('RhapsodyCreator/invalid-address-proof');

        leaf = generateLeaf (minterB.address, 5);
        proof = merklized.tree.getHexProof (leaf);
        await expect (
          presaleMinter (minterB, 5, 10, proof, 0.08 * 5)
        ).to.be.revertedWith ('RhapsodyCreator/invalid-address-proof');
      });

      it ('should fail if too much or too little eth supplied', async () => {
        let leaf = generateLeaf (minterA.address, 5);
        let proof = merklized.tree.getHexProof (leaf);
        await expect (
          presaleMinter (minterA, 1, 5, proof, 1.5)
        ).to.be.revertedWith ('RhapsodyCreator/invalid-mint-value');

        leaf = generateLeaf (minterB.address, 5);
        proof = merklized.tree.getHexProof (leaf);
        await expect (
          presaleMinter (minterB, 5, 10, proof, 0)
        ).to.be.revertedWith ('RhapsodyCreator/invalid-mint-value');
      });

      // todo: fix
      // it ('should only be able to mint once', async () => {
      //   let leaf = generateLeaf (minterA.address, 5);
      //   let proof = merklized.tree.getHexProof (leaf);

      //   await expect (presaleMinter (minterA, 4, 5, proof, 4 * 0.08)).to
      //     .emit (creatorA, 'Created')
      //     .withArgs (minterA.address, 4);

      //   await expect (
      //     presaleMinter (minterA, 1, 5, proof, 0.08)
      //   ).to.to.be.revertedWith ('RhapsodyCreator/invalid-double-mint');

      //   leaf = generateLeaf (minterB.address, 5);
      //   proof = merklized.tree.getHexProof (leaf);

      //   await expect (presaleMinter (minterB, 4, 5, proof, 4 * 0.08)).to
      //     .emit (creatorA, 'Created')
      //     .withArgs (minterB.address, 4);

      //   await expect (
      //     presaleMinter (minterB, 2, 5, proof, 2 * 0.08)
      //   ).to.be.revertedWith (
      //     'RhapsodyCreator/invalid-invocation-upper-boundary'
      //   );

      //   leaf = generateLeaf (minterC.address, 5);
      //   proof = merklized.tree.getHexProof (leaf);

      //   await expect (presaleMinter (minterC, 5, 5, proof, 5 * 0.08)).to
      //     .emit (creatorA, 'Created')
      //     .withArgs (minterC.address, 5);

      //   await expect (
      //     presaleMinter (minterC, 1, 5, proof, 1 * 0.08)
      //   ).to.be.revertedWith (
      //     'RhapsodyCreator/invalid-invocation-upper-boundary'
      //   );
      // });

      it ('should not be able to transfer NFTs out and mint again', async () => {
        let leaf = generateLeaf (minterA.address, 5);
        let proof = merklized.tree.getHexProof (leaf);

        await expect (presaleMinter (minterA, 2, 5, proof, 2 * 0.08)).to
          .emit (creatorA, 'Created')
          .withArgs (minterA.address, 2);

        await creatorA
          .connect (minterA)
          .transferFrom (minterA.address, minterB.address, 0);

        await creatorA
          .connect (minterA)
          .transferFrom (minterA.address, minterB.address, 1);

        await expect (
          presaleMinter (minterA, 1, 5, proof, 0.08)
        ).to.to.be.revertedWith ('RhapsodyCreator/invalid-double-mint');
      });

      it ('should not be able to mint if not whitelisted', async () => {
        const wrongProof = [
          '0x1428975b69ccaa80e5613347ec07d7a0696894fc28b3655983d43f9eb00032a1',
          '0xf55f0dad9adfe0f2aa1946779b3ca83c165360edef49c6b72ddc0e2f070f7ff6',
        ];

        let leaf = generateLeaf (minterB.address, 5);
        let proof = merklized.tree.getHexProof (leaf);

        await expect (
          presaleMinter (minterB, 1, 5, wrongProof, 1 * 0.08)
        ).to.be.revertedWith ('RhapsodyCreator/invalid-address-proof');
      });

      describe ('variable whitelist', () => {
        let merklizedA;
        beforeEach (async () => {
          merklizedA = await buildWhitelist ([
            [minterB.address, 5],
            [minterA.address, 4],
            [minterC.address, 3],
          ]);
          await creatorA.setMintMerkleRoot (merklizedA.root);
        });

        it ('should be able to variable mint', async () => {
          let leaf = generateLeaf (minterA.address, 4);
          let proof = merklizedA.tree.getHexProof (leaf);
          await expect (presaleMinter (minterA, 2, 4, proof, 2 * 0.08)).to
            .emit (creatorA, 'Created')
            .withArgs (minterA.address, 2);

          leaf = generateLeaf (minterB.address, 5);
          proof = merklizedA.tree.getHexProof (leaf);
          await expect (presaleMinter (minterB, 4, 5, proof, 4 * 0.08)).to
            .emit (creatorA, 'Created')
            .withArgs (minterB.address, 4);

          leaf = generateLeaf (minterC.address, 3);
          proof = merklizedA.tree.getHexProof (leaf);
          await expect (presaleMinter (minterC, 1, 3, proof, 1 * 0.08)).to
            .emit (creatorA, 'Created')
            .withArgs (minterC.address, 1);
        });

        it ('should only allow max allocated variable amount in merkle root', async () => {
          let leaf = generateLeaf (minterA.address, 4);
          let proof = merklizedA.tree.getHexProof (leaf);
          await expect (presaleMinter (minterA, 4, 4, proof, 4 * 0.08)).to
            .emit (creatorA, 'Created')
            .withArgs (minterA.address, 4);

          leaf = generateLeaf (minterB.address, 5);
          proof = merklizedA.tree.getHexProof (leaf);
          await expect (presaleMinter (minterB, 5, 5, proof, 5 * 0.08)).to
            .emit (creatorA, 'Created')
            .withArgs (minterB.address, 5);
        });

        it ('should fail if trying to mint more than max limit of an allocated address limit', async () => {
          let leaf = generateLeaf (minterA.address, 4);
          let proof = merklizedA.tree.getHexProof (leaf);
          await expect (
            presaleMinter (minterA, 5, 4, proof, 5 * 0.08)
          ).to.be.revertedWith (
            'RhapsodyCreator/invalid-invocation-upper-boundary'
          );

          leaf = generateLeaf (minterC.address, 3);
          proof = merklizedA.tree.getHexProof (leaf);
          await expect (
            presaleMinter (minterC, 4, 3, proof, 4 * 0.08)
          ).to.be.revertedWith (
            'RhapsodyCreator/invalid-invocation-upper-boundary'
          );
        });
      });

      // todo: finish this up!
      describe ('small collection', () => {
        let creatorB;
        let merklizedA;
        beforeEach (async () => {
          const RhapsodyCreator = await hre.ethers.getContractFactory (
            'RhapsodyCreatorTest',
            deployer,
            overrides
          );
          merklizedA = await buildWhitelist ([
            [minterB.address, 5],
            [minterA.address, 4],
            [minterC.address, 3],
          ]);
          await creatorA.setMintMerkleRoot (merklizedA.root);

          creatorB = await RhapsodyCreator.deploy (
            12,
            4,
            0,
            creatorTestParams.mintPrice
          );
          await creatorB.setMintMerkleRoot (merklized.root);
          await creatorB.setMintTime (
            currentBlockTime + 105,
            currentBlockTime + 110
          );
        });

        it ('should be able to mint total nft collection size in whitlist', async () => {});
      });
    });

    describe ('publicMint', () => {
      let publicMinter;
      beforeEach (async () => {
        await creator.setMintTime (
          currentBlockTime + 105,
          currentBlockTime + 110
        );
        publicMinter = async (minter, invocations, ether) =>
          creator.connect (minter).publicMint (invocations, {
            value: parseEther (ether),
          });
      });

      it ('should be able to mint nfts in public mint', async () => {
        await expect (publicMinter (minterA, 1, 0.08)).to
          .emit (creator, 'Created')
          .withArgs (minterA.address, 1);

        await expect (publicMinter (minterA, 5, 5 * 0.08)).to
          .emit (creator, 'Created')
          .withArgs (minterA.address, 5);

        await expect (publicMinter (minterA, 14, 14 * 0.08)).to
          .emit (creator, 'Created')
          .withArgs (minterA.address, 14);

        await expect (publicMinter (minterB, 20, 0.08 * 20)).to
          .emit (creator, 'Created')
          .withArgs (minterB.address, 20);
      });

      it ('should only be able to max batch amount of nfts', async () => {
        await expect (publicMinter (minterA, 20, 0.08 * 20)).to
          .emit (creator, 'Created')
          .withArgs (minterA.address, 20);

        await expect (
          publicMinter (minterB, 21, 0.08 * 21)
        ).to.be.revertedWith (
          'RhapsodyCreator/invalid-invocation-upper-boundary'
        );
      });

      it ('should only be able to mint max batch amount of nfts even in two or more txs', async () => {
        await expect (publicMinter (minterA, 5, 0.08 * 5)).to
          .emit (creator, 'Created')
          .withArgs (minterA.address, 5);

        await expect (
          publicMinter (minterA, 16, 0.08 * 16)
        ).to.be.revertedWith (
          'RhapsodyCreator/invalid-invocation-upper-boundary'
        );
      });

      it ('should fail if minting invocation is 0', async () => {
        await expect (publicMinter (minterA, 0, 0.08)).to.be.revertedWith (
          'RhapsodyCreator/invalid-mint-value'
        );
      });
    });

    describe ('setMintTime', () => {
      it ('should be able to set valid mint times', async () => {
        await creator.setMintTime (
          currentBlockTime + 105,
          currentBlockTime + 110
        );

        expect (await creator.presaleTime ()).to.be.equal (
          currentBlockTime + 105
        );

        expect (await creator.publicTime ()).to.be.equal (
          currentBlockTime + 110
        );
      });

      it ('can change presale and public time retroactively', async () => {
        await creator.setMintTime (
          currentBlockTime + 105,
          currentBlockTime + 110
        );
        expect (await creator.presaleTime ()).to.be.equal (
          currentBlockTime + 105
        );
        expect (await creator.publicTime ()).to.be.equal (
          currentBlockTime + 110
        );

        // forward time
        await creator.setMintTime (
          currentBlockTime + 110,
          currentBlockTime + 115
        );

        expect (await creator.presaleTime ()).to.be.equal (
          currentBlockTime + 110
        );

        expect (await creator.publicTime ()).to.be.equal (
          currentBlockTime + 115
        );

        // backward time
        await creator.setMintTime (
          currentBlockTime + 105,
          currentBlockTime + 110
        );

        expect (await creator.presaleTime ()).to.be.equal (
          currentBlockTime + 105
        );
        expect (await creator.publicTime ()).to.be.equal (
          currentBlockTime + 110
        );

        // testing edge case
        await creator.setMintTime (currentBlockTime + 1, currentBlockTime + 2);
        expect (await creator.presaleTime ()).to.be.equal (
          currentBlockTime + 1
        );
        expect (await creator.publicTime ()).to.be.equal (currentBlockTime + 2);
      });

      it ('public sale time cannot be less than presale time', async () => {
        await expect (
          creator.setMintTime (currentBlockTime + 110, currentBlockTime + 105)
        ).to.be.revertedWith ('RhapsodyCreator/invalid-public-time');

        // edge cases
        await expect (
          creator.setMintTime (currentBlockTime + 2, currentBlockTime + 1)
        ).to.be.revertedWith ('RhapsodyCreator/invalid-public-time');

        await expect (
          creator.setMintTime (currentBlockTime + 1, currentBlockTime + 0)
        ).to.be.revertedWith ('RhapsodyCreator/invalid-public-time');
      });

      it ('presale time cannot be less than the current block timestamp', async () => {
        await expect (
          creator.setMintTime (currentBlockTime - 10, currentBlockTime + 10)
        ).to.be.revertedWith ('RhapsodyCreator/invalid-presale-time');

        await expect (
          creator.setMintTime (currentBlockTime - 1, currentBlockTime)
        ).to.be.revertedWith ('RhapsodyCreator/invalid-presale-time');

        await expect (
          creator.setMintTime (currentBlockTime - 2, currentBlockTime - 1)
        ).to.be.revertedWith ('RhapsodyCreator/invalid-presale-time');
      });
    });
  });

  describe ('dev', () => {
    beforeEach (async () => {
      await creator.setMintTime (
        currentBlockTime + 105,
        currentBlockTime + 110
      );
    });

    describe ('promotionMint', () => {
      it ('should be able to batch mint according to maxBatchSize', async () => {
        await expect (creator.promotionMint (100)).to
          .emit (creator, 'Created')
          .withArgs (admin.address, 100);
      });

      it ('should be able to batch mint according to maxBatchSize multiple times', async () => {
        await expect (creator.promotionMint (20)).to
          .emit (creator, 'Created')
          .withArgs (admin.address, 20);
        await expect (creator.promotionMint (40)).to
          .emit (creator, 'Created')
          .withArgs (admin.address, 40);
        await expect (creator.promotionMint (40)).to
          .emit (creator, 'Created')
          .withArgs (admin.address, 40);
      });

      it ('should only be able to mint max promotional nfts', async () => {
        await expect (creator.promotionMint (100)).to
          .emit (creator, 'Created')
          .withArgs (admin.address, 100);

        await expect (creator.promotionMint (1)).to.be.revertedWith (
          'RhapsodyCreator/invalid-promotion-supply'
        );
      });

      it ('should fail if not minting according to maxBatchSize', async () => {
        await expect (creator.promotionMint (1)).to.be.revertedWith (
          'RhapsodyCreator/invalid-batch-multiple'
        );
      });

      it ('should only allow owner to mint', async () => {
        await expect (
          creator.connect (minterA).promotionMint (20)
        ).to.be.revertedWith ('Ownable: caller is not the owner');
      });

      describe ('totalSupply restrictions', () => {
        let creatorA;
        beforeEach (async () => {
          let collectionSize = 8;
          let amountForPromotion = 4;
          let maxPublicBatchPerAddress = 2;
          const RhapsodyCreator = await hre.ethers.getContractFactory (
            'RhapsodyCreatorTest',
            admin,
            overrides
          );
          creatorA = await RhapsodyCreator.deploy (
            collectionSize,
            maxPublicBatchPerAddress,
            amountForPromotion,
            creatorTestParams.mintPrice
          );
          await creatorA.setMintMerkleRoot (merklized.root);
        });

        it ('should not allow to mint more than promotionMint if some nfts already minted', async () => {
          await expect (creatorA.promotionMint (4)).to
            .emit (creatorA, 'Created')
            .withArgs (admin.address, 4);

          await creatorA.setMintTime (
            currentBlockTime + 1,
            currentBlockTime + 2
          );

          await creatorA
            .connect (minterA)
            .publicMint (2, {value: parseEther (0.08 * 2)});

          await expect (creatorA.promotionMint (4)).to.be.revertedWith (
            'RhapsodyCreator/invalid-promotion-supply'
          );
        });

        it ('should only allow correct allocation of promotion mint even if late', async () => {
          await creatorA.setMintTime (
            currentBlockTime + 1,
            currentBlockTime + 2
          );
          await creatorA
            .connect (minterA)
            .publicMint (2, {value: parseEther (0.08 * 2)});
          await expect (creatorA.promotionMint (2)).to
            .emit (creatorA, 'Created')
            .withArgs (admin.address, 2);
          await expect (creatorA.promotionMint (2)).to.be.revertedWith (
            'RhapsodyCreator/invalid-promotion-supply'
          );
        });
      });
    });
  });

  // todo: add these test cases
  // describe ('publicMint', () => {
  //   let t;
  //   let mintFunction;
  //   beforeEach (async () => {
  //     mintFunction = async (invocations, ether) =>
  //       creator.connect (minterA).publicMint (invocations, {
  //         value: parseEther (ether),
  //       });
  //   });

  //   // it ('should fail if minting too many', async () => {
  //   //   await mintFunction (maxMintPerTx - 1, 0.08 * (maxMintPerTx - 1)); // todo: check minterA's address, should pass
  //   //   await mintFunction (maxMintPerTx, 0.08 * maxMintPerTx); // todo: check minterA's address, should pass
  //   //   await expect (
  //   //     mintFunction (maxMintPerTx + 1, 0.08 * (maxMintPerTx + 1))
  //   //   ).to.be.revertedWith ('RhapsodyCreator/invalid-mint-invocation');
  //   //   await expect (mintFunction (minMintPerTx - 1, 0)).to.be.revertedWith (
  //   //     'RhapsodyCreator/invalid-mint-invocation'
  //   //   );
  //   // });

  //   // it ("should fail if 'to' is invalid", async () => {
  //   //   await expect (
  //   //     t.mint (AddressZero, 1, {
  //   //       value: parseEther (0.08),
  //   //     })
  //   //   ).to.be.revertedWith ('ERC721A: mint to the zero address');
  //   // });

  //   it ('should supply correct ether value', async () => {
  //     await expect (mintFunction (3, 3 * 0.05)).to.be.revertedWith (
  //       'RhapsodyCreator/invalid-mint-value'
  //     );
  //     await expect (mintFunction (1, 0)).to.be.revertedWith (
  //       'RhapsodyCreator/invalid-mint-value'
  //     );
  //     await expect (mintFunction (maxMintPerTx, 0)).to.be.revertedWith (
  //       'RhapsodyCreator/invalid-mint-value'
  //     );
  //     await expect (mintFunction (maxMintPerTx, 2)).to.be.revertedWith (
  //       'RhapsodyCreator/invalid-mint-value'
  //     );
  //     await expect (mintFunction (maxMintPerTx, 10)).to.be.revertedWith (
  //       'RhapsodyCreator/invalid-mint-value'
  //     );
  //   });

  //   it ('should not mint before mintTimeStartAt', async () => {
  //     const t = now ();
  //     creator.setMintTime (t + 100, t + 999);
  //     await expect (mintFunction (1, 0.08)).to.be.revertedWith (
  //       'RhapsodyCreator/invalid-mint-time'
  //     );
  //   });

  //   // it ('should mint one nft', async () => {
  //   //   await expect (mintFunction (1, 0.08)).to
  //   //     .emit (t, 'Created')
  //   //     .withArgs (minterA.address, 1);
  //   // });

  //   it ('should only be able to mint max invocations per address', async () => {
  //     await mintFunction (maxMintPerTx, 0.08 * maxMintPerTx);
  //     await expect (mintFunction (1, 0.08)).to.be.revertedWith (
  //       'RhapsodyCreator/invalid-mint-invocation'
  //     );
  //   });

  //   it ('should only be able to mint max supply', async () => {
  //     const RhapsodyCreator = await hre.ethers.getContractFactory (
  //       'RhapsodyCreator',
  //       deployer,
  //       overrides
  //     );
  //     let creatorB = await RhapsodyCreator.deploy (
  //       merklized.root,
  //       2,
  //       creatorTestParams.maxPublicBatchPerTx,
  //       creatorTestParams.maxPresaleBatchPerTx,
  //       0,
  //       creatorTestParams.mintPrice
  //     );

  //     await creatorB.connect (minterA).publicMint (1, {
  //       value: parseEther (0.08),
  //     });
  //     await creatorB.connect (minterA).publicMint (1, {
  //       value: parseEther (0.08),
  //     });
  //     await expect (
  //       creatorB.connect (minterA).publicMint (1, {
  //         value: parseEther (0.08),
  //       })
  //     ).to.be.revertedWith ('RhapsodyCreator/invalid-total-supply');
  //   });
  // });
});
