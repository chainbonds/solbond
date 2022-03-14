import React, {FC} from "react";
import {IQPool, useQPoolUserTool} from "../../contexts/QPoolsProvider";
import {Transaction, TransactionInstruction} from "@solana/web3.js";
import {sendAndConfirmTransaction} from "../../utils/utils";
import {useItemsLoad} from "../../contexts/ItemsLoadingContext";
import {PortfolioAccount} from "@qpools/sdk";

export const RedeemPortfolioButton: FC = ({}) => {

    // TODO Implement logic to airdrop some currency ...
    const qPoolContext: IQPool = useQPoolUserTool();
    const itemLoadContext = useItemsLoad();

    const redeemPortfolio = async () => {

        console.log("About to be redeeming!");
        await itemLoadContext.addLoadItem({message: "Fetching Account Information"});
        await itemLoadContext.addLoadItem({message: "Approving Redeem & Redeeming Positions"});
        await itemLoadContext.addLoadItem({message: "Redeeming Positions"});
        await itemLoadContext.addLoadItem({message: "Transferring USDC Back to Your Wallet"});

        /**
         * Withdraw a Portfolio workflow:
         * 1) approve_withdraw_to_user(ctx,amount_total):
         *      ctx: context of the portfolio
         *      amount: total amount of USDC in the portfolio
         *
         * 2) for position_i in range(num_positions):
         *          approve_withdraw_amount_{PROTOCOL_NAME}(ctx, args)
         * 3) for position_i in range(num_positions):
         *          withdraw
         *
         * 3) transfer_redeemed_to_user():
         *      transfers the funds back to the user
         *
         */
        let tx: Transaction = new Transaction();

        // TODO: Call Crank API to withdraw for this user lol

        // Get the total amount from the initialUsdcAmount
        /**
         * Send some SOL to the crank wallet to run the cranks ...
         */
        let portfolioContents = (await qPoolContext._solbondProgram!.account.portfolioAccount.fetch(qPoolContext.portfolioObject!.portfolioPDA)) as PortfolioAccount;
        let initialUsdcAmount = portfolioContents.initialAmountUSDC;
        // Instead of initial amount, we should try to get the maximum. But for now, this should suffice
        let IxApproveWithdraw = await qPoolContext.portfolioObject!.signApproveWithdrawToUser(initialUsdcAmount);
        tx.add(IxApproveWithdraw);
        let IxRedeemPositions = await qPoolContext.portfolioObject!.approveRedeemFullPortfolio();
        IxRedeemPositions.map((x: TransactionInstruction) => {
            tx.add(x)
        });
        // Now send the transaction ...
        // Amount of SOL is pretty high probably.
        let IxSendToCrankWallet = await qPoolContext.portfolioObject!.sendToCrankWallet(
            qPoolContext.localTmpKeypair!.publicKey,
            100_000_000
        );
        tx.add(IxSendToCrankWallet);
        await itemLoadContext.incrementCounter();
        // Now sign this transaction
        await sendAndConfirmTransaction(
            qPoolContext._solbondProgram!.provider,
            qPoolContext.connection!,
            tx,
            qPoolContext.userAccount!.publicKey
        );
        await itemLoadContext.incrementCounter();

        /**
         * Run all cranks to take back the orders ...
         */
        await qPoolContext.crankRpcTool!.fullfillAllWithdrawalsPermissionless();
        await itemLoadContext.incrementCounter();
        console.log("I TRY TO TRANSFER TO USER --------------------------------------------------------------------");
        await qPoolContext.crankRpcTool!.transferToUser();
        await itemLoadContext.incrementCounter();

        let tmpWalletBalance: number = await qPoolContext.connection!.getBalance(qPoolContext.localTmpKeypair!.publicKey);
        let lamportsBack = Math.min(tmpWalletBalance - 7_001, 0.0);
        if (lamportsBack > 0) {
            let ix = await qPoolContext.crankRpcTool!.sendToUsersWallet(
                qPoolContext.localTmpKeypair!.publicKey,
                lamportsBack
            );
            let tx2 = new Transaction();
            tx2.add(ix);
            await sendAndConfirmTransaction(
                qPoolContext.crankRpcTool!.crankProvider,
                qPoolContext.connection!,
                tx2,
                qPoolContext.userAccount!.publicKey
            );
        }

        // Make reload
        await qPoolContext.makePriceReload();
    }

    return (
        <>
            <button
                type="button"
                // py-2.5
                className="px-6 h-8 my-auto bg-pink-800 text-white font-semibold text-xs leading-tight uppercase rounded shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out"
                onClick={() => {
                    console.log("Redeem stupid Position");
                    redeemPortfolio();
                }}
            >
                Redeem to USDC
            </button>
        </>
    );
};
