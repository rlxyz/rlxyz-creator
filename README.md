# Rhapsody Creator

```bash
$ yarn & yarn test
```

## How to use

1. See `contracts/Example.sol` and change accordingly.
2. Create the `.envrc` file and change ENVIRONMENT variables based on `.envrc.example` (you don't need this for `yarn test` but would need it for testnet)
3. For localhost/testnet/mainnet (aside from testing), use the `production/testnet.json` to set values for the mint. 
4. To generate merkle root, head over to `@rhapsodylabs/whitelist-merkle` and follow the steps. Create the root and paste into `production/testnet.json`
5. Change these variables in `hardhat.config.ts` to use in testnet
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

Please use in testnet environment only.

1. The `RhapsodyCreator` contract hasn't been fully stress/fuzz tested echidna. 
2. There is an issue with the `presaleMint` for addresses that generate fake proofs and still able to mint.

Contact [jeevanpillay](https://twitter.com/jeevanpillay) for more information.
