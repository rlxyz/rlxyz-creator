// SPDX-License-Identifier: CC-BY-NC-SA-4.0
pragma solidity ^0.8.0;

import "./token/RhapsodyCreator.sol";

contract Tiger is RhapsodyCreator {
    constructor(bytes32 _presaleMerkleRoot)
        RhapsodyCreator("The Tiger Archives", "TIGER", _presaleMerkleRoot, 6688, 20, 100, 0.08 ether)
    {}
}
