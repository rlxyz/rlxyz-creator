// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IRandomizer.sol";

contract Randomizer is IRandomizer, Ownable {
    mapping(address => bool) public dependencies;

    function addDependency(address _dependency) public onlyOwner {
        dependencies[_dependency] = true;
    }

    function removeDependency(address _dependency) public onlyOwner {
        dependencies[_dependency] = false;
    }

    function getRandomValue() external view onlyDependency returns (bytes32) {
        return keccak256(abi.encodePacked(123 * block.timestamp));
    }

    modifier onlyDependency() {
        require(dependencies[msg.sender], "Caller is not in dependency list");
        _;
    }
}
