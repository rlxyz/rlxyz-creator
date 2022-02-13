[![NPM Package](https://img.shields.io/npm/v/@rlxyz/contracts.svg)](https://www.npmjs.org/package/@rlxyz/contracts)

**A library for ERC721 development built on an optimzed contract standard** 

 * Wrapper around [ERC721A](https://github.com/chiru-labs/ERC721A) by Chiru-Labs.
 * Incorporates public sale functionality
 * Incorporates pre-sale functionality that utilises merkle roots
 * Incorporates Promtoion NFTs to be minted

## Overview

### Installation

```console
$ yarn add @rlxyz/contracts
```

RLXYZ Contracts features a stable API which means your contracts won't break unexpectedly when upgrading to a newer minor version.

### Usage

Once installed, you can use the contracts in the library by importing them:

```solidity
pragma solidity ^0.8.0;

import "@rlxyz/contracts/RhapsodyCreator.sol";

contract Example is RhapsodyCreator {
    constructor(bytes32 _presaleMerkleRoot)
        RhapsodyCreator("Example", "EXAM", _presaleMerkleRoot, 60, 10, 5, 0.05 ether)
    {}
}
```

_If you're new to smart contract development, head to [Developing Smart Contracts](https://docs.openzeppelin.com/learn/developing-smart-contracts) to learn about creating a new project and compiling your contracts._

To keep your system secure, you should **always** use the installed code as-is, and neither copy-paste it from online sources, nor modify it yourself. The library is designed so that only the contracts and functions you use are deployed, so you don't need to worry about it needlessly increasing gas costs.

## Learn More

Check out Open Zeppelin's [guides on their blog](https://blog.openzeppelin.com/guides), which cover several common use cases and good practices. The following articles provide great background reading, though please note, some of the referenced tools have changed as the tooling in the ecosystem continues to rapidly evolve.

* [The Hitchhiker’s Guide to Smart Contracts in Ethereum](https://blog.openzeppelin.com/the-hitchhikers-guide-to-smart-contracts-in-ethereum-848f08001f05) will help you get an overview of the various tools available for smart contract development, and help you set up your environment.
* [A Gentle Introduction to Ethereum Programming, Part 1](https://blog.openzeppelin.com/a-gentle-introduction-to-ethereum-programming-part-1-783cc7796094) provides very useful information on an introductory level, including many basic concepts from the Ethereum platform.
* For a more in-depth dive, you may read the guide [Designing the Architecture for Your Ethereum Application](https://blog.openzeppelin.com/designing-the-architecture-for-your-ethereum-application-9cec086f8317), which discusses how to better structure your application and its relationship to the real world.

## Security

This project is maintained by [RLXYZ](https://twitter.com/rhapsodylabsxyz).

Critical bug fixes will be backported to past major releases.

## Contribute

RLXYZ Contracts exists thanks to its contributors. There are many ways you can participate and help build high quality software. Check out the [contribution guide](CONTRIBUTING.md)!

## License

RLXYZ Contracts is released under the [MIT License](LICENSE).
