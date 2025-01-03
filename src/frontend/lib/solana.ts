import { Connection, PublicKey, Transaction, sendAndConfirmTransaction } from '@solana/web3.js';
import { Program, Provider, web3 } from '@project-serum/anchor';
import { getOrCreateAssociatedTokenAccount } from '@solana/spl-token';

export class SolanaService {
    private connection: Connection;
    private program: Program;

    constructor(programId: string, network: string = 'devnet') {
        this.connection = new Connection(
            network === 'devnet' ? web3.clusterApiUrl('devnet') : network
        );
    }

    async mintNFT(wallet: any) {
        try {
            const provider = new Provider(
                this.connection,
                wallet,
                Provider.defaultOptions()
            );

            const transaction = new Transaction();
            // Ajouter les instructions de mint
            const signature = await sendAndConfirmTransaction(
                this.connection,
                transaction,
                [wallet.payer]
            );

            return signature;
        } catch (error) {
            console.error('Error minting NFT:', error);
            throw error;
        }
    }

    async getNFTMetadata(mintAddress: string) {
        const mint = new PublicKey(mintAddress);
        const tokenMetadata = await this.program.account.metadata.fetch(mint);
        return tokenMetadata;
    }
}
