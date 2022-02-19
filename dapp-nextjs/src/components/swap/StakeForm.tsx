/* This example requires Tailwind CSS v2.0+ */
import {useForm} from "react-hook-form";
import {useWallet} from '@solana/wallet-adapter-react';
import {Transaction, TransactionInstruction} from "@solana/web3.js";
import InputFieldWithLogo from "../InputFieldWithLogo";
import CallToActionButton from "../CallToActionButton";
import {BN} from "@project-serum/anchor";
import React, {useEffect, useState} from "react";
import {IQPool, useQPoolUserTool} from "../../contexts/QPoolsProvider";
import {WalletMultiButton} from "@solana/wallet-adapter-react-ui";
import {u64} from "@solana/spl-token";
import {useLoad} from "../../contexts/LoadingContext";
import ConfirmPortfolioBuyModal from "../ConfirmPortfolioBuyModal";
import {MOCK} from "@qpools/sdk";
import {sendAndConfirmTransaction} from "../../utils/utils";

// // TODO: Do i need to shorten the instructions even further ...?
// // TODO: For every two positions, create another instruction ...

export default function StakeForm() {

    const {register, handleSubmit} = useForm();
    const walletContext: any = useWallet();
    const qPoolContext: IQPool = useQPoolUserTool();
    const loadContext = useLoad();

    const [valueInUsdc, setValueInUsdc] = useState<number>(0.);
    const [displayBuyModal, setBuyModal] = useState<boolean>(false);

    const submitToContract = async (d: any) => {

        console.log(JSON.stringify(d));

        // The pool addresses will be all hardcoded somewhere
        // For the three pools we have, calculate these assignments.
        // Also, devnet will be everything hardcoded:
        // MOCK.DEV.stableSwapProgramId

        // Pass it on to the confirm modal
        // positionInput: Array<PositionsInput>, ownerKeypair: Keypair

        if (!qPoolContext.userAccount!.publicKey) {
            alert("Please connect your wallet first!");
            return
        }

        await loadContext.increaseCounter();

        // Initialize if not initialized yet
        await qPoolContext.initializeQPoolsUserTool(walletContext);

        // We can now assume that the portfolio was created in the qpools context.
        const sendAmount: BN = new BN(valueInUsdc).mul(new BN(10**MOCK.DEV.SABER_USDC_DECIMALS));

        // Send "sendAmount" to the PDA pool...

        // Code copy-pasted from the tests
        // TODO: Update the amount, match it to the inputs ...
        // Also, update the amount / weight change (amount should be calculated by weight + total_amount).
        // const sendAmount: BN = new BN(valueInUsd).mul(new BN(10**MOCK.DEV.SABER_USDC_DECIMALS));

        let amountTokenA = new u64(sendAmount);
        const amounts = [amountTokenA, 0, 0];
        let weights: Array<BN> = [new BN(1000), new BN(0), new BN(0)];

        // All transactions
        // Collect all transactions into one array
        // And then, split execution to minimize number of clicks
        // let txs = [];

        /*
            BLOCK 1: Create Associated Token Accounts for the Portfolio
         */
        // First, and if this was not created before, create the associated token accounts
        let txAssociatedTokenAccounts: Transaction = new Transaction();
        (await qPoolContext.portfolioObject!.registerAtaForLiquidityPortfolio()).map((x: TransactionInstruction) => {
            if (x) {
                txAssociatedTokenAccounts.add(x);
            }
        });
        // If the transaction is not empty
        console.log("txAssociatedTokenAccounts Instructions are: ", txAssociatedTokenAccounts.instructions);
        if (txAssociatedTokenAccounts.instructions.length > 0) {
            await sendAndConfirmTransaction(
                qPoolContext._solbondProgram!.provider,
                qPoolContext.connection!,
                txAssociatedTokenAccounts,
                qPoolContext.userAccount!.publicKey
            );
        }

        // Ok, now associated token accounts are created the first time the user uses the application ...
        // Or more specifically, the first time the portfolio is used

        /*
            BLOCK 2: Create the data structures for the portfolio, and liquidity pools
         */
        // TODO: Here too, double-check if these accounts were already created.
        //  If they were not created, then create them. This could possibly also save a couple instructions
        // Register all pools, and addresses
        console.log("Registering all accounts ...");
        let txRegisterDataStructures: Transaction = new Transaction();
        txRegisterDataStructures.add(
            await qPoolContext.portfolioObject!.registerPortfolio(weights)
        );
        (await qPoolContext.portfolioObject!.registerAllLiquidityPools()).map((x: TransactionInstruction) => {
            if (x) {
                txRegisterDataStructures.add(x);
            }
        });
        console.log("txRegisterDataStructures Instructions are: ", txRegisterDataStructures.instructions);
        await sendAndConfirmTransaction(
            qPoolContext._solbondProgram!.provider,
            qPoolContext.connection!,
            txRegisterDataStructures,
            qPoolContext.userAccount!.publicKey
        );

        /*
            BLOCK 2: Create the data structures for the portfolio, and liquidity pools
         */
        // Now apply all functions that send money back and forth
        console.log("Sending tokens around. This should be atomic, so that liquidity mining is successful, indeed ...");
        let txPushTokensToLiquidityPoolsThroughPortfolio: Transaction = new Transaction();
        txPushTokensToLiquidityPoolsThroughPortfolio.add(
            await qPoolContext.portfolioObject!.transferUsdcFromUserToPortfolio(amountTokenA)
        );

        // Gotta calculate the full distribution of tokens before sending these instrutions ...
        // Perhaps we should call it 1-by-1 for now?
        // Calculating the full allocation beforehand seems a bit tough to do right now, no?

        await qPoolContext.portfolioObject!.depositTokensToLiquidityPools(weights)

        // console.log(txDeposit);
        // console.log(txDeposit.length);
        //
        // let txLength = txDeposit.length;
        //
        // let tx0 = txDeposit.slice(0, 2);
        // let tx1 = txDeposit.slice(2, txLength);

        // Split up in multiple parts ...
        // .map((x: TransactionInstruction) => {
        //     if (x) {
        //         txPushTokensToLiquidityPoolsThroughPortfolio.add(x);
        //     }
        // });
        //
        // let txLength = txPushTokensToLiquidityPoolsThroughPortfolio.instructions.length;
        //
        // // Split into two transactions, because they don't fit into a single one!
        // let transactionPart1 = new Transaction();
        // txPushTokensToLiquidityPoolsThroughPortfolio.instructions.slice(0, (txLength / 2)).map((x: TransactionInstruction) => {
        //     transactionPart1.add(x);
        // })
        // // Split instructions into multiple ones, if its too long by default
        // await sendAndConfirmTransaction(
        //     qPoolContext._solbondProgram!.provider,
        //     qPoolContext.connection!,
        //     transactionPart1,
        //     qPoolContext.userAccount!.publicKey
        // );
        //
        // // Split into two transactions, because they don't fit into a single one!
        // let transactionPart2 = new Transaction();
        // txPushTokensToLiquidityPoolsThroughPortfolio.instructions.slice((txLength / 2), txLength).map((x: TransactionInstruction) => {
        //     transactionPart2.add(x);
        // })
        // // Split instructions into multiple ones, if its too long by default
        // await sendAndConfirmTransaction(
        //     qPoolContext._solbondProgram!.provider,
        //     qPoolContext.connection!,
        //     transactionPart2,
        //     qPoolContext.userAccount!.publicKey
        // );

        console.log("Done sending USDC to portfolio!!");
        await loadContext.decreaseCounter();

        // Display a message "Portfolio created"!

    }

    useEffect(() => {
        if (walletContext.publicKey) {
            console.log("Walle1t pubkey wallet is:", walletContext.publicKey.toString());
            qPoolContext.initializeQPoolsUserTool(walletContext);
        }
        // initializeQPoolsUserTool
    }, [walletContext.publicKey]);

    return (
        <>
            <ConfirmPortfolioBuyModal
                isOpen={displayBuyModal}
                onClose={() => {}}
            />
            <div className="">
                <div className="">
                    <form action="#" method="POST" onSubmit={handleSubmit(submitToContract)}>
                        <div className="py-5 bg-slate-800 bg-gray">
                            <div>
                                <div className={"flex flex-row w-full justify-center"}>
                                    {/*<div className={"flex flew-row w-full px-8 text-gray-400 justify-center"}>*/}
                                    {/*    Balance: */}
                                    {/*</div>*/}
                                    {/*<div className={"flex flew-row w-full px-8 text-gray-400 justify-center"}>*/}
                                    {/*    Balance:*/}
                                    {/*</div>*/}
                                </div>
                                <InputFieldWithLogo
                                    logoPath={"/usdc-logo.png"}
                                    displayText={"USDC"}
                                    registerFunction={() => register("solana_amount")}
                                    modifiable={true}
                                    setNewValue={setValueInUsdc}
                                />
                            </div>
                        </div>
                        {qPoolContext.userAccount &&
                            <CallToActionButton
                                type={"submit"}
                                text={"EARN"}
                            />
                        }
                        {!qPoolContext.userAccount &&
                            <div className={"flex w-full justify-center"}>
                                <WalletMultiButton
                                    className={"btn btn-ghost"}
                                    onClick={() => {
                                        console.log("click");
                                    }}
                                />
                            </div>
                        }
                    </form>
                </div>
            </div>
        </>
    );
}
