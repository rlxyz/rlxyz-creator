// SPDX-License-Identifier: CC-BY-NC-SA-4.0
pragma solidity ^0.8.0;

import "../../ElevateCreatorGenerative.sol";

// @notice this RhapsodyCreatorRinkeby is used in testnets such as rinkeby
contract ElevateCreatorGenerativeRinkeby is ElevateCreatorGenerative {
    constructor(
        address _mintRandomizer,
        uint256 _collectionSize,
        uint256 _maxPublicBatchPerAddress,
        uint256 _amountForPromotion,
        uint256 _mintPrice
    )
        ElevateCreatorGenerative(
            "Rhapsody Creator Generative Rinkeby",
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

    function _generateUniqueIdentifier(uint256 seed) internal view override returns (bytes32) {
        return keccak256(abi.encodePacked(seed));
    }
}
