// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";

contract CosmosNFTEVM is ERC721URIStorage, ERC721Enumerable, ReentrancyGuard, Ownable, VRFConsumerBase {
    using Strings for uint256;

    // Prix fixe en ETH
    uint256 public constant MINT_PRICE = 0.1 ether;
    uint256 public constant MAX_SUPPLY = 10000;
    uint256 public constant TEAM_RESERVE = 500;
    uint256 public constant COLLAB_RESERVE = 100;

    // Chainlink VRF pour la génération aléatoire
    bytes32 private keyHash;
    uint256 private fee;
    
    // Mappings
    mapping(uint256 => PlanetAttributes) public planetAttributes;
    mapping(address => bool) public isCollaborator;
    mapping(uint256 => bool) public isCollabNFT;
    mapping(bytes32 => uint256) private requestToTokenId;
    
    struct PlanetAttributes {
        uint8 planetType;    // 0-3 (Rocky, Ice, Gas, Forest)
        uint8 rarity;        // 0-4 (Common to Legendary)
        string specialTrait;
    }
    
    // Events
    event MintRequested(address indexed to, bytes32 requestId);
    event PlanetRevealed(uint256 indexed tokenId, uint8 planetType, uint8 rarity);
    
    constructor(
        address _vrfCoordinator,
        address _linkToken,
        bytes32 _keyHash
    ) 
        ERC721("Cosmos Planets EVM", "COSMOS") 
        VRFConsumerBase(_vrfCoordinator, _linkToken) 
    {
        keyHash = _keyHash;
        fee = 0.1 * 10**18; // 0.1 LINK
    }

    function mint() public payable nonReentrant {
        require(msg.value >= MINT_PRICE, "Insufficient payment");
        require(totalSupply() < MAX_SUPPLY - TEAM_RESERVE - COLLAB_RESERVE, "Max supply reached");
        
        // Demande de nombre aléatoire à Chainlink VRF
        bytes32 requestId = requestRandomness(keyHash, fee);
        uint256 tokenId = totalSupply();
        requestToTokenId[requestId] = tokenId;
        
        _safeMint(msg.sender, tokenId);
        emit MintRequested(msg.sender, requestId);
    }
    
    function fulfillRandomness(bytes32 requestId, uint256 randomness) internal override {
        uint256 tokenId = requestToTokenId[requestId];
        
        // Génération des attributs basée sur le nombre aléatoire
        uint8 planetType = uint8(randomness % 4);
        uint8 rarity = _calculateRarity(uint8((randomness >> 8) % 100));
        
        planetAttributes[tokenId] = PlanetAttributes({
            planetType: planetType,
            rarity: rarity,
            specialTrait: ""
        });
        
        emit PlanetRevealed(tokenId, planetType, rarity);
    }
    
    function mintCollabNFT(address to, string memory specialTrait) public {
        require(isCollaborator[msg.sender], "Not a collaborator");
        require(totalSupply() < COLLAB_RESERVE, "Collab reserve depleted");
        
        uint256 tokenId = totalSupply();
        planetAttributes[tokenId] = PlanetAttributes({
            planetType: uint8(block.timestamp % 4),
            rarity: 4, // Legendary
            specialTrait: specialTrait
        });
        
        isCollabNFT[tokenId] = true;
        _safeMint(to, tokenId);
    }
    
    function _calculateRarity(uint8 rand) internal pure returns (uint8) {
        if (rand < 50) return 0;      // 50% Common
        if (rand < 75) return 1;      // 25% Uncommon
        if (rand < 90) return 2;      // 15% Rare
        if (rand < 98) return 3;      // 8% Epic
        return 4;                     // 2% Legendary
    }

    // Fonction pour générer les métadonnées on-chain
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        PlanetAttributes memory attrs = planetAttributes[tokenId];
        
        string memory planetType = attrs.planetType == 0 ? "Rocky" :
                                 attrs.planetType == 1 ? "Ice" :
                                 attrs.planetType == 2 ? "Gas" : "Forest";
                                 
        string memory rarity = attrs.rarity == 0 ? "Common" :
                             attrs.rarity == 1 ? "Uncommon" :
                             attrs.rarity == 2 ? "Rare" :
                             attrs.rarity == 3 ? "Epic" : "Legendary";
        
        string memory json = Base64.encode(bytes(string(abi.encodePacked(
            '{"name": "Cosmos Planet #', tokenId.toString(),
            '", "description": "A unique planetary NFT in the cosmos.",',
            '"attributes": [{"trait_type": "Planet Type", "value": "', planetType,
            '"}, {"trait_type": "Rarity", "value": "', rarity, '"}',
            isCollabNFT[tokenId] ? string(abi.encodePacked(
                ', {"trait_type": "Special Trait", "value": "', attrs.specialTrait, '"}'
            )) : "",
            ']}'
        ))));
        
        return string(abi.encodePacked("data:application/json;base64,", json));
    }

    function _beforeTokenTransfer(address from, address to, uint256 tokenId, uint256 batchSize)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
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