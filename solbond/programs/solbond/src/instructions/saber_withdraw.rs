use anchor_lang::prelude::*;
use anchor_lang::solana_program::program_option::COption;
use anchor_spl::token::{self, Mint, Token, TokenAccount};
use crate::state::{BondPoolAccount, InvariantPoolAccount};
use stable_swap_anchor::*;
use stable_swap_anchor::{Deposit, SwapToken, SwapUserContext, SwapOutput};
use anchor_lang::solana_program::system_program;
use stable_swap_anchor::StableSwap;

//use amm::{self, Tickmap, State, Pool, Tick, Position, PositionList};

#[derive(Accounts)]
// #[instruction(amount)]
#[instruction(
    _bump_bond_pool_account: u8,
    token_a_amount: u64,
    token_b_amount: u64,
    min_mint_amount: u64,
)]
pub struct SaberWithdrawInstruction<'info> {

    //pub user: AccountInfo<'info>,
    /// The "A" token of the swap.
    //pub input_a: AccountInfo<'info>,
    /// The "B" token of the swap.
    //pub input_b: AccountInfo<'info>,
    /// The pool mint of the swap.
    
    // user: SwapUserContext block 
    pub token_program: AccountInfo<'info>,
    #[account(mut)]
    pub swap_authority: AccountInfo<'info>,
    #[account(
        seeds=[bond_pool_currency_token_mint.key.as_ref(), b"bondPoolAccount1"],
        bump = _bump_bond_pool_account
    )]    pub user_authority: AccountInfo<'info>,
    pub swap: AccountInfo<'info>,

    #[account(
        mut,
        constraint = &input_lp.owner == user_authority.key,
    )]
    pub input_lp:  Box<Account<'info, TokenAccount>>,
    #[account(mut)]
    pub pool_mint: AccountInfo<'info>,

    // output_a: SwapOutput block

    //      user_token: SwapToken  block
    #[account(
        mut,
        constraint = &user_a.owner == user_authority.key,
    )]
    pub user_a: Box<Account<'info, TokenAccount>>,
    #[account(mut)]
    pub reserve_a: AccountInfo<'info>,//Box<Account<'info, TokenAccount>>,
    #[account(mut)]
    pub fees_a: Box<Account<'info, TokenAccount>>,


    // output_b: SwapOutput block

    //      user_token: SwapToken  block
    #[account(
        mut,
        constraint = &user_b.owner == user_authority.key,
    )]
    pub user_b: Box<Account<'info, TokenAccount>>,
    #[account(mut)]
    pub reserve_b: Box<Account<'info, TokenAccount>>,
    #[account(mut)]
    pub fees_b: Box<Account<'info, TokenAccount>>,


    #[account(signer)]
    pub initializer: AccountInfo<'info>,
    #[account(mut)]
    pub bond_pool_currency_token_mint: AccountInfo<'info>,


    
    pub saber_swap_program: Program<'info, StableSwap>,
    pub system_program: AccountInfo<'info>,
    


}

/*
    Based on the portfolio and weights, calculate how much to re-distribute into each pool
*/
// // TODO: Replace everything by decimals?
// pub fn calculate_amount_per_pool(x: u64) -> [u64; 5] {
//
//     let default_pay_in_amount: u64 = x / 5;
//
//     return [default_pay_in_amount, default_pay_in_amount, default_pay_in_amount, default_pay_in_amount, default_pay_in_amount];
// }

/**
    Deposit reserve to pools.
    All the Solana tokens that are within the reserve,
    are now put into
    Frontend should be respondible for creating all the required token accounts!
 */
pub fn handler(
    ctx: Context<SaberWithdrawInstruction>,
    _bump_bond_pool_account: u8,
    min_mint_amount: u64,
    token_a_amount: u64,
    token_b_amount: u64,
) -> ProgramResult {
    msg!("Depositing reserve to pools!");

    let user_context: SwapUserContext = SwapUserContext {
        token_program: ctx.accounts.token_program.to_account_info(),
        swap_authority: ctx.accounts.swap_authority.to_account_info(),
        user_authority: ctx.accounts.user_authority.to_account_info(),
        swap: ctx.accounts.swap.to_account_info(),
    };

    let input_a: SwapToken = SwapToken {
        user: ctx.accounts.user_a.to_account_info(),
        reserve: ctx.accounts.reserve_a.to_account_info(),
    };

    let input_b: SwapToken = SwapToken {
        user: ctx.accounts.user_b.to_account_info(),
        reserve: ctx.accounts.reserve_b.to_account_info(),
    };

    let output_a: SwapOutput = SwapOutput {
        user_token: input_a,
        fees: ctx.accounts.fees_a.to_account_info(),
    };

    let output_b: SwapOutput = SwapOutput {
        user_token: input_b,
        fees: ctx.accounts.fees_b.to_account_info(),
    };

    let withdraw_context: Withdraw = Withdraw {
       user: user_context,
       input_lp: ctx.accounts.input_lp.to_account_info(),
       pool_mint: ctx.accounts.pool_mint.to_account_info(),
       output_a: output_a,
       output_b: output_b,
    };
    let saber_swap_program = ctx.accounts.saber_swap_program.to_account_info();


    stable_swap_anchor::withdraw(
        CpiContext::new_with_signer(
            saber_swap_program,
            withdraw_context,
            &[
                [
                    ctx.accounts.bond_pool_currency_token_mint.key.as_ref(), b"bondPoolAccount1",
                    &[_bump_bond_pool_account]
                ].as_ref()
            ]
        ),
        min_mint_amount,
        token_a_amount,
        token_b_amount,
        
    )?;


    // // Calculate how much currency is in the bond
    // let available_currency: u64 = ctx.accounts.bond_pool_currency_account.amount;
    //
    // // For now, assume we provide the same amount of liquidity to all pools
    // // So we don't have to calculate the weightings
    // let fraction_per_pool = calculate_amount_per_pool(available_currency);
    //
    // // Make swaps, and deposit this much to the pool
    // for i in 0..fraction_per_pool.len() {
    //
    // }

    Ok(())
}