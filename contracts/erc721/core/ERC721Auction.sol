pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@divergencetech/ethier/contracts/erc721/ERC721ACommon.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./ERC721Core.sol";
import "./../../utils/TimeHelper.sol";

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

    // ============= Immutables ==============

    /// @notice the total supply
    uint256 public collectionMaxSupply;

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
    ) ERC721Core(_name, _symbol, _royaltyReceiver, _royaltyBasisPoints) {
        require(_collectionMaxSupply > 0, "ERC721Generative: collectionMaxSupply must be greater than 0");
        collectionMaxSupply = _collectionMaxSupply;
    }

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
