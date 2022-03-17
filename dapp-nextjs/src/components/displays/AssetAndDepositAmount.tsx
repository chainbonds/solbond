import {useEffect, useState} from "react";
import {IQPool, useQPoolUserTool} from "../../contexts/QPoolsProvider";
import {getAssociatedTokenAddressOffCurve} from "@qpools/sdk/lib/utils";
import {PublicKey} from "@solana/web3.js";
import {tokenAccountExists, MOCK} from "@qpools/sdk";
import {useWallet} from '@solana/wallet-adapter-react';
import {COLORS} from "../../const"
import Image from "next/image";
import InputFieldWithLogo from "../inputs/InputFieldWithLogo"
import InputSlider from "../inputs/Slider"

export default function AssetAndDepositAmount(props : any) {

    const [depositAmountUsdc, setDepositAmountUsdc] = useState<number>(0.);
    const [depositAmountSol, setDepositAmountSol] = useState<number>(0.);

    const [walletAmountUsdc, setWalletAmountUsdc] = useState<number>(0.);
    const [walletAmountSol, setWalletAmountSol] = useState<number>(0.);

    const qPoolContext: IQPool = useQPoolUserTool();
    const [percentage, setPercentage] = useState<number>(0.);

    useEffect(() => {
        setDepositAmountUsdc(walletAmountUsdc * percentage)
        setDepositAmountSol(walletAmountSol * percentage)
        props.setDepositAmountSol(walletAmountSol * percentage)
        props.setDepositAmountUsdc(walletAmountUsdc * percentage)
    }, [percentage]);

    useEffect(() => {
        updateAccountBalance(MOCK.DEV.SABER_USDC, setWalletAmountUsdc);
        updateAccountBalance(MOCK.DEV.SOL, setWalletAmountSol);

    }, [qPoolContext.reloadPriceSentinel, qPoolContext.userAccount, qPoolContext.connection]);

    const updateAccountBalance = async (mintAddress : PublicKey, setAmountFunction :any ) => {
        console.log("#useEffect UserInfoBalance");
        if (qPoolContext.connection && qPoolContext.userAccount) {
            // Get the associated token account
            console.log("Getting associated token account")
            let userCurrencyAta: PublicKey = await getAssociatedTokenAddressOffCurve(
                mintAddress, qPoolContext.userAccount.publicKey
            )
            let existsBool = await tokenAccountExists(qPoolContext.connection!, userCurrencyAta);
            console.log("User ATA: ", userCurrencyAta.toString(), existsBool);
            if (existsBool) {
                console.log("Exists!");
                // Check if this account exists, first of all
                let x = await qPoolContext.connection!.getTokenAccountBalance(userCurrencyAta);
                if (x.value && x.value.uiAmount) {
                    console.log("Balance is: ", x.value);
                    setAmountFunction(x.value.uiAmount!);
                } else {
                    console.log("ERROR: Something went wrong unpacking the balance!");
                }
                console.log("Done fetching");
            } else {
                console.log("Account doesn't exist yet");
            }
        }
        console.log("##useEffect UserInfoBalance");
    }


    const solAddress  = "https://spl-token-icons.static-assets.ship.capital/icons/101/So11111111111111111111111111111111111111112.png"
    return (
        <div className={"flex flex-col w-full"}>
            <div className = "pl-52 place-content-center">
                <div className={""}>
                    <InputSlider
                    setPercentage = {setPercentage}
                />
                </div>

            </div>
        </div>
    )

}
