pragma solidity ^0.8.0;

import "./core/ERC721Auction.sol";

abstract contract ERC721BasicAuction is ERC721Auction {
    /// ============ Constructor ============
    constructor(
        string memory _name,
        string memory _symbol,
        address payable _royaltyReceiver,
        uint96 _royaltyBasisPoints,
        uint256 _collectionMaxSupply
    ) ERC721Auction(_name, _symbol, _royaltyReceiver, _royaltyBasisPoints, _collectionMaxSupply) {}

    /// ============ Internal Functions ============

    function _mintMany(address to, uint256 invocations) internal override {
        _safeMint(to, invocations);
        emit Created(to, invocations);
    }
}
