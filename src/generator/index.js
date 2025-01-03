import NFTGenerator from './NFTGenerator';
import MetadataManager from './MetadataManager';

class UnifiedGenerator {
    constructor(ipfsConfig) {
        this.generator = new NFTGenerator(ipfsConfig);
        this.metadataManager = new MetadataManager();
    }

    async generateNFT(tokenId, chainType) {
        // Créer un seed unique basé sur le tokenId et la chaîne
        const seed = this.createSeed(tokenId, chainType);
        
        // Générer la planète
        const planetBuffer = await this.generator.generatePlanet(seed);
        
        // Déterminer le type et générer les métadonnées
        const planetType = this.generator.getRandomTrait('planetTypes', seed);
        const metadata = this.metadataManager.generateMetadata(tokenId, planetType, seed);
        
        // Upload sur IPFS
        const ipfsData = await this.generator.uploadToIPFS(planetBuffer, metadata);
        
        return {
            ...ipfsData,
            chainType,
            tokenId
        };
    }

    createSeed(tokenId, chainType) {
        return ethers.utils.keccak256(
            ethers.utils.defaultAbiCoder.encode(
                ['uint256', 'string'],
                [tokenId, chainType]
            )
        );
    }

    async generateBatch(startId, count, chainType) {
        const results = [];
        for (let i = 0; i < count; i++) {
            const result = await this.generateNFT(startId + i, chainType);
            results.push(result);
        }
        return results;
    }
}

export default UnifiedGenerator;