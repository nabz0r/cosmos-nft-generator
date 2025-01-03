use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token};
use mpl_token_metadata::instruction as mpl_instruction;

declare_id!("your_program_id");

#[program]
pub mod cosmos_nft {
    use super::*;

    pub fn initialize(
        ctx: Context<Initialize>,
        name: String,
        symbol: String,
        uri: String,
    ) -> Result<()> {
        let cosmos_nft = &mut ctx.accounts.cosmos_nft;
        cosmos_nft.authority = ctx.accounts.authority.key();
        cosmos_nft.mint_price = 1_000_000_000; // 1 SOL
        cosmos_nft.total_supply = 0;
        cosmos_nft.max_supply = 10000;

        Ok(())
    }

    pub fn mint_nft(
        ctx: Context<MintNFT>,
        creator_key: Pubkey,
        uri: String,
        title: String,
    ) -> Result<()> {
        // Vérifier le paiement
        let cosmos_nft = &mut ctx.accounts.cosmos_nft;
        require!(
            ctx.accounts.payment.lamports() >= cosmos_nft.mint_price,
            CosmosNFTError::InsufficientPayment
        );

        // Vérifier la supply
        require!(
            cosmos_nft.total_supply < cosmos_nft.max_supply,
            CosmosNFTError::MaxSupplyReached
        );

        // Incrémenter la supply
        cosmos_nft.total_supply += 1;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(init, payer = authority, space = 8 + 32 + 8 + 8 + 8)]
    pub cosmos_nft: Account<'info, CosmosNFT>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct MintNFT<'info> {
    #[account(mut)]
    pub cosmos_nft: Account<'info, CosmosNFT>,
    #[account(mut)]
    pub mint: Signer<'info>,
    #[account(mut)]
    pub payment: Signer<'info>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[account]
pub struct CosmosNFT {
    pub authority: Pubkey,
    pub mint_price: u64,
    pub total_supply: u64,
    pub max_supply: u64,
}

#[error_code]
pub enum CosmosNFTError {
    #[msg("Insufficient payment for minting")]
    InsufficientPayment,
    #[msg("Maximum supply reached")]
    MaxSupplyReached,
}