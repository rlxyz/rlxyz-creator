// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "erc721a/contracts/ERC721A.sol";
import "./utils/interfaces/IRandomizer.sol";

error HashQueryForNonexistentToken();

contract RhapsodyCreatorGenerative is ERC721A, Ownable, ReentrancyGuard {
    /// ============ Semantic Versioning ============
    /// @dev Semantic versioning for this contract
    string public constant version = "2.0.0";

    /// ============ Libraries ============

    /// @notice safe math for arithmetic operations
    using SafeMath for uint256;

    /// ============ Events ============

    event Created(address indexed to, uint256 currentTotalSupply, uint256 invocations, bytes32[] identifiers);

    /// ============ Immutable storage ============

    /// @notice total number of tokens in the collection
    uint256 public immutable collectionSize;

    /// @notice max number of tokens that can be minted in a single transaction
    uint256 public immutable maxPublicBatchPerAddress;

    // ============ Mutable storage ============

    /// @notice time the claim starts
    uint256 public claimTime;

    /// @notice the hash of each token
    mapping(uint256 => bytes32) private _tokenHash;

    /// @notice the mapping of claimed tokens
    mapping(uint256 => bool) private _claimed;

    /// @notice the claim contract
    IERC721 private _claimContract;

    // ============ Private storage ============

    string private _baseTokenURI;

    // ============= Dependencies ==============

    /// @notice the randomizer contract
    IRandomizer public mintRandomizerContract;

    /// ============= Constructor =============

    /// @notice Creates a new Creator contract
    constructor(
        string memory _name,
        string memory _symbol,
        string memory _baseURI,
        uint256 _collectionSize,
        uint256 _maxPublicBatchPerAddress,
        uint256 _claimTime,
        address _claimContractAddress
    ) ERC721A(_name, _symbol) {
        require(_collectionSize > 0, "RhapsodyCreatorGenerative/invalid-collection-size");
        require(_claimContractAddress != address(0), "RhapsodyCreatorGenerative/claim-contract-address-zero");

        collectionSize = _collectionSize;
        maxPublicBatchPerAddress = _maxPublicBatchPerAddress;

        _setBaseURI(_baseURI);
        _setClaimMintTime(_claimTime);

        _claimContract = IERC721(_claimContractAddress);
    }

    /// =========== Sale ===========

    /// @notice Allows claim of tokens if address is part of merkle tree
    /// @param tokenIds token ids to claim
    /// @dev user must mint max invocations
    function claimMint(uint256[] calldata tokenIds)
        external
        nonReentrant
        isMintLive(claimTime)
        isMintValid(tokenIds.length, maxPublicBatchPerAddress)
    {
        uint256 invocations = tokenIds.length;

        for (uint256 i = 0; i < tokenIds.length; i++) {
            uint256 tokenId = tokenIds[i];
            require(!_claimed[tokenId], "RhapsodyCreatorGenerative/token-claimed");
            require(_claimContract.ownerOf(tokenId) == msg.sender, "RhapsodyCreatorGenerative/token-not-owned");
            _claimed[tokenId] = true;
        }

        _mintMany(msg.sender, invocations);
    }

    /// @notice ensures that minters need valid invocations + value to mint
    modifier isMintValid(uint256 invocations, uint256 maxInvocation) {
        require(tx.origin == msg.sender, "RhapsodyCreatorGenerative/invalid-mint-caller");
        require(totalSupply().add(invocations) <= collectionSize, "RhapsodyCreatorGenerative/invalid-total-supply");
        require(
            _mintOf(msg.sender).add(invocations) <= maxInvocation,
            "RhapsodyCreatorGenerative/invalid-invocation-upper-boundary"
        );
        require(invocations > 0, "RhapsodyCreatorGenerative/invalid-invocation-lower-boundary");
        _;
    }

    /// @notice mint tokens in batches
    /// @param to address to mint to
    /// @param invocations number of tokens to mint
    function _mintMany(address to, uint256 invocations) internal {
        _safeMint(to, invocations);

        uint256 currentTotalSupply = totalSupply();
        uint256 currentInvocations = currentTotalSupply.sub(invocations);
        bytes32[] memory uniqueIdentifiers = new bytes32[](invocations);
        for (uint256 i = 0; i < invocations; i++) {
            uint256 currentIndex = currentInvocations.add(i);
            bytes32 identifier = _generateUniqueIdentifier(currentIndex);
            uniqueIdentifiers[i] = identifier;
            _tokenHash[currentIndex] = identifier;
        }

        emit Created(to, currentTotalSupply, invocations, uniqueIdentifiers);
    }

    /// @notice Set the time for the mint
    /// @param _claimTime time the presale starts
    /// @dev this function can serve as an "active" and "non-active" sale status
    /// @dev set the values to uint256(-1) for "non-active" sale status
    /// @dev also, pass contract ownership to address(0) to close sale forever
    function setClaimMintTime(uint256 _claimTime) public onlyOwner {
        _setClaimMintTime(_claimTime);
    }

    /// @notice Set the internal time for the mint
    /// @param _claimTime time the claim starts
    /// @dev this function can serve as an "active" and "non-active" sale status
    /// @dev set the values to uint256(-1) for "non-active" sale status
    /// @dev also, pass contract ownership to address(0) to close sale forever
    function _setClaimMintTime(uint256 _claimTime) internal {
        claimTime = _claimTime;
    }

    /// @notice used to check the time of mint of presale and public
    /// @dev only publicTime/presaleTime variable is used here; see publicMint/presaleMint function
    /// @dev time > 0 is optimization when the sale is not live; r.e  mint "not-active" mode
    modifier isMintLive(uint256 time) {
        require(time > 0 && block.timestamp > time, "RhapsodyCreatorGenerative/invalid-mint-time");
        _;
    }

    /// @notice used the set the mint randomizer for on-chain generative projects
    function setMintRandomizerContract(address _mintRandomizerContract) external onlyOwner {
        mintRandomizerContract = IRandomizer(_mintRandomizerContract);
    }

    /// =========== Metadata ===========

    /// @notice set the new baseURI to change the tokens metadata
    function setBaseURI(string calldata newBaseURI) external onlyOwner {
        _setBaseURI(newBaseURI);
    }

    /// @notice set the internal baseURI to change the tokens metadata
    function _setBaseURI(string memory newBaseURI) internal virtual {
        _baseTokenURI = newBaseURI;
    }

    /// @notice core metadata baseURI used for tokens metadata
    function baseURI() public view returns (string memory) {
        return _baseTokenURI;
    }

    /// =========== Dev ===========

    /// @notice withdraws the ether in the contract to owner
    function withdrawMoney() external onlyOwner nonReentrant {
        (bool success, ) = msg.sender.call{ value: address(this).balance }("");
        require(success, "RhapsodyCreatorGenerative/invalid-withdraw-money");
    }

    /// @notice returns the current block timestamp
    /// @dev this function is overriden in testing for time-dependent testing
    function _currentTime() internal view virtual returns (uint256) {
        return block.timestamp;
    }

    /// @notice sets the owners quantity explicity
    /// @dev eliminate loops in future calls of ownerOf()
    function setOwnersExplicit(uint256 quantity) external onlyOwner nonReentrant {
        _setOwnersExplicit(quantity);
    }

    /// =========== Helpers ===========

    /// @notice internally returns the number of mints of an address
    function _mintOf(address _owner) internal view returns (uint256) {
        return _numberMinted(_owner);
    }

    /// @notice returns the number of mints of an address
    function mintOf(address _owner) public view returns (uint256) {
        return _mintOf(_owner);
    }

    // @notice returns the hash of a token
    function tokenHash(uint256 _tokenId) public view returns (bytes32) {
        if (!_exists(_tokenId)) revert HashQueryForNonexistentToken();
        return _tokenHash[_tokenId];
    }

    function _generateUniqueIdentifier(uint256 seed) internal view virtual returns (bytes32) {
        return keccak256(abi.encodePacked(seed, tx.origin, block.number - 1, mintRandomizerContract.getRandomValue()));
    }
}
