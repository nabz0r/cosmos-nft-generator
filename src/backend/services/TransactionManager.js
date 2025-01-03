import { ethers } from 'ethers';
import { Connection, PublicKey } from '@solana/web3.js';
import { redis } from '../config/redis';

export class TransactionManager {
    constructor() {
        this.providers = {
            ETH: new ethers.providers.JsonRpcProvider(process.env.ETH_RPC),
            POLYGON: new ethers.providers.JsonRpcProvider(process.env.POLYGON_RPC),
            SOLANA: new Connection(process.env.SOLANA_RPC)
        };
        
        this.contracts = {
            ETH: new ethers.Contract(process.env.ETH_CONTRACT, ABI, this.providers.ETH),
            POLYGON: new ethers.Contract(process.env.POLYGON_CONTRACT, ABI, this.providers.POLYGON)
        };
    }

    async processMint(chainType, walletAddress, tokenId) {
        const key = `mint:${chainType}:${walletAddress}:${tokenId}`;
        const processing = await redis.get(key);

        if (processing) {
            throw new Error('Mint already in progress');
        }

        await redis.set(key, 'processing', 'EX', 300); // 5min expiration

        try {
            let txHash;
            if (chainType === 'SOLANA') {
                txHash = await this.processSolanaMint(walletAddress, tokenId);
            } else {
                txHash = await this.processEVMMint(chainType, walletAddress, tokenId);
            }

            await redis.set(key, 'completed');
            return { txHash, status: 'success' };
        } catch (error) {
            await redis.del(key);
            throw error;
        }
    }

    async processEVMMint(chainType, walletAddress, tokenId) {
        const contract = this.contracts[chainType];
        const tx = await contract.mint(tokenId, { from: walletAddress });
        await tx.wait();
        return tx.hash;
    }

    async processSolanaMint(walletAddress, tokenId) {
        // Solana mint logic
        return 'solana_tx_hash';
    }

    async getTransactionStatus(chainType, txHash) {
        try {
            if (chainType === 'SOLANA') {
                const status = await this.providers.SOLANA.getSignatureStatus(txHash);
                return this.formatSolanaStatus(status);
            } else {
                const tx = await this.providers[chainType].getTransactionReceipt(txHash);
                return this.formatEVMStatus(tx);
            }
        } catch (error) {
            console.error(`Error getting tx status: ${error}`);
            return { status: 'error', error: error.message };
        }
    }

    formatEVMStatus(tx) {
        if (!tx) return { status: 'pending' };
        return {
            status: tx.status ? 'confirmed' : 'failed',
            confirmations: tx.confirmations,
            blockNumber: tx.blockNumber
        };
    }

    formatSolanaStatus(status) {
        if (!status) return { status: 'pending' };
        return {
            status: status.confirmations ? 'confirmed' : 'pending',
            confirmations: status.confirmations || 0
        };
    }
}