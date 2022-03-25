import React, {useEffect, useState} from "react";
import {WalletMultiButton} from "@solana/wallet-adapter-react-ui";
import {IRpcProvider, useRpc} from "../../contexts/RpcProvider";
import {IExistingPortfolio, useExistingPortfolio} from "../../contexts/ExistingPortfolioProvider";
import RowInList from "../common/RowInList";
import SinglePositionInPortfolioRow from "../redeemPortfolio/SinglePositionInPortfolioRow";

// The existing Portfolio Context could technically be just outside of this
export default function RedeemPortfolioView({}) {

    const rpcProvider: IRpcProvider = useRpc();
    const existingPortfolioProvider: IExistingPortfolio = useExistingPortfolio();
    const [totalPortfolioValueInUsd, setTotalPortfolioValueInUsd] = useState<number>();

    useEffect(() => {
        setTotalPortfolioValueInUsd(existingPortfolioProvider.totalPortfolioValueInUsd);
    }, [existingPortfolioProvider.totalPortfolioValueInUsd]);

    const displayListOfPortfolios = () => {

        // await rpcProvider.portfolioObject!.getInitialDepositInAllCurrencies();

        if (!rpcProvider.portfolioObject) {
            return (
                <RowInList
                    text={"Connect wallet to see your portfolios!"}
                />
            )
        }

        console.log("Printing the total portfolios ..");
        console.log(existingPortfolioProvider!.totalPortfolioValueInUsd);
        console.log(existingPortfolioProvider!.positionInfos);
        // if (totalPortfolioValueInUsd === 0.00) {
        //     return (
        //         <ConnectWalletPortfolioRow
        //             text={"No active portfolio position found!"}
        //         />
        //     );
        // }
        if (existingPortfolioProvider.positionInfos.length === 0) {
            // TODO: Here, the user should for some reason run the cranks (?)
            return (
                <RowInList
                    text={"You have not created any positions yet!"}
                />
            );
        }
        if (!rpcProvider.portfolioObject.portfolioPDA) {
            return (
                <RowInList
                    text={"Loading ..."}
                />
            );
        }
        console.log("Portfolio PDA (1) is: ", rpcProvider.portfolioObject.portfolioPDA);
        if (!totalPortfolioValueInUsd) {
            console.log("Total portfolio value is not set ...");
        }
        return (
            <>
                <SinglePositionInPortfolioRow
                    address={rpcProvider.portfolioObject.portfolioPDA}
                    value={totalPortfolioValueInUsd!}
                    initialValue={0.}
                />
            </>
        )
    }

    return (
        <>
            <div className={"flex flex-col w-full font-medium"}>
                <div className={"text-xl font-light mt-3"}>
                    The Portfolio you see is worth an estimated USDC {existingPortfolioProvider.totalPortfolioValueInUsd.toFixed(2)}
                </div>
                <div className={"flex py-5 w-full"}>
                    <div className={"flex flex-col w-full"}>
                        {/*
                            TODO: Have perhaps one line "Portfolio, with this allocaiton
                            We can also just display how much profit or loss it accumulated so far

                            For each portfolio that is loaded, display one of these...
                            And you can also include a button to redeem, for each single one...
                        */}
                        {displayListOfPortfolios()}
                    </div>
                </div>
                {!rpcProvider.userAccount &&
                <div className={"flex w-full justify-center"}>
                    <WalletMultiButton
                        className={"btn btn-ghost"}
                        onClick={() => {
                            console.log("click");
                        }}
                    />
                </div>
                }
            </div>
        </>
    );
}
