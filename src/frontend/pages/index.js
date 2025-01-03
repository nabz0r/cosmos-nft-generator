import { WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import MintSection from '../components/MintSection';
import Gallery from '../components/Gallery';

require('@solana/wallet-adapter-react-ui/styles.css');

const wallets = [new PhantomWalletAdapter()];

export default function Home() {
    return (
        <WalletProvider wallets={wallets} autoConnect>
            <WalletModalProvider>
                <div className="min-h-screen bg-gray-900 text-white">
                    <nav className="bg-gray-800 p-4">
                        <div className="max-w-6xl mx-auto flex justify-between items-center">
                            <h1 className="text-2xl font-bold">Cosmos NFT</h1>
                            <WalletMultiButton />
                        </div>
                    </nav>

                    <main>
                        <MintSection />
                        <Gallery />
                    </main>
                </div>
            </WalletModalProvider>
        </WalletProvider>
    );
}