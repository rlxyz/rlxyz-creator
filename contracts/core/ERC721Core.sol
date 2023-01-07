// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@divergencetech/ethier/contracts/erc721/BaseTokenURI.sol";
import "@divergencetech/ethier/contracts/erc721/ERC721ACommon.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./../utils/OwnableWithdraw.sol";

abstract contract ERC721Core is Ownable, ERC721ACommon, ReentrancyGuard, BaseTokenURI, OwnableWithdraw {
    /// ============ Libraries ============

    /// @notice safe math for arithmetic operations
    using SafeMath for uint256;

    // ============= Immutables ==============

    /// @notice the total supply
    uint256 public collectionMaxSupply;

    /// ============ Events ============

    /// @notice emitted when a token is created
    event Created(address indexed to, uint256 invocations);

    /// ============ Functions ============

    /// @notice Constructor
    constructor(
        string memory _name,
        string memory _symbol,
        address payable _royaltyReceiver,
        uint96 _royaltyBasisPoints,
        uint256 _collectionMaxSupply
    ) ERC721ACommon(_name, _symbol, _royaltyReceiver, _royaltyBasisPoints) BaseTokenURI("") {
        require(_collectionMaxSupply > 0, "ERC721Generative: collectionMaxSupply must be greater than 0");
        collectionMaxSupply = _collectionMaxSupply;
    }

    /// @notice mint tokens in batches
    /// @param to address to mint to
    /// @param invocations number of tokens to mint
    // virtual
    function _mintMany(address to, uint256 invocations) internal virtual;

    function _isMintValid(address from, uint256 invocations) internal view {
        require(tx.origin == from, "RhapsodyCreatorGenerative/invalid-mint-caller");
        require(
            totalSupply().add(invocations) <= collectionMaxSupply,
            "RhapsodyCreatorGenerative/invalid-total-supply"
        );
        require(invocations > 0, "RhapsodyCreatorGenerative/invalid-invocation-lower-boundary");
    }

    /**
    @dev Required override to select the correct baseTokenURI.
     */
    function _baseURI() internal view override(BaseTokenURI, ERC721A) returns (string memory) {
        return BaseTokenURI._baseURI();
    }

    /// @notice returns the current block timestamp
    /// @dev this function is overriden in testing for time-dependent testing
    function _currentTime() internal view virtual returns (uint256) {
        return block.timestamp;
    }
}
