import React, {FC} from "react";
import {IRpcProvider, useRpc} from "../../contexts/RpcProvider";
import {PublicKey, Transaction, TransactionInstruction} from "@solana/web3.js";
import {sendAndConfirmTransaction} from "../../utils/utils";
import {IItemsLoad, useItemsLoad} from "../../contexts/ItemsLoadingContext";
import {ILocalKeypair, useLocalKeypair} from "../../contexts/LocalKeypairProvider";
import {ICrank, useCrank} from "../../contexts/CrankProvider";
import {useErrorMessage} from "../../contexts/ErrorMessageContext";
import {lamportsReserversForLocalWallet} from "../../const";

export const RedeemPortfolioButton: FC = ({}) => {

    const rpcProvider: IRpcProvider = useRpc();
    const localKeypairProvider: ILocalKeypair = useLocalKeypair();
    const crankProvider: ICrank = useCrank();
    const itemLoadContext: IItemsLoad = useItemsLoad();
    const errorMessage = useErrorMessage();

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
    const redeemPortfolio = async () => {

        console.log("About to be redeeming!");
        await itemLoadContext.addLoadItem({message: "Fetching Account Information"});
        await itemLoadContext.addLoadItem({message: "Approving Redeem & Redeeming Positions"});
        await itemLoadContext.addLoadItem({message: "Redeeming Positions"});
        await itemLoadContext.addLoadItem({message: "Transferring USDC Back to Your Wallet"});

        let USDC_mint = new PublicKey("2tWC4JAdL4AxEFJySziYJfsAnW2MHKRo98vbAPiRDSk8");
        let mSOL = rpcProvider.portfolioObject!.marinadeState.mSolMintAddress;
        console.log("mSOL address is: ", mSOL.toString());

        /************************************************************************************
         * TRANSACTION 1
         *************************************************************************************/
        /**
         * Approve that the Portfolio will be withdrawn
         */
        let tx: Transaction = new Transaction();
        console.log("Approving Withdraw Portfolio");
        let IxApproveWithdrawPortfolio = await rpcProvider.portfolioObject!.approveWithdrawPortfolio();
        tx.add(IxApproveWithdrawPortfolio);

        /**
         * Approve for each position individually (by protocol), that it will be withdrawn
         */
        console.log("Getting instructions to approve the transaction...");
        let {portfolio, positionsSaber, positionsMarinade} = await rpcProvider.portfolioObject!.getPortfolioAndPositions();
        let allIxs = await rpcProvider.portfolioObject!.approveRedeemAllPositions(portfolio, positionsSaber, positionsMarinade);
        allIxs.map((x: TransactionInstruction) => tx.add(x));

        /**
         * Send some SOL to the crank wallet, just in case it doesn't have enough lamports
         */
        console.log("Send some to Crank Wallet");
        let IxSendToCrankWallet = await rpcProvider.portfolioObject!.sendToCrankWallet(
            localKeypairProvider.localTmpKeypair!.publicKey,
            lamportsReserversForLocalWallet
        );
        tx.add(IxSendToCrankWallet);

        await itemLoadContext.incrementCounter();
        if (tx.instructions.length > 0) {
            try {
                await sendAndConfirmTransaction(
                    rpcProvider._solbondProgram!.provider,
                    rpcProvider.connection!,
                    tx
                );
            } catch (error) {
                itemLoadContext.resetCounter();
                console.log(String(error));
                errorMessage.addErrorMessage(
                    "Something went wrong approving the redeems!",
                    String(error)
                );
            }
        }
        await itemLoadContext.incrementCounter();

        /************************************************************************************
         * TRANSACTION 2
         *************************************************************************************/
        /**
         * Run the crank transactions
         */
        try {
            await crankProvider.crankRpcTool!.redeemAllPositions(portfolio, positionsSaber, positionsMarinade);
            await itemLoadContext.incrementCounter();
            let sgTransferUsdcToUser = await crankProvider.crankRpcTool!.transfer_to_user(USDC_mint);
            console.log("Signature to send back USDC", sgTransferUsdcToUser);
        } catch (error) {
            itemLoadContext.resetCounter();
            console.log(String(error));
            errorMessage.addErrorMessage(
                "Something went wrong approving the redeems!",
                String(error)
            );
        }

        // TODO: Swap mSOL ot marinade SOL optionally ...
        // TODO: Also make the marinade SOL disappear, and just airdrop new SOL
        /**
         * Send the lamports in the local crank wallet back to the user
         */
        let tmpWalletBalance: number = await rpcProvider.connection!.getBalance(localKeypairProvider.localTmpKeypair!.publicKey);
        // This is approximately how much lamports is required for a single transaction...
        let lamportsBack = Math.min(tmpWalletBalance - 7_001, 0);
        if (lamportsBack > 0) {
            let ix = await crankProvider.crankRpcTool!.sendToUsersWallet(
                localKeypairProvider.localTmpKeypair!.publicKey,
                lamportsBack
            );
            let tx2 = new Transaction();
            tx2.add(ix);
            try {
                await sendAndConfirmTransaction(
                    crankProvider.crankRpcTool!.crankProvider,
                    crankProvider.crankRpcTool!.connection!,
                    tx2
                );
            } catch (error) {
                itemLoadContext.resetCounter();
                console.log(String(error));
                errorMessage.addErrorMessage(
                    "Something went wrong approving the redeems!",
                    String(error)
                );
            }
        }
        await itemLoadContext.incrementCounter();
        await rpcProvider.makePriceReload();
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
