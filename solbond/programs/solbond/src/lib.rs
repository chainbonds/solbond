use anchor_lang::prelude::*;
use anchor_lang::solana_program::program_option::COption;
use anchor_spl::token::{self, Mint, TokenAccount, Transfer, Token, MintTo, Burn};
use spl_token::instruction::AuthorityType;

const DECIMALS:u8 = 6;

declare_id!("GGoMTmrJtapovtdjZLv1hdbgZeF4pj8ANWxRxewnZ35g");

#[program]
pub mod solbond {

    use super::*;

    const BOND_PDA_SEED: &[u8] = b"bond";

    pub fn initialize(ctx: Context<InitializeBond>,
                      _time_frame: i64,
                      _initializer_amount: u64,
                      _bump: u8,
                      _user_name: String) -> ProgramResult {

        msg!("INITIALIZE BOND");

        // turn name into bytes to write to BondAccount
        //let name_bytes = _user_name.as_bytes();
        //let mut name_data = [b' '; 10];
        //name_data[..name_bytes.len()].copy_from_slice(name_bytes);

        let bond_account = &mut ctx.accounts.bond_account;

        //bond_account.user_name = name_data;
        bond_account.bump = _bump;
        bond_account.initializer_amount = _initializer_amount;
        bond_account.bond_time = _time_frame;


        // bond_account.initializer is the one who initializes the program
        // and has to pay for it 
        bond_account.initializer_key = *ctx.accounts.initializer.key;

        bond_account.initializer_token_account = *ctx.accounts.initializer_token_account.to_account_info().key;
        bond_account.initializer_solana_account = *ctx.accounts.initializer_solana_account.to_account_info().key;
        bond_account.solana_holdings_account = *ctx.accounts.solana_holdings_account.to_account_info().key;
        // bond_account.redeemable_mint = *ctx.accounts.redeemable_mint.to_account_info().key;
                
        //let (pda, _bump_seed) = Pubkey::find_program_address(&[BOND_PDA_SEED], ctx.program_id);

        //token::set_authority(ctx.accounts.into(), AuthorityType::AccountOwner, Some(pda))?;
        
        Ok(())
    }


    pub fn buy_bond(ctx: Context<BuyBond>) -> ProgramResult {
        msg!("BUY BOND");
        let bond_account = &mut ctx.accounts.bond_account;

        // I think this transfers the solana that the user wants to deposit 
        // to an address belonging to the bond that holds the solana
        let cpi_accounts = Transfer {
            from: ctx.accounts.initializer_solana_account.to_account_info(),
            to: ctx.accounts.bond_solana_account.to_account_info(),
            authority: ctx.accounts.initializer.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        let amount = bond_account.initializer_amount;
        let bump = bond_account.bump;
        token::transfer(cpi_ctx, amount)?;
        // Now we give the user some minted tokens so they don't cry
        let seeds = &[
            BOND_PDA_SEED,
            &[bump],
        ];
        
        let signer = &[&seeds[..]];
        let cpi_accounts_mint = MintTo {
                    mint: ctx.accounts.redeemable_mint.to_account_info(),
                    to: ctx.accounts.initializer_token_account.to_account_info(),
                    authority: ctx.accounts.initializer.to_account_info(),
        };
        let cpi_program_mint = ctx.accounts.token_program.to_account_info();
        let cpi_ctx_mint = CpiContext::new_with_signer(cpi_program_mint, 
                                                                          cpi_accounts_mint, 
                                                                       signer);
        token::mint_to(cpi_ctx_mint, amount)?;

        

        Ok(())
    }

    pub fn redeem_bond(ctx: Context<RedeemBond>, amount: u64) -> ProgramResult {

        let bond_account = &mut ctx.accounts.bond_account;
        let cpi_accounts = Burn {
            mint: ctx.accounts.redeemable_mint.to_account_info(),
            to: ctx.accounts.initializer_token_account.to_account_info(),
            authority: ctx.accounts.initializer.to_account_info(),
        };

        // put checks for amount in later
        // update amounts later
        // lol this is just the start
        let bump = bond_account.bump;
        let seeds = &[
            BOND_PDA_SEED,
            &[bump],
        ];
        
        let signer = &[&seeds[..]];
        // burn the tokens
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
        token::burn(cpi_ctx, amount)?;

        // send solana back to user

        let cpi_accounts = Transfer {
            from: ctx.accounts.bond_solana_account.to_account_info(),
            to: ctx.accounts.initializer_solana_account.to_account_info(),
            authority: ctx.accounts.initializer.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);

        token::transfer(cpi_ctx, amount)?;

        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(_initializer_amount: u64, _redeemable_bump: u8, _user_name: String)]
pub struct InitializeBond<'info> {

    // initializer: user calling the program to request a bond
    #[account(signer)]
    pub initializer: AccountInfo<'info>,
    // initializer_token_account: the account holding the tokens the user will receive in exchange for the deposit
    // has to be zero at initializiation
    // what if multiple bonds? (multiple accounts, should be handled automatically? idk..)
    #[account(
        mut,
        constraint = initializer_token_account.amount == 0,
    )]
    pub initializer_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
    )]
    pub solana_holdings_account: Account<'info, TokenAccount>,

    // initializer_solana_account: the account holding the solana which the user exchanges for a bond
    // has to be equal to the initializer_amount
    #[account(
        mut,
        constraint = initializer_solana_account.amount == _initializer_amount,
    )]
    pub initializer_solana_account: Account<'info, TokenAccount>,

    // bond_account: used to save the bond I guess
    // the initializer will pay for the fees of calling this program
    #[account(
        init,
        payer = initializer,
        space = 8 + BondAccount::LEN,
     )]
    pub bond_account: Account<'info, BondAccount>,

    pub rent: Sysvar<'info, Rent>,
    pub clock: Sysvar<'info, Clock>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    
    
}


#[derive(Accounts)]
pub struct BuyBond<'info> {
    #[account(signer)]
    pub initializer: AccountInfo<'info>,

    #[account(mut)]
    pub initializer_solana_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub initializer_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub bond_solana_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub bond_token_account: Account<'info, TokenAccount>,

    #[account(mut, 
              constraint = bond_account.initializer_solana_account == *initializer_solana_account.to_account_info().key,
              constraint = bond_account.initializer_token_account == *bond_token_account.to_account_info().key,
              constraint = bond_account.initializer_key == *initializer.to_account_info().key,
              close = initializer
              )]
    pub bond_account: ProgramAccount<'info, BondAccount>,

    #[account(
        seeds = ["smt_jfh".as_bytes(),b"redeemable_mint".as_ref()],
        bump = bond_account.bump,
    )]
    pub redeemable_mint: Account<'info, Mint>,
    pub rent: Sysvar<'info, Rent>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,

}

#[derive(Accounts)]
pub struct RedeemBond<'info> {
    #[account(signer)]
    pub initializer: AccountInfo<'info>,

    #[account(mut)]
    pub initializer_solana_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub initializer_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub bond_solana_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub bond_token_account: Account<'info, TokenAccount>,

    #[account(mut, 
              constraint = bond_account.initializer_solana_account == *initializer_solana_account.to_account_info().key,
              constraint = bond_account.initializer_token_account == *bond_token_account.to_account_info().key,
              constraint = bond_account.initializer_key == *initializer.to_account_info().key,
              close = initializer
              )]
    pub bond_account: ProgramAccount<'info, BondAccount>,

    #[account(
        seeds = ["smt_jfh".as_bytes(),b"redeemable_mint".as_ref()],
        bump = bond_account.bump,

    )]
    pub redeemable_mint: Account<'info, Mint>,

    pub rent: Sysvar<'info, Rent>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,

}

#[account]
pub struct BondAccount {
    pub initializer_key: Pubkey,
    pub initializer_token_account: Pubkey,
    pub initializer_solana_account: Pubkey,
    pub solana_holdings_account: Pubkey,
    // pub redeemable_mint: Pubkey,
    pub initializer_amount: u64,
    pub bond_time: i64,
    pub bump: u8,


}


impl BondAccount {
    pub const LEN: usize =    32   // initializer_key
                            + 32   // initializer_token_account
                            + 32   // initializer_solana_account
                            + 32   // solana_holdings_account
                            // + 32   // redeemable_mint
                            + 64   // amount
                            + 64   // time_frame
                            + 8;   // bump 
}
