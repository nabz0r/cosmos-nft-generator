# Documentation Technique

## Smart Contract

### Fonctions d'Urgence

```solidity
// Pause toutes les opérations du contrat
pause() public onlyOwner

// Réactive les opérations du contrat
unpause() public onlyOwner
```

### Events
```solidity
event EmergencyPause(address indexed trigger);
event EmergencyUnpause(address indexed trigger);
```

### Fonctions Principales

```solidity
// Mint public
mint() public payable whenNotPaused

// Mint team
mintTeamReserve() public onlyOwner whenNotPaused

// Mint collaborateur
mintCollabNFT(address to, string specialTrait) public whenNotPaused onlyCollaborator
```

### Système de Rareté

```solidity
function _calculateRarity(uint256 rand) internal pure returns (uint256) {
    if (rand < 50) return 0;      // 50% Common
    if (rand < 75) return 1;      // 25% Uncommon
    if (rand < 90) return 2;      // 15% Rare
    if (rand < 98) return 3;      // 8% Epic
    return 4;                     // 2% Legendary
}
```

## Frontend

### Configuration

```typescript
const config = {
    SOLANA_NETWORK: 'devnet',
    NFT_STORAGE_KEY: process.env.NFT_STORAGE_KEY,
    PROGRAM_ID: process.env.PROGRAM_ID
}
```

### Intégration Wallet

```typescript
import { useWallet } from '@solana/wallet-adapter-react';

// Connexion wallet
const { wallet, connect } = useWallet();
```

## Sécurité

- Protection contre la réentrance
- Système de pause d'urgence
- Gestion des royalties
- Contrôle des collaborateurs
- Protection contre le spam