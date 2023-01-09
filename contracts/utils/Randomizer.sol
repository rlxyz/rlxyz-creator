// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IRandomizer.sol";

contract Randomizer is IRandomizer, Ownable {
    function getRandomValue() external view returns (uint256) {
        return uint256(blockhash(block.number - 1)) + 369963;
    }
}
