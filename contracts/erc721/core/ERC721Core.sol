// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@divergencetech/ethier/contracts/erc721/BaseTokenURI.sol";
import "@divergencetech/ethier/contracts/erc721/ERC721ACommon.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./../../utils/OwnableWithdraw.sol";

abstract contract ERC721Core is Ownable, ERC721ACommon, ReentrancyGuard, BaseTokenURI, OwnableWithdraw {
    /// ============ Events ============

    /// @notice emitted when a token is created
    event Created(address indexed to, uint256 invocations);

    /// ============ Functions ============

    /// @notice Constructor
    constructor(
        string memory _name,
        string memory _symbol,
        address payable _royaltyReceiver,
        uint96 _royaltyBasisPoints
    ) ERC721ACommon(_name, _symbol, _royaltyReceiver, _royaltyBasisPoints) BaseTokenURI("") {}

    /**
    @dev Required override to select the correct baseTokenURI.
     */
    function _baseURI() internal view override(BaseTokenURI, ERC721A) returns (string memory) {
        return BaseTokenURI._baseURI();
    }
}
