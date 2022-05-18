// SPDX-License-Identifier: CC-BY-NC-SA-4.0
pragma solidity ^0.8.0;

import "../RhapsodyCreatorGenerative.sol";

contract RhapsodyCreatorGenerativeGasTest is RhapsodyCreatorGenerative {
    constructor(
        uint256 _collectionSize,
        uint256 _maxPublicBatchPerAddress,
        uint256 _amountForPromotion,
        uint256 _mintPrice
    )
        RhapsodyCreatorGenerative(
            "Rhapsody Creator Test",
            "RCT",
            _collectionSize,
            _maxPublicBatchPerAddress,
            _amountForPromotion,
            _mintPrice
        )
    {}

    function _currentTime() internal view override returns (uint256) {
        return 123456789;
    }

    function _generateUniqueIdentifier(uint256 seed) internal view override returns (bytes32) {
        return keccak256(abi.encodePacked(seed));
    }

    function mintOne(address to) public {
        _mintMany(to, 2);
    }

    function mintTwo(address to) public {
        _mintMany(to, 1);
    }
}
