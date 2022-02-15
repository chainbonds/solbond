/* This example requires Tailwind CSS v2.0+ */
import {useForm} from "react-hook-form";
import {useWallet} from '@solana/wallet-adapter-react';
import {clusterApiUrl, Connection, PublicKey, Transaction} from "@solana/web3.js";
import * as anchor from "@project-serum/anchor";
// web3, Wallet as AnchorWallet
// import {BN} from "@project-serum/anchor";
// import {solbondProgram} from "../../programs/solbond";
import {AiOutlineArrowDown} from "react-icons/ai";
import InputFieldWithLogo from "../InputFieldWithLogo";
import CallToActionButton from "../CallToActionButton";
import React, {useEffect, useState} from "react";
import {WalletMultiButton} from "@solana/wallet-adapter-react-ui";
import {IQPool, useQPoolUserTool} from "../../contexts/QPoolsProvider";
import {BN} from "@project-serum/anchor";
import {useLoad} from "../../contexts/LoadingContext";
import {MATH_DENOMINATOR, REDEEMABLES_DECIMALS} from "@qpools/sdk/lib/const";
import {sendAndConfirm} from "easy-spl/dist/util";
import {SEED} from "@qpools/sdk/lib/seeds";
import SinglePortfolioRow from "../portfolio/SinglePortfolioRow";
import {u64} from "@solana/spl-token";
import ConnectWalletPortfolioRow from "../portfolio/ConnectWalletPortfolioRow";

export default function UnstakeForm() {

    const {register, handleSubmit} = useForm();
    const walletContext: any = useWallet();
    const qPoolContext: IQPool = useQPoolUserTool();
    const loadContext = useLoad();

    const [valueInUsdc, setValueInUsdc] = useState<number>(0.0);
    const [valueInQPT, setValueInQpt] = useState<number>(0.0);

    // useEffect(() => {
    //     setValueInSol((_: number) => {
    //         // Get the exchange rate between QPT and USDC
    //         return valueInQPT * 1.;
    //     });
    // }, [valueInQPT]);

    useEffect(() => {
        qPoolContext.qPoolsStats?.calculateTVL().then(out => {

            // Calculate the conversion rate ...
            // Add this depending on decimals //
            let newValueBasedOnConversionRateUsdcPerQpt = out.tvl.mul(new BN(valueInQPT)).div(new BN(10**out.tvlDecimals)).div(new BN(out.totalQPT));
            setValueInUsdc((_: number) => {
                return newValueBasedOnConversionRateUsdcPerQpt.toNumber();
            });
        });
    }, [valueInQPT]);

    const submitToContract = async (d: any) => {

        console.log(JSON.stringify(d));

        console.log("About to be redeeming!");

        // Redeem the full portfolio
        // @ts-ignore
        await qPoolContext.portfolioObject!.redeemFullPortfolio();
        // Transfer back the contents of the full item. For this, fetch the total USDC amount of the account

        await qPoolContext.portfolioObject!.transferToUser();
        // Redeem the full portfolio


        // // TODO: All decimals should be registered somewhere!
        // const sendAmount: BN = new BN(valueInQPT).mul(new BN(10**REDEEMABLES_DECIMALS));
        // console.log("send amount qpt is: ", sendAmount.toString());
    }

    useEffect(() => {
        if (walletContext.publicKey) {
            console.log("Wallet pubkey wallet is:", walletContext.publicKey.toString());
            qPoolContext.initializeQPoolsUserTool(walletContext);
        }
        // initializeQPoolsUserTool
    }, [walletContext.publicKey]);

    const [portfolio, setPortfolio] = useState<any>(null);
    useEffect(() => {
        if (qPoolContext.portfolioObject) {

            console.log("Getting Portfolio Object");
            qPoolContext.portfolioObject!.fetchPortfolio().then((x: any) => {
                console.log("Portfolio response is: ", x);
            });

            console.log("Getting Two Way Pool Object");
            qPoolContext.portfolioObject!.fetchAllPools().then((x: any) => {
                console.log("Pool response is: ", x);
            })

            console.log("Getting Position Objects");
            qPoolContext.portfolioObject!.fetchAllPositions().then((x: any) => {
                console.log("Position response is: ", x);
            })

            console.log("Finally, calculting the total Portfolio Value..");
            qPoolContext.portfolioObject!.calculatePortfolioValue();

        }
    }, [qPoolContext.portfolioObject]);

    const displayListOfPortfolios = () => {

        // If the display tool is not ready yet / if the wallet was not connected yet, ask the user to connect their wallet
        if (!qPoolContext.portfolioObject) {
            return (
                <ConnectWalletPortfolioRow
                    text={"Connect wallet to see your portfolios!"}
                />
            )
        }

        return (
            <SinglePortfolioRow
                address={"DR24...B6kR"}
                time={"10. Feb. 2022"}
                value={5.2}
            />
        )
    }

    return (
        <>
            <div className="">
                <div className="">
                    <form action="#" method="POST" onSubmit={handleSubmit(submitToContract)}>
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
                        {qPoolContext.userAccount &&
                        <CallToActionButton
                            type={"submit"}
                            text={"REDEEM"}
                        />
                        }
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
                    </form>

                </div>
            </div>
        </>
    );
}
