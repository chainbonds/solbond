import {useEffect, useState} from "react";
import {IQPool, useQPoolUserTool} from "../contexts/QPoolsProvider";
import {delay, getAssociatedTokenAddressOffCurve} from "@qpools/sdk/lib/utils";
import {PublicKey} from "@solana/web3.js";

export default function UserInfo(props: any) {

    // Just run a lop where you update TVL every couple times
    const qPoolContext: IQPool = useQPoolUserTool();
    const [currencyBalance, setCurrencyBalance] = useState<number>(0.);

    useEffect(() => {

        if (qPoolContext.connection && qPoolContext.currencyMint && qPoolContext.userAccount) {
            // Get the associated token account
            console.log("Getting associated token account")
            getAssociatedTokenAddressOffCurve(
                qPoolContext.currencyMint.publicKey, qPoolContext.userAccount.publicKey
            ).then((userCurrencyAta: PublicKey) => {
                qPoolContext.connection!.getTokenAccountBalance(userCurrencyAta).then((x) => {
                    if (x.value && x.value.uiAmount) {
                        console.log("Balance is: ", x.value);
                        setCurrencyBalance(x.value.uiAmount!);
                    } else {
                        console.log("ERROR: Something went wrong unpacking the balance!");
                    }
                    console.log("Done fetching");
                });
            })

            // Get the balance
        }
    }, [qPoolContext.totalPortfolioValueInUsd, qPoolContext.userAccount, qPoolContext.allocatedAccounts, qPoolContext.reloadPriceSentinel]);

    return (
        <>
            <div className={"flex flex-col md:flex-row items-center lg:items-begin"}>
                {/*{singleBox("Total Value Locked", "$ " + String((tvl / (10 ** tvlDecimals)).toFixed(2) ) + " USD")}*/}
                USDC Balance in Wallet: {currencyBalance}
                {/*8.02%*/}
            </div>
        </>
    )

}