pragma solidity ^0.8.0;

import "./core/ERC721Auction.sol";
import "./../random/RNGConsumer.sol";

error HashQueryForNonexistentToken();

abstract contract ERC721GenerativeAuction is ERC721Auction, RNGConsumer {
    /// ============ Libraries ============

    /// @notice safe math for arithmetic operations
    using SafeMath for uint256;

    /// @notice the mapping of token hashes
    mapping(uint256 => bytes32) private _tokenHash;

    /// ============ Constructor ============
    constructor(
        string memory _name,
        string memory _symbol,
        address payable _royaltyReceiver,
        uint96 _royaltyBasisPoints,
        uint256 _collectionMaxSupply
    ) ERC721Auction(_name, _symbol, _royaltyReceiver, _royaltyBasisPoints, _collectionMaxSupply) {}

    /// ============ Internal Functions ============

    /// @notice mint tokens in batches
    /// @param to address to mint to
    /// @param invocations number of tokens to mint
    function _mintMany(address to, uint256 invocations) internal override {
        _safeMint(to, invocations);

        uint256 currentTotalSupply = totalSupply();
        uint256 currentInvocations = currentTotalSupply.sub(invocations);
        bytes32[] memory uniqueIdentifiers = new bytes32[](invocations);
        for (uint256 i = 0; i < invocations; i++) {
            uint256 currentIndex = currentInvocations.add(i);
            bytes32 identifier = getRandomValue(currentIndex);
            uniqueIdentifiers[i] = identifier;
            _tokenHash[currentIndex] = identifier;
        }

        emit Created(to, invocations);
    }

    /// @notice returns the hash of a token
    function tokenHash(uint256 _tokenId) public view returns (bytes32) {
        if (!_exists(_tokenId)) revert HashQueryForNonexistentToken();
        return _tokenHash[_tokenId];
    }
}
