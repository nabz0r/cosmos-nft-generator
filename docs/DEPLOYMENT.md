# Guide de Déploiement

## Prérequis
- Node.js >= 14
- Solana CLI
- Wallet Solana avec des SOL

## Smart Contract

1. Configuration Solana
```bash
solana config set --url devnet
solana-keygen new --outfile ./deploy-keypair.json
```

2. Déploiement du programme
```bash
anchor build
anchor deploy
```

## Frontend

1. Build
```bash
cd frontend
npm run build
```

2. Déploiement (exemple avec Vercel)
```bash
vercel deploy
```

## Post-Déploiement

1. Mint des NFTs équipe
```bash
node scripts/mint-team-reserve.js
```

2. Configuration des collaborateurs
```bash
node scripts/add-collaborators.js
```