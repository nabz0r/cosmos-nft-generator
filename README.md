# 🪐 Cosmos NFT Generator

Générateur de NFTs créant des planètes procédurales en pixel art 64x64 sur Solana.

## 🚀 Quick Start

```bash
# Installer les dépendances
npm install
pip install -r requirements.txt

# Configurer votre wallet Solana
solana config set --url devnet
solana-keygen new --outfile ~/.config/solana/devnet.json

# Déployer le contrat
anchor build
anchor deploy

# Lancer le frontend
cd frontend
npm run dev
```

## 🛠️ Architecture

- `src/generator/`: Scripts de génération de planètes et métadonnées
- `src/contracts/`: Smart contracts Solana
- `src/frontend/`: Interface utilisateur Next.js

## 🔑 Configuration

```bash
# .env
SOLANA_NETWORK=devnet
NFT_STORAGE_KEY=your_key
PROGRAM_ID=your_program_id
```

## 📦 Déploiement

1. Déployer le contrat sur Solana devnet
2. Uploader les assets sur IPFS
3. Configurer le frontend avec les bonnes variables

## 🎨 Génération de NFTs

```python
from src.generator.batch_generator import BatchGenerator

generator = BatchGenerator()
generator.generate_batch(start_id=0, count=10)
```

## License

MIT