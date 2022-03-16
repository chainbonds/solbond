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
import PurchaseButton from "../buttons/PurchaseButton";
import OnramperModal from "../modals/OnramperModal"
import {COLORS} from "../../const"
import ConnectWalletButton from "../buttons/ConnectWalletButton";

export default function StakeForm() {

    const {register} = useForm();
    const walletContext: any = useWallet();
    const qPoolContext: IQPool = useQPoolUserTool();

    const [valueInUsdc, setValueInUsdc] = useState<number>(0.);
    const [amountSol, setAmountSol] = useState<number>(0.);

    const [displayBuyModal, setDisplayBuyModal] = useState<boolean>(false);
    const [displayOnramperModal, setDisplayOnramperModal] = useState<boolean>(false);


    useEffect(() => {
        if (walletContext.publicKey) {
            qPoolContext.initializeQPoolsUserTool(walletContext);
        }
    }, [walletContext.publicKey]);

    const getActionButton = () => {
        if (qPoolContext.userAccount) {
            return (
                <PurchaseButton
                    valueInUsdc={valueInUsdc}
                    amountSol = {amountSol}
                />
            )
        } else {
            return (
                <ConnectWalletButton/>
            );
        }
    }

    return (
        <>
            <ConfirmPortfolioBuyModal
                isOpen={displayBuyModal}
                onClose={() => {
                    setDisplayBuyModal(false)
                }}
                valueInUsdc={valueInUsdc}
            />
            <OnramperModal
                isOpen={displayOnramperModal}
                onClose={() => {
                    setDisplayOnramperModal(false)
                }}
            />

            <div className={"flex pb-2 w-full"}>
                <div className={"flex flex-col w-full"}>
                    <div className={"flex flex-row"}>
                        <div className={"flex flex-col w-full mr-4 space-y-2"}>
                            <InputFieldWithLogo
                                logoPath={"/usdc-logo.png"}
                                displayText={"USDC"}
                                registerFunction={() => register("solana_amount")}
                                modifiable={true}
                                setNewValue={setValueInUsdc}
                            />
                            <InputFieldWithLogo
                                logoPath={"https://spl-token-icons.static-assets.ship.capital/icons/101/So11111111111111111111111111111111111111112.png"}
                                displayText={"SOL"}
                                registerFunction={() => register("solana_amount")}
                                modifiable={true}
                                setNewValue={setAmountSol}
                            />
                        </div>
                        <div className={"flex flex-row ml-auto my-auto"}>
                            {getActionButton()}
                        </div>
                    </div>
                    <div className={"flex flex-row mx-1 mt-1"}>
                        <UserInfoBalance
                        onClick = {() => {setDisplayOnramperModal(true)}}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}
