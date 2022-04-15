import React, {useEffect, useState} from "react";
import LoadingItemsModal from "./common/LoadingItemsModal";
import {BRAND_COLORS} from "../const";
import {IRpcProvider, useRpc} from "../contexts/RpcProvider";
import {ViewWalletNotConnected} from "./ViewWalletNotConnected";
import {ViewWalletConnectedCreatePortfolio} from "./ViewWalletConnectedCreatePortfolio";
import {ViewWalletConnectedPortfolioExists} from "./ViewWalletConnectedPortfolioExists";
import ErrorMessageModal from "./common/ErrorMessageModal";
import {useConnectedWallet} from "@saberhq/use-solana";
import {PortfolioAccount, Registry} from "@qpools/sdk";
import RunCranksModal from "./common/RunCranksModal";
import {ShowCrank} from "../types/ShowCrank";

export enum PortfolioState {
    WalletNotConnected,
    ShowSuggestedPortfolio,
    ShowExistingPortfolio
}
interface Props {
    registry: Registry
}
export const Main = ({registry}: Props) => {

    const rpcProvider: IRpcProvider = useRpc();
    const walletProvider = useConnectedWallet();
    const [displayForm, setDisplayForm] = useState<PortfolioState>(PortfolioState.WalletNotConnected);
    const [showCrankState, setShowCrankState] = useState<ShowCrank>(ShowCrank.NoCrank);

    /**
     * Determine which view to show
     */
    const determineDisplayedView = async () => {
        console.log("#determineDisplayedView()");
        if (!walletProvider || !walletProvider!.publicKey) {
            setShowCrankState(ShowCrank.NoCrank);
            setDisplayForm(PortfolioState.WalletNotConnected);
        } else if (rpcProvider.portfolioObject) {

            let portfolioAccount: PortfolioAccount | null = await rpcProvider.portfolioObject.fetchPortfolio();
            if (!portfolioAccount) {
                console.log("Portfolio Account does not exist, just show suggested portfolio ...");
                setShowCrankState(ShowCrank.NoCrank);
                setDisplayForm(PortfolioState.ShowSuggestedPortfolio);
            } else if (!portfolioAccount!.fullyCreated) {
                console.log("Show the deposit crank ... do not show s");
                setShowCrankState(ShowCrank.DepositCrank);
                setDisplayForm(PortfolioState.ShowSuggestedPortfolio);
            } else if (portfolioAccount!.fullyCreated && !portfolioAccount!.toBeRedeemed) {
                console.log("Do not show the withdraw crank, just show portfolio")
                setShowCrankState(ShowCrank.NoCrank);
                setDisplayForm(PortfolioState.ShowExistingPortfolio);
            } else if (portfolioAccount!.fullyCreated && portfolioAccount!.toBeRedeemed) {
                console.log("Do show the withdraw crank, portfolio is not redeemed yet")
                setShowCrankState(ShowCrank.WithdrawCrank);
                setDisplayForm(PortfolioState.ShowExistingPortfolio);
            } else {
                console.log(portfolioAccount);
                throw Error("Well, you havent considered this case!");
            }

            // let isFulfilled = await rpcProvider.portfolioObject.portfolioExists();
            // if (isFulfilled) {
            //
            //     // Optionally show the crank ...
            //     let portfolioAccount: PortfolioAccount | null = await rpcProvider.portfolioObject.fetchPortfolio();
            //     if (!portfolioAccount) {
            //         console.log(portfolioAccount);
            //         throw Error("portfolioExists returned true, but now we get null? something is off ");
            //     }
            //     console.log("Portfolio Account is: ", portfolioAccount);
            //     if (portfolioAccount.fullyCreated) {
            //         setDisplayForm(PortfolioState.ShowExistingPortfolio);
            //     } else {
            //         // I guess we have to have another state, which also doesn't display the wallet ...
            //         // At this point, we should also jut show
            //         if (!portfolioAccount.fullyCreated) {
            //             setShowCrankState(ShowCrank.DepositCrank);
            //             setDisplayForm(PortfolioState.WalletNotConnected);
            //         }
            //         if (portfolioAccount.toBeRedeemed) {
            //             setShowCrankState(ShowCrank.WithdrawCrank);
            //             setDisplayForm(PortfolioState.ShowExistingPortfolio);
            //         }
            //     }
            // } else {
            //     setDisplayForm(PortfolioState.ShowSuggestedPortfolio);
            // }
        }
        console.log("##determineDisplayedView()");
    };
    // TODO: Don't index on the wallet provider only ... might refresh very often
    useEffect(() => {
        // Check if the account exists, and if it was fulfilled
        determineDisplayedView();
        // Gotta update this once the crank is run ...
    }, [rpcProvider.portfolioObject, walletProvider && walletProvider?.publicKey, rpcProvider.makePriceReload]);


    // useEffect(() => {
    //     console.log("Flushing the portfolio of the user to the console");
    //     if (rpcProvider.portfolioObject) {
    //         rpcProvider.portfolioObject.fetchPortfolio().then((portfolioAccount: PortfolioAccount | null) => {
    //             let isFulfilled = portfolioAccount?.fullyCreated;
    //             if (isFulfilled) {
    //                 console.log("Flushing all accounts ... ", portfolioAccount);
    //                 rpcProvider.portfolioObject!.flushAllAccountsToConsole();
    //             } else {
    //                 console.log("No position executed found yet!");
    //             }
    //         });
    //     } else {console.log("PortfolioObject not created yet")}
    // }, [rpcProvider.portfolioObject]);

    return (
        <div
            id="content"
            className={"flex flex-col grow my-auto"}
            style={{backgroundColor: BRAND_COLORS.slate900}}
        >
            <RunCranksModal showCrankState={showCrankState} />
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
