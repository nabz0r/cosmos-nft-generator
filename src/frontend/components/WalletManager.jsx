import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { ethers } from 'ethers';

export default function WalletManager({ selectedChain, onWalletConnect }) {
    const solanaWallet = useWallet();
    const [evmAddress, setEvmAddress] = useState(null);
    const [isConnecting, setIsConnecting] = useState(false);

    useEffect(() => {
        // Reset state when chain changes
        setEvmAddress(null);
    }, [selectedChain]);

    const connectMetaMask = async () => {
        if (!window.ethereum) {
            alert('Please install MetaMask!');
            return;
        }

        setIsConnecting(true);
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const accounts = await provider.send('eth_requestAccounts', []);
            setEvmAddress(accounts[0]);
            onWalletConnect({
                address: accounts[0],
                type: 'evm',
                provider
            });
        } catch (error) {
            console.error('Error connecting to MetaMask:', error);
        } finally {
            setIsConnecting(false);
        }
    };

    useEffect(() => {
        if (solanaWallet.connected) {
            onWalletConnect({
                address: solanaWallet.publicKey.toString(),
                type: 'solana',
                wallet: solanaWallet
            });
        }
    }, [solanaWallet.connected]);

    const getWalletButton = () => {
        if (!selectedChain) return null;

        if (selectedChain.id === 'solana') {
            return <WalletMultiButton className="!bg-green-500 hover:!bg-green-600" />;
        }

        return (
            <button
                onClick={connectMetaMask}
                disabled={isConnecting}
                className={`
                    px-6 py-2 rounded-lg font-semibold text-white
                    ${selectedChain.id === 'ethereum' ? 'bg-blue-500 hover:bg-blue-600' : ''}
                    ${selectedChain.id === 'polygon' ? 'bg-purple-500 hover:bg-purple-600' : ''}
                    disabled:opacity-50 disabled:cursor-not-allowed
                `}
            >
                {isConnecting ? 'Connecting...' : 'Connect MetaMask'}
            </button>
        );
    };

    return (
        <div className="mt-6 text-center">
            {getWalletButton()}
            {(evmAddress || solanaWallet.connected) && (
                <div className="mt-4 text-gray-300 text-sm">
                    Connected: 
                    {evmAddress 
                        ? `${evmAddress.slice(0, 6)}...${evmAddress.slice(-4)}` 
                        : `${solanaWallet.publicKey.toString().slice(0, 6)}...`}
                </div>
            )}
        </div>
    );
}