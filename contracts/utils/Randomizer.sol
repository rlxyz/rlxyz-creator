// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./interfaces/IRandomizer.sol";

contract Randomizer is IRandomizer {
    function getRandomValue() external view returns (uint256) {
        return uint256(blockhash(block.number - 1)) + 369963;
    }
}
