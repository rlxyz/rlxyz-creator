// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface IRNGProducer {
    function getRandomValue() external view returns (uint256);
}
