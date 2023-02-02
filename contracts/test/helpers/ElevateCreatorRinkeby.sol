// SPDX-License-Identifier: CC-BY-NC-SA-4.0
pragma solidity ^0.8.0;

import "../../ElevateCreatorBasic.sol";

// @notice this ElevateCreatorRinkeby is used in testnets such as rinkeby
contract ElevateCreatorRinkeby is ElevateCreatorBasic {
    constructor(
        uint256 _collectionSize,
        uint256 _maxPublicBatchPerAddress,
        uint256 _amountForPromotion,
        uint256 _mintPrice
    )
        ElevateCreatorBasic(
            "Elevate Creator Rinkeby",
            "RCT",
            _collectionSize,
            _maxPublicBatchPerAddress,
            _amountForPromotion,
            _mintPrice,
            0,
            1,
            2
        )
    {}
}
