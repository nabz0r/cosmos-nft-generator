import { Connection, SystemProgram, Transaction } from '@solana/web3.js';
import { Program, Provider } from '@project-serum/anchor';
import { getOrCreateAssociatedTokenAccount } from '@solana/spl-token';

const PROGRAM_ID = process.env.NEXT_PUBLIC_PROGRAM_ID;
const CONNECTION = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC);

export async function mintNFT() {
    try {
        const provider = new Provider(CONNECTION, window.solana, {});
        const program = new Program(idl, PROGRAM_ID, provider);

        const mintKeypair = Keypair.generate();
        const tokenAddress = mintKeypair.publicKey;

        const tx = await program.rpc.mintNft(
            provider.wallet.publicKey,
            {
                accounts: {
                    mint: tokenAddress,
                    tokenProgram: TOKEN_PROGRAM_ID,
                    systemProgram: SystemProgram.programId,
                },
                signers: [mintKeypair]
            }
        );

        return {
            tokenId: tokenAddress.toString(),
            signature: tx
        };
    } catch (error) {
        console.error('Error in mintNFT:', error);
        throw error;
    }
}

export async function fetchUserNFTs(userPublicKey) {
    try {
        const provider = new Provider(CONNECTION, window.solana, {});
        const program = new Program(idl, PROGRAM_ID, provider);

        const nfts = await program.account.planetNft.all([
            {
                memcmp: {
                    offset: 8,
                    bytes: userPublicKey.toBase58()
                }
            }
        ]);

        return nfts.map(nft => ({
            tokenId: nft.publicKey.toString(),
            name: nft.account.name,
            image: nft.account.uri,
            attributes: {
                type: nft.account.planetType,
                rarity: nft.account.rarityLevel,
                specialTrait: nft.account.specialTrait
            }
        }));
    } catch (error) {
        console.error('Error fetching NFTs:', error);
        throw error;
    }
}