import React, {FC} from "react";
import {GiLever} from "react-icons/gi";
import {BN} from "@project-serum/anchor";
import {IRpcProvider, useRpc} from "../../../contexts/RpcProvider";
import {Connection, PublicKey, SystemProgram, Transaction} from "@solana/web3.js";
import {Token, TOKEN_PROGRAM_ID} from "@solana/spl-token";
import {useLoad} from "../../../contexts/LoadingContext";
import {useErrorMessage} from "../../../contexts/ErrorMessageContext";
import {syncNative} from "@solendprotocol/solend-sdk";
import {calculateActiveTickIndex} from "recharts/types/util/ChartUtils";
import {lamportsReserversForLocalWallet} from "../../../const";
import {sendAndConfirmTransaction} from "../../../utils/utils";
import {useItemsLoad} from "../../../contexts/ItemsLoadingContext";
import {useLocalKeypair} from "../../../contexts/LocalKeypairProvider";
import {ICrank, useCrank} from "../../../contexts/CrankProvider";

interface Props {}
export const RunDepositCrankButton = ({}: Props) => {

    const rpcProvider: IRpcProvider = useRpc();
    const itemLoadContext = useItemsLoad();
    const localKeypairProvider = useLocalKeypair();
    const errorMessage = useErrorMessage();
    const crankProvider: ICrank = useCrank();

    // Onclick, alert that the user must connect his wallet first!
    // TODO: The functionality of this should be put in a function somewhere ...
    //  Otherwise we have duplicate code with the deposit button in the normal program flow
    const depositCrank = async () => {
        console.log("Running Deposit Crank again ... airdrop...");

        await itemLoadContext.addLoadItem({message: "Depositing lamports to Crank Wallet"});
        await itemLoadContext.addLoadItem({message: "Runnning Cranks"});


        /**
         * First, send some SOL to the crank wallet. Technically, we could also just do it at this point ...
         */
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
                "Something went wrong creating the portfolio. The Solana Devnet Network seems to be down :///",
                String(error)
            );
            return;
        }
        await itemLoadContext.incrementCounter();

        /**
         * Then, run the cranks
         */
        try {
            let {portfolio, positionsSaber, positionsMarinade, positionsSolend} = await rpcProvider.portfolioObject!.getPortfolioAndPositions();
            await crankProvider.crankRpcTool!.depositAllPositions(portfolio, positionsSaber, positionsMarinade, positionsSolend);
        } catch (error) {
            itemLoadContext.resetCounter();
            console.log(String(error));
            errorMessage.addErrorMessage(
                "crank_portfolio_saber",
                "Fulfilling the Saber Protocol failed.",
                String(error)
            );
            return;
        }
        await itemLoadContext.incrementCounter();

        alert("Crank successful! You might have to reload the page for assets to be updated");
        await rpcProvider.makePriceReload();
    };

    return (
        <>
            <button
                className={"border border-gray-500 text-white font-bold py-3 px-7 rounded"}
                onClick={() => depositCrank()}
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
