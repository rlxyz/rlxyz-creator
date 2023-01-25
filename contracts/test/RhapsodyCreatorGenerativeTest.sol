// SPDX-License-Identifier: CC-BY-NC-SA-4.0
pragma solidity ^0.8.0;

import "../RhapsodyCreatorGenerative.sol";

contract RhapsodyCreatorGenerativeTest is RhapsodyCreatorGenerative {
    constructor(
        address _mintRandomizer,
        uint256 _collectionSize,
        uint256 _maxPublicBatchPerAddress,
        uint256 _amountForPromotion,
        uint256 _mintPrice
    )
        RhapsodyCreatorGenerative(
            "Rhapsody Creator Test",
            "RCT",
            _mintRandomizer,
            _collectionSize,
            _maxPublicBatchPerAddress,
            _amountForPromotion,
            _mintPrice,
            0,
            1,
            2
        )
    {}

    function mintOne() public {
        _mintMany(msg.sender, 1);
    }

    function _currentTime() internal view override returns (uint256) {
        return 123456789;
    }

    function _generateUniqueIdentifier(uint256 seed) internal view override returns (bytes32) {
        return keccak256(abi.encodePacked(seed));
    }
}
