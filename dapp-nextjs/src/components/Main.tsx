import React, {FC, useEffect, useState} from "react";
import LoadingItemsModal from "./modals/LoadingItemsModal";
import PortfolioChartAndTable from "./portfolio/PortfolioChartAndTable";
import {IQPool, useQPoolUserTool} from "../contexts/QPoolsProvider";
import StakeForm from "./swap/StakeForm";
import UnstakeForm from "./swap/UnstakeForm";
import {BRAND_COLORS} from "../const";

export enum HeroFormState {
    Stake,
    Unstake
}

export const Main: FC = ({}) => {

    // const [totalAmountInUsdc, setTotalAmountInUsdc] = useState<number>(0.);
    // Let this state be determined if the user has a portfolio
    const [displayForm, setDisplayForm] = useState<HeroFormState>(HeroFormState.Stake);
    const qPoolContext: IQPool = useQPoolUserTool();

    const fetchAndDisplay = async () => {
        if (qPoolContext.portfolioObject) {
            let isFulfilled = await qPoolContext.portfolioObject!.portfolioExists();
            if (isFulfilled) {
                setDisplayForm(HeroFormState.Unstake);
                // TODO: Replace this ...
                // setDisplayForm(HeroFormState.Stake);
            } else {
                setDisplayForm(HeroFormState.Stake);
            }
        }
    };
    //
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
            return "This will be the allocation in which your assets generate yields";
        } else if (displayForm === HeroFormState.Unstake) {
            return "See the assets for your current portfolio";
        }
    }

    return (
        <div
            id="content"
            className={"flex flex-col grow my-auto"}
            style={{ backgroundColor: BRAND_COLORS.slate900 }}
        >
            <LoadingItemsModal />
            <div className={"flex flex-col grow w-full my-auto"}>
                <div className={"flex flex-col mx-auto "}>
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
                    <div className={"flex flex-row mt-8"}>
                        <PortfolioChartAndTable
                                displayMode={displayForm}
                                totalAmountInUsdc={100}
                            />
                    </div>
                    <div className={"flex flex-row my-auto mt-7"}>
                        {formComponent()}
                    </div>
                </div>
            </div>
        </div>
    );

}
