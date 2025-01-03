import { useState } from 'react';
import { ethers } from 'ethers';
import contractABI from '../contracts/PlanetNFT.json';

export default function Home() {
  const [minting, setMinting] = useState(false);
  const contractAddress = 'YOUR_CONTRACT_ADDRESS';

  async function mintNFT() {
    try {
      setMinting(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);

      const mintPrice = await contract.MINT_PRICE();
      const tx = await contract.mint({ value: mintPrice });
      await tx.wait();

      alert('NFT minted successfully!');
    } catch (error) {
      console.error('Error minting NFT:', error);
      alert('Error minting NFT');
    } finally {
      setMinting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-8">Cosmos NFT Generator</h1>
      
      <div className="max-w-sm p-6 bg-gray-800 rounded-lg shadow-xl">
        <h2 className="text-2xl font-semibold mb-4">Mint Your Planet</h2>
        <p className="mb-4">Create your unique planetary NFT in the cosmos.</p>
        
        <button
          onClick={mintNFT}
          disabled={minting}
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
          {minting ? 'Minting...' : 'Mint NFT'}
        </button>
      </div>
    </div>
  );
}