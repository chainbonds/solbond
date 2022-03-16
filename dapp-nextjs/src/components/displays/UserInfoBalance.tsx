import {useEffect, useState} from "react";
import {IQPool, useQPoolUserTool} from "../../contexts/QPoolsProvider";
import {getAssociatedTokenAddressOffCurve} from "@qpools/sdk/lib/utils";
import {PublicKey} from "@solana/web3.js";
import {tokenAccountExists, MOCK} from "@qpools/sdk";
import {useWallet} from '@solana/wallet-adapter-react';
import {COLORS} from "../../const"

export default function UserInfoBalance(props : any) {

    const qPoolContext: IQPool = useQPoolUserTool();
    const [currencyBalance, setCurrencyBalance] = useState<number>(0.);

    const updateAccountBalance = async () => {
        console.log("#useEffect UserInfoBalance");
        if (qPoolContext.connection && qPoolContext.userAccount) {
            // Get the associated token account
            console.log("Getting associated token account")
            let userCurrencyAta: PublicKey = await getAssociatedTokenAddressOffCurve(
                MOCK.DEV.SABER_USDC, qPoolContext.userAccount.publicKey
            )
            let existsBool = await tokenAccountExists(qPoolContext.connection!, userCurrencyAta);
            console.log("User ATA: ", userCurrencyAta.toString(), existsBool);
            if (existsBool) {
                console.log("Exists!");
                // Check if this account exists, first of all
                let x = await qPoolContext.connection!.getTokenAccountBalance(userCurrencyAta);
                if (x.value && x.value.uiAmount) {
                    console.log("Balance is: ", x.value);
                    setCurrencyBalance(x.value.uiAmount!);
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

    useEffect(() => {
        updateAccountBalance();
    }, [qPoolContext.reloadPriceSentinel, qPoolContext.userAccount, qPoolContext.connection ]);

    return (
        <>
            <div
                className={"flex flex-col md:flex-row items-center lg:items-begin text-gray-500 text-sm font-semibold "}>
                Wallet Balance: {currencyBalance.toFixed(2)} USDC.
            </div>
            <div className={"flex flex-row mr-4"}>
                <button
                    style = {{textDecoration : "underline" }}//background : COLORS[0]
                    className={"flex flex-col md:flex-row items-center lg:items-begin text-gray-500 hover:text-white text-sm font-semibold "}
                    onClick = {() => {props.onClick()}}
                >
                    <text>	&nbsp;Buy more?</text>
                </button>
            </div>
        </>
    )

}
