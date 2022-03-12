import {useEffect, useState} from "react";
import {IQPool, useQPoolUserTool} from "../../contexts/QPoolsProvider";
import {getAssociatedTokenAddressOffCurve} from "@qpools/sdk/lib/utils";
import {PublicKey} from "@solana/web3.js";
// import {tokenAccountExists} from "../../../../../qPools-contract/qpools-sdk/src/utils";
import {tokenAccountExists, registry} from "@qpools/sdk";

export default function UserInfoBalance() {

    const qPoolContext: IQPool = useQPoolUserTool();
    const [currencyBalance, setCurrencyBalance] = useState<number>(0.);

    useEffect(() => {

        if (qPoolContext.connection && qPoolContext.currencyMint && qPoolContext.userAccount) {
            // Get the associated token account
            console.log("Getting associated token account")
            getAssociatedTokenAddressOffCurve(
                qPoolContext.currencyMint.publicKey, qPoolContext.userAccount.publicKey
            ).then((userCurrencyAta: PublicKey) => {

                (tokenAccountExists(qPoolContext.connection!, userCurrencyAta).then((existsBool: boolean) => {

                    if (existsBool) {
                        // Check if this account exists, first of all
                        qPoolContext.connection!.getTokenAccountBalance(userCurrencyAta).then((x) => {
                            if (x.value && x.value.uiAmount) {
                                console.log("Balance is: ", x.value);
                                setCurrencyBalance(x.value.uiAmount!);
                            } else {
                                console.log("ERROR: Something went wrong unpacking the balance!");
                            }
                            console.log("Done fetching");
                        });
                    } else {
                        console.log("Account doesn't exist yet");
                    }

                }));

            })
        }
    }, [qPoolContext.totalPortfolioValueInUsd, qPoolContext.userAccount, qPoolContext.allocatedAccounts, qPoolContext.reloadPriceSentinel]);
    
    /*
        //this was being written for the recommendation of the amount that a user should buy in order to pay less swap fees.
        const getUsdcBalance = async () => {
        if (qPoolContext.connection && qPoolContext.currencyMint && qPoolContext.userAccount) {

            let mintList : {symbol : string, address : PublicKey}[] = registry.getSearchableTokensInWallet()
            let existingCurrencies
            for (var val of mintList) {
                let userCurrencyAta = await getAssociatedTokenAddressOffCurve(
                    val.address, qPoolContext.userAccount.publicKey
                )

                tokenAccountExists(qPoolContext.connection!, userCurrencyAta
                console.log(val); // prints values: 10, 20, 30, 40
            }



        }
    }*/

    return (
        <>
            <div
                className={"flex flex-col md:flex-row items-center lg:items-begin text-gray-500 text-sm font-semibold "}>
                Wallet Balance: {currencyBalance.toFixed(2)} USDC
            </div>
        </>
    )

}
