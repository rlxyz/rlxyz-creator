// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@divergencetech/ethier/contracts/erc721/BaseTokenURI.sol";
import "@divergencetech/ethier/contracts/erc721/ERC721ACommon.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./../../utils/OwnableWithdraw.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./../../utils/TimeHelper.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

abstract contract ERC721Core is Ownable, ERC721ACommon, ReentrancyGuard, BaseTokenURI, OwnableWithdraw, TimeHelper {
    /// @notice safe math for arithmetic operations
    using SafeMath for uint256;

    /// @notice safe math for arithmetic operations

    /// ============ Events ============

    /// @notice emitted when a token is created
    event Created(address indexed to, uint256 invocations);

    // ============= Immutables ==============

    /// @notice the total supply
    uint256 public collectionMaxSupply;

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

    /**
    @dev Required override to select the correct baseTokenURI.
     */
    function _baseURI() internal view override(BaseTokenURI, ERC721A) returns (string memory) {
        return BaseTokenURI._baseURI();
    }

    /// ============ Internal Functions ============

    function _mintMany(address to, uint256 invocations) internal virtual;

    function _isAuctionMintValid(address to, uint256 invocations) internal view {
        require(tx.origin == to, "RhapsodyCreatorGenerative/invalid-mint-caller");
        require(
            totalSupply().add(invocations) <= collectionMaxSupply,
            "RhapsodyCreatorGenerative/invalid-total-supply"
        );
        require(invocations > 0, "RhapsodyCreatorGenerative/invalid-invocation-lower-boundary");
    }

    function _isAuctionMaxPerAddressValid(
        address to,
        uint256 invocations,
        uint256 maxPerAddress
    ) internal view {
        require(invocations <= maxPerAddress, "RhapsodyCreatorGenerative/invalid-invocation-upper-boundary");
        require(
            _numberMinted(to).add(invocations) <= maxPerAddress,
            "RhapsodyCreatorGenerative/invalid-address-invocation-upper-boundary"
        );
    }

    function _isAuctionProofValid(
        address prover,
        uint256 invocations,
        bytes32[] calldata proof,
        bytes32 merkleRoot
    ) internal pure {
        require(
            MerkleProof.verify(proof, merkleRoot, keccak256(abi.encodePacked(prover, invocations))),
            "RhapsodyCreatorGenerative/invalid-address-proof"
        );
    }

    // startTime must be more than 0 and less than current time; endTime not set, means forever...
    function _isAuctionTimeValid(uint256 startTime, uint256 endTime) internal view {
        require(startTime > 0 && startTime >= _currentTime(), "RhapsodyCreatorGenerative/invalid-start-time");
        require(endTime <= _currentTime(), "RhapsodyCreatorGenerative/invalid-end-time");
    }

    function _isAuctionPriceValid(
        uint256 value,
        uint256 invocations,
        uint256 mintPrice
    ) internal pure {
        require(value == mintPrice.mul(invocations), "RhapsodyCreatorGenerative/invalid-mint-value");
    }
}
