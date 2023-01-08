pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import "@divergencetech/ethier/contracts/erc721/ERC721ACommon.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./ERC721Core.sol";

abstract contract ERC721Auction is TimeHelper, ERC721Core {
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

    // ============ Constructor ============

    constructor(
        string memory _name,
        string memory _symbol,
        address payable _royaltyReceiver,
        uint96 _royaltyBasisPoints,
        uint256 _collectionMaxSupply
    ) ERC721Core(_name, _symbol, _royaltyReceiver, _royaltyBasisPoints, _collectionMaxSupply) {}

    // ============ Public Functions ============

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

    /// @notice Allow Purchase based on auction id
    /// @dev user must mint max invocations
    function purchase(uint256 auctionId, uint256 invocations) external payable nonReentrant {
        Auction memory auction = getAuction(auctionId);
        _isAuctionTimeValid(auction.startTime, auction.endTime);
        _isAuctionMintValid(msg.sender, invocations);
        _isAuctionMaxPerAddressValid(msg.sender, invocations, auction.maxPerAddress);
        _isAuctionPriceValid(msg.value, invocations, auction.price);
        _mintMany(msg.sender, invocations);
    }

    /// @notice Allow Merkle-Root Purchase based on auction id
    function purchase(
        uint256 auctionId,
        uint256 invocations,
        bytes32[] calldata proof
    ) external payable nonReentrant {
        Auction memory auction = getAuction(auctionId);
        _isAuctionTimeValid(auction.startTime, auction.endTime);
        _isAuctionMintValid(msg.sender, invocations);
        _isAuctionMaxPerAddressValid(msg.sender, invocations, auction.maxPerAddress);
        _isAuctionPriceValid(msg.value, invocations, auction.price);
        _isAuctionProofValid(msg.sender, invocations, proof, auction.merkleRoot);
        _mintMany(msg.sender, invocations);
    }
}
