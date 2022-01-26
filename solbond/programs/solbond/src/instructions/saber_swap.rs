use anchor_lang::prelude::*;
use anchor_lang::solana_program::program_option::COption;
use anchor_spl::token::{self, Mint, Token, TokenAccount};
use crate::state::{BondPoolAccount, InvariantPoolAccount};
use stable_swap_anchor::*;
use stable_swap_anchor::{Swap, SwapToken, SwapUserContext, SwapOutput};
use anchor_lang::solana_program::system_program;
use stable_swap_anchor::StableSwap;

//use amm::{self, Tickmap, State, Pool, Tick, Position, PositionList};

#[derive(Accounts)]
// #[instruction(amount)]
#[instruction(
    _bump_bond_pool_account: u8,
    amount_in: u64,
    min_amount_out: u64,
)]
pub struct SaberSwapInstruction<'info> {

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
    //#[account(mut)]
    #[account(
        seeds=[bond_pool_currency_token_mint.key.as_ref(), b"bondPoolAccount1"],
        bump = _bump_bond_pool_account
    )]
    pub user_authority: AccountInfo<'info>,
    pub swap: AccountInfo<'info>,


    // input: SwapToken block
    #[account(
        mut,
        constraint = &user_input.owner == user_authority.key
    )]
    pub user_input: Box<Account<'info, TokenAccount>>,
    #[account(mut)]
    pub reserve_input: Box<Account<'info, TokenAccount>>,


    // output: SwapOutput block

    //      user_token: SwapToken  block
    #[account(
        mut,
        constraint = &user_output.owner == user_authority.key
    )]
    pub user_output: Box<Account<'info, TokenAccount>>,
    #[account(mut)]
    pub reserve_output: Box<Account<'info, TokenAccount>>,
    #[account(
        mut,
    )]
    pub fees_output: Box<Account<'info, TokenAccount>>,

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
    ctx: Context<SaberSwapInstruction>,
    _bump_bond_pool_account: u8,
    amount_in: u64,
    min_amount_out: u64,
) -> ProgramResult {
    msg!("swap with saber!");

    let user_context: SwapUserContext = SwapUserContext {
        token_program: ctx.accounts.token_program.to_account_info(),
        swap_authority: ctx.accounts.swap_authority.to_account_info(),
        user_authority: ctx.accounts.user_authority.to_account_info(),
        swap: ctx.accounts.swap.to_account_info(),
    };

    msg!("got user ctx!");


    let input: SwapToken = SwapToken {
        user: ctx.accounts.user_input.to_account_info(),
        reserve: ctx.accounts.reserve_input.to_account_info(),
    };

    msg!("got input ctx!");

    let output_swap_token: SwapToken = SwapToken {
        user: ctx.accounts.user_output.to_account_info(),
        reserve: ctx.accounts.reserve_output.to_account_info(),
    };

    msg!("got output swap cts!");


    let output: SwapOutput = SwapOutput {
        user_token: output_swap_token,
        fees: ctx.accounts.fees_output.to_account_info(),
    };

    msg!("got output ctx!");


    let swap_context: Swap = Swap {
       user: user_context,
       input: input,
       output: output,
    };
    let saber_swap_program = ctx.accounts.saber_swap_program.to_account_info();

    msg!("swap ctx!");

    stable_swap_anchor::swap(
        CpiContext::new_with_signer(
            saber_swap_program,
            swap_context,
            &[
                [
                    ctx.accounts.bond_pool_currency_token_mint.key.as_ref(), b"bondPoolAccount1",
                    &[_bump_bond_pool_account]
                ].as_ref()
            ]
        ),
        amount_in,
        min_amount_out,        
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