# Guide Frontend Multi-Chain

## Vue d'ensemble

### Architecture
```
src/frontend/
├── components/
│   ├── ChainSelector.jsx    # Sélection du réseau
│   ├── WalletManager.jsx    # Gestion des wallets
│   └── MintSection.jsx      # Interface de mint
└── pages/
    └── mint.js             # Page principale
```

## Fonctionnalités

### Sélection de Réseau
- Ethereum (0.1 ETH)
- Polygon (100 MATIC)
- Solana (1 SOL)

### Support Wallets
- MetaMask (ETH/Polygon)
- Phantom (Solana)

## Guide d'Utilisation

### 1. Sélection du Réseau
```jsx
<ChainSelector 
    onChainSelect={handleChainSelect}
    selectedChain={selectedChain}
/>
```

### 2. Connexion Wallet
```jsx
<WalletManager 
    selectedChain={selectedChain}
    onWalletConnect={handleWalletConnect}
/>
```

### 3. Mint
```jsx
<MintSection 
    chainInfo={selectedChain}
    walletInfo={walletInfo}
/>
```

## Configuration

### Installation
```bash
npm install
# ou
yarn install
```

### Variables d'Environnement
```env
NEXT_PUBLIC_ETH_RPC=votre_eth_rpc
NEXT_PUBLIC_POLYGON_RPC=votre_polygon_rpc
NEXT_PUBLIC_SOLANA_RPC=votre_solana_rpc
```

## Style Guide

### Thème par Réseau
- Ethereum: Bleu (#3B82F6)
- Polygon: Violet (#8B5CF6)
- Solana: Vert (#10B981)

### Classes Communes
```css
.chain-selector {
    @apply p-6 bg-gray-800 rounded-xl shadow-xl;
}

.wallet-button {
    @apply px-6 py-2 rounded-lg font-semibold text-white;
}
```