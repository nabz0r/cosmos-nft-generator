import { useState } from 'react';

export default function NetworkSelector({ onSelect }) {
    const [selectedNetwork, setSelectedNetwork] = useState(null);

    const networks = [
        { id: 'ethereum', name: 'Ethereum', type: 'EVM', icon: '🌐' },
        { id: 'polygon', name: 'Polygon', type: 'EVM', icon: '⬡' },
        { id: 'solana', name: 'Solana', type: 'SOLANA', icon: '☀️' }
    ];

    const handleNetworkSelect = (network) => {
        setSelectedNetwork(network.id);
        onSelect(network);
    };

    return (
        <div className="p-4 bg-white rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Select Network</h3>
            <div className="grid grid-cols-3 gap-4">
                {networks.map(network => (
                    <button
                        key={network.id}
                        onClick={() => handleNetworkSelect(network)}
                        className={`p-4 rounded-lg border transition-all ${selectedNetwork === network.id 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-blue-200'}`}
                    >
                        <div className="text-2xl mb-2">{network.icon}</div>
                        <div className="font-medium">{network.name}</div>
                    </button>
                ))}
            </div>
        </div>
    );
}