// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../../RhapsodyCreator.sol";

contract RhapsodyCreatorRinkebyMinimal is RhapsodyCreator {
    /// @notice Semver Version
    string public constant VERSION = "0.0.2";

    constructor(bytes32 _presaleMerkleRoot)
        RhapsodyCreator("Rhapsody Creator Rinkeby Minimal", "RCTM", _presaleMerkleRoot, 60, 10, 5, 0.05 ether)
    {}
}
