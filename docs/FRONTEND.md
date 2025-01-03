# Frontend Documentation

## Overview
Le frontend est construit avec Next.js et utilise Solana Wallet Adapter pour l'intégration wallet.

## Composants Principaux

### MintSection
- Interface de mint principale
- Connexion wallet
- Affichage des NFTs mintés
- Gestion des transactions

### Gallery
- Affichage des NFTs de l'utilisateur
- Vue détaillée des attributs
- Support des traits spéciaux

## Installation

```bash
cd frontend
npm install
npm run dev
```

## Configuration

```env
NEXT_PUBLIC_PROGRAM_ID=votre_program_id
NEXT_PUBLIC_SOLANA_RPC=https://api.devnet.solana.com
```

## Fonctionnalités

### Mint
- Prix : 1 SOL
- Affichage en temps réel des attributs
- Gestion des erreurs

### Galerie
- Chargement automatique
- Filtre par type/rareté
- Support des NFTs spéciaux