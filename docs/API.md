# Documentation API

## Points d'Entrée

### Transactions

```http
POST /api/mint
Body: {
    "chainType": "ETH",
    "walletAddress": "0x...",
    "tokenId": "1"
}

GET /api/transaction/:chainType/:txHash
Response: {
    "status": "confirmed",
    "confirmations": 12,
    "blockNumber": 123456
}
```

### Analytics

```http
GET /api/analytics/mints
Response: {
    "totalMints": 1000,
    "chainDistribution": {...},
    "rarityDistribution": {...},
    "volume24h": 150
}

GET /api/analytics/trends
Response: {
    "hourlyTrend": [...],
    "popularTypes": [...],
    "featureFrequency": [...]
}
```

### Synchronisation

```http
GET /api/sync/status
Response: {
    "ETH": { "synced": true, "behind": 0 },
    "POLYGON": { "synced": true, "behind": 0 },
    "SOLANA": { "synced": true, "behind": 0 }
}

POST /api/sync/force
Response: {
    "success": true,
    "results": {...}
}
```

## Authentication

Utiliser le header Authorization:
```http
Authorization: Bearer your_token_here
```

## Rate Limiting

- 100 requêtes/min par IP
- 1000 requêtes/jour par wallet

## Codes d'Erreur

```javascript
200: Success
400: Bad Request
401: Unauthorized
429: Too Many Requests
500: Server Error
```

## Exemples

### Mint NFT
```javascript
const response = await fetch('/api/mint', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
        chainType: 'ETH',
        walletAddress: '0x...',
        tokenId: '1'
    })
});
```

### Get Analytics
```javascript
const stats = await fetch('/api/analytics/mints')
    .then(res => res.json());
```