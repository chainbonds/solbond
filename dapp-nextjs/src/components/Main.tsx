import React, {FC, useEffect, useState} from "react";
import LoadingItemsModal from "./modals/LoadingItemsModal";
import PortfolioChartAndTable from "./portfolio/PortfolioChartAndTable";
import {IQPool, useQPoolUserTool} from "../contexts/QPoolsProvider";
import StakeForm from "./swap/StakeForm";
import UnstakeForm from "./swap/UnstakeForm";

enum HeroFormState {
    Stake,
    Unstake
}

export const Main: FC = ({}) => {

    // const title = () => {
    //     return (
    //         <div
    //             id="slogan-wrapper"
    //             className="w-full h-full flex"
    //             style={{ backgroundColor: "#0f172a" }}
    //         >
    //             <div className={"relative text-center lg:text-left mx-auto lg:mx-0"}>
    //                 <h1 className="absolute text-4xl lg:text-7xl font-bold transform -translate-x-1 -translate-y-1">
    //                     Generate Yields
    //                     <br/>
    //                     Adjust Risk
    //                 </h1>
    //                 <h1 className="text-4xl lg:text-7xl font-bold text-pink-500">
    //                     Generate Yields
    //                     <br/>
    //                     Adjust Risk
    //                 </h1>
    //             </div>
    //         </div>
    //     )
    // }

    const [totalAmountInUsdc, setTotalAmountInUsdc] = useState<number>(0.);
    // Get the total USD value from the Stake Form or sth.
    // useEffect(() => {
    //     if (props.valueInUsdc) {
    //         console.log("Defined!: ", props.valueInUsdc);
    //         setTotalAmountInUsdc(props.valueInUsdc);
    //     } else {
    //         console.log("WARNING: Prop is empty!", props.valueInUsdc);
    //     }
    // }, [props.valueInUsdc]);

    // Let this state be determined if the user has a portfolio
    const [displayForm, setDisplayForm] = useState<HeroFormState>(HeroFormState.Stake);
    const qPoolContext: IQPool = useQPoolUserTool();

    const fetchAndDisplay = async () => {
        if (qPoolContext.portfolioObject) {
            let isFulfilled = await qPoolContext.portfolioObject!.portfolioExistsAndIsFulfilled();
            if (isFulfilled) {
                setDisplayForm(HeroFormState.Unstake);
            } else {
                setDisplayForm(HeroFormState.Stake);
            }
        }
    };

    useEffect(() => {
        // Check if the account exists, and if it was fulfilled
        fetchAndDisplay();
    }, [qPoolContext.portfolioObject, qPoolContext.makePriceReload]);

    const formComponent = () => {
        if (displayForm === HeroFormState.Stake) {
            return (
                <StakeForm/>
            );
        } else if (displayForm === HeroFormState.Unstake) {
            return (
                <UnstakeForm/>
            );
        }
    }

    const titleString = () => {
        if (displayForm === HeroFormState.Stake) {
            return "Please Select Your Portfolio";
        } else if (displayForm === HeroFormState.Unstake) {
            return "Your Portfolio";
        }
    }

    const descriptionString = () => {
        if (displayForm === HeroFormState.Stake) {
            return "Please Select Your Portfolio";
        } else if (displayForm === HeroFormState.Unstake) {
            return "See the assets for your current portfolio";
        }
    }

    return (
        <div
            id="content"
            className={"flex flex-col grow my-auto"}
            style={{ backgroundColor: "#0f172a" }}
        >
            <LoadingItemsModal />
            <div className={"flex flex-col grow w-full my-auto"}>
                <div className={"flex flex-col mx-auto"}>
                    <div className={"flex flex-row w-full"}>
                        <h1 className={"text-3xl font-light"}>
                            {titleString()}
                        </h1>
                        {/*
                            Implement buttons, depending on
                                (1) Sharpe Optimized
                                (2) Best Yield
                                (3) Take Wallet
                        */}
                    </div>
                    <div className={"flex flex-row mt-2"}>
                        <h2 className={"text-2xl font-light"}>
                            {descriptionString()}
                        </h2>
                    </div>
                    {/*<div className={"flex flex-row mx-auto w-full"}>*/}
                    <div className={"flex flex-row mt-6"}>
                        <PortfolioChartAndTable
                                totalAmountInUsdc={100}
                            />
                    </div>
                    {/*</div>*/}
                    {/*<div className={"flex flex-row mx-auto w-full"}>*/}
                    <div className={"flex flex-row my-auto mt-10"}>
                        {formComponent()}
                    </div>

                    {/*</div>*/}

                    {/*{title()}*/}
                    {/*<div className="pt-4 pb-1 text-2xl text-gray-100 leading-10 text-center lg:text-left">*/}
                    {/*    <p>*/}
                    {/*        The most convenient way to generate passive income*/}
                    {/*    </p>*/}
                    {/*    <p>*/}
                    {/*        without locking in liquidity. Risk-adjusted for your favorite asset.*/}
                    {/*    </p>*/}
                    {/*</div>*/}
                    {/*<div className={"flex flex-row mx-auto my-auto mt-5"}>*/}
                    {/*    <Statistics/>*/}
                    {/*</div>*/}
                </div>
                {/*<div*/}
                {/*    className={"my-auto w-96 mx-auto lg:mx-0 lg:w-full justify-center lg:justify-end lg:ml-14"}>*/}
                {/*    <HeroForm/>*/}
                {/*</div>*/}
            </div>
        </div>
    );

}
