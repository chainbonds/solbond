import React from "react";
import {useEffect, useState} from "react";
import Image from "next/image";
import {BRAND_COLORS} from "../../const";
import {IQPool, useQPoolUserTool} from "../../contexts/QPoolsProvider";
import {getAssociatedTokenAddressOffCurve} from "@qpools/sdk/lib/utils";
import {PublicKey} from "@solana/web3.js";
import {tokenAccountExists, MOCK} from "@qpools/sdk";

export default function InputFieldWithLogo(props: any) {

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



    const inputField = () => {
        return (<>
            <input
                className="rounded-lg text-right h-12 pr-5"
                style={{backgroundColor: BRAND_COLORS.slate700}}
                type="number"
                id="stake_amount"
                autoComplete="stake_amount"
                placeholder="0.0"
                step={"0.0001"}
                min="0"
                onChange={(event) => {
                    let newValue = Number(event.target.value);
                    console.log("New " + String(props.displayText) + " is: " + String(newValue));
                    props.setNewValue(newValue);
                }}
            />
        </>)
    }

    const displayField = () => {
        return (
            <div
                className="rounded-lg w-60 items-end text-right h-12 p-4"
                style={{backgroundColor: BRAND_COLORS.slate700}}
                id="stake_amount"
                placeholder="10.0"
            >
                {props.value}
            </div>
        )
    }

    return (
            <div className="flex flex-row w-full h-full mx-0">
                <div className="relative text-gray-300 focus-within:text-gray-300 w-full h-full">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-2 h-full">
                    <div className={"flex w-full my-auto text-center content-center"}>
                        <Image alt={props.displayText} src={props.logoPath} height={34} width={34}/>
                        <text className={"my-auto text-center content-center mx-2"}>
                            {props.displayText}
                        </text>
                    </div>
                    </span>
                    {props.modifiable ? inputField() : displayField()}
                    <div className={"absolute h-full inset-y-0 right-0 my-auto "}>
                        <div className={"text-center content-center m-auto place-self-center "}>/15</div>
                    </div>
                </div>
            </div>
    );
}
