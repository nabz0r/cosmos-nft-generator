import { ethers } from 'ethers';
import { Connection } from '@solana/web3.js';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';

export class WalletConnector {
    constructor() {
        this.evmProvider = null;
        this.solanaProvider = null;
    }

    async connectMetaMask() {
        if (typeof window.ethereum !== 'undefined') {
            try {
                await window.ethereum.request({ method: 'eth_requestAccounts' });
                this.evmProvider = new ethers.providers.Web3Provider(window.ethereum);
                return this.evmProvider;
            } catch (error) {
                console.error('MetaMask connection failed:', error);
                throw error;
            }
        } else {
            throw new Error('MetaMask not installed');
        }
    }

    async connectPhantom() {
        try {
            const wallet = new PhantomWalletAdapter();
            await wallet.connect();
            this.solanaProvider = wallet;
            return wallet;
        } catch (error) {
            console.error('Phantom connection failed:', error);
            throw error;
        }
    }

    async mint(chainType) {
        if (chainType === 'EVM') {
            return this.mintEVM();
        } else if (chainType === 'SOLANA') {
            return this.mintSolana();
        }
        throw new Error('Invalid chain type');
    }

    async mintEVM() {
        if (!this.evmProvider) throw new Error('MetaMask not connected');
        const signer = this.evmProvider.getSigner();
        const contract = new ethers.Contract(EVM_CONTRACT_ADDRESS, EVM_ABI, signer);
        const tx = await contract.mint({ value: ethers.utils.parseEther('0.1') });
        return tx.wait();
    }

    async mintSolana() {
        if (!this.solanaProvider) throw new Error('Phantom not connected');
        // Existing Solana mint logic
    }
}