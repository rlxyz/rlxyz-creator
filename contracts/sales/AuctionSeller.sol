pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

abstract contract AuctionSeller {
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

    constructor() {}

    // ============ Public Functions ============

    function createAuction(
        uint256 startTime,
        uint256 endTime,
        uint256 price,
        uint256 maxPerAddress,
        bytes32 merkleRoot
    ) external {
        uint256 auctionId = _auctionId.current();
        auctions[auctionId] = Auction(startTime, endTime, price, maxPerAddress, merkleRoot);
        _auctionId.increment();
    }

    function getAuction(uint256 auctionId) public view returns (Auction memory) {
        require(auctionId < _auctionId.current(), "ERC721Generative: auction does not exist");
        return auctions[auctionId];
    }
}
