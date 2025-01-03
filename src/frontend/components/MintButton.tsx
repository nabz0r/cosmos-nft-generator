import { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, PublicKey, Keypair } from '@solana/web3.js';
import { Program, Provider } from '@project-serum/anchor';
import idl from '../lib/cosmos_nft.json';

const programID = new PublicKey(process.env.NEXT_PUBLIC_PROGRAM_ID);
const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC);

export const MintButton = () => {
  const wallet = useWallet();
  const [isMinting, setIsMinting] = useState(false);

  async function handleMint() {
    if (!wallet.connected || !wallet.publicKey) return;

    try {
      setIsMinting(true);

      const provider = new Provider(
        connection,
        wallet,
        Provider.defaultOptions()
      );

      const program = new Program(idl, programID, provider);

      // Create mint account
      const mintKeypair = Keypair.generate();
      const tokenAddress = mintKeypair.publicKey;

      // Mint NFT using our smart contract
      const tx = await program.rpc.mintNft(
        wallet.publicKey,
        "https://arweave.net/your-metadata-uri",
        "Cosmos Planet #1",
        {
          accounts: {
            cosmosnft: programID,
            mint: tokenAddress,
            payment: wallet.publicKey,
            tokenProgram: program.programId,
            systemProgram: SystemProgram.programId,
            rent: SYSVAR_RENT_PUBKEY,
          },
          signers: [mintKeypair],
        }
      );

      console.log("Mint transaction:", tx);
    } catch (error) {
      console.error("Error minting NFT:", error);
      alert("Failed to mint NFT. See console for details.");
    } finally {
      setIsMinting(false);
    }
  }

  return (
    <button
      onClick={handleMint}
      disabled={!wallet.connected || isMinting}
      className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:opacity-50"
    >
      {isMinting ? "Minting..." : "Mint NFT"}
    </button>
  );
}