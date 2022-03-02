// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "erc721a/contracts/ERC721A.sol";
import "erc721a/contracts/extensions/ERC721AOwnersExplicit.sol";
import "./utils/interfaces/IRandomizer.sol";

error HashQueryForNonexistentToken();

contract RhapsodyCreatorGenerative is ERC721A, ERC721AOwnersExplicit, Ownable, ReentrancyGuard {
    /// ============ Libraries ============

    /// @notice safe math for arithmetic operations
    using SafeMath for uint256;

    /// ============ Events ============

    event Created(address indexed to, uint256 currentTotalSupply, uint256 invocations, bytes32[] identifiers);

    /// ============ Immutable storage ============

    /// @notice promotional nfts count
    uint256 public immutable amountForPromotion;

    /// @notice max mintable tokens for each address in public
    uint256 public immutable maxPublicBatchPerAddress;

    /// @notice mint price of each nft; same for pre/public sale.
    uint256 public immutable mintPrice;

    /// @notice total number of tokens in the collection
    uint256 internal immutable collectionSize;

    // ============ Mutable storage ============

    /// @notice ERC721-presale inclusion root
    bytes32 public presaleMerkleRoot;

    /// @notice ERC721-claim inclusion root
    bytes32 public claimMerkleRoot;

    /// @notice time the public starts
    uint256 public claimTime;

    /// @notice time the presale starts
    uint256 public presaleTime;

    /// @notice time the public starts
    uint256 public publicTime;

    /// @notice the hash of each token
    mapping(uint256 => bytes32) private _tokenHash;

    // ============ Private storage ============

    string private _baseTokenURI;

    // ============= Dependencies ==============

    /// @notice the randomizer contract
    IRandomizer public mintRandomizerContract;

    /// ============= Constructor =============

    /// @notice Creates a new Creator contract
    /// @param _collectionSize the total size of the collection
    /// @param _maxPublicBatchPerAddress max mintable tokens in public sale
    /// @param _amountForPromotion promotional nfts count
    /// @param _mintPrice mint price of each nft
    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _collectionSize,
        uint256 _maxPublicBatchPerAddress,
        uint256 _amountForPromotion,
        uint256 _mintPrice
    ) ERC721A(_name, _symbol) {
        require(_collectionSize > 0, "RhapsodyCreator/invalid-collection-size");
        require(_amountForPromotion <= _collectionSize, "RhapsodyCreator/invalid-promotion-amount");
        require(_mintPrice > 0, "RhapsodyCreator/invalid-mint-price");

        collectionSize = _collectionSize;
        maxPublicBatchPerAddress = _maxPublicBatchPerAddress;
        amountForPromotion = _amountForPromotion;
        mintPrice = _mintPrice;
    }

    /// =========== Sale ===========

    /// @notice Allows claim of tokens if address is part of merkle tree
    /// @param invocations number of tokens to mint
    /// @param proof merkle proof to prove address and token mint count are in tree
    function claimMint(uint256 invocations, bytes32[] calldata proof)
        public
        isMintLive(claimTime)
        isMintValid(invocations, maxPublicBatchPerAddress)
        isMintProofValid(invocations, msg.sender, proof, claimMerkleRoot)
    {
        require(_mintOf(msg.sender) == 0, "RhapsodyCreator/invalid-double-mint");
        _mintMany(msg.sender, invocations);
    }

    /// @notice Allows presale minting of tokens if address is part of merkle tree
    /// @param invocations number of tokens to mint
    /// @param maxInvocation max number of invocations of the user
    /// @param proof merkle proof to prove address and token mint count are in tree
    function presaleMint(
        uint256 invocations,
        uint256 maxInvocation,
        bytes32[] calldata proof
    )
        external
        payable
        isMintLive(presaleTime)
        isMintValid(invocations, maxInvocation)
        isMintPricingValid(invocations)
        isMintProofValid(maxInvocation, msg.sender, proof, presaleMerkleRoot)
    {
        require(_mintOf(msg.sender) == 0, "RhapsodyCreator/invalid-double-mint");
        _mintMany(msg.sender, invocations);
    }

    /// @notice Allows public minting of tokens
    /// @param invocations number of tokens to mint
    /// @dev user can only mint less than maxPublicBatchPerAddress of tokens
    function publicMint(uint256 invocations)
        external
        payable
        isMintLive(publicTime)
        isMintValid(invocations, maxPublicBatchPerAddress)
        isMintPricingValid(invocations)
    {
        _mintMany(msg.sender, invocations);
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

    function _generateRandomValue() internal view virtual returns (bytes32) {
        return mintRandomizerContract.getRandomValue();
    }

    function _generateUniqueIdentifier(uint256 seed) internal view virtual returns (bytes32) {
        return keccak256(abi.encodePacked(seed, block.number, blockhash(block.number.sub(1)), _generateRandomValue()));
    }

    /// @notice Set the time for the mint
    /// @param _presaleTime time the presale starts
    /// @param _publicTime time the public sale starts
    /// @dev this function can serve as an "active" and "non-active" sale status
    /// @dev set the values to uint256(-1) for "non-active" sale status
    /// @dev also, pass contract ownership to address(0) to close sale forever
    function setMintTime(
        uint256 _claimTime,
        uint256 _presaleTime,
        uint256 _publicTime
    ) public onlyOwner {
        require(_claimTime > _currentTime(), "RhapsodyCreator/invalid-claim-time");
        require(_presaleTime > _claimTime, "RhapsodyCreator/invalid-presale-time");
        require(_publicTime > _presaleTime, "RhapsodyCreator/invalid-public-time");
        claimTime = _claimTime;
        presaleTime = _presaleTime;
        publicTime = _publicTime;
    }

    /// @notice ensures that minters need valid invocations + value to mint
    modifier isMintValid(uint256 invocations, uint256 maxInvocation) {
        require(tx.origin == msg.sender, "RhapsodyCreator/invalid-mint-caller");
        require(totalSupply().add(invocations) <= collectionSize, "RhapsodyCreator/invalid-total-supply");
        require(
            _mintOf(msg.sender).add(invocations) <= maxInvocation,
            "RhapsodyCreator/invalid-invocation-upper-boundary"
        );
        require(invocations > 0, "RhapsodyCreator/invalid-invocation-lower-boundary");
        _;
    }

    modifier isMintPricingValid(uint256 invocations) {
        require(msg.value == mintPrice.mul(invocations), "RhapsodyCreator/invalid-mint-value");
        require(msg.value > 0, "RhapsodyCreator/invalid-invocation-lower-boundary");
        _;
    }

    /// @notice used to check the time of mint of presale and public
    /// @dev only publicTime/presaleTime variable is used here; see publicMint/presaleMint function
    /// @dev time > 0 is optimization when the sale is not live; r.e  mint "not-active" mode
    modifier isMintLive(uint256 time) {
        require(time > 0 && block.timestamp > time, "RhapsodyCreator/invalid-mint-time");
        _;
    }

    modifier isMintProofValid(
        uint256 invocations,
        address prover,
        bytes32[] calldata proof,
        bytes32 merkleRoot
    ) {
        require(
            MerkleProof.verify(proof, merkleRoot, keccak256(abi.encodePacked(prover, invocations))),
            "RhapsodyCreator/invalid-address-proof"
        );
        _;
    }

    /// @notice used the set the mint randomizer for on-chain generative projects
    function setMintRandomizerContract(address _mintRandomizerContract) external onlyOwner {
        mintRandomizerContract = IRandomizer(_mintRandomizerContract);
    }

    /// =========== Merkle Roots ===========

    /// @notice force override the merkle root used in presale mint
    /// @param _presaleMerkleRoot root of the merklelized whitelist
    function setMintMerkleRoot(bytes32 _presaleMerkleRoot) public onlyOwner {
        presaleMerkleRoot = _presaleMerkleRoot;
    }

    /// @notice force override the merkle root used in presale mint
    /// @param _claimMerkleRoot root of the merklelized claimlist
    function setClaimMerkleRoot(bytes32 _claimMerkleRoot) public onlyOwner {
        claimMerkleRoot = _claimMerkleRoot;
    }

    /// =========== Metadata ===========

    /// @notice set the new baseURI to change the tokens metadata
    function setBaseURI(string calldata newBaseURI) external onlyOwner {
        _baseTokenURI = newBaseURI;
    }

    /// @notice core metadata baseURI used for tokens metadata
    function _baseURI() internal view virtual override returns (string memory) {
        return _baseTokenURI;
    }

    /// @notice core metadata baseURI used for tokens metadata
    function baseURI() public view returns (string memory) {
        return _baseURI();
    }

    /// =========== Dev ===========

    /// @notice used by owner to mint promotional nfts
    /// @param invocations the number of invocations to batch mint
    function promotionMint(uint256 invocations) external onlyOwner {
        require(totalSupply().add(invocations) <= amountForPromotion, "RhapsodyCreator/invalid-promotion-supply");
        uint256 maxBatchSize = maxPublicBatchPerAddress;
        require(invocations.mod(maxBatchSize) == 0, "RhapsodyCreator/invalid-batch-multiple");
        uint256 blocks = invocations.div(maxBatchSize);
        for (uint256 i = 0; i < blocks; i++) {
            _mintMany(msg.sender, maxBatchSize);
        }
    }

    /// @notice withdraws the ether in the contract to owner
    function withdrawMoney() external onlyOwner nonReentrant {
        (bool success, ) = msg.sender.call{ value: address(this).balance }("");
        require(success, "RhapsodyCreator/invalid-withdraw-money");
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
}
