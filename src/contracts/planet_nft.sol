// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract PlanetNFT is ERC721, ERC721URIStorage, ERC721Enumerable, Ownable, Pausable, ReentrancyGuard {
    using Counters for Counters.Counter;

    // State variables
    Counters.Counter private _tokenIdCounter;
    uint256 public constant MINT_PRICE = 1 ether;
    uint256 public constant MAX_SUPPLY = 10000;
    string public baseURI;
    mapping(uint256 => uint256) public planetTypes; // 0: Rocky, 1: Ice, 2: Gas, 3: Forest
    mapping(uint256 => uint256) public rarityLevels; // 0: Common, 1: Uncommon, 2: Rare, 3: Epic, 4: Legendary

    // Events
    event PlanetMinted(address indexed owner, uint256 indexed tokenId, uint256 planetType, uint256 rarity);
    event PriceUpdated(uint256 newPrice);
    event BaseURIUpdated(string newBaseURI);
    event RoyaltiesWithdrawn(address indexed to, uint256 amount);

    constructor() ERC721("Cosmos Planets", "CSMS") {
        baseURI = "";
    }

    // Mint functions
    function mint() public payable whenNotPaused nonReentrant {
        require(msg.value >= MINT_PRICE, "Insufficient payment");
        require(totalSupply() < MAX_SUPPLY, "Max supply reached");

        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();

        // Generate random planet type and rarity
        uint256 planetType = _random(4); // 0-3
        uint256 rarity = _calculateRarity(_random(100)); // Based on probability

        planetTypes[tokenId] = planetType;
        rarityLevels[tokenId] = rarity;

        _safeMint(msg.sender, tokenId);

        emit PlanetMinted(msg.sender, tokenId, planetType, rarity);
    }

    function batchMint(uint256 amount) public payable whenNotPaused nonReentrant {
        require(amount > 0 && amount <= 20, "Invalid amount");
        require(msg.value >= MINT_PRICE * amount, "Insufficient payment");
        require(totalSupply() + amount <= MAX_SUPPLY, "Would exceed max supply");

        for (uint256 i = 0; i < amount; i++) {
            mint();
        }
    }

    // Admin functions
    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function setBaseURI(string memory newBaseURI) public onlyOwner {
        baseURI = newBaseURI;
        emit BaseURIUpdated(newBaseURI);
    }

    function withdrawRoyalties() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No royalties to withdraw");
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Transfer failed");
        
        emit RoyaltiesWithdrawn(owner(), balance);
    }

    // View functions
    function getPlanetInfo(uint256 tokenId) public view returns (uint256 planetType, uint256 rarity) {
        require(_exists(tokenId), "Token does not exist");
        return (planetTypes[tokenId], rarityLevels[tokenId]);
    }

    function tokensOfOwner(address owner) public view returns (uint256[] memory) {
        uint256 tokenCount = balanceOf(owner);
        uint256[] memory tokens = new uint256[](tokenCount);
        
        for (uint256 i = 0; i < tokenCount; i++) {
            tokens[i] = tokenOfOwnerByIndex(owner, i);
        }
        
        return tokens;
    }

    // Internal functions
    function _random(uint256 max) internal view returns (uint256) {
        return uint256(keccak256(abi.encodePacked(block.timestamp, block.difficulty, msg.sender))) % max;
    }

    function _calculateRarity(uint256 rand) internal pure returns (uint256) {
        if (rand < 50) return 0;      // 50% Common
        if (rand < 75) return 1;      // 25% Uncommon
        if (rand < 90) return 2;      // 15% Rare
        if (rand < 98) return 3;      // 8% Epic
        return 4;                     // 2% Legendary
    }

    // Required overrides
    function _beforeTokenTransfer(address from, address to, uint256 tokenId, uint256 batchSize)
        internal
        override(ERC721, ERC721Enumerable)
        whenNotPaused
    {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
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

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}