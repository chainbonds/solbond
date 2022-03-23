import {useEffect, useState} from "react";
import {IRpcProvider, useRpc} from "../../contexts/RpcProvider";
import {getAssociatedTokenAddressOffCurve} from "@qpools/sdk/lib/utils";
import {PublicKey} from "@solana/web3.js";
import {tokenAccountExists, MOCK} from "@qpools/sdk";
import {IExistingPortfolio, useExistingPortfolio} from "../../contexts/ExistingPortfolioProvider";

export default function UserInfoBalance() {

    const rpcProvider: IRpcProvider = useRpc();
    const existingPortfolioProvider: IExistingPortfolio = useExistingPortfolio();
    const [currencyBalance, setCurrencyBalance] = useState<number>(0.);

    // TODO: Replace the USDC with the currency that is currently selected ...
    //   Should probably also include this in the context

    const updateAccountBalance = async () => {
        console.log("#useEffect UserInfoBalance");
        if (rpcProvider.connection && rpcProvider.userAccount) {
            // Get the associated token account
            console.log("Getting associated token account")
            // TODO: Replace USDC by some currency, or whatever the user has currency chosen as their Input ...
            let userCurrencyAta: PublicKey = await getAssociatedTokenAddressOffCurve(
                MOCK.DEV.SABER_USDC, rpcProvider.userAccount.publicKey
            )
            let existsBool = await tokenAccountExists(rpcProvider.connection!, userCurrencyAta);
            console.log("User ATA: ", userCurrencyAta.toString(), existsBool);
            if (existsBool) {
                console.log("Exists!");
                // Check if this account exists, first of all
                let x = await rpcProvider.connection!.getTokenAccountBalance(userCurrencyAta);
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
    }, [
        existingPortfolioProvider.totalPortfolioValueInUsd,
        rpcProvider.provider,
        existingPortfolioProvider.positionInfos,
        rpcProvider.reloadPriceSentinel
    ]);

    return (
        <>
            <div
                className={"flex flex-col md:flex-row items-center lg:items-begin text-gray-500 text-sm font-semibold "}>
                Wallet Balance: {currencyBalance.toFixed(2)} USDC
            </div>
        </>
    )

}
