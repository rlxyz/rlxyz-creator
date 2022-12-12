// SPDX-License-Identifier: CC-BY-NC-SA-4.0
pragma solidity ^0.8.0;

import "../../RhapsodyCreator.sol";

// @notice this RhapsodyCreatorRinkeby is used in testnets such as rinkeby
contract RhapsodyCreatorRinkeby is RhapsodyCreator {
    /// @notice Semver Version
    string public constant VERSION = "0.0.6";

    constructor(
        uint256 _collectionSize,
        uint256 _maxPublicBatchPerAddress,
        uint256 _amountForPromotion,
        uint256 _mintPrice
    )
        RhapsodyCreator(
            "Rhapsody Creator Rinkeby",
            "RCT",
            "",
            _collectionSize,
            _maxPublicBatchPerAddress,
            _amountForPromotion,
            _mintPrice,
            0,
            1
        )
    {}
}
