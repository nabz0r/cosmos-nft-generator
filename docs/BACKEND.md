# Documentation Backend

## Architecture

```
src/backend/
├── api/
│   └── server.js          # Serveur Express
├── services/
│   ├── TransactionManager.js  # Gestion transactions
│   ├── AnalyticsService.js    # Analytics
│   └── ChainSyncService.js    # Synchro cross-chain
└── config/
    └── redis.js             # Config Redis
```

## Services

### TransactionManager
- Gestion des transactions cross-chain
- Validation des mints
- Suivi des statuts

### AnalyticsService
- Statistiques en temps réel
- Cache Redis
- Agrégation des données

### ChainSyncService
- Synchronisation multi-chain
- Écoute des événements
- Résolution des conflits

## Base de Données

### Tables Principales
```sql
CREATE TABLE mints (
    id SERIAL PRIMARY KEY,
    chain_type VARCHAR(10),
    token_id VARCHAR(255),
    owner_address TEXT,
    created_at TIMESTAMP
);

CREATE TABLE transfers (
    id SERIAL PRIMARY KEY,
    chain_type VARCHAR(10),
    token_id VARCHAR(255),
    from_address TEXT,
    to_address TEXT,
    timestamp TIMESTAMP
);
```

## Cache Redis

### Keys
```
mint_stats:        # Statistiques de mint (5min TTL)
trends:            # Tendances (5min TTL)
chain_sync_status: # Statut sync (1min TTL)
```

## Sécurité

### Mesures
- Rate limiting par IP/wallet
- Validation des transactions
- Protection contre la réentrance

### Monitoring
- Logs des transactions
- Alertes de synchronisation
- Métriques de performance

## Configuration

### Variables d'Environnement
```env
# RPC URLs
ETH_RPC=...
POLYGON_RPC=...
SOLANA_RPC=...

# Contracts
ETH_CONTRACT=...
POLYGON_CONTRACT=...
SOLANA_PROGRAM_ID=...

# Database
DATABASE_URL=...

# Redis
REDIS_URL=...
```