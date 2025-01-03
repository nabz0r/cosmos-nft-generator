// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

// ... [imports précédents] ...

contract PlanetNFT is ERC721, ERC721URIStorage, ERC721Enumerable, ERC2981, Ownable, Pausable, ReentrancyGuard {
    // Constants existantes
    uint256 public constant MINT_PRICE = 1 ether;
    uint256 public constant MAX_SUPPLY = 10000;
    uint256 public constant TEAM_RESERVE = 500;    // 5% réservé pour l'équipe
    uint256 public constant COLLAB_RESERVE = 100;  // 1% pour les collaborateurs
    uint96 public constant ROYALTY_FEE = 500;      // 5% de royalties

    // Nouvelles variables pour les collaborateurs
    mapping(address => bool) public isCollaborator;
    mapping(uint256 => bool) public isCollabNFT;
    mapping(uint256 => string) public collabSpecialTraits;
    uint256 public collabNFTsMinted;

    // Events
    event CollaboratorAdded(address indexed collaborator);
    event CollaboratorRemoved(address indexed collaborator);
    event CollabNFTMinted(address indexed to, uint256 tokenId, string specialTrait);

    // Modifier pour les collaborateurs
    modifier onlyCollaborator() {
        require(isCollaborator[msg.sender], "Not a collaborator");
        _;
    }

    constructor(address _teamWallet) ERC721("Cosmos Planets", "CSMS") {
        teamWallet = _teamWallet;
        _setDefaultRoyalty(_teamWallet, ROYALTY_FEE);
        
        // Ajouter automatiquement le team wallet comme collaborateur
        isCollaborator[_teamWallet] = true;
    }

    // Gestion des collaborateurs
    function addCollaborator(address collaborator) public onlyOwner {
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

    // Mint spécial collaborateur
    function mintCollabNFT(address to, string memory specialTrait) public onlyCollaborator {
        require(collabNFTsMinted < COLLAB_RESERVE, "Collab reserve depleted");
        
        uint256 tokenId = _tokenIdCounter++;
        collabNFTsMinted++;
        
        // Marquer comme NFT collaborateur
        isCollabNFT[tokenId] = true;
        collabSpecialTraits[tokenId] = specialTrait;
        
        // Génération spéciale pour NFT collab
        planetTypes[tokenId] = _random(4);
        rarityLevels[tokenId] = 4; // Toujours Legendary
        
        _safeMint(to, tokenId);
        emit CollabNFTMinted(to, tokenId, specialTrait);
    }

    // Override du tokenURI pour les NFTs collaborateurs
    function tokenURI(uint256 tokenId) 
        public 
        view 
        override(ERC721, ERC721URIStorage) 
        returns (string memory) 
    {
        if (isCollabNFT[tokenId]) {
            // Ajouter les traits spéciaux aux métadonnées
            return _generateCollabTokenURI(tokenId);
        }
        return super.tokenURI(tokenId);
    }

    // Génération des métadonnées spéciales pour les NFTs collaborateurs
    function _generateCollabTokenURI(uint256 tokenId) internal view returns (string memory) {
        string memory trait = collabSpecialTraits[tokenId];
        string memory baseTokenURI = super.tokenURI(tokenId);
        
        // Ici vous pouvez customiser davantage les métadonnées
        // Par exemple, ajouter un badge spécial ou des attributs uniques
        return string(abi.encodePacked(baseTokenURI, "_collab_", trait));
    }

    // View functions pour les NFTs collaborateurs
    function getCollabInfo(uint256 tokenId) public view returns (
        bool isCollab,
        string memory specialTrait,
        uint256 planetType,
        uint256 rarity
    ) {
        require(_exists(tokenId), "Token does not exist");
        return (
            isCollabNFT[tokenId],
            collabSpecialTraits[tokenId],
            planetTypes[tokenId],
            rarityLevels[tokenId]
        );
    }

    // ... [reste du contrat inchangé] ...
}