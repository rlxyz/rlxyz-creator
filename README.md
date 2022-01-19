# Rhapsody Creator

```bash
$ yarn & yarn test
```

## How to

1. See `contracts/Example.sol` and change accordingly.

2. For localhost/testnet/mainnet (aside from testing), use the `production/testnet.json` to set values for the mint.

3. Change these variables in `hardhat.config.ts` to use in testnet

```javascript
const customTestnetAccounts = {
  deployer: "<add-deployer-address>", // Account 0
  admin: '<add-admin-address>', // Account 1,
  testnetUserA: '<add-testnetUserA-address>', // Account 3
  testnetUserB: '<add-testnetUserB-address>', // Account 4
  testnetUserC: '<add-testnetUserC-address>', // Account 3
}
```

4. See `docs/RELEASE.md` for deploying contracts 
