// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@divergencetech/ethier/contracts/erc721/BaseTokenURI.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@divergencetech/ethier/contracts/erc721/ERC721ACommon.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./ERC721Core.sol";
import "./../../utils/TimeHelper.sol";
import "./../../sales/MirrorSellerBasic.sol";

abstract contract ERC721Mirror is TimeHelper, ERC721Core, MirrorSellerBasic {
    /// ============ Libraries ============
    /// @notice safe math for arithmetic operations
    using SafeMath for uint256;

    /// @notice counter for auction ids
    using Counters for Counters.Counter;

    /// ============ Struct ============
    struct Auction {
        uint256 startTime;
        uint256 endTime;
        uint256 price;
        uint256 maxPerAddress;
        bytes32 merkleRoot;
    }

    // ============ Mutables ============

    mapping(uint256 => Auction) public auctions;

    Counters.Counter private _auctionId;

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
        address _mirrorContract
    )
        ERC721Core(_name, _symbol, _receiver, _royaltyBasisPoints, _collectionMaxSupply)
        MirrorSellerBasic(_mirrorContract)
    {}

    /// ============ Public Functions ============
    function createAuction(
        uint256 startTime,
        uint256 endTime,
        uint256 price,
        uint256 maxPerAddress,
        bytes32 merkleRoot
    ) external onlyOwner {
        uint256 auctionId = _auctionId.current();
        auctions[auctionId] = Auction(startTime, endTime, price, maxPerAddress, merkleRoot);
        _auctionId.increment();
    }

    function getAuction(uint256 auctionId) public view returns (Auction memory) {
        require(auctionId < _auctionId.current(), "ERC721Generative: auction does not exist");
        return auctions[auctionId];
    }

    /// =========== Sale ===========

    /// @notice Allows claim of tokens if address is part of merkle tree
    /// @param tokenIds token ids to claim
    /// @dev user must mint max invocations
    // @todo add price check. if price is not 0, then user should be able to use payable to pay for the mint...
    function purchase(uint256 auctionId, uint256[] calldata tokenIds) external nonReentrant {
        Auction memory auction = getAuction(auctionId);
        _isAuctionTimeValid(auction.startTime, auction.endTime);
        _isAuctionMintValid(msg.sender, tokenIds.length);
        _isAuctionMaxPerAddressValid(msg.sender, tokenIds.length, auction.maxPerAddress);
        _mirrorMany(msg.sender, tokenIds);
        _mintMany(msg.sender, tokenIds.length);
    }
}
