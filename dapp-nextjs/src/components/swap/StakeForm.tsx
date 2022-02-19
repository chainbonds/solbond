/* This example requires Tailwind CSS v2.0+ */
import {useForm} from "react-hook-form";
import {useWallet} from '@solana/wallet-adapter-react';
import {Transaction, TransactionInstruction} from "@solana/web3.js";
import InputFieldWithLogo from "../InputFieldWithLogo";
import CallToActionButton from "../CallToActionButton";
import {BN} from "@project-serum/anchor";
import React, {useEffect, useRef, useState} from "react";
import {IQPool, useQPoolUserTool} from "../../contexts/QPoolsProvider";
import {WalletMultiButton} from "@solana/wallet-adapter-react-ui";
import {u64} from "@solana/spl-token";
import {useLoad} from "../../contexts/LoadingContext";
import {MOCK} from "@qpools/sdk";
import {sendAndConfirmTransaction} from "../../utils/utils";
import UserInfoBalance from "../UserInfoBalance";
import ConfirmPortfolioBuyModal from "../modals/ConfirmPortfolioBuyModal";

// // TODO: Do i need to shorten the instructions even further ...?
// // TODO: For every two positions, create another instruction ...

export default function StakeForm() {

    const {register, handleSubmit} = useForm();
    const walletContext: any = useWallet();
    const qPoolContext: IQPool = useQPoolUserTool();
    const loadContext = useLoad();

    const [valueInUsdc, setValueInUsdc] = useState<number>(0.);
    const [displayBuyModal, setDisplayBuyModal] = useState<boolean>(false);

    useEffect(() => {
        console.log("Value in USDC changes", valueInUsdc);
    }, [valueInUsdc]);

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
                onClose={() => {
                    setDisplayBuyModal(false)
                }}
                valueInUsdc={valueInUsdc}
            />
            <div className="">
                <div className="">
                    {/*<form action="" method="POST">*/}
                        <div className="pt-5 pb-2 bg-slate-800 bg-gray">
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
                                <div className={"flex flex-row justify-end mx-1 mt-1"}>
                                    <UserInfoBalance />
                                </div>
                            </div>
                        </div>
                        {qPoolContext.userAccount &&
                            <>
                                <CallToActionButton
                                    onClick={() => {setDisplayBuyModal(true)}}
                                    type={"button"}
                                    text={"EARN"}
                                />
                            </>
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
                    {/*</form>*/}
                </div>
            </div>
        </>
    );
}
