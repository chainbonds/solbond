import React, {FC} from "react";
import {GiLever} from "react-icons/gi";
import {BN} from "@project-serum/anchor";
import {IRpcProvider, useRpc} from "../../../contexts/RpcProvider";
import {useLoad} from "../../../contexts/LoadingContext";
import {useErrorMessage} from "../../../contexts/ErrorMessageContext";
import {useItemsLoad} from "../../../contexts/ItemsLoadingContext";
import {Transaction} from "@solana/web3.js";
import {lamportsReserversForLocalWallet} from "../../../const";
import {sendAndConfirmTransaction} from "../../../utils/utils";
import {useLocalKeypair} from "../../../contexts/LocalKeypairProvider";
import {useCrank} from "../../../contexts/CrankProvider";

interface Props {}
export const RunWithdrawCrankButton = ({}: Props) => {

    const rpcProvider: IRpcProvider = useRpc();
    const loadContext = useLoad();
    const errorMessage = useErrorMessage();
    const itemLoadContext = useItemsLoad();
    const localKeypairProvider = useLocalKeypair();
    const crankProvider = useCrank();

    // Onclick, alert that the user must connect his wallet first!
    const withdrawCrank = async () => {
        console.log("Requesting airdrop...");

        await itemLoadContext.addLoadItem({message: "Depositing lamports to Crank Wallet"});
        await itemLoadContext.addLoadItem({message: "Runnning Cranks"});

        let tx: Transaction = new Transaction();
        console.log("Depositing some SOL to run the cranks ...");
        // This much SOL should suffice for now probably ...
        let IxSendToCrankWallet = await rpcProvider.portfolioObject!.sendToCrankWallet(
            localKeypairProvider.localTmpKeypair!.publicKey,
            lamportsReserversForLocalWallet
        );
        tx.add(IxSendToCrankWallet);
        console.log("Sending and signing the transaction");
        console.log("Provider is: ");
        console.log(rpcProvider._solbondProgram!.provider);
        console.log(rpcProvider._solbondProgram!.provider.wallet.publicKey.toString());
        try {
            await sendAndConfirmTransaction(
                rpcProvider._solbondProgram!.provider,
                rpcProvider.connection!,
                tx
            );
        } catch (error) {
            itemLoadContext.resetCounter();
            console.log(error);
            errorMessage.addErrorMessage(
                "create_portfolio",
                "Something went wrong creating the portfolio",
                String(error)
            );
            return;
        }
        await itemLoadContext.incrementCounter();

        /************************************************************************************
         * TRANSACTION 2
         *************************************************************************************/
        /**
         * Run the crank transactions
         */
        try {
            // TODO: Make this redeemAllPositions optional,
            console.log("Redeeming all postions");
            let {portfolio, positionsSaber, positionsMarinade, positionsSolend} = await rpcProvider.portfolioObject!.getPortfolioAndPositions();
            console.log("Positions are: ");
            console.log(positionsSaber);
            console.log(positionsMarinade);
            console.log(positionsSolend);
            await crankProvider.crankRpcTool!.redeemAllPositions(portfolio, positionsSaber, positionsMarinade, positionsSolend);
            await itemLoadContext.incrementCounter();
            console.log("transferring to user usdc ...");
            // let sgTransferUsdcToUser = await crankProvider.crankRpcTool!.transfer_to_user(USDC_mint);
            // console.log("transferring to user usdc done");
            // console.log("Signature to send back USDC", sgTransferUsdcToUser);
            // let sgTransferMSolToUser = await crankProvider.crankRpcTool!.transfer_to_user(mSOL);
            // console.log("Signature to send back mSOL", sgTransferMSolToUser);
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
        let tmpWalletBalance: BN = new BN(await rpcProvider.connection!.getBalance(localKeypairProvider.localTmpKeypair!.publicKey));
        // This is approximately how much lamports is required for a single transaction...
        // TODO: Add this into a constants variable
        let lamportsBack = BN.min(tmpWalletBalance.subn(7_001), new BN(0));
        if (lamportsBack.gtn(0)) {
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


        alert("Faucet successful! You might have to reload the page for assets to be updated");
        await rpcProvider.makePriceReload();
        await loadContext.decreaseCounter();
    };

    return (
        <>
            <button
                className={"border border-gray-500 text-white font-bold py-3 px-7 rounded "}
                onClick={() => withdrawCrank()}
            >
                <div className={"flex flex-row"}>
                    <div className={"py-auto my-auto pr-3"}>
                        <GiLever/>
                    </div>
                    Run Crank
                </div>
            </button>
        </>
    );
};
