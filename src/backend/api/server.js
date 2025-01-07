const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { limiter, mintLimiter } = require('../middleware/rateLimiter');
const { validateMetadata, validateIPFSHash } = require('../middleware/metadataValidator');
const { logger, monitorTransaction } = require('../services/monitoring');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(limiter);

// Routes
app.post('/api/mint', mintLimiter, async (req, res) => {
    try {
        const { metadata, ipfsHash } = req.body;

        // Validate metadata
        const metadataValidation = validateMetadata(metadata);
        if (!metadataValidation.valid) {
            return res.status(400).json({ errors: metadataValidation.errors });
        }

        // Validate IPFS hash
        if (!validateIPFSHash(ipfsHash)) {
            return res.status(400).json({ error: 'Invalid IPFS hash' });
        }

        // Process mint transaction
        const txHash = await mintNFT(metadata, ipfsHash);
        
        // Monitor transaction
        monitorTransaction(txHash, req.body.chain)
            .catch(error => logger.error('Transaction monitoring failed', { error }));

        res.json({ txHash });
    } catch (error) {
        logger.error('Mint failed', { error: error.message });
        res.status(500).json({ error: 'Mint failed' });
    }
});

app.get('/api/status', async (req, res) => {
    try {
        const { txHash, chain } = req.query;
        const status = await monitorTransaction(txHash, chain);
        res.json(status);
    } catch (error) {
        res.status(500).json({ error: 'Status check failed' });
    }
});

app.listen(process.env.PORT, () => {
    logger.info(`Server running on port ${process.env.PORT}`);
});
