import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { mintNFT } from '../lib/planetNFT';

export default function MintSection() {
    const { publicKey, connected } = useWallet();
    const [minting, setMinting] = useState(false);
    const [lastMintedNFT, setLastMintedNFT] = useState(null);

    const handleMint = async () => {
        if (!connected) return;
        try {
            setMinting(true);
            const mintResult = await mintNFT();
            setLastMintedNFT(mintResult);
        } catch (error) {
            console.error('Mint error:', error);
        } finally {
            setMinting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-purple-900 text-white py-12">
            <div className="max-w-6xl mx-auto px-4">
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold mb-4">Cosmos NFT Generator</h1>
                    <p className="text-xl text-gray-300">Mint your unique planetary NFT</p>
                </div>

                <div className="bg-gray-800 rounded-xl p-8 max-w-md mx-auto">
                    <div className="flex flex-col items-center space-y-6">
                        {!connected ? (
                            <div className="text-center">
                                <p className="mb-4">Connect your wallet to mint</p>
                                <WalletMultiButton className="btn-primary" />
                            </div>
                        ) : (
                            <div className="w-full text-center">
                                <p className="mb-4">Connected: {publicKey.toString().slice(0, 8)}...</p>
                                <button
                                    onClick={handleMint}
                                    disabled={minting}
                                    className="w-full py-3 px-6 bg-purple-600 hover:bg-purple-700 rounded-lg disabled:opacity-50 transition-colors"
                                >
                                    {minting ? 'Minting...' : 'Mint NFT (1 SOL)'}
                                </button>
                            </div>
                        )}
                    </div>

                    {lastMintedNFT && (
                        <div className="mt-8 p-4 bg-gray-700 rounded-lg">
                            <h3 className="text-lg font-semibold mb-2">Successfully Minted!</h3>
                            <p>Token ID: {lastMintedNFT.tokenId}</p>
                            <p>Type: {lastMintedNFT.type}</p>
                            <p>Rarity: {lastMintedNFT.rarity}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}