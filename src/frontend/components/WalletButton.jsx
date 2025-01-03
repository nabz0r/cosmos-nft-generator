import { useState } from 'react';
import { WalletConnector } from '../lib/walletConnectors';

export default function WalletButton() {
    const [connector] = useState(new WalletConnector());
    const [activeWallet, setActiveWallet] = useState(null);
    const [chainType, setChainType] = useState(null);

    const handleMetaMask = async () => {
        try {
            const provider = await connector.connectMetaMask();
            setActiveWallet('MetaMask');
            setChainType('EVM');
            return provider;
        } catch (error) {
            console.error('MetaMask connection failed:', error);
        }
    };

    const handlePhantom = async () => {
        try {
            const provider = await connector.connectPhantom();
            setActiveWallet('Phantom');
            setChainType('SOLANA');
            return provider;
        } catch (error) {
            console.error('Phantom connection failed:', error);
        }
    };

    return (
        <div className="flex flex-col items-center space-y-4">
            <div className="flex space-x-4">
                <button
                    onClick={handleMetaMask}
                    className={`px-6 py-2 rounded-lg ${activeWallet === 'MetaMask' 
                        ? 'bg-orange-500 text-white' 
                        : 'bg-gray-200 hover:bg-orange-100'}`}
                >
                    Connect MetaMask
                </button>
                <button
                    onClick={handlePhantom}
                    className={`px-6 py-2 rounded-lg ${activeWallet === 'Phantom' 
                        ? 'bg-purple-500 text-white' 
                        : 'bg-gray-200 hover:bg-purple-100'}`}
                >
                    Connect Phantom
                </button>
            </div>
            {activeWallet && (
                <p className="text-sm text-gray-600">
                    Connected with {activeWallet} on {chainType}
                </p>
            )}
        </div>
    );
}