class MetadataManager {
    constructor() {
        this.rarityLevels = {
            Common: 50,     // 50%
            Uncommon: 25,   // 25%
            Rare: 15,       // 15%
            Epic: 8,        // 8%
            Legendary: 2    // 2%
        };
    }

    generateMetadata(id, planetType, seed) {
        const rarity = this.calculateRarity(seed);
        const features = this.generateFeatures(seed, rarity);

        return {
            id,
            name: `Cosmos Planet #${id}`,
            description: this.generateDescription(planetType, rarity),
            attributes: [
                {
                    trait_type: 'Planet Type',
                    value: planetType
                },
                {
                    trait_type: 'Rarity',
                    value: rarity
                },
                ...features.map(feature => ({
                    trait_type: 'Feature',
                    value: feature
                }))
            ]
        };
    }

    calculateRarity(seed) {
        const random = parseInt(seed.slice(-2), 16) % 100;
        let sum = 0;
        
        for (const [rarity, chance] of Object.entries(this.rarityLevels)) {
            sum += chance;
            if (random < sum) return rarity;
        }
        
        return 'Common'; // Fallback
    }

    generateFeatures(seed, rarity) {
        const features = [
            'Rings',
            'Moons',
            'Storms',
            'Craters',
            'Volcanoes',
            'Oceans',
            'Mountains'
        ];

        // Nombre de features basé sur la rareté
        const featureCount = {
            Common: 1,
            Uncommon: 2,
            Rare: 3,
            Epic: 4,
            Legendary: 5
        }[rarity];

        // Sélection aléatoire basée sur le seed
        return this.shuffleArray(features, seed).slice(0, featureCount);
    }

    generateDescription(planetType, rarity) {
        return `A unique ${rarity.toLowerCase()} ${planetType.toLowerCase()} planet in the Cosmos NFT universe. Each planet is procedurally generated and exists across multiple blockchains.`;
    }

    shuffleArray(array, seed) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = parseInt(seed.slice(i * 2, i * 2 + 2), 16) % (i + 1);
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
}

export default MetadataManager;