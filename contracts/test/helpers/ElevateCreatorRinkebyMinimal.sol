// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../../ElevateCreatorBasic.sol";

contract ElevateCreatorRinkebyMinimal is ElevateCreatorBasic {
    constructor() ElevateCreatorBasic("Rhapsody Creator Rinkeby Minimal", "RCTM", 60, 10, 5, 0.05 ether, 0, 1, 2) {}
}
