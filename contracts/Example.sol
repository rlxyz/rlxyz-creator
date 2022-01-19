// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "./token/RhapsodyCreator.sol";

contract Example is RhapsodyCreator {
    constructor(
        bytes32 _presaleMerkleRoot,
        uint256 _collectionSize,
        uint256 _maxPublicBatchPerAddress,
        uint256 _amountForPromotion,
        uint256 _mintPrice
    )
        RhapsodyCreator(
            "Example",
            "EXAM",
            _presaleMerkleRoot,
            _collectionSize,
            _maxPublicBatchPerAddress,
            _amountForPromotion,
            _mintPrice
        )
    {}
}
