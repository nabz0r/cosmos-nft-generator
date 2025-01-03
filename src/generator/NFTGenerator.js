import { create } from 'ipfs-http-client';
import { createCanvas } from 'canvas';
import { ethers } from 'ethers';

class NFTGenerator {
    constructor(ipfsConfig = { host: 'ipfs.infura.io', port: 5001, protocol: 'https' }) {
        this.ipfs = create(ipfsConfig);
        this.traits = {
            planetTypes: ['Rocky', 'Ice', 'Gas', 'Forest'],
            colors: {
                Rocky: ['#8B4513', '#A0522D', '#6B4423'],
                Ice: ['#ADD8E6', '#87CEEB', '#B0E0E6'],
                Gas: ['#FFD700', '#FFA500', '#FF8C00'],
                Forest: ['#228B22', '#32CD32', '#006400']
            },
            features: ['Rings', 'Moons', 'Storms', 'Craters']
        };
    }

    async generatePlanet(seed) {
        const canvas = createCanvas(64, 64);
        const ctx = canvas.getContext('2d');

        // Utiliser le seed pour la génération déterministe
        const randomValue = ethers.utils.keccak256(seed);
        const planetType = this.getRandomTrait('planetTypes', randomValue);
        const colors = this.traits.colors[planetType];
        
        // Générer la planète
        this.drawBackground(ctx);
        this.drawPlanet(ctx, colors, randomValue);
        this.addFeatures(ctx, randomValue);

        return canvas.toBuffer();
    }

    drawBackground(ctx) {
        ctx.fillStyle = '#000033';
        ctx.fillRect(0, 0, 64, 64);
        
        // Ajouter des étoiles
        for (let i = 0; i < 20; i++) {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(
                Math.random() * 64,
                Math.random() * 64,
                1,
                1
            );
        }
    }

    drawPlanet(ctx, colors, seed) {
        const centerX = 32;
        const centerY = 32;
        const radius = 20;

        // Base de la planète
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fillStyle = colors[0];
        ctx.fill();

        // Détails de surface
        this.addSurfaceDetails(ctx, centerX, centerY, radius, colors);
    }

    addSurfaceDetails(ctx, centerX, centerY, radius, colors) {
        for (let i = 0; i < 50; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * radius;
            const x = centerX + Math.cos(angle) * distance;
            const y = centerY + Math.sin(angle) * distance;
            
            ctx.beginPath();
            ctx.arc(x, y, Math.random() * 3, 0, Math.PI * 2);
            ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
            ctx.fill();
        }
    }

    getRandomTrait(traitType, seed) {
        const array = this.traits[traitType];
        const index = ethers.BigNumber.from(seed).mod(array.length).toNumber();
        return array[index];
    }

    async uploadToIPFS(imageBuffer, metadata) {
        try {
            // Upload de l'image
            const imageFile = await this.ipfs.add(imageBuffer);
            const imageUrl = `ipfs://${imageFile.path}`;

            // Création des métadonnées
            const nftMetadata = {
                name: metadata.name,
                description: metadata.description,
                image: imageUrl,
                attributes: metadata.attributes,
                external_url: `https://cosmosnft.com/planet/${metadata.id}`
            };

            // Upload des métadonnées
            const metadataFile = await this.ipfs.add(JSON.stringify(nftMetadata));
            return {
                imageUrl,
                metadataUrl: `ipfs://${metadataFile.path}`,
                metadata: nftMetadata
            };
        } catch (error) {
            console.error('IPFS upload error:', error);
            throw error;
        }
    }
}

export default NFTGenerator;