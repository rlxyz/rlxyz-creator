// SPDX-License-Identifier: CC-BY-NC-SA-4.0
pragma solidity ^0.8.0;

import "../../RhapsodyCreatorClaim.sol";

// @notice this RhapsodyCreatorClaimRinkeby is used in testnets such as rinkeby
contract RhapsodyCreatorClaimRinkeby is RhapsodyCreatorClaim {
    /// @notice Semver Version
    string public constant VERSION = "0.0.2";

    constructor(uint256 _collectionSize) RhapsodyCreatorClaim("Rhapsody Creator Rinkeby", "RCT", _collectionSize) {}
}
