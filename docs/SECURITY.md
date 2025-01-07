# Documentation Sécurité

## Architecture de Sécurité

```mermaid
flowchart TD
    Client[Client] --> RateLimit[Rate Limiter]
    RateLimit --> API[API Gateway]
    API --> Validator[Metadata Validator]
    API --> Monitor[Transaction Monitor]
    Validator --> IPFS[IPFS Validation]
    Monitor --> ELK[ELK Stack]
    Monitor --> Blockchain[Blockchain]
```

## Smart Contract Sécurité

### Mécanisme de Pause
```mermaid
sequenceDiagram
    participant Owner
    participant Contract
    participant User
    
    Owner->>Contract: pause()
    Contract-->>Contract: _pause()
    Contract-->>Contract: emit EmergencyPause
    User->>Contract: mint()
    Contract-->>User: revert "Pausable: paused"
```

### Système de Royalties
```mermaid
sequenceDiagram
    participant Owner
    participant Contract
    participant Marketplace
    
    Owner->>Contract: setDefaultRoyalty(2.5%)
    Marketplace->>Contract: royaltyInfo(tokenId, price)
    Contract-->>Marketplace: [receiver, amount]
```

## Rate Limiting

```mermaid
flowchart LR
    Client --> Redis[(Redis)]
    Redis --> |Global: 100 req/15min| API
    Redis --> |Mint: 5 req/heure| Mint[Mint Endpoint]
```

## Validation des Métadonnées

```mermaid
sequenceDiagram
    participant Client
    participant API
    participant Validator
    participant IPFS
    
    Client->>API: POST /api/mint
    API->>Validator: Valide metadata
    Validator->>IPFS: Vérifie hash
    IPFS-->>Validator: Hash valide
    Validator-->>API: Validation OK
    API-->>Client: Transaction hash
```

## Monitoring Transactions

```mermaid
sequenceDiagram
    participant TX as Transaction
    participant Monitor
    participant ELK
    participant Alert
    
    TX->>Monitor: Nouvelle transaction
    Monitor->>ELK: Log transaction
    Monitor->>Alert: Si erreur
    ELK->>Alert: Si anomalie
```

## Implémentations

### Smart Contract
- Mécanisme de pause d'urgence
- Standards implémentés :
  - ERC721
  - ERC2981 (Royalties)
- Tests exhaustifs
- Protection contre la réentrance

### Rate Limiting
- Limitation globale : 100 requêtes/15min/IP
- Limitation mint : 5 requêtes/heure/IP
- Stockage Redis distribué
- Protection DDOS basique

### Validation Métadonnées
- Validation champs requis
  - name
  - description
  - image
- Validation format attributs
- Vérification hash IPFS

### Monitoring
- Stack ELK
- Logging temps réel
- Alerting anomalies
- Suivi transactions multi-chain