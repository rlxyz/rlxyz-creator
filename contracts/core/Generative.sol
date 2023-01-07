// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./../utils/interfaces/IRandomizer.sol";

error HashQueryForNonexistentToken();

abstract contract Generative is Ownable {
    // ============= Dependencies ==============

    /// @notice the randomizer contract
    IRandomizer public mintRandomizerContract;

    /// ============ Mutable Storage ============

    mapping(uint256 => bytes32) private _tokenHash;

    /// ============ Functions ============

    // @notice returns the hash of a token
    function tokenHash(uint256 _tokenId) public view returns (bytes32) {
        if (!_exists(_tokenId)) revert HashQueryForNonexistentToken();
        return _tokenHash[_tokenId];
    }

    // @notice check if tokenId exists as a virtual function
    function _exists(uint256 _tokenId) internal view virtual returns (bool);

    /// @notice used the set the mint randomizer for on-chain generative projects
    function setMintRandomizerContriact(address _mintRandomizerContract) external onlyOwner {
        mintRandomizerContract = IRandomizer(_mintRandomizerContract);
    }

    function _generateUniqueIdentifier(uint256 seed) internal view virtual returns (bytes32) {
        return keccak256(abi.encodePacked(seed, tx.origin, block.number - 1, mintRandomizerContract.getRandomValue()));
    }
}
