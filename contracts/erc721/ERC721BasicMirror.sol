// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@divergencetech/ethier/contracts/erc721/BaseTokenURI.sol";
import "@divergencetech/ethier/contracts/erc721/ERC721ACommon.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./../random/interfaces/IRNGProducer.sol";
import "./core/ERC721Mirror.sol";

error HashQueryForNonexistentToken();

contract ERC721GenerativeMirror is ERC721Mirror {
    /// ============ Constructor ============
    constructor(
        string memory _name,
        string memory _symbol,
        address payable _royaltyReceiver,
        uint96 _royaltyBasisPoints,
        uint256 _collectionMaxSupply,
        address _mirrorContract
    ) ERC721Mirror(_name, _symbol, _royaltyReceiver, _royaltyBasisPoints, _collectionMaxSupply, _mirrorContract) {}

    /// ======== Internal Functions ========
    function _mintMany(address to, uint256 invocations) internal override {
        _safeMint(to, invocations);
        emit Created(to, invocations);
    }
}
