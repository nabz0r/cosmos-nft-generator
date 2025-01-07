const { createLogger, format, transports } = require('winston');
const { ElasticsearchTransport } = require('winston-elasticsearch');

const logger = createLogger({
    format: format.combine(
        format.timestamp(),
        format.json()
    ),
    transports: [
        new ElasticsearchTransport({
            level: 'info',
            indexPrefix: 'nft-logs',
            clientOpts: { node: process.env.ELASTIC_URL }
        }),
        new transports.Console()
    ]
});

const monitorTransaction = async (txHash, chain) => {
    try {
        const txData = chain === 'ethereum' ? 
            await web3.eth.getTransaction(txHash) :
            await connection.getTransaction(txHash);

        logger.info('Transaction processed', {
            txHash,
            chain,
            status: txData.status || 'pending',
            from: txData.from,
            timestamp: new Date().toISOString()
        });

        return txData;
    } catch (error) {
        logger.error('Transaction monitoring failed', {
            txHash,
            chain,
            error: error.message
        });
        throw error;
    }
};

module.exports = { logger, monitorTransaction };