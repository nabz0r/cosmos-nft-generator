# Détails Techniques

## Génération Déterministe

### Création du Seed
```javascript
createSeed(tokenId, chainType) {
    return ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(
            ['uint256', 'string'],
            [tokenId, chainType]
        )
    );
}
```

### Traits par Rareté

| Rareté    | Features | Probabilité |
|-----------|----------|-------------|
| Common    | 1        | 50%         |
| Uncommon  | 2        | 25%         |
| Rare      | 3        | 15%         |
| Epic      | 4        | 8%          |
| Legendary | 5        | 2%          |

## Stockage IPFS

### Structure
```
IPFS/
├── images/
│   ├── <token_id>.png
│   └── ...
└── metadata/
    ├── <token_id>.json
    └── ...
```

### Upload Process
1. Génération de l'image
2. Upload de l'image sur IPFS
3. Création des métadonnées
4. Upload des métadonnées
5. Retour des URLs

## Compatibilité Cross-Chain

### Ethereum/Polygon
- Métadonnées OpenSea standard
- URI IPFS direct
- Gas-efficient metadata

### Solana
- Format Metaplex
- Arweave backup
- Metadata program v2

## Performance

### Optimisations
- Génération asynchrone
- Batch processing
- Cache IPFS

### Limites
- Max 50 NFTs par batch
- Taille image: 64x64px
- Max 100 req/min IPFS

## Sécurité

### Vérifications
- Unicité des seeds
- Validation des métadonnées
- Rate limiting

### Backup
- Stockage redondant IPFS
- Sauvegarde métadonnées
- Journal des générations