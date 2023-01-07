// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
@notice An abstract contract that allows users to mirror an existing ERC721 contract by keeping tracking
of mirrored tokens. This is useful for projects that want to allow users to mirror their existing NFTs
on a new contract.
 */
//! @todo note; removeed nonReentrant from _mirrorMany
abstract contract MirrorSellerBasic is Ownable {
    /// @notice the mirror contract
    IERC721 public mirrorContract;

    /// @notice the mapping of mirrored tokens
    mapping(uint256 => bool) private _mirrored;
    /// @notice total mirrored
    uint256 public totalMirrored;

    constructor(address _mirrorContract) {
        setMirrorContract(_mirrorContract);
    }

    /// @param tokenIds token ids to mirror
    /// @dev user must mint max invocations
    function _mirrorMany(address to, uint256[] calldata tokenIds) internal {
        for (uint256 i = 0; i < tokenIds.length; i++) {
            uint256 tokenId = tokenIds[i];
            require(!_mirrored[tokenId], "RhapsodyCreatorGenerative/token-mirrored");
            require(mirrorContract.ownerOf(tokenId) == to, "RhapsodyCreatorGenerative/token-not-owned");
            _mirrored[tokenId] = true;
        }
        totalMirrored += tokenIds.length;
    }

    function setMirrorContract(address _mirrorContract) public onlyOwner {
        mirrorContract = IERC721(_mirrorContract);
    }
}
