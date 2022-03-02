// SPDX-License-Identifier: CC-BY-NC-SA-4.0
pragma solidity ^0.8.0;

import "../../RhapsodyCreatorGenerative.sol";

// @notice this RhapsodyCreatorRinkeby is used in testnets such as rinkeby
contract RhapsodyCreatorGenerativeRinkeby is RhapsodyCreatorGenerative {
    /// @notice Semver Version
    string public constant VERSION = "0.0.1";

    constructor(
        uint256 _collectionSize,
        uint256 _maxPublicBatchPerAddress,
        uint256 _amountForPromotion,
        uint256 _mintPrice
    )
        RhapsodyCreatorGenerative(
            "Rhapsody Creator Generative Rinkeby",
            "RCT",
            _collectionSize,
            _maxPublicBatchPerAddress,
            _amountForPromotion,
            _mintPrice
        )
    {}

    function _generateRandomValue() internal view override returns (bytes32) {
        return keccak256(abi.encodePacked((block.number)));
    }
}
