pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./interfaces/IRNGProducer.sol";

abstract contract RNGConsumer {
    /// ============ Libraries ============

    /// @notice safe math for arithmetic operations
    using SafeMath for uint256;

    // ============= Dependencies ==============

    /// @notice the randomizer contract
    IRNGProducer public rngProducer;

    /// ============ Functions ============

    constructor(address _rngProducer) {
        setRandomizerContract(_rngProducer);
    }

    /// @notice used the set the mint randomizer for on-chain generative projects
    function setRandomizerContract(address _rngProducer) public {
        rngProducer = IRNGProducer(_rngProducer);
    }

    function getRandomValue(uint256 seed) internal view returns (bytes32) {
        return keccak256(abi.encodePacked(seed, tx.origin, block.number - 1, rngProducer.getRandomValue()));
    }
}
