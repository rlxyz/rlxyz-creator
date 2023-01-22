// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../../RhapsodyCreatorBasic.sol";

contract RhapsodyCreatorRinkebyMinimal is RhapsodyCreatorBasic {
    constructor() RhapsodyCreatorBasic("Rhapsody Creator Rinkeby Minimal", "RCTM", 60, 10, 5, 0.05 ether, 0, 1, 2) {}
}
