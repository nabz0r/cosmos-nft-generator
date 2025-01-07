// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";

contract CosmosNFTEVM is ERC721URIStorage, ERC721Enumerable, ERC2981, ReentrancyGuard, Ownable, VRFConsumerBase, Pausable {
    using Strings for uint256;

    uint256 public constant MINT_PRICE = 0.1 ether;
    uint256 public constant MAX_SUPPLY = 10000;
    uint256 public constant TEAM_RESERVE = 500;
    uint256 public constant COLLAB_RESERVE = 100;
    uint96 public constant ROYALTY_FEE = 250; // 2.5%

    bytes32 private keyHash;
    uint256 private fee;
    
    mapping(uint256 => PlanetAttributes) public planetAttributes;
    mapping(address => bool) public isCollaborator;
    mapping(uint256 => bool) public isCollabNFT;
    mapping(bytes32 => uint256) private requestToTokenId;
    
    struct PlanetAttributes {
        uint8 planetType;
        uint8 rarity;
        string specialTrait;
    }
    
    event MintRequested(address indexed to, bytes32 requestId);
    event PlanetRevealed(uint256 indexed tokenId, uint8 planetType, uint8 rarity);
    event EmergencyPause(address indexed trigger);
    event EmergencyUnpause(address indexed trigger);
    event RoyaltyUpdated(address receiver, uint96 feeNumerator);
    
    constructor(
        address _vrfCoordinator,
        address _linkToken,
        bytes32 _keyHash
    ) 
        ERC721("Cosmos Planets EVM", "COSMOS") 
        VRFConsumerBase(_vrfCoordinator, _linkToken) 
    {
        keyHash = _keyHash;
        fee = 0.1 * 10**18;
        _setDefaultRoyalty(msg.sender, ROYALTY_FEE);
    }

    function mint() public payable nonReentrant whenNotPaused {
        require(msg.value >= MINT_PRICE, "Insufficient payment");
        require(totalSupply() < MAX_SUPPLY - TEAM_RESERVE - COLLAB_RESERVE, "Max supply reached");
        
        bytes32 requestId = requestRandomness(keyHash, fee);
        uint256 tokenId = totalSupply();
        requestToTokenId[requestId] = tokenId;
        
        _safeMint(msg.sender, tokenId);
        emit MintRequested(msg.sender, requestId);
    }
    
    function mintCollabNFT(address to, string memory specialTrait) public whenNotPaused {
        require(isCollaborator[msg.sender], "Not a collaborator");
        require(totalSupply() < COLLAB_RESERVE, "Collab reserve depleted");
        
        uint256 tokenId = totalSupply();
        planetAttributes[tokenId] = PlanetAttributes({
            planetType: uint8(block.timestamp % 4),
            rarity: 4,
            specialTrait: specialTrait
        });
        
        isCollabNFT[tokenId] = true;
        _safeMint(to, tokenId);
    }

    function setTokenRoyalty(uint256 tokenId, address recipient, uint96 fraction) external onlyOwner {
        _setTokenRoyalty(tokenId, recipient, fraction);
        emit RoyaltyUpdated(recipient, fraction);
    }

    function setDefaultRoyalty(address recipient, uint96 fraction) external onlyOwner {
        _setDefaultRoyalty(recipient, fraction);
        emit RoyaltyUpdated(recipient, fraction);
    }

    function deleteDefaultRoyalty() external onlyOwner {
        _deleteDefaultRoyalty();
    }

    function pause() public onlyOwner {
        _pause();
        emit EmergencyPause(msg.sender);
    }

    function unpause() public onlyOwner {
        _unpause();
        emit EmergencyUnpause(msg.sender);
    }
    
    function _calculateRarity(uint8 rand) internal pure returns (uint8) {
        if (rand < 50) return 0;
        if (rand < 75) return 1;
        if (rand < 90) return 2;
        if (rand < 98) return 3;
        return 4;
    }

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

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, ERC2981)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function _beforeTokenTransfer(address from, address to, uint256 tokenId, uint256 batchSize)
        internal
        override(ERC721, ERC721Enumerable)
        whenNotPaused
    {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }
}