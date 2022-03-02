# RhapsodyCreator Release Process

Once the smart contracts have been updated, follow the steps below.

The testnet networks Rinkeby are supported.

The `production/testnet.json` file is used here.

## 1. Deploy Top-level Contracts

For each network run the command:

```bash
$ yarn deploy rinkeby
```

## 2. Run the post-deploy script

This script is used for the NFT sale setup
NOTE: `transferOwnership` is called and moved to `admin`

```bash
$ yarn deploy:post
```

It does the follow

- Transfer Ownership
- Set Base URI
- Set Mint Time

## 3. Run the start functions

Includes minting of promotional NFTs

```bash
$ yarn deploy:start
```

## 4. Verify the contracts on Etherscan

```bash
$ yarn deploy:verify rinkeby
```

## 3. Publish contracts npm package

Increment the version in `package.json` then publish the package:

```bash
$ yarn publish
```

If the package requires a tag then add a tag:

```bash
$ yarn publish --tag rc
```
