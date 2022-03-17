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
import AssetAndDepositAmount from "../displays/AssetAndDepositAmount"
import InputSlider from "../inputs/Slider"

export default function StakeForm() {

    const walletContext: any = useWallet();
    const qPoolContext: IQPool = useQPoolUserTool();


    const [depositAmountUsdc, setDepositAmountUsdc] = useState<number>(0.);
    const [depositAmountSol, setDepositAmountSol] = useState<number>(0.);

    const [allowSwap, setAllowSwap] = useState<boolean>(true);

    const [displayBuyModal, setDisplayBuyModal] = useState<boolean>(false);
    const [displayOnramperModal, setDisplayOnramperModal] = useState<boolean>(false);

    //TODO : fetch solana price
    const solanaPrice = 100;

    const getActionButton = () => {
        if (qPoolContext.userAccount) {
            return (
                <PurchaseButton
                    valueInUsdc={depositAmountUsdc}
                    amountSol = {depositAmountSol}
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
                valueInUsdc={depositAmountUsdc}
            />
            <OnramperModal
                isOpen={displayOnramperModal}
                onClose={() => {
                    setDisplayOnramperModal(false)
                }}
            />

            <div className={"flex pb-2 w-full"}>
                <div className={"flex flex-row space-x-6"}>
                    <AssetAndDepositAmount
                        setDepositAmountUsdc = {(amount :number) => {setDepositAmountUsdc(amount)}}
                        setDepositAmountSol = {(amount :number) => {setDepositAmountSol(amount)}}
                    />
                    <div className={"flex flex-row ml-auto my-auto"}>
                        {getActionButton()}
                    </div>
                </div>
            </div>
        </>
    );
}
