// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@divergencetech/ethier/contracts/erc721/BaseTokenURI.sol";
import "./core/ERC721GenerativeCommon.sol";

contract ERC721Generative is ERC721GenerativeCommon {
    /// ============ Semantic Versioning ============
    /// @dev Semantic versioning for this contract
    string public constant version = "1.0.0";

    /// ============= Constructor =============
    /// @notice Creates a new Creator contract
    constructor(
        // Common
        string memory _name,
        string memory _symbol,
        address payable _receiver,
        uint96 _royaltyBasisPoints,
        uint256 _collectionMaxSupply,
        // Extra
        address _randomizerContract
    )
        ERC721GenerativeCommon(
            _name,
            _symbol,
            _receiver,
            _royaltyBasisPoints,
            _collectionMaxSupply,
            _randomizerContract
        )
    {}
}
