// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";

contract PlanetNFT is ERC721, ERC721URIStorage, ERC721Enumerable, ERC2981, Ownable, Pausable, ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    // Constants
    uint256 public constant MINT_PRICE = 1 ether;
    uint256 public constant MAX_SUPPLY = 10000;
    uint256 public constant TEAM_RESERVE = 500;    // 5% réservé pour l'équipe
    uint256 public constant COLLAB_RESERVE = 100;  // 1% pour les collaborateurs
    uint96 public constant ROYALTY_FEE = 500;      // 5% de royalties

    // State variables
    address public teamWallet;
    string public baseURI;
    bool public teamReserveMinted;
    uint256 public collabNFTsMinted;

    // Mappings
    mapping(uint256 => uint256) public planetTypes;
    mapping(uint256 => uint256) public rarityLevels;
    mapping(address => bool) public isCollaborator;
    mapping(uint256 => bool) public isCollabNFT;
    mapping(uint256 => string) public collabSpecialTraits;

    // Events
    event TeamReserveMinted(address indexed to, uint256 startId, uint256 endId);
    event CollaboratorAdded(address indexed collaborator);
    event CollaboratorRemoved(address indexed collaborator);
    event CollabNFTMinted(address indexed to, uint256 tokenId, string specialTrait);
    event RoyaltiesWithdrawn(address indexed to, uint256 amount);

    modifier onlyCollaborator() {
        require(isCollaborator[msg.sender], "Not a collaborator");
        _;
    }

    constructor(address _teamWallet) ERC721("Cosmos Planets", "CSMS") {
        require(_teamWallet != address(0), "Invalid team wallet");
        teamWallet = _teamWallet;
        _setDefaultRoyalty(_teamWallet, ROYALTY_FEE);
        isCollaborator[_teamWallet] = true;
    }

    // Public mint function
    function mint() public payable whenNotPaused nonReentrant {
        require(msg.value >= MINT_PRICE, "Insufficient payment");
        require(_tokenIdCounter.current() < MAX_SUPPLY - TEAM_RESERVE - COLLAB_RESERVE, "Max public supply reached");

        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();

        planetTypes[tokenId] = _random(4);
        rarityLevels[tokenId] = _calculateRarity(_random(100));

        _safeMint(msg.sender, tokenId);
    }

    // Team mint functions
    function mintTeamReserve() public onlyOwner {
        require(!teamReserveMinted, "Team reserve already minted");
        require(_tokenIdCounter.current() + TEAM_RESERVE <= MAX_SUPPLY, "Not enough supply");

        uint256 startId = _tokenIdCounter.current();
        
        for(uint256 i = 0; i < TEAM_RESERVE; i++) {
            uint256 tokenId = _tokenIdCounter.current();
            _tokenIdCounter.increment();
            
            planetTypes[tokenId] = _random(4);
            rarityLevels[tokenId] = 4; // Legendary
            
            _safeMint(teamWallet, tokenId);
        }

        teamReserveMinted = true;
        emit TeamReserveMinted(teamWallet, startId, _tokenIdCounter.current() - 1);
    }

    // Collaborator functions
    function addCollaborator(address collaborator) public onlyOwner {
        require(collaborator != address(0), "Invalid address");
        require(!isCollaborator[collaborator], "Already a collaborator");
        isCollaborator[collaborator] = true;
        emit CollaboratorAdded(collaborator);
    }

    function removeCollaborator(address collaborator) public onlyOwner {
        require(collaborator != teamWallet, "Cannot remove team wallet");
        require(isCollaborator[collaborator], "Not a collaborator");
        isCollaborator[collaborator] = false;
        emit CollaboratorRemoved(collaborator);
    }

    function mintCollabNFT(address to, string memory specialTrait) public onlyCollaborator {
        require(collabNFTsMinted < COLLAB_RESERVE, "Collab reserve depleted");
        
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        collabNFTsMinted++;
        
        isCollabNFT[tokenId] = true;
        collabSpecialTraits[tokenId] = specialTrait;
        planetTypes[tokenId] = _random(4);
        rarityLevels[tokenId] = 4; // Legendary
        
        _safeMint(to, tokenId);
        emit CollabNFTMinted(to, tokenId, specialTrait);
    }

    // Treasury management
    function withdrawRoyalties() public {
        require(msg.sender == teamWallet, "Only team wallet");
        uint256 balance = address(this).balance;
        require(balance > 0, "No royalties to withdraw");
        
        (bool success, ) = payable(teamWallet).call{value: balance}("");
        require(success, "Transfer failed");
        
        emit RoyaltiesWithdrawn(teamWallet, balance);
    }

    // Admin functions
    function setTeamWallet(address newTeamWallet) public onlyOwner {
        require(newTeamWallet != address(0), "Invalid address");
        teamWallet = newTeamWallet;
        _setDefaultRoyalty(newTeamWallet, ROYALTY_FEE);
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function setBaseURI(string memory newBaseURI) public onlyOwner {
        baseURI = newBaseURI;
    }

    // Internal functions
    function _random(uint256 max) internal view returns (uint256) {
        return uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender, _tokenIdCounter.current()))) % max;
    }

    function _calculateRarity(uint256 rand) internal pure returns (uint256) {
        if (rand < 50) return 0;      // 50% Common
        if (rand < 75) return 1;      // 25% Uncommon
        if (rand < 90) return 2;      // 15% Rare
        if (rand < 98) return 3;      // 8% Epic
        return 4;                     // 2% Legendary
    }

    // Required overrides
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override(ERC721, ERC721Enumerable) whenNotPaused {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, ERC2981)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}