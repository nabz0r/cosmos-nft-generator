import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { fetchUserNFTs } from '../lib/planetNFT';

export default function Gallery() {
    const { publicKey } = useWallet();
    const [nfts, setNfts] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (publicKey) {
            loadNFTs();
        }
    }, [publicKey]);

    const loadNFTs = async () => {
        try {
            setLoading(true);
            const userNFTs = await fetchUserNFTs(publicKey);
            setNfts(userNFTs);
        } catch (error) {
            console.error('Error loading NFTs:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="py-12 px-4">
            <h2 className="text-3xl font-bold mb-8 text-center">Your Planets</h2>
            
            {loading ? (
                <div className="text-center">Loading your cosmic collection...</div>
            ) : nfts.length === 0 ? (
                <div className="text-center text-gray-500">
                    No planets discovered yet. Start minting!
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {nfts.map((nft) => (
                        <div key={nft.tokenId} className="bg-gray-800 rounded-xl p-4">
                            <img 
                                src={nft.image} 
                                alt={nft.name}
                                className="w-full h-48 object-cover rounded-lg mb-4" 
                            />
                            <h3 className="text-xl font-semibold mb-2">{nft.name}</h3>
                            <div className="space-y-1 text-sm text-gray-300">
                                <p>Type: {nft.attributes.type}</p>
                                <p>Rarity: {nft.attributes.rarity}</p>
                                {nft.attributes.specialTrait && (
                                    <p>Special: {nft.attributes.specialTrait}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}