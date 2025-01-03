// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";

contract PlanetNFT is 
    ERC721, 
    ERC721URIStorage, 
    ERC721Enumerable, 
    ReentrancyGuard, 
    Pausable, 
    Ownable,
    VRFConsumerBase 
{
    using Counters for Counters.Counter;

    // Constants
    uint256 private constant MINT_PRICE = 1 ether;
    uint256 private constant MAX_SUPPLY = 10000;
    uint256 private constant TEAM_RESERVE = 500;
    uint256 private constant TIMELOCK = 24 hours;

    // VRF variables
    bytes32 private immutable keyHash;
    uint256 private immutable fee;
    mapping(bytes32 => uint256) private requestToTokenId;

    // State variables
    Counters.Counter private _tokenIdCounter;
    mapping(address => bool) public isCollaborator;
    mapping(uint256 => string) private _tokenURIs;
    mapping(bytes32 => uint256) private _pendingActions;
    mapping(bytes32 => address) private _pendingCollaborators;

    // Events
    event TimelockInitiated(bytes32 indexed actionId, uint256 executeTime);
    event CollaboratorUpdateScheduled(address indexed collaborator, bool status);
    event RandomnessRequested(bytes32 indexed requestId, uint256 tokenId);

    constructor(
        address _vrfCoordinator,
        address _linkToken,
        bytes32 _keyHash,
        uint256 _fee
    ) 
        ERC721("Planet NFT", "PLANET")
        VRFConsumerBase(_vrfCoordinator, _linkToken)
    {
        keyHash = _keyHash;
        fee = _fee;
    }

    // Security modifiers
    modifier timelocked(bytes32 actionId) {
        require(_pendingActions[actionId] != 0, "Action not initiated");
        require(block.timestamp >= _pendingActions[actionId], "Timelock active");
        delete _pendingActions[actionId];
        _;
    }

    modifier validMint() {
        require(msg.value >= MINT_PRICE, "Insufficient payment");
        require(_tokenIdCounter.current() < MAX_SUPPLY, "Max supply reached");
        require(!paused(), "Contract is paused");
        _;
    }

    // Main functions
    function mint() public payable nonReentrant validMint {
        bytes32 requestId = requestRandomness(keyHash, fee);
        uint256 tokenId = _tokenIdCounter.current();
        requestToTokenId[requestId] = tokenId;
        _tokenIdCounter.increment();
        _safeMint(msg.sender, tokenId);
        emit RandomnessRequested(requestId, tokenId);
    }

    function fulfillRandomness(bytes32 requestId, uint256 randomness) internal override {
        uint256 tokenId = requestToTokenId[requestId];
        _generatePlanetTraits(tokenId, randomness);
    }

    // Admin functions with timelock
    function initiateCollaboratorUpdate(address collaborator, bool status) public onlyOwner {
        bytes32 actionId = keccak256(abi.encodePacked("collaborator", collaborator, status));
        _pendingActions[actionId] = block.timestamp + TIMELOCK;
        _pendingCollaborators[actionId] = collaborator;
        emit CollaboratorUpdateScheduled(collaborator, status);
    }

    function executeCollaboratorUpdate(address collaborator, bool status) public onlyOwner 
        timelocked(keccak256(abi.encodePacked("collaborator", collaborator, status))) 
    {
        isCollaborator[collaborator] = status;
    }

    // Emergency functions
    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    // Internal functions
    function _generatePlanetTraits(uint256 tokenId, uint256 randomness) internal {
        // Generate traits using VRF randomness
        // Implementation details...
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override(ERC721, ERC721Enumerable) whenNotPaused {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    // Required overrides
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    // Circuit breaker
    function withdrawLink() public onlyOwner {
        require(LINK.transfer(msg.sender, LINK.balanceOf(address(this))), "Unable to transfer");
    }

    // Secure withdrawal
    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Transfer failed");
    }
}