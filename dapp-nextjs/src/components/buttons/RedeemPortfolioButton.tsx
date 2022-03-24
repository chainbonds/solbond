import React, {FC} from "react";
import {IRpcProvider, useRpc} from "../../contexts/RpcProvider";
import {PublicKey, Transaction, TransactionInstruction} from "@solana/web3.js";
import {sendAndConfirmTransaction} from "../../utils/utils";
import {IItemsLoad, useItemsLoad} from "../../contexts/ItemsLoadingContext";
import {BN} from "@project-serum/anchor";
import {ILocalKeypair, useLocalKeypair} from "../../contexts/LocalKeypairProvider";
import {ICrank, useCrank} from "../../contexts/CrankProvider";

export const RedeemPortfolioButton: FC = ({}) => {

    // TODO Implement logic to airdrop some currency ...
    const rpcProvider: IRpcProvider = useRpc();
    const localKeypairProvider: ILocalKeypair = useLocalKeypair();
    const crankProvider: ICrank = useCrank();
    const itemLoadContext: IItemsLoad = useItemsLoad();

    // TODO: Get all assets and protocols through the context. Also, perhaps instead of if protocolType, just directly also record the protocol itself ...
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

        let USDC_mint = new PublicKey("2tWC4JAdL4AxEFJySziYJfsAnW2MHKRo98vbAPiRDSk8");
        // We need the mSOL, because in the end, this is what we will be sendin back to the user ...
        // We will probably need to apply a hack, where we replace the mSOL with SOL, bcs devnet.
        // Probably easiest to do so is by swapping on the frontend, once we are mainnet ready
        let mSOL = rpcProvider.portfolioObject!.marinadeState.mSolMintAddress;
        console.log("mSOL address is: ", mSOL.toString());

        /**
         *
         * Transaction 1:
         * - First, approve to the portfolio that it may be withdrawn
         *
         */

        // Test the redeem functionality first ..

        let tx: Transaction = new Transaction();
        console.log("Approving Withdraw Portfolio");
        let IxApproveWithdrawPortfolio = await rpcProvider.portfolioObject!.approveWithdrawPortfolio();
        tx.add(IxApproveWithdrawPortfolio);

        // Get all saber positions ... and approve them
        // Fetch all positions for Saber
        // Redeem all positions for Saber

        // Fetch all positions for Marinade
        // Redeem all positions for Marinade

        console.log("Getting instructions to approve the transaction...");
        let {portfolio, positionsSaber, positionsMarinade} = await rpcProvider.portfolioObject!.getPortfolioAndPositions();

        let allIxs = await rpcProvider.portfolioObject!.approveRedeemAllPositions(portfolio, positionsSaber, positionsMarinade);
        allIxs.map((x: TransactionInstruction) => tx.add(x));
        // console.log("Approving Saber Withdraw");
        // // TODO: Check which of the tokens is tokenA, and withdraw accordingly ...
        // let minRedeemAmount = new BN(0);  // This is the minimum amount of tokens that should be put out ...
        // let IxApproveWithdrawSaber = await rpcProvider.portfolioObject!.signApproveWithdrawAmountSaber(0, minRedeemAmount);
        // tx.add(IxApproveWithdrawSaber);
        //
        // console.log("Approving Marinade Withdraw");
        // let IxApproveWithdrawMarinade = await rpcProvider.portfolioObject!.approveWithdrawToMarinade(1);
        // tx.add(IxApproveWithdrawMarinade);

        console.log("Send some to Crank Wallet");
        let IxSendToCrankWallet = await rpcProvider.portfolioObject!.sendToCrankWallet(
            localKeypairProvider.localTmpKeypair!.publicKey,
            10_000_000
        );
        tx.add(IxSendToCrankWallet);

        await itemLoadContext.incrementCounter();
        // TODO: Skip for now, because the cranks did run ..
        if (tx.instructions.length > 0) {
            await sendAndConfirmTransaction(
                rpcProvider._solbondProgram!.provider,
                rpcProvider.connection!,
                tx
            );
        }
        await itemLoadContext.incrementCounter();

        /**
         *
         * Transaction 2 (Cranks):
         *
         */

            // Run all cranks ...
        // let allIxs = await rpcProvider.portfolioObject!.approveRedeemAllPositions(portfolio, positionsSaber, positionsMarinade);


        // Run the saber redeem cranks ..
        await crankProvider.crankRpcTool!.redeemAllPositions(portfolio, positionsSaber, positionsMarinade);
        // let sgRedeemSinglePositionOnlyOne = await crankProvider.crankRpcTool!.redeem_single_position_only_one(0);
        // console.log("Signature to run the crank to get back USDC is: ", sgRedeemSinglePositionOnlyOne);
        // TODO: Swap mSOL ot marinade SOL optionally ...
        await itemLoadContext.incrementCounter();
        // For each initial asset, send it back to the user
        let sgTransferUsdcToUser = await crankProvider.crankRpcTool!.transfer_to_user(USDC_mint);
        console.log("Signature to send back USDC", sgTransferUsdcToUser);

        // TODO: Also make the marinade SOL disappear, and just airdrop new SOL
        let tmpWalletBalance: number = await rpcProvider.connection!.getBalance(localKeypairProvider.localTmpKeypair!.publicKey);
        let lamportsBack = Math.min(tmpWalletBalance - 7_001, 0.0);
        if (lamportsBack > 0) {
            let ix = await crankProvider.crankRpcTool!.sendToUsersWallet(
                localKeypairProvider.localTmpKeypair!.publicKey,
                lamportsBack
            );
            let tx2 = new Transaction();
            tx2.add(ix);
            await sendAndConfirmTransaction(
                crankProvider.crankRpcTool!.crankProvider,
                crankProvider.crankRpcTool!.connection!,
                tx2
            );
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
