# Système de Génération NFT

## Architecture

```
src/generator/
├── NFTGenerator.js      # Génération graphique
├── MetadataManager.js   # Gestion des métadonnées
└── index.js            # Interface unifiée
```

## Caractéristiques

### Types de Planètes
- Rocky (Rocheuse)
- Ice (Glacée)
- Gas (Gazeuse)
- Forest (Forestière)

### Système de Rareté
- Common: 50%
- Uncommon: 25%
- Rare: 15%
- Epic: 8%
- Legendary: 2%

### Features
- Rings (Anneaux)
- Moons (Lunes)
- Storms (Tempêtes)
- Craters (Cratères)
- Volcanoes (Volcans)
- Oceans (Océans)
- Mountains (Montagnes)

## Utilisation

### Génération Simple
```javascript
const generator = new UnifiedGenerator();

// Générer un NFT
const nft = await generator.generateNFT(tokenId, 'ETH');
console.log(nft.imageUrl, nft.metadataUrl);
```

### Génération en Batch
```javascript
// Générer plusieurs NFTs
const nfts = await generator.generateBatch(startId, count, 'SOLANA');
```

### Configuration IPFS
```javascript
const config = {
    host: 'ipfs.infura.io',
    port: 5001,
    protocol: 'https'
};

const generator = new UnifiedGenerator(config);
```

## Métadonnées

### Format
```json
{
    "name": "Cosmos Planet #1",
    "description": "A unique rare rocky planet...",
    "image": "ipfs://...",
    "attributes": [
        {
            "trait_type": "Planet Type",
            "value": "Rocky"
        },
        {
            "trait_type": "Rarity",
            "value": "Rare"
        },
        {
            "trait_type": "Feature",
            "value": "Rings"
        }
    ]
}
```