// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./interfaces/IRandomizer.sol";

contract Randomizer is IRandomizer {
    function getRandomValue() external view returns (uint256) {
        return uint256(keccak256(abi.encodePacked(tx.origin, block.number - 69))) + 369963;
    }
}
