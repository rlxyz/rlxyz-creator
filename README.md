# Rhapsody Creator

```bash
$ yarn & yarn test
```

## Localhost: How to Use!

1. See `contracts/test/helpers/RhapsodyCreatorRinkeby.sol` and change accordingly.
2. Create the `.envrc` file and change ENVIRONMENT variables based on `.envrc.example` (you don't need this for `yarn test` but would need it for testnet)
3. For localhost/testnet, use the `production/testnet.json` to set values for the mint. You will need to change these values (expect `"name": "RhapsodyCreatorRinkeby"`)
```json
{
  "name": "RhapsodyCreatorRinkeby",
  "deploy": {
    "presaleMerkleRoot": "0xc65b72b028415a7b64ca3da340d1f0540f146cc996de566d9c0c5a28db654745",
    "collectionSize": 120,
    "maxPublicBatchPerAddress": 5,
    "amountForPromotion": 10,
    "mintPrice": "50000000000000000"
  },
  "postDeploy": {
    "baseTokenURI": "https://ipfs.rhapsodylabs.xyz/ipfs/QmVReWkT3EuZFfxEBtGYbDAALP1UC6jwBPhRoK3ZkfFzdG/",
    "presaleTime": 1642719600,
    "publicTime": 1642914000
  },
  "start": {
    "amountForPromotion": 10
  }
}
```
5. To generate merkle root, head over to `@rhapsodylabs/whitelist-merkle` and follow the steps. Create the root and paste into `production/testnet.json`
6. Change these variables in `hardhat.config.ts` to use in testnet
```javascript
const customTestnetAccounts = {
  deployer: "<add-deployer-address>", // Account 0
  admin: '<add-admin-address>', // Account 1,
  testnetUserA: '<add-testnetUserA-address>', // Account 3
  testnetUserB: '<add-testnetUserB-address>', // Account 4
  testnetUserC: '<add-testnetUserC-address>', // Account 3
}
```
6. See `docs/RELEASE.md` for deploying contracts 

## DISCLAIMER: Existing Bugs

The `RhapsodyCreator` contract hasn't been fully stress/fuzz tested with echidna. Please use in testnet environment only.

1. There is an issue with the `presaleMint` for addresses that generate fake proofs and still able to mint.
2. Publish ABI to npm hasn't been tested

Contact [Jeevan Pillay](https://twitter.com/jeevanpillay) for more information.