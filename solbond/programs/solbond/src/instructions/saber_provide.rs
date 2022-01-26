use anchor_lang::prelude::*;
use anchor_lang::solana_program::program_option::COption;
use anchor_spl::token::{self, Mint, Token, TokenAccount};
use crate::state::{BondPoolAccount, InvariantPoolAccount};
use stable_swap_anchor::*;
use stable_swap_anchor::{Deposit, SwapToken, SwapUserContext};
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
pub struct SaberLiquidityInstruction<'info> {

    //pub user: AccountInfo<'info>,
    /// The "A" token of the swap.
    //pub input_a: AccountInfo<'info>,
    /// The "B" token of the swap.
    //pub input_b: AccountInfo<'info>,
    /// The pool mint of the swap.
    /// 
    /// 
    #[account(signer)]
    pub initializer: AccountInfo<'info>,

    #[account(mut)]
    pub bond_pool_currency_token_mint: AccountInfo<'info>,

    #[account(mut)]
    pub pool_mint: AccountInfo<'info>,
    /// The output account for LP tokens.
    /// 
    #[account(mut)]
    pub output_lp: AccountInfo<'info>,

    // user block
    //#[account(mut)]
    pub token_program: AccountInfo<'info>,
    /// The authority of the swap.
    #[account(mut)]
    pub swap_authority: AccountInfo<'info>,
    /// The authority of the user.
    //#[account(mut, signer)]
    #[account(
        seeds=[bond_pool_currency_token_mint.key.as_ref(), b"bondPoolAccount1"],
        bump = _bump_bond_pool_account
    )]
    pub user_authority: AccountInfo<'info>,
    /// The swap.
    //#[account(mut)]
    pub swap: AccountInfo<'info>,
    /// The clock
    //#[account(mut)]
    pub clock: AccountInfo<'info>,

    // input block
    #[account(
        mut,
        constraint = &user_a.owner == user_authority.key,
    )]
    pub user_a: Box<Account<'info,TokenAccount>>,
    /// The token account for the pool's reserves of this token.
    #[account(mut)]
    pub reserve_a: Box<Account<'info,TokenAccount>>,
    #[account(
        mut,
        constraint = &user_b.owner == user_authority.key
    )]
    pub user_b: Box<Account<'info,TokenAccount>>,
    /// The token account for the pool's reserves of this token.
    #[account(mut)]
    pub reserve_b: Box<Account<'info,TokenAccount>>,


    
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
    ctx: Context<SaberLiquidityInstruction>,
    _bump_bond_pool_account: u8,
    token_a_amount: u64,
    token_b_amount: u64,
    min_mint_amount: u64,
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

    let deposit_context: Deposit = Deposit {
       user: user_context,
       input_a: input_a,
       input_b: input_b,
       pool_mint: ctx.accounts.pool_mint.to_account_info(),
       output_lp: ctx.accounts.output_lp.to_account_info(),
    };
    let saber_swap_program = ctx.accounts.saber_swap_program.to_account_info();


    stable_swap_anchor::deposit(
        CpiContext::new_with_signer(
            saber_swap_program,
            deposit_context,
            &[
                [
                    ctx.accounts.bond_pool_currency_token_mint.key.as_ref(), b"bondPoolAccount1",
                    &[_bump_bond_pool_account]
                ].as_ref()
            ]
        ),
        token_a_amount,
        token_b_amount,
        min_mint_amount,
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