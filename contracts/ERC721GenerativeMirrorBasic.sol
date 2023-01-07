// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@divergencetech/ethier/contracts/erc721/BaseTokenURI.sol";
import "./core/ERC721GenerativeCommon.sol";
import "./sales/MirrorSellerBasic.sol";

// ERC721A
// Basic, Generative
// MirrorSeller, FixedPriceSeller
// MirrorSellerBasic, MirrorSellerPure

// Steps:
// a) Deploy Contract
//  1. Insert mirrorContract address in Form
//  2. Infer collectionMaxSupply based on mirrorContract
//  3. Form inputs for name symbol, mirrorPurchaseTime
//  4. Fetch randomizerContractAddress based on chainId
//  5. Set RoyaltyBasisPoints & receiver to null
//  6. Deploy Contract
// b) Update Contract Core Variables
//  1. Using contract address, update the baseURI
// c) Mint is ready...

// Core Setup:
// a) Ensure Randomizer is on mainnet and goerli; keep the randomizer contract addresses handy
// b) get baostro to review the contract (and write test cases for these)
// c) add new flow for mirrorSeller in elevate.art
// d) keep track of the contract type in elevate.art db
// e) based on the contract type, show the appropriate mint page in elevate.art

// Mirror Setup:
// a) Add new flow for mirrorSeller in elevate.art
// b) Should check tokens of the mirrorContract in the mint page
// c) Allow user to mint based on these (v1 should mint all tokens; v2 we can allow user to select tokens)

// Things that have been removed:
// 1. SetBaseURI in Constructor
// 2. SetOwnersExplicity? whatever the fuck that means.... Check ERC721A and understand this...
// 3. removed require(_mintOf(msg.sender).add(invocations) <= maxInvocation,"RhapsodyCreatorGenerative/invalid-invocation-upper-boundary"); from isMintValid

contract ERC721GenerativeMirror is ERC721GenerativeCommon, MirrorSellerBasic {
    /// ============ Semantic Versioning ============
    /// @dev Semantic versioning for this contract
    string public constant version = "1.0.0";

    /// @notice safe math for arithmetic operations
    using SafeMath for uint256;

    // ============ Mutable storage ============

    /// @notice time the claim starts
    uint256 public mirrorPurchaseTime;

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
        address _randomizerContract,
        address _mirrorContract,
        // Purchase
        uint256 _mirrorPurchaseTime
    )
        ERC721GenerativeCommon(
            _name,
            _symbol,
            _receiver,
            _royaltyBasisPoints,
            _collectionMaxSupply,
            _randomizerContract
        )
        MirrorSellerBasic(_mirrorContract)
    {
        setMirrorPurchaseTime(_mirrorPurchaseTime);
    }

    /// =========== Sale ===========

    /// @notice Allows claim of tokens if address is part of merkle tree
    /// @param tokenIds token ids to claim
    /// @dev user must mint max invocations
    function purchase(uint256[] calldata tokenIds) external nonReentrant isMintLive(mirrorPurchaseTime) {
        _isMintValid(msg.sender, tokenIds.length);
        _mirrorMany(msg.sender, tokenIds);
        _mintMany(msg.sender, tokenIds.length);
    }

    /// @notice Set the time for the mint
    /// @param _mirrorPurchaseTime time the presale starts
    /// @dev this function can serve as an "active" and "non-active" sale status
    /// @dev set the values to uint256(-1) for "non-active" sale status
    /// @dev also, pass contract ownership to address(0) to close sale forever
    function setMirrorPurchaseTime(uint256 _mirrorPurchaseTime) public onlyOwner {
        mirrorPurchaseTime = _mirrorPurchaseTime;
    }

    /// @notice used to check the time of mint of presale and public
    /// @dev only publicTime/presaleTime variable is used here; see publicMint/presaleMint function
    /// @dev time > 0 is optimization when the sale is not live; r.e  mint "not-active" mode
    modifier isMintLive(uint256 time) {
        require(time > 0 && _currentTime() > time, "RhapsodyCreatorGenerative/invalid-mint-time");
        _;
    }
}
