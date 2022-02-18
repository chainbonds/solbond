/* This example requires Tailwind CSS v2.0+ */
import {useForm} from "react-hook-form";
import {useWallet} from '@solana/wallet-adapter-react';
import * as anchor from "@project-serum/anchor";
import {Connection, Keypair, PublicKey, Signer, Transaction, TransactionInstruction} from "@solana/web3.js";
import {AiOutlineArrowDown} from "react-icons/ai";
import InputFieldWithLogo from "../InputFieldWithLogo";
import CallToActionButton from "../CallToActionButton";
import {BN, web3} from "@project-serum/anchor";
import React, {Fragment, useEffect, useState} from "react";
import {IQPool, useQPoolUserTool} from "../../contexts/QPoolsProvider";
import {WalletMultiButton} from "@solana/wallet-adapter-react-ui";
import {Mint, WalletI} from "easy-spl";
import {Token, TOKEN_PROGRAM_ID, u64} from "@solana/spl-token";
// import airdropAdmin from "@qpools/sdk/src/airdropAdmin";
// import {createAssociatedTokenAccountSendUnsigned, delay} from "@qpools/sdk/src/utils";
// import {MATH_DENOMINATOR, MOCK} from "@qpools/sdk/src/const";
import {useLoad} from "../../contexts/LoadingContext";
// import {SEED} from "@qpools/sdk/lib/seeds";
import {sendAndConfirm} from "easy-spl/dist/util";
import ConfirmPortfolioBuyModal from "../ConfirmPortfolioBuyModal";
import {Modal} from "react-bootstrap";
import { Transition } from "@headlessui/react";
import {airdropAdmin, createAssociatedTokenAccountSendUnsigned, MOCK} from "@qpools/sdk";
import {SEED} from "@qpools/sdk/lib/seeds";
import {PositionsInput} from "@qpools/sdk/lib/register-portfolio";
import {tou64} from "@qpools/sdk/lib/utils";

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

        // The first two instructions can work together, I would say ...
        let tx0: Transaction = new Transaction();
        console.log("Creating all positions ...");
        let ix0 = await qPoolContext.portfolioObject!.registerPortfolio(weights);
        tx0.add(ix0);
        let ix1 = await qPoolContext.portfolioObject!.registerAllLiquidityPools();
        tx0.add(ix1);

        console.log("Signing transaction 1...");
        console.log("Payer is: ", qPoolContext.portfolioObject!.payer);
        console.log("Wallet is: ", qPoolContext.portfolioObject!.wallet);
        // await sendAndConfirm();
        // return web3.sendAndConfirmRawTransaction(conn, tx.serialize(), { commitment: 'confirmed' })
        const blockhash = await qPoolContext.connection!.getRecentBlockhash();
        console.log("Added blockhash");
        tx0.recentBlockhash = blockhash.blockhash;
        tx0.feePayer = qPoolContext.userAccount!.publicKey;
        // await qPoolContext.userAccount!.signTransaction(tx0);
        let sg0 = await qPoolContext._solbondProgram.provider.send(tx0);
        // let sg0 = await qPoolContext.connection!.sendRawTransaction(tx0.serialize());
        console.log("sg0 is: ", sg0);
        await qPoolContext.connection!.confirmTransaction(sg0, 'confirmed');

        // Send and confirm this set of transactions ...
        console.log("Transferring USDC to positions ...");
        let tx1: Transaction = new Transaction();
        let ix2 = await qPoolContext.portfolioObject!.transferUsdcFromUserToPortfolio(amountTokenA);
        tx1.add(ix2);
        let ix3 = await qPoolContext.portfolioObject!.depositTokensToLiquidityPools(weights);
        tx1.add(ix3);

        tx0.recentBlockhash = blockhash.blockhash;
        tx0.feePayer = qPoolContext.userAccount!.publicKey;
        // await qPoolContext.userAccount!.signTransaction(tx0);
        console.log("Signing transaction 2...");
        let sg1 = await qPoolContext._solbondProgram.provider.send(tx1);
        console.log("sg1 is: ", sg1);
        await qPoolContext.connection!.confirmTransaction(sg1);

        // Send some USDC to the wallet's address
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
