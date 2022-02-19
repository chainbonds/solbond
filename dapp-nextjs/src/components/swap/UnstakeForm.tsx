/* This example requires Tailwind CSS v2.0+ */
import {useForm} from "react-hook-form";
import {useWallet} from '@solana/wallet-adapter-react';
import {PublicKey} from "@solana/web3.js";
import React, {useEffect, useState} from "react";
import {WalletMultiButton} from "@solana/wallet-adapter-react-ui";
import {IQPool, useQPoolUserTool} from "../../contexts/QPoolsProvider";
import {useLoad} from "../../contexts/LoadingContext";
import ConnectWalletPortfolioRow from "../portfolio/ConnectWalletPortfolioRow";
import SinglePortfolioRow from "../portfolio/SinglePortfolioRow";

export default function UnstakeForm() {

    const {register, handleSubmit} = useForm();
    const walletContext: any = useWallet();
    const qPoolContext: IQPool = useQPoolUserTool();
    const loadContext = useLoad();

    const [valueInUsdc, setValueInUsdc] = useState<number>(0.0);

    const [portfolioPDA, setPortfolioPDA] = useState<PublicKey>();
    const [totalPortfolioValueInUsd, setTotalPortfolioValueInUsd] = useState<number>();

    useEffect(() => {
        setTotalPortfolioValueInUsd(qPoolContext.totalPortfolioValueInUsd);
    }, [qPoolContext.totalPortfolioValueInUsd]);

    useEffect(() => {
        if (walletContext.publicKey) {
            console.log("Wallet pubkey wallet is:", walletContext.publicKey.toString());
            qPoolContext.initializeQPoolsUserTool(walletContext);
        }
        // initializeQPoolsUserTool
    }, [walletContext.publicKey]);

    const displayListOfPortfolios = () => {

        // If the display tool is not ready yet / if the wallet was not connected yet, ask the user to connect their wallet
        if (!qPoolContext.portfolioObject) {
            return (
                <ConnectWalletPortfolioRow
                    text={"Connect wallet to see your portfolios!"}
                />
            )
        }
        if (qPoolContext.allocatedAccounts.length === 0) {
            return (
                <ConnectWalletPortfolioRow
                    text={"You have not created any positions yet!"}
                />
            );
        }
        if (totalPortfolioValueInUsd === 0.00) {
            return (
                <ConnectWalletPortfolioRow
                    text={"No active portfolio position found!"}
                />
            );
        }
        console.log("Portfolio PDA is: ", qPoolContext.portfolioObject.portfolioPDA);
        return (
            <SinglePortfolioRow
                address={portfolioPDA}
                value={totalPortfolioValueInUsd}
            />
        )
    }

    return (
        <>
            <div className="">
                <div className="">
                    {/*<form action="#" method="POST" onSubmit={handleSubmit(submitToContract)}>*/}
                        <div className="py-5 bg-slate-800 bg-gray">
                            <div>
                                {/*
                                    TODO: Have perhaps one line "Portfolio, with this allocaiton
                                    We can also just display how much profit or loss it accumulated so far

                                    For each portfolio that is loaded, display one of these...
                                    And you can also include a button to redeem, for each single one...
                                */}
                                {displayListOfPortfolios()}
                            </div>
                        </div>
                        {!qPoolContext.userAccount &&
                        <div className={"flex w-full justify-center"}>
                            <WalletMultiButton
                                className={"btn btn-ghost"}
                                onClick={() => {
                                    console.log("click");
                                }}
                            />
                        </div>
                        }
                    {/*</form>*/}
                </div>
            </div>
        </>
    );
}
