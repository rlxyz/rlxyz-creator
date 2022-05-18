// SPDX-License-Identifier: CC-BY-NC-SA-4.0
pragma solidity ^0.8.0;

import "../RhapsodyCreatorClaim.sol";

contract RhapsodyCreatorClaimTest is RhapsodyCreatorClaim {
    constructor(uint256 _collectionSize) RhapsodyCreatorClaim("Rhapsody Creator Test", "RCT", _collectionSize) {}

    function _currentTime() internal view override returns (uint256) {
        return 123456789;
    }

    function mintOne() public {
        _mintMany(msg.sender, 1);
    }
}
