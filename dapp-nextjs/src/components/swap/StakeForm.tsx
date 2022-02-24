/* This example requires Tailwind CSS v2.0+ */
import {useForm} from "react-hook-form";
import {useWallet} from '@solana/wallet-adapter-react';
import InputFieldWithLogo from "../inputs/InputFieldWithLogo";
import CallToActionButton from "../buttons/CallToActionButton";
import React, {useEffect, useState} from "react";
import {IQPool, useQPoolUserTool} from "../../contexts/QPoolsProvider";
import {WalletMultiButton} from "@solana/wallet-adapter-react-ui";
import UserInfoBalance from "../displays/UserInfoBalance";
import ConfirmPortfolioBuyModal from "../modals/ConfirmPortfolioBuyModal";

export default function StakeForm() {

    const {register} = useForm();
    const walletContext: any = useWallet();
    const qPoolContext: IQPool = useQPoolUserTool();

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
                        <div className="pt-5 pb-2 bg-slate-800 bg-gray">
                            <div>
                                <div className={"flex flex-row w-full justify-center"}>
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
                </div>
            </div>
        </>
    );
}
