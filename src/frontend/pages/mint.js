import { useState } from 'react';
import ChainSelector from '../components/ChainSelector';
import WalletManager from '../components/WalletManager';
import MintSection from '../components/MintSection';

export default function MintPage() {
    const [selectedChain, setSelectedChain] = useState(null);
    const [walletInfo, setWalletInfo] = useState(null);

    const handleChainSelect = (chain) => {
        setSelectedChain(chain);
        setWalletInfo(null); // Reset wallet when chain changes
    };

    const handleWalletConnect = (info) => {
        setWalletInfo(info);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black py-12 px-4">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-white mb-2">
                        Cosmos NFT Generator
                    </h1>
                    <p className="text-gray-400">
                        Mint your unique planetary NFT on your preferred network
                    </p>
                </div>

                <ChainSelector 
                    onChainSelect={handleChainSelect}
                    selectedChain={selectedChain}
                />

                <WalletManager 
                    selectedChain={selectedChain}
                    onWalletConnect={handleWalletConnect}
                />

                {walletInfo && (
                    <MintSection 
                        chainInfo={selectedChain}
                        walletInfo={walletInfo}
                    />
                )}
            </div>
        </div>
    );
}