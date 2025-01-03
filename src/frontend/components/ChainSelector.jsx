import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function ChainSelector({ onChainSelect, selectedChain }) {
    const chains = [
        {
            id: 'ethereum',
            name: 'Ethereum',
            icon: '/icons/eth.svg',
            price: '0.1 ETH',
            color: 'bg-blue-500',
            network: '0x1'
        },
        {
            id: 'polygon',
            name: 'Polygon',
            icon: '/icons/polygon.svg',
            price: '100 MATIC',
            color: 'bg-purple-500',
            network: '0x89'
        },
        {
            id: 'solana',
            name: 'Solana',
            icon: '/icons/solana.svg',
            price: '1 SOL',
            color: 'bg-green-500',
            network: 'mainnet-beta'
        }
    ];

    const handleChainSelect = async (chain) => {
        try {
            // Si MetaMask est sélectionné pour ETH/Polygon
            if (chain.id !== 'solana' && window.ethereum) {
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: chain.network }],
                });
            }
            onChainSelect(chain);
        } catch (error) {
            console.error('Error switching chain:', error);
        }
    };

    return (
        <div className="p-6 bg-gray-800 rounded-xl shadow-xl">
            <h2 className="text-2xl font-bold text-white mb-6">Select Network</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {chains.map((chain) => (
                    <button
                        key={chain.id}
                        onClick={() => handleChainSelect(chain)}
                        className={`
                            p-4 rounded-lg border-2 transition-all duration-200
                            ${selectedChain?.id === chain.id 
                                ? `${chain.color} border-white` 
                                : 'border-gray-600 hover:border-gray-400'}
                            flex flex-col items-center space-y-3
                        `}
                    >
                        <div className="w-12 h-12 relative">
                            <Image 
                                src={chain.icon} 
                                alt={chain.name}
                                layout="fill"
                                className="rounded-full"
                            />
                        </div>
                        <div className="text-white font-semibold">{chain.name}</div>
                        <div className="text-gray-300 text-sm">{chain.price}</div>
                    </button>
                ))}
            </div>
        </div>
    );
}