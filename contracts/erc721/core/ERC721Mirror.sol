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
import "./../../sales/AuctionSeller.sol";

abstract contract ERC721Mirror is TimeHelper, ERC721Core, MirrorSellerBasic, AuctionSeller {
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
