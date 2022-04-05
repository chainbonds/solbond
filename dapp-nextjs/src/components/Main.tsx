import React, {FC, useEffect, useState} from "react";
import LoadingItemsModal from "./common/LoadingItemsModal";
import {BRAND_COLORS} from "../const";
import {IRpcProvider, useRpc} from "../contexts/RpcProvider";
import {useWallet, WalletContextState} from "@solana/wallet-adapter-react";
import {ViewWalletNotConnected} from "./ViewWalletNotConnected";
import {ViewWalletConnectedCreatePortfolio} from "./ViewWalletConnectedCreatePortfolio";
import {ViewWalletConnectedPortfolioExists} from "./ViewWalletConnectedPortfolioExists";
import ErrorMessageModal from "./common/ErrorMessageModal";
import * as qpools from "@qpools/sdk";

export enum PortfolioState {
    WalletNotConnected,
    ShowSuggestedPortfolio,
    ShowExistingPortfolio
}
interface Props {
    registry: qpools.helperClasses.Registry
}
export const Main = ({registry}: Props) => {

    const rpcProvider: IRpcProvider = useRpc();
    const walletProvider: WalletContextState = useWallet();
    const [displayForm, setDisplayForm] = useState<PortfolioState>(PortfolioState.WalletNotConnected);

    /**
     * Determine which view to show
     */
    const determineDisplayedView = async () => {
        if (!walletProvider.publicKey) {
            setDisplayForm(PortfolioState.WalletNotConnected);
        } else if (rpcProvider.portfolioObject) {
            let isFulfilled = await rpcProvider.portfolioObject.portfolioExists();
            if (isFulfilled) {
                setDisplayForm(PortfolioState.ShowExistingPortfolio);
            } else {
                setDisplayForm(PortfolioState.ShowSuggestedPortfolio);
            }
        }
    };
    useEffect(() => {
        // Check if the account exists, and if it was fulfilled
        determineDisplayedView();
    }, [rpcProvider.portfolioObject, walletProvider.wallet, walletProvider.publicKey, rpcProvider.makePriceReload]);


    useEffect(() => {
        console.log("Flushing the portfolio of the user to the console");
        if (rpcProvider.portfolioObject) {
            rpcProvider.portfolioObject.portfolioExists().then((isFulfilled: boolean) => {
                if (isFulfilled) {
                    rpcProvider.portfolioObject!.flushAllAccountsToConsole();
                } else {
                    console.log("No position found!")
                }
            });
        } else {console.log("PortfolioObject not created yet")}
    }, [rpcProvider.portfolioObject]);

    return (
        <div
            id="content"
            className={"flex flex-col grow my-auto"}
            style={{backgroundColor: BRAND_COLORS.slate900}}
        >
            <LoadingItemsModal/>
            <div className={"flex flex-col grow w-full my-auto"}>
                <div className={"md:mx-auto"}>
                    {(displayForm === PortfolioState.WalletNotConnected) && <ViewWalletNotConnected registry={registry}/>}
                    {(displayForm === PortfolioState.ShowSuggestedPortfolio) && <ViewWalletConnectedCreatePortfolio registry={registry}/>}
                    {(displayForm === PortfolioState.ShowExistingPortfolio) && <ViewWalletConnectedPortfolioExists registry={registry}/>}
                </div>
            </div>
            <ErrorMessageModal/>
        </div>
    );

}
