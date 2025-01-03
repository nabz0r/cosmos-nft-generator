import { Prisma } from '@prisma/client';
import { redis } from '../config/redis';

export class AnalyticsService {
    constructor() {
        this.prisma = new PrismaClient();
    }

    async getMintStats() {
        // Cache check
        const cached = await redis.get('mint_stats');
        if (cached) return JSON.parse(cached);

        const stats = await this.prisma.$transaction([
            // Total mints per chain
            this.prisma.mint.groupBy({
                by: ['chainType'],
                _count: true
            }),
            // Rarity distribution
            this.prisma.nft.groupBy({
                by: ['rarity'],
                _count: true
            }),
            // 24h volume
            this.prisma.mint.count({
                where: {
                    createdAt: {
                        gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
                    }
                }
            })
        ]);

        const formattedStats = this.formatMintStats(stats);
        await redis.set('mint_stats', JSON.stringify(formattedStats), 'EX', 300);
        
        return formattedStats;
    }

    async getTrends() {
        const cached = await redis.get('trends');
        if (cached) return JSON.parse(cached);

        const trends = await this.prisma.$transaction([
            // Hourly mint volume
            this.prisma.$queryRaw`
                SELECT date_trunc('hour', "createdAt") as hour,
                       count(*) as count
                FROM "Mint"
                WHERE "createdAt" > now() - interval '24 hours'
                GROUP BY hour
                ORDER BY hour DESC
            `,
            // Popular planet types
            this.prisma.nft.groupBy({
                by: ['planetType'],
                _count: true,
                orderBy: {
                    _count: 'desc'
                }
            }),
            // Rare features frequency
            this.prisma.nftFeature.groupBy({
                by: ['feature'],
                _count: true
            })
        ]);

        const formattedTrends = this.formatTrends(trends);
        await redis.set('trends', JSON.stringify(formattedTrends), 'EX', 300);

        return formattedTrends;
    }

    formatMintStats([chainStats, rarityStats, volume24h]) {
        return {
            totalMints: chainStats.reduce((acc, curr) => acc + curr._count, 0),
            chainDistribution: chainStats,
            rarityDistribution: rarityStats,
            volume24h
        };
    }

    formatTrends([hourlyVolume, planetTypes, features]) {
        return {
            hourlyTrend: hourlyVolume,
            popularTypes: planetTypes,
            featureFrequency: features
        };
    }
}