# 🪐 Cosmos NFT Generator

Générateur de NFTs multi-chain avec synchronisation cross-chain et analytics en temps réel.

## 🌐 Features

### Cross-Chain Support
- Ethereum (0.1 ETH)
- Polygon (100 MATIC)
- Solana (1 SOL)

### Analytics & Monitoring
- Statistiques en temps réel
- Suivi des tendances
- Analyses de rareté

### Backend & API
- Gestion des transactions
- Synchronisation cross-chain
- Cache Redis

## 💻 Stack Technique

### Frontend
- Next.js
- TailwindCSS
- Web3 Integration

### Backend
- Node.js/Express
- Redis
- Prisma/PostgreSQL

### Blockchain
- Solana Web3.js
- Ethers.js
- IPFS

## 🚀 Quick Start

```bash
# Installation
npm install

# Configuration
cp .env.example .env
# Remplir les variables d'environnement

# Démarrage Backend
npm run start:api

# Démarrage Frontend
npm run dev
```

## 📈 Analytics

```bash
# Endpoint Analytics
GET /api/analytics/mints    # Statistiques de mint
GET /api/analytics/trends   # Tendances
```

## 📑 Documentation

- [Guide Installation](docs/INSTALLATION.md)
- [Guide Technique](docs/TECHNICAL.md)
- [Guide API](docs/API.md)

## 👥 Contribution

Voir [CONTRIBUTING.md](CONTRIBUTING.md) pour les détails.

## 📜 License

MIT