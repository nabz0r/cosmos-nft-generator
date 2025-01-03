import express from 'express';
import cors from 'cors';
import { ethers } from 'ethers';
import { Connection } from '@solana/web3.js';
import { TransactionManager } from '../services/TransactionManager';
import { AnalyticsService } from '../services/AnalyticsService';
import { ChainSyncService } from '../services/ChainSyncService';

const app = express();
app.use(cors());
app.use(express.json());

// Services initialization
const transactionManager = new TransactionManager();
const analyticsService = new AnalyticsService();
const chainSyncService = new ChainSyncService();

// Mint endpoints
app.post('/api/mint', async (req, res) => {
    try {
        const { chainType, walletAddress, tokenId } = req.body;
        const mintResult = await transactionManager.processMint(chainType, walletAddress, tokenId);
        res.json(mintResult);
    } catch (error) {
        console.error('Mint error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Transaction status
app.get('/api/transaction/:chainType/:txHash', async (req, res) => {
    try {
        const { chainType, txHash } = req.params;
        const status = await transactionManager.getTransactionStatus(chainType, txHash);
        res.json(status);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Analytics endpoints
app.get('/api/analytics/mints', async (req, res) => {
    try {
        const stats = await analyticsService.getMintStats();
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/analytics/trends', async (req, res) => {
    try {
        const trends = await analyticsService.getTrends();
        res.json(trends);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Chain sync endpoints
app.get('/api/sync/status', async (req, res) => {
    try {
        const status = await chainSyncService.getSyncStatus();
        res.json(status);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/sync/force', async (req, res) => {
    try {
        const result = await chainSyncService.forceSyncAll();
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});