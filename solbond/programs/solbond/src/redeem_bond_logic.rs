use solana_program::program::{invoke, invoke_signed};
use anchor_lang::prelude::*;
use anchor_lang::solana_program::program_option::COption;
use anchor_lang::solana_program::native_token::{lamports_to_sol, sol_to_lamports};
use anchor_spl::token::{self, Burn, Mint, TokenAccount, Token, MintTo};

use crate::{
    ErrorCode,
    BondInstanceAccount,
    BondPoolAccount,
    RedeemBondInstance
};

/*
    TODO 1:
        Move some of the profits in both cases to the generator / initiator of the bond_pool_account (owner)
 */

/**
 * Calculate how many of the profits to pay out
 */
pub fn redeem_bond_instance_profits_only(ctx: Context<RedeemBondInstance>) -> ProgramResult {

    let bond_instance_account = &mut ctx.accounts.bond_instance_account;

    if (ctx.accounts.clock.unix_timestamp as u64) < bond_instance_account.end_time {
        return Err(ErrorCode::TimeFrameNotPassed.into());
    }
    // Maybe: Check if amount is less than what was paid in so far
    // I don't think this is possible just with the key.
    // It might make more sense to write another token into this
    let full_amount_in_redeemables = ctx.accounts.bond_instance_token_account.amount;

    /*
    * Step 1: Calculate market rate
    */
    // If the user takes out anything, the timeframe then is also updated.
    let owned_solana_amount_in_lamports: u64 = sol_to_lamports(
        lamports_to_sol(ctx.accounts.bond_pool_solana_account.lamports()) /
            lamports_to_sol(ctx.accounts.bond_pool_redeemable_mint.supply) *
            // TODO: Be careful here, make sure the redeemables' decimals are maybe recorded somewhere, right now we can do this because our token has 9 decimals
            lamports_to_sol(full_amount_in_redeemables)
    );

    // Gotta make sure that the payout amount is higher than the initially paid-in amount.
    if owned_solana_amount_in_lamports < bond_instance_account.initial_payin_amount_in_lamports {
        msg!("This error should not happen: {} {}", owned_solana_amount_in_lamports, bond_instance_account.initial_payin_amount_in_lamports);
        return Err(ErrorCode::PayoutError.into());
    };
    // Calculate how much to actually pay out
    let payout_amount_in_lamports: u64 = owned_solana_amount_in_lamports - bond_instance_account.initial_payin_amount_in_lamports;

    // Update how many redeemables to actually keep
    // And how many redeemables to get rid of

    // Calculate how much redeemables to keep
    // TODO: Check if division by zero, and prevent if it is so
    let keep_redeemable_amount = sol_to_lamports(lamports_to_sol(bond_instance_account.initial_payin_amount_in_lamports) / lamports_to_sol(ctx.accounts.bond_pool_solana_account.lamports()));
    // TODO: Check for nan and infinity
    let burn_redeemable_amount = full_amount_in_redeemables - keep_redeemable_amount;

    // Or simply just do an assert
    if (keep_redeemable_amount + burn_redeemable_amount) != owned_solana_amount_in_lamports {
        msg!("Calculation doesnt add up! {} {} {}", keep_redeemable_amount, burn_redeemable_amount, owned_solana_amount_in_lamports);
        return Err(ErrorCode::Calculation.into());
    }

    // TODO: Assert that this is the same as when we calculate
    // Perhaps do this test only on the front-end

    // let bond_instance_account = &mut ctx.accounts.bond_instance_account;
    if ctx.accounts.purchaser_token_account.to_account_info().lamports() > owned_solana_amount_in_lamports {
        return Err(ErrorCode::RedeemCapacity.into());
    }
    if ctx.accounts.purchaser_token_account.to_account_info().lamports() > burn_redeemable_amount {
        return Err(ErrorCode::RedeemCapacity.into());
    }

    /*
     * Step 2: Burn Bond Token
     */
    let cpi_accounts = Burn {
        mint: ctx.accounts.bond_pool_redeemable_mint.to_account_info(),
        to: ctx.accounts.bond_instance_token_account.to_account_info(),
        authority: ctx.accounts.bond_instance_account.to_account_info(),
    };
    let cpi_program = ctx.accounts.token_program.to_account_info();
    token::burn(
        CpiContext::new_with_signer(
            cpi_program,
            cpi_accounts,
            &[
                [
                    ctx.accounts.bond_instance_account.purchaser.key().as_ref(), b"bondInstanceAccount",
                    &[ctx.accounts.bond_instance_account.bump_bond_instance_account]
                ].as_ref(),
                [
                    ctx.accounts.bond_pool_account.generator.key().as_ref(), b"bondPoolAccount",
                    &[ctx.accounts.bond_pool_account.bump_bond_pool_account]
                ].as_ref()
            ]
        ), burn_redeemable_amount)?;

    /*
     * Step 3: Pay out Solana
     *     Can later on replace this with paying out redeemables,
     *      and the user can call another function to replace the redeemables with the bond
     */
    let res = anchor_lang::solana_program::system_instruction::transfer(
        ctx.accounts.bond_pool_solana_account.to_account_info().key,
        ctx.accounts.purchaser.to_account_info().key,
        payout_amount_in_lamports,
    );
    invoke_signed(
        &res,
        &[ctx.accounts.bond_pool_solana_account.to_account_info(), ctx.accounts.purchaser.to_account_info()],
        &[[
            ctx.accounts.bond_pool_account.key().as_ref(), b"bondPoolSolanaAccount",
            &[ctx.accounts.bond_pool_account.bump_bond_pool_solana_account]
        ].as_ref()]
    )?;

    Ok(())
}

// TODO: Move this into a different file

/**
 * Returns everything that is owned as redeemables.
 * Account will not include any more redeemables after this!
 * There is no need to update the redeemables after this, because of this
 */
pub fn redeem_bond_instance_face_value_and_profits(ctx: Context<RedeemBondInstance>) -> ProgramResult {

    let bond_instance_account = &mut ctx.accounts.bond_instance_account;
    // Update when the last payout happened ...
    bond_instance_account.last_profit_payout = ctx.accounts.clock.unix_timestamp as u64;

    // We can finally delete this account-data!
    if (ctx.accounts.clock.unix_timestamp as u64) < bond_instance_account.end_time {
        return Err(ErrorCode::TimeFrameNotPassed.into());
    }

    /*
    * Step 1: Calculate market rate
    */
    let full_amount_in_redeemables = ctx.accounts.bond_instance_token_account.amount;
    // If the user takes out anything, the timeframe then is also updated.

    // Calculate current worth,
    // minus initial pay-in-amount
    let payout_amount_in_lamports: u64 = sol_to_lamports(
        lamports_to_sol(ctx.accounts.bond_pool_solana_account.lamports()) /
            lamports_to_sol(ctx.accounts.bond_pool_redeemable_mint.supply) *
            // TODO: Be careful here, make sure the redeemables' decimals are maybe recorded somewhere, right now we can do this because our token has 9 decimals
            lamports_to_sol(full_amount_in_redeemables)
    );

    /*
     * Step 2: Burn Bond Token
     */
    let cpi_accounts = Burn {
        mint: ctx.accounts.bond_pool_redeemable_mint.to_account_info(),
        to: ctx.accounts.bond_instance_token_account.to_account_info(),
        authority: ctx.accounts.bond_instance_account.to_account_info(),
    };
    let cpi_program = ctx.accounts.token_program.to_account_info();
    token::burn(
        CpiContext::new_with_signer(
            cpi_program,
            cpi_accounts,
            &[
                [
                    ctx.accounts.bond_instance_account.purchaser.key().as_ref(), b"bondInstanceAccount",
                    &[ctx.accounts.bond_instance_account.bump_bond_instance_account]
                ].as_ref(),
                [
                    ctx.accounts.bond_pool_account.generator.key().as_ref(), b"bondPoolAccount",
                    &[ctx.accounts.bond_pool_account.bump_bond_pool_account]
                ].as_ref()
            ]
        ), full_amount_in_redeemables)?;

    /*
     * Step 3: Pay out Solana
     *     Can later on replace this with paying out redeemables,
     *      and the user can call another function to replace the redeemables with the bond
     */
    let res = anchor_lang::solana_program::system_instruction::transfer(
        ctx.accounts.bond_pool_solana_account.to_account_info().key,
        ctx.accounts.purchaser.to_account_info().key,
        payout_amount_in_lamports,
    );
    invoke_signed(
        &res,
        &[ctx.accounts.bond_pool_solana_account.to_account_info(), ctx.accounts.purchaser.to_account_info()],
        &[[
            ctx.accounts.bond_pool_account.key().as_ref(), b"bondPoolSolanaAccount",
            &[ctx.accounts.bond_pool_account.bump_bond_pool_solana_account]
        ].as_ref()]
    )?;

    Ok(())

}